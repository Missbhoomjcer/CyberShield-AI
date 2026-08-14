import os
import sys
import time
from collections import deque

import numpy as np
import torch


# ============================================================
# PATH SETUP
# ============================================================

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)

if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)


# ============================================================
# MONITOR IMPORTS
# ============================================================

from monitoring.cpu_monitor import get_cpu_usage
from monitoring.memory_monitor import get_memory_usage
from monitoring.process_monitor import (
    get_process_count,
    get_suspicious_process_count,
)
from monitoring.file_monitor import get_file_change_count
from monitoring.network_monitor import get_network_connection_count
from monitoring.registry_monitor import (
    get_registry_snapshot,
    get_registry_change_count,
)

from dl.threat_alert_engine import calculate_final_risk


# ============================================================
# LSTM CONFIGURATION
# ============================================================

MODEL_PATH = os.path.join(
    BACKEND_DIR,
    "models",
    "lstm_behavioral_model.pth",
)

SCALER_PATH = os.path.join(
    BACKEND_DIR,
    "datasets",
    "behavioral",
    "lstm_scaler_large.npz",
)

SEQUENCE_LENGTH = 10
FEATURE_COUNT = 7


# ============================================================
# LSTM MODEL
# ============================================================

class BehavioralLSTM(torch.nn.Module):

    def __init__(
        self,
        input_size=7,
        hidden_size=64,
        num_layers=2,
        dropout=0.2,
    ):
        super().__init__()

        self.lstm = torch.nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout,
        )

        self.dropout = torch.nn.Dropout(0.3)

        self.fc = torch.nn.Linear(
            hidden_size,
            1,
        )

    def forward(self, x):

        output, _ = self.lstm(x)

        last_output = output[:, -1, :]

        last_output = self.dropout(last_output)

        return self.fc(last_output)


# ============================================================
# LOAD MODEL
# ============================================================

device = torch.device("cpu")

model = BehavioralLSTM(
    input_size=FEATURE_COUNT,
    hidden_size=64,
    num_layers=2,
    dropout=0.2,
)

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"\nLSTM model not found:\n{MODEL_PATH}"
    )

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device,
)

if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
    model.load_state_dict(checkpoint["model_state_dict"])
else:
    model.load_state_dict(checkpoint)

model.to(device)
model.eval()


# ============================================================
# LOAD SCALER
# ============================================================

if not os.path.exists(SCALER_PATH):
    raise FileNotFoundError(
        f"\nLSTM scaler not found:\n{SCALER_PATH}"
    )

scaler_data = np.load(SCALER_PATH)

if "mean" in scaler_data and "scale" in scaler_data:

    scaler_mean = scaler_data["mean"]
    scaler_scale = scaler_data["scale"]

elif "mean_" in scaler_data and "scale_" in scaler_data:

    scaler_mean = scaler_data["mean_"]
    scaler_scale = scaler_data["scale_"]

else:

    raise KeyError(
        "Scaler file does not contain expected mean/scale arrays."
    )


# ============================================================
# BEHAVIORAL FEATURE ORDER
# ============================================================

FEATURE_NAMES = [
    "cpu_usage",
    "memory_usage",
    "process_count",
    "file_change_count",
    "network_connection_count",
    "suspicious_process_count",
    "suspicious_score",
]


# ============================================================
# BEHAVIORAL SCORE
# ============================================================

def calculate_suspicious_score(
    cpu_usage,
    memory_usage,
    process_count,
    file_change_count,
    network_connection_count,
    suspicious_process_count,
):
    """
    Calculate a heuristic behavioral score from 0-100.

    This is only a supporting signal for the ML model.
    It does not claim that a process is malware.
    """

    score = 0.0

    # CPU
    if cpu_usage >= 90:
        score += 15
    elif cpu_usage >= 75:
        score += 8

    # Memory
    if memory_usage >= 90:
        score += 15
    elif memory_usage >= 80:
        score += 8

    # Processes
    if process_count >= 450:
        score += 10
    elif process_count >= 350:
        score += 5

    # File activity
    if file_change_count >= 50:
        score += 20
    elif file_change_count >= 20:
        score += 10

    # Network
    if network_connection_count >= 150:
        score += 15
    elif network_connection_count >= 100:
        score += 8

    # Suspicious processes
    if suspicious_process_count >= 5:
        score += 25
    elif suspicious_process_count >= 2:
        score += 10

    return round(min(score, 100.0), 2)


# ============================================================
# COLLECT BEHAVIOR
# ============================================================

def collect_behavior():

    cpu_usage = get_cpu_usage()

    memory_usage = get_memory_usage()

    process_count = get_process_count()

    suspicious_process_count = (
        get_suspicious_process_count()
    )

    file_change_count = get_file_change_count(
        interval=0.2
    )

    network_connection_count = (
        get_network_connection_count()
    )

    suspicious_score = calculate_suspicious_score(
        cpu_usage,
        memory_usage,
        process_count,
        file_change_count,
        network_connection_count,
        suspicious_process_count,
    )

    return {
        "cpu_usage": cpu_usage,
        "memory_usage": memory_usage,
        "process_count": process_count,
        "file_change_count": file_change_count,
        "network_connection_count": network_connection_count,
        "suspicious_process_count": suspicious_process_count,
        "suspicious_score": suspicious_score,
    }


# ============================================================
# PRINT BEHAVIOR
# ============================================================

def print_behavior(data):

    print("-" * 65)

    print(
        f"CPU Usage                  : "
        f"{data['cpu_usage']}%"
    )

    print(
        f"Memory Usage               : "
        f"{data['memory_usage']}%"
    )

    print(
        f"Process Count              : "
        f"{data['process_count']}"
    )

    print(
        f"File Change Count          : "
        f"{data['file_change_count']}"
    )

    print(
        f"Network Connections        : "
        f"{data['network_connection_count']}"
    )

    print(
        f"Suspicious Process Count   : "
        f"{data['suspicious_process_count']}"
    )

    print(
        f"Suspicious Score           : "
        f"{data['suspicious_score']}"
    )


# ============================================================
# LSTM PREDICTION
# ============================================================

def predict_lstm(sequence):

    values = np.array(
        sequence,
        dtype=np.float32,
    )

    # Standardization using training scaler.
    values = (
        values - scaler_mean
    ) / np.where(
        scaler_scale == 0,
        1,
        scaler_scale,
    )

    values = values.reshape(
        1,
        SEQUENCE_LENGTH,
        FEATURE_COUNT,
    )

    tensor = torch.tensor(
        values,
        dtype=torch.float32,
    ).to(device)

    with torch.no_grad():

        output = model(tensor)

        probability = torch.sigmoid(
            output
        ).item()

    prediction = (
        "SUSPICIOUS"
        if probability >= 0.5
        else "NORMAL"
    )

    return prediction, probability


# ============================================================
# PRINT THREAT RESULT
# ============================================================

def print_threat_result(
    result,
    lstm_probability,
):

    print()

    print(
        f"LSTM Prediction           : "
        f"{result.prediction}"
    )

    print(
        f"LSTM Probability          : "
        f"{lstm_probability:.4f}"
    )

    print(
        f"Behavioral Score          : "
        f"{result.behavioral_score:.2f}"
    )

    print(
        f"FINAL RISK                : "
        f"{result.final_risk:.2f}%"
    )

    print(
        f"RISK LEVEL                : "
        f"{result.risk_level}"
    )

    print(
        f"THREAT ALERT              : "
        f"{'YES' if result.alert else 'NO'}"
    )

    print()

    print("Reasons:")

    for reason in result.reasons:

        print(
            f" - {reason}"
        )


# ============================================================
# REAL-TIME MONITOR
# ============================================================

if __name__ == "__main__":

    print("=" * 65)

    print(
        "CYBERSHIELD-AI "
        "REAL-TIME PROTECTION MODE"
    )

    print("=" * 65)

    print()

    print(
        "LSTM model loaded successfully."
    )

    print(
        f"Model: {MODEL_PATH}"
    )

    print()

    print(
        "Registry monitoring: ENABLED"
    )

    print(
        "Threat alert engine: ENABLED"
    )

    print()

    print(
        "Monitoring behavioral telemetry..."
    )

    print(
        "LSTM requires "
        f"{SEQUENCE_LENGTH} observations "
        "before making a prediction."
    )

    print(
        "Press Ctrl+C to stop."
    )

    print()

    # --------------------------------------------------------
    # LSTM rolling window
    # --------------------------------------------------------

    sequence_buffer = deque(
        maxlen=SEQUENCE_LENGTH
    )

    # --------------------------------------------------------
    # Initial registry state
    # --------------------------------------------------------

    previous_registry_snapshot = (
        get_registry_snapshot()
    )

    try:

        while True:

            # ================================================
            # COLLECT BEHAVIOR
            # ================================================

            behavior = collect_behavior()

            # ================================================
            # REGISTRY MONITORING
            # ================================================

            current_registry_snapshot = (
                get_registry_snapshot()
            )

            registry_change_count = (
                get_registry_change_count(
                    previous_registry_snapshot,
                    current_registry_snapshot,
                )
            )

            previous_registry_snapshot = (
                current_registry_snapshot
            )

            # ================================================
            # BUILD LSTM FEATURE VECTOR
            # ================================================

            feature_vector = [

                behavior["cpu_usage"],

                behavior["memory_usage"],

                behavior["process_count"],

                behavior["file_change_count"],

                behavior["network_connection_count"],

                behavior["suspicious_process_count"],

                behavior["suspicious_score"],
            ]

            sequence_buffer.append(
                feature_vector
            )

            # ================================================
            # DISPLAY TELEMETRY
            # ================================================

            print_behavior(
                behavior
            )

            print(
                f"Registry Changes          : "
                f"{registry_change_count}"
            )

            # ================================================
            # LSTM
            # ================================================

            if len(sequence_buffer) < SEQUENCE_LENGTH:

                print()

                print(
                    "LSTM Status               : "
                    "COLLECTING DATA"
                )

                print(
                    "Samples collected         : "
                    f"{len(sequence_buffer)}/"
                    f"{SEQUENCE_LENGTH}"
                )

            else:

                # --------------------------------------------
                # LSTM prediction
                # --------------------------------------------

                prediction, probability = (
                    predict_lstm(
                        list(sequence_buffer)
                    )
                )

                # --------------------------------------------
                # Final threat assessment
                # --------------------------------------------

                threat_result = (
                    calculate_final_risk(

                        lstm_probability=probability,

                        suspicious_score=(
                            behavior[
                                "suspicious_score"
                            ]
                        ),

                        cpu_usage=(
                            behavior[
                                "cpu_usage"
                            ]
                        ),

                        memory_usage=(
                            behavior[
                                "memory_usage"
                            ]
                        ),

                        process_count=(
                            behavior[
                                "process_count"
                            ]
                        ),

                        file_change_count=(
                            behavior[
                                "file_change_count"
                            ]
                        ),

                        network_connection_count=(
                            behavior[
                                "network_connection_count"
                            ]
                        ),

                        suspicious_process_count=(
                            behavior[
                                "suspicious_process_count"
                            ]
                        ),

                        registry_change_count=(
                            registry_change_count
                        ),
                    )
                )

                # --------------------------------------------
                # Display final assessment
                # --------------------------------------------

                print_threat_result(
                    threat_result,
                    probability,
                )

            # ================================================
            # WAIT
            # ================================================

            time.sleep(2)

    except KeyboardInterrupt:

        print()

        print("=" * 65)

        print(
            "CYBERSHIELD-AI "
            "MONITOR STOPPED"
        )

        print("=" * 65)