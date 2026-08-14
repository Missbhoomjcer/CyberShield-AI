import os
import numpy as np
import torch
import torch.nn as nn


# ============================================================
# CYBERSHIELD-AI LSTM REAL-TIME PREDICTOR
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "lstm_behavioral_model.pth"
)

SCALER_PATH = os.path.join(
    BASE_DIR,
    "datasets",
    "behavioral",
    "lstm_scaler_large.npz"
)


# ------------------------------------------------------------
# Behavioral feature order
# MUST remain exactly the same as training
# ------------------------------------------------------------

FEATURE_NAMES = [
    "cpu_usage",
    "memory_usage",
    "process_count",
    "file_change_count",
    "network_connection_count",
    "suspicious_process_count",
    "suspicious_score"
]

SEQUENCE_LENGTH = 10
NUM_FEATURES = 7


# ------------------------------------------------------------
# LSTM MODEL
# ------------------------------------------------------------

class BehavioralLSTM(nn.Module):

    def __init__(self):
        super().__init__()

        self.lstm = nn.LSTM(
            input_size=7,
            hidden_size=64,
            num_layers=2,
            batch_first=True,
            dropout=0.2
        )

        self.dropout = nn.Dropout(0.3)

        self.fc = nn.Linear(64, 1)

    def forward(self, x):

        output, _ = self.lstm(x)

        last_output = output[:, -1, :]

        last_output = self.dropout(last_output)

        result = self.fc(last_output)

        return result


# ------------------------------------------------------------
# LOAD MODEL
# ------------------------------------------------------------

device = torch.device("cpu")

model = BehavioralLSTM()

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"LSTM model not found:\n{MODEL_PATH}"
    )

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device
)

# Support both state_dict and complete checkpoint
if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
    model.load_state_dict(checkpoint["model_state_dict"])
else:
    model.load_state_dict(checkpoint)

model.to(device)
model.eval()


# ------------------------------------------------------------
# LOAD SCALER
# ------------------------------------------------------------

if not os.path.exists(SCALER_PATH):
    raise FileNotFoundError(
        f"LSTM scaler not found:\n{SCALER_PATH}"
    )

scaler_data = np.load(SCALER_PATH)


# Support common scaler formats
if "mean" in scaler_data and "scale" in scaler_data:

    scaler_mean = scaler_data["mean"]
    scaler_scale = scaler_data["scale"]

elif "mean_" in scaler_data and "scale_" in scaler_data:

    scaler_mean = scaler_data["mean_"]
    scaler_scale = scaler_data["scale_"]

elif "data_mean" in scaler_data and "data_scale" in scaler_data:

    scaler_mean = scaler_data["data_mean"]
    scaler_scale = scaler_data["data_scale"]

else:

    raise KeyError(
        "Could not find scaler mean/scale values in "
        f"{SCALER_PATH}\n"
        f"Available keys: {scaler_data.files}"
    )


# ------------------------------------------------------------
# FEATURE NORMALIZATION
# ------------------------------------------------------------

def normalize_features(features):

    values = np.array(
        features,
        dtype=np.float32
    )

    values = (
        values - scaler_mean
    ) / scaler_scale

    return values


# ------------------------------------------------------------
# PREDICTION FUNCTION
# ------------------------------------------------------------

def predict(sequence):

    if len(sequence) != SEQUENCE_LENGTH:

        raise ValueError(
            f"LSTM requires exactly "
            f"{SEQUENCE_LENGTH} observations."
        )

    if any(len(row) != NUM_FEATURES for row in sequence):

        raise ValueError(
            f"Each observation must contain "
            f"{NUM_FEATURES} features."
        )

    # Convert to numpy
    sequence = np.array(
        sequence,
        dtype=np.float32
    )

    # Normalize using training scaler
    sequence = (
        sequence - scaler_mean
    ) / scaler_scale

    # Tensor shape:
    # (1, 10, 7)

    tensor = torch.tensor(
        sequence,
        dtype=torch.float32
    ).unsqueeze(0)

    with torch.no_grad():

        output = model(tensor)

        probability = torch.sigmoid(
            output
        ).item()

    if probability >= 0.5:

        prediction = 1
        label = "SUSPICIOUS"

    else:

        prediction = 0
        label = "NORMAL"

    return {
        "prediction": prediction,
        "label": label,
        "probability": probability,
        "risk_percent": probability * 100
    }


# ------------------------------------------------------------
# TEST
# ------------------------------------------------------------

if __name__ == "__main__":

    print("=" * 70)
    print("CYBERSHIELD-AI LSTM PREDICTOR TEST")
    print("=" * 70)

    print()
    print("Model:", MODEL_PATH)
    print("Scaler:", SCALER_PATH)
    print()
    print("Expected input:")
    print("(1, 10, 7)")
    print()

    # Dummy sequence for testing
    dummy_sequence = []

    for _ in range(SEQUENCE_LENGTH):

        dummy_sequence.append([
            20.0,   # CPU
            50.0,   # Memory
            250.0,  # Processes
            0.0,    # File changes
            20.0,   # Network
            0.0,    # Suspicious processes
            5.0     # Suspicious score
        ])

    result = predict(dummy_sequence)

    print("=" * 70)
    print("PREDICTION")
    print("=" * 70)

    print(
        f"Prediction : {result['label']}"
    )

    print(
        f"Probability: {result['probability']:.4f}"
    )

    print(
        f"Risk       : {result['risk_percent']:.2f}%"
    )

    print("=" * 70)