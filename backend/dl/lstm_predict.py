import os
import time
from collections import deque

import numpy as np
import pandas as pd
import psutil
import torch
import torch.nn as nn


# ============================================================
# CYBERSHIELD-AI REAL-TIME LSTM BEHAVIORAL DETECTOR
# ============================================================

print("=" * 70)
print("CYBERSHIELD-AI REAL-TIME LSTM BEHAVIORAL DETECTOR")
print("=" * 70)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "backend",
    "models",
    "lstm_behavioral_model.pth"
)

SCALER_PATH = os.path.join(
    BASE_DIR,
    "backend",
    "datasets",
    "behavioral",
    "lstm_scaler_large.npz"
)


# ============================================================
# SETTINGS
# ============================================================

SEQUENCE_LENGTH = 10
INTERVAL_SECONDS = 2

FEATURE_NAMES = [
    "cpu_usage",
    "memory_usage",
    "process_count",
    "file_change_count",
    "network_connection_count",
    "suspicious_process_count",
    "suspicious_score"
]


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print()
print("Device:", DEVICE)


# ============================================================
# CHECK FILES
# ============================================================

if not os.path.exists(MODEL_PATH):

    raise FileNotFoundError(
        f"""
LSTM model not found:

{MODEL_PATH}

Train the model first:

python backend\\dl\\lstm_train.py
"""
    )


if not os.path.exists(SCALER_PATH):

    raise FileNotFoundError(
        f"""
LSTM scaler not found:

{SCALER_PATH}

Generate the sequence dataset first:

python backend\\dl\\sequence_generator.py
"""
    )


# ============================================================
# LSTM MODEL
# ============================================================

class BehavioralLSTM(nn.Module):

    def __init__(
        self,
        input_size=7,
        hidden_size=64,
        num_layers=2,
        dropout=0.3
    ):

        super().__init__()

        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.2
        )

        self.dropout = nn.Dropout(
            dropout
        )

        self.fc = nn.Linear(
            hidden_size,
            1
        )

    def forward(self, x):

        output, _ = self.lstm(x)

        last_output = output[:, -1, :]

        last_output = self.dropout(
            last_output
        )

        result = self.fc(
            last_output
        )

        return result.squeeze(1)


# ============================================================
# LOAD MODEL
# ============================================================

print()
print("Loading LSTM model...")

checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE,
    weights_only=False
)

model = BehavioralLSTM(
    input_size=7,
    hidden_size=64,
    num_layers=2,
    dropout=0.3
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model.to(DEVICE)

model.eval()

print("LSTM model loaded successfully.")


# ============================================================
# LOAD SCALER
# ============================================================

print()
print("Loading behavioral scaler...")

scaler_data = np.load(
    SCALER_PATH
)

if "mean" in scaler_data:

    scaler_mean = scaler_data["mean"]
    scaler_scale = scaler_data["scale"]

elif "mean_" in scaler_data:

    scaler_mean = scaler_data["mean_"]
    scaler_scale = scaler_data["scale_"]

else:

    print(
        "Scaler keys:",
        scaler_data.files
    )

    raise KeyError(
        "Could not find scaler mean/scale values."
    )


print("Scaler loaded successfully.")


# ============================================================
# RUNTIME STATE
# ============================================================

sequence_buffer = deque(
    maxlen=SEQUENCE_LENGTH
)

previous_process_count = None
previous_file_count = None
previous_network_count = None


# ============================================================
# SYSTEM TELEMETRY
# ============================================================

def get_process_count():

    try:

        return len(
            psutil.pids()
        )

    except Exception:

        return 0


def get_network_connection_count():

    try:

        return len(
            psutil.net_connections()
        )

    except Exception:

        return 0


# ============================================================
# FILE ACTIVITY MONITOR
# ============================================================

def get_file_change_count():

    """
    Count files that were created, modified,
    or deleted since the previous observation.

    This is intentionally different from counting
    the total number of files on the system.

    The LSTM training dataset uses file_change_count
    as a behavioral activity feature.
    """

    global previous_file_count

    folders = []

    user_profile = os.environ.get(
        "USERPROFILE"
    )

    if user_profile:

        folders = [
            os.path.join(
                user_profile,
                "Desktop"
            ),
            os.path.join(
                user_profile,
                "Documents"
            ),
            os.path.join(
                user_profile,
                "Downloads"
            )
        ]

    current_files = {}

    for folder in folders:

        if not os.path.exists(folder):

            continue

        try:

            for root, dirs, files in os.walk(
                folder
            ):

                # Skip heavy/system-like directories
                dirs[:] = [
                    directory
                    for directory in dirs
                    if directory not in {
                        "node_modules",
                        ".git",
                        "__pycache__",
                        ".venv"
                    }
                ]

                for filename in files:

                    try:

                        file_path = os.path.join(
                            root,
                            filename
                        )

                        stat = os.stat(
                            file_path
                        )

                        current_files[
                            file_path
                        ] = (
                            stat.st_mtime_ns,
                            stat.st_size
                        )

                    except (
                        FileNotFoundError,
                        PermissionError,
                        OSError
                    ):

                        continue

        except (
            PermissionError,
            OSError
        ):

            continue

    # --------------------------------------------------------
    # FIRST OBSERVATION
    # --------------------------------------------------------

    if previous_file_count is None:

        previous_file_count = (
            current_files
        )

        return 0

    # --------------------------------------------------------
    # DETECT CREATED / MODIFIED FILES
    # --------------------------------------------------------

    changed_files = 0

    for path, metadata in current_files.items():

        # Newly created file
        if path not in previous_file_count:

            changed_files += 1

        # Existing file modified
        elif previous_file_count[path] != metadata:

            changed_files += 1

    # --------------------------------------------------------
    # DETECT DELETED FILES
    # --------------------------------------------------------

    deleted_files = (
        set(previous_file_count.keys())
        -
        set(current_files.keys())
    )

    changed_files += len(
        deleted_files
    )

    # --------------------------------------------------------
    # UPDATE BASELINE
    # --------------------------------------------------------

    previous_file_count = (
        current_files
    )

    return changed_files


# ============================================================
# SUSPICIOUS PROCESS DETECTION
# ============================================================

def get_suspicious_process_count():

    suspicious_names = [
        "powershell.exe",
        "cmd.exe",
        "wscript.exe",
        "cscript.exe",
        "mshta.exe",
        "rundll32.exe",
        "regsvr32.exe",
        "certutil.exe",
        "bitsadmin.exe"
    ]

    count = 0

    try:

        for process in psutil.process_iter(
            ["name"]
        ):

            try:

                name = process.info[
                    "name"
                ]

                if not name:

                    continue

                if name.lower() in suspicious_names:

                    count += 1

            except (
                psutil.NoSuchProcess,
                psutil.AccessDenied
            ):

                continue

    except Exception:

        pass

    return count


# ============================================================
# BEHAVIORAL FEATURE COLLECTION
# ============================================================

def collect_features():

    # --------------------------------------------------------
    # SYSTEM FEATURES
    # --------------------------------------------------------

    cpu_usage = psutil.cpu_percent(
        interval=0.2
    )

    memory_usage = (
        psutil.virtual_memory().percent
    )

    process_count = (
        get_process_count()
    )

    file_change_count = (
        get_file_change_count()
    )

    network_connection_count = (
        get_network_connection_count()
    )

    suspicious_process_count = (
        get_suspicious_process_count()
    )

    # --------------------------------------------------------
    # BEHAVIORAL SCORE
    # --------------------------------------------------------

    # This is NOT the malware verdict.
    # It is an additional behavioral feature
    # supplied to the LSTM.

    cpu_score = min(
        cpu_usage,
        100
    )

    memory_score = min(
        max(memory_usage - 70, 0) * 2,
        100
    )

    process_score = min(
        max(process_count - 300, 0) / 2,
        100
    )

    file_score = min(
        file_change_count / 2,
        100
    )

    network_score = min(
        network_connection_count / 2,
        100
    )

    suspicious_score = (
        0.20 * cpu_score
        + 0.15 * memory_score
        + 0.15 * process_score
        + 0.20 * file_score
        + 0.15 * network_score
        + 0.15 * suspicious_process_count
    )

    suspicious_score = min(
        suspicious_score,
        100
    )

    return np.array(
        [
            cpu_usage,
            memory_usage,
            process_count,
            file_change_count,
            network_connection_count,
            suspicious_process_count,
            suspicious_score
        ],
        dtype=np.float32
    )


# ============================================================
# NORMALIZATION
# ============================================================

def normalize_features(features):

    features = np.asarray(
        features,
        dtype=np.float32
    )

    normalized = (
        features - scaler_mean
    ) / (
        scaler_scale + 1e-8
    )

    return normalized.astype(
        np.float32
    )


# ============================================================
# LSTM PREDICTION
# ============================================================

def predict_sequence(sequence):

    normalized_sequence = np.array(
        [
            normalize_features(row)
            for row in sequence
        ],
        dtype=np.float32
    )

    tensor = torch.tensor(
        normalized_sequence,
        dtype=torch.float32
    )

    tensor = tensor.unsqueeze(0)

    tensor = tensor.to(DEVICE)

    with torch.no_grad():

        output = model(
            tensor
        )

        probability = torch.sigmoid(
            output
        ).item()

    return probability


# ============================================================
# REAL-TIME MONITOR
# ============================================================

print()
print("=" * 70)
print("REAL-TIME MONITORING STARTING")
print("=" * 70)

print()
print(
    "Sequence length :",
    SEQUENCE_LENGTH
)

print(
    "Interval        :",
    INTERVAL_SECONDS,
    "seconds"
)

print()
print("Features:")

for i, name in enumerate(
    FEATURE_NAMES,
    1
):

    print(
        f"{i}. {name}"
    )

print()
print(
    "Collecting behavioral observations..."
)

print(
    "The first 10 observations fill the LSTM sequence."
)

print()
print(
    "File activity is measured as "
    "created/modified/deleted files between observations."
)

print()
print(
    "Press CTRL+C to stop."
)

print("=" * 70)


# ============================================================
# MONITOR LOOP
# ============================================================

try:

    while True:

        features = collect_features()

        sequence_buffer.append(
            features
        )

        print()
        print(
            f"[{pd.Timestamp.now()}]"
        )

        print(
            f"CPU={features[0]:.1f}% | "
            f"MEM={features[1]:.1f}% | "
            f"PROC={int(features[2])} | "
            f"FILES={int(features[3])} | "
            f"NET={int(features[4])} | "
            f"SUSPICIOUS_PROC={int(features[5])} | "
            f"SCORE={features[6]:.2f}"
        )

        # ----------------------------------------------------
        # WAIT UNTIL 10 TIMESTEPS EXIST
        # ----------------------------------------------------

        if len(sequence_buffer) < SEQUENCE_LENGTH:

            remaining = (
                SEQUENCE_LENGTH
                - len(sequence_buffer)
            )

            print(
                f"LSTM buffer: "
                f"{len(sequence_buffer)}/"
                f"{SEQUENCE_LENGTH} "
                f"({remaining} more needed)"
            )

        else:

            probability = predict_sequence(
                list(sequence_buffer)
            )

            threat_percent = (
                probability * 100
            )

            if probability >= 0.5:

                status = "SUSPICIOUS"

            else:

                status = "NORMAL"

            print()
            print(
                "LSTM RESULT"
            )

            print(
                f"Behavior      : {status}"
            )

            print(
                f"Suspicious probability: "
                f"{threat_percent:.2f}%"
            )

            print(
                f"Normal probability: "
                f"{100 - threat_percent:.2f}%"
            )

        time.sleep(
            INTERVAL_SECONDS
        )


except KeyboardInterrupt:

    print()
    print()
    print("=" * 70)
    print("REAL-TIME LSTM MONITOR STOPPED")
    print("=" * 70)

    print()
    print("No files were modified.")
    print("No malware was executed.")