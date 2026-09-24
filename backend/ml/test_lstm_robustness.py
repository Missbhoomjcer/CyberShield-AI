import json
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn


# ============================================================
# CONFIGURATION
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    PROJECT_ROOT
    / "backend"
    / "models"
    / "lstm_behavioral_model.pth"
)

# IMPORTANT:
# LSTM scaler is stored in backend/data, NOT backend/models
SCALER_PATH = (
    PROJECT_ROOT
    / "backend"
    / "datasets"
    / "behavioral"
    / "lstm_scaler_large.npz"
)

REPORT_PATH = (
    PROJECT_ROOT
    / "backend"
    / "reports"
    / "lstm_robustness_test.json"
)

SEQUENCE_LENGTH = 10
INPUT_SIZE = 7
HIDDEN_SIZE = 64
NUM_LAYERS = 2


# ============================================================
# DEVICE
# ============================================================

DEVICE = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)


# ============================================================
# LSTM MODEL
# ============================================================

class BehavioralLSTM(nn.Module):

    def __init__(
        self,
        input_size=7,
        hidden_size=64,
        num_layers=2
    ):
        super().__init__()

        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.2
        )

        self.dropout = nn.Dropout(0.3)

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

        return self.fc(last_output)


# ============================================================
# LOAD SCALER
# ============================================================

def load_scaler():

    if not SCALER_PATH.exists():

        raise FileNotFoundError(
            f"LSTM scaler not found:\n"
            f"{SCALER_PATH}"
        )

    scaler_data = np.load(
        SCALER_PATH
    )

    mean = scaler_data["mean"]
    scale = scaler_data["scale"]

    return mean, scale


# ============================================================
# LOAD MODEL
# ============================================================

def load_model():

    if not MODEL_PATH.exists():

        raise FileNotFoundError(
            f"LSTM model not found:\n"
            f"{MODEL_PATH}"
        )

    model = BehavioralLSTM(
        input_size=INPUT_SIZE,
        hidden_size=HIDDEN_SIZE,
        num_layers=NUM_LAYERS
    )

    checkpoint = torch.load(
        MODEL_PATH,
        map_location=DEVICE
    )

    if (
        isinstance(checkpoint, dict)
        and "model_state_dict" in checkpoint
    ):

        model.load_state_dict(
            checkpoint["model_state_dict"]
        )

    else:

        model.load_state_dict(
            checkpoint
        )

    model.to(DEVICE)

    model.eval()

    return model


# ============================================================
# BEHAVIORAL FEATURES
# ============================================================

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
# TEST SCENARIOS
# ============================================================

SCENARIOS = {

    "Normal Activity": {
        "cpu_usage": 20,
        "memory_usage": 35,
        "process_count": 120,
        "file_change_count": 2,
        "network_connection_count": 5,
        "suspicious_process_count": 0,
        "suspicious_score": 5
    },

    "Mild Suspicious Activity": {
        "cpu_usage": 35,
        "memory_usage": 45,
        "process_count": 130,
        "file_change_count": 8,
        "network_connection_count": 12,
        "suspicious_process_count": 1,
        "suspicious_score": 20
    },

    "Moderate Suspicious Activity": {
        "cpu_usage": 55,
        "memory_usage": 60,
        "process_count": 140,
        "file_change_count": 18,
        "network_connection_count": 25,
        "suspicious_process_count": 2,
        "suspicious_score": 45
    },

    "Ransomware-like Activity": {
        "cpu_usage": 75,
        "memory_usage": 70,
        "process_count": 150,
        "file_change_count": 40,
        "network_connection_count": 35,
        "suspicious_process_count": 3,
        "suspicious_score": 70
    },

    "Extreme Ransomware Activity": {
        "cpu_usage": 95,
        "memory_usage": 92,
        "process_count": 160,
        "file_change_count": 80,
        "network_connection_count": 70,
        "suspicious_process_count": 8,
        "suspicious_score": 95
    },

    "File Change Spike": {
        "cpu_usage": 45,
        "memory_usage": 50,
        "process_count": 135,
        "file_change_count": 100,
        "network_connection_count": 10,
        "suspicious_process_count": 1,
        "suspicious_score": 55
    },

    "Network Spike": {
        "cpu_usage": 40,
        "memory_usage": 45,
        "process_count": 135,
        "file_change_count": 5,
        "network_connection_count": 100,
        "suspicious_process_count": 1,
        "suspicious_score": 30
    },

    "Suspicious Process Spike": {
        "cpu_usage": 50,
        "memory_usage": 55,
        "process_count": 145,
        "file_change_count": 15,
        "network_connection_count": 20,
        "suspicious_process_count": 10,
        "suspicious_score": 65
    }
}


# ============================================================
# CREATE SEQUENCE
# ============================================================

def create_sequence(scenario):

    values = np.array(
        [
            [
                scenario[name]
                for name in FEATURE_NAMES
            ]
        ] * SEQUENCE_LENGTH,
        dtype=np.float32
    )

    return values


# ============================================================
# SCALE SEQUENCE
# ============================================================

def scale_sequence(
    sequence,
    mean,
    scale
):

    scale = np.where(
        scale == 0,
        1,
        scale
    )

    return (
        sequence - mean
    ) / scale


# ============================================================
# PREDICT
# ============================================================

def predict(
    model,
    sequence
):

    tensor = torch.tensor(
        sequence,
        dtype=torch.float32,
        device=DEVICE
    ).unsqueeze(0)

    with torch.no_grad():

        logits = model(tensor)

        probability = torch.sigmoid(
            logits
        ).item()

    return probability


# ============================================================
# MAIN
# ============================================================

def main():

    print()
    print("=" * 80)
    print("CYBERSHIELD-AI LSTM BEHAVIORAL ROBUSTNESS TEST")
    print("=" * 80)

    print()
    print("Device:", DEVICE)

    # --------------------------------------------------------
    # Load model
    # --------------------------------------------------------

    print()
    print("Loading LSTM model...")

    model = load_model()

    print(
        "LSTM model loaded successfully."
    )

    # --------------------------------------------------------
    # Load scaler
    # --------------------------------------------------------

    print()
    print("Loading LSTM scaler...")

    mean, scale = load_scaler()

    print(
        "LSTM scaler loaded successfully."
    )

    print(
        "Scaler dimensions:",
        len(mean)
    )

    # --------------------------------------------------------
    # Run scenarios
    # --------------------------------------------------------

    results = []

    print()
    print(
        "Running behavioral scenarios..."
    )

    for name, scenario in SCENARIOS.items():

        sequence = create_sequence(
            scenario
        )

        scaled_sequence = scale_sequence(
            sequence,
            mean,
            scale
        )

        probability = predict(
            model,
            scaled_sequence
        )

        prediction = (
            "SUSPICIOUS"
            if probability >= 0.5
            else "NORMAL"
        )

        print()
        print("-" * 80)

        print(
            f"Scenario           : {name}"
        )

        print(
            f"CPU usage          : "
            f"{scenario['cpu_usage']}"
        )

        print(
            f"Memory usage       : "
            f"{scenario['memory_usage']}"
        )

        print(
            f"Process count      : "
            f"{scenario['process_count']}"
        )

        print(
            f"File changes       : "
            f"{scenario['file_change_count']}"
        )

        print(
            f"Network connections: "
            f"{scenario['network_connection_count']}"
        )

        print(
            f"Suspicious process : "
            f"{scenario['suspicious_process_count']}"
        )

        print(
            f"Suspicious score   : "
            f"{scenario['suspicious_score']}"
        )

        print(
            f"LSTM probability   : "
            f"{probability * 100:.4f}%"
        )

        print(
            f"LSTM prediction    : "
            f"{prediction}"
        )

        results.append(
            {
                "scenario": name,
                "features": scenario,
                "probability": round(
                    probability,
                    6
                ),
                "prediction": prediction
            }
        )

    # --------------------------------------------------------
    # Save report
    # --------------------------------------------------------

    REPORT_PATH.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    with open(
        REPORT_PATH,
        "w"
    ) as f:

        json.dump(
            {
                "model":
                    "LSTM behavioral detector",

                "sequence_length":
                    SEQUENCE_LENGTH,

                "feature_names":
                    FEATURE_NAMES,

                "device":
                    str(DEVICE),

                "results":
                    results
            },
            f,
            indent=4
        )

    # --------------------------------------------------------
    # Summary
    # --------------------------------------------------------

    print()
    print("=" * 80)
    print("ROBUSTNESS TEST SUMMARY")
    print("=" * 80)

    for result in results:

        print(
            f'{result["scenario"]:<30} '
            f'{result["probability"] * 100:>9.4f}% '
            f'{result["prediction"]}'
        )

    print()
    print(
        "Report saved:"
    )

    print(
        REPORT_PATH
    )

    print()
    print(
        "LSTM robustness testing completed."
    )

    print("=" * 80)


if __name__ == "__main__":
    main()