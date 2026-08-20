import os
import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "backend",
    "datasets",
    "behavioral",
    "lstm_sequences_large.npz"
)

MODEL_PATH = os.path.join(
    BASE_DIR,
    "backend",
    "models",
    "lstm_behavioral_model.pth"
)


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 70)
print("CYBERSHIELD-AI LSTM MODEL EVALUATION")
print("=" * 70)

print("\nLoading dataset...")

data = np.load(DATA_PATH)

X = data["X"]
y = data["y"]

print("X shape:", X.shape)
print("y shape:", y.shape)


# ============================================================
# MODEL
# ============================================================

class BehavioralLSTM(nn.Module):

    def __init__(
        self,
        input_size,
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
            dropout=0.2 if num_layers > 1 else 0
        )

        self.dropout = nn.Dropout(dropout)

        self.fc = nn.Linear(
            hidden_size,
            1
        )

    def forward(self, x):

        output, (hidden, cell) = self.lstm(x)

        last_output = output[:, -1, :]

        last_output = self.dropout(last_output)

        result = self.fc(last_output)

        return result.squeeze(1)


# ============================================================
# LOAD SAVED MODEL
# ============================================================

print("\nLoading trained LSTM model...")

checkpoint = torch.load(
    MODEL_PATH,
    map_location="cpu"
)

model = BehavioralLSTM(
    input_size=checkpoint["input_size"],
    hidden_size=checkpoint["hidden_size"],
    num_layers=checkpoint["num_layers"],
    dropout=checkpoint["dropout"]
)

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model.eval()

print("Model loaded successfully.")


# ============================================================
# EVALUATION
# ============================================================

print("\nRunning evaluation...")

X_tensor = torch.tensor(
    X,
    dtype=torch.float32
)

with torch.no_grad():

    logits = model(X_tensor)

    probabilities = torch.sigmoid(logits)

    predictions = (
        probabilities >= 0.5
    ).int().numpy()


# ============================================================
# METRICS
# ============================================================

accuracy = accuracy_score(
    y,
    predictions
)

matrix = confusion_matrix(
    y,
    predictions
)

report = classification_report(
    y,
    predictions,
    target_names=[
        "NORMAL",
        "SUSPICIOUS"
    ]
)


# ============================================================
# RESULTS
# ============================================================

print("\n" + "=" * 70)
print("LSTM EVALUATION RESULTS")
print("=" * 70)

print(
    f"\nAccuracy: {accuracy * 100:.2f}%"
)

print("\nConfusion Matrix:")
print(matrix)

print("\nClassification Report:")
print(report)


# ============================================================
# PROBABILITY DISTRIBUTION
# ============================================================

print("=" * 70)
print("PREDICTION DISTRIBUTION")
print("=" * 70)

normal_predictions = np.sum(
    predictions == 0
)

suspicious_predictions = np.sum(
    predictions == 1
)

print(
    "Predicted NORMAL     :",
    normal_predictions
)

print(
    "Predicted SUSPICIOUS :",
    suspicious_predictions
)

print(
    "\nActual NORMAL        :",
    np.sum(y == 0)
)

print(
    "Actual SUSPICIOUS    :",
    np.sum(y == 1)
)

print("=" * 70)