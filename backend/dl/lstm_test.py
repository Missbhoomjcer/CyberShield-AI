import os
import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)

# ============================================================
# CYBERSHIELD-AI LSTM MODEL TESTING
# ============================================================

print("=" * 70)
print("CYBERSHIELD-AI LSTM BEHAVIORAL MODEL TESTING")
print("=" * 70)

# ------------------------------------------------------------
# PATHS
# ------------------------------------------------------------

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

# ------------------------------------------------------------
# DEVICE
# ------------------------------------------------------------

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print()
print("Device:", device)

# ------------------------------------------------------------
# CHECK FILES
# ------------------------------------------------------------

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(
        f"\nLSTM dataset not found:\n{DATA_PATH}\n"
        "\nRun first:\n"
        "python backend\\dl\\sequence_generator.py"
    )

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(
        f"\nLSTM model not found:\n{MODEL_PATH}\n"
        "\nTrain first:\n"
        "python backend\\dl\\lstm_train.py"
    )

# ------------------------------------------------------------
# LOAD DATASET
# ------------------------------------------------------------

print()
print("Loading LSTM sequence dataset...")

data = np.load(DATA_PATH)

X = data["X"].astype(np.float32)
y = data["y"].astype(np.float32)

print("X shape:", X.shape)
print("y shape:", y.shape)

# ------------------------------------------------------------
# CREATE TEST SPLIT
# ------------------------------------------------------------

# Use the final 20% as test data.
# This is kept separate from the training data.

test_size = int(len(X) * 0.20)

X_test = X[-test_size:]
y_test = y[-test_size:]

print()
print("Test dataset:")
print("Test samples:", len(X_test))
print("Timesteps:", X_test.shape[1])
print("Features:", X_test.shape[2])

print()
print("Test label distribution:")
print("NORMAL (0):", int(np.sum(y_test == 0)))
print("SUSPICIOUS (1):", int(np.sum(y_test == 1)))

# ------------------------------------------------------------
# LSTM MODEL
# ------------------------------------------------------------

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

        # Take the final timestep
        output = output[:, -1, :]

        output = self.dropout(output)

        output = self.fc(output)

        return output.squeeze(1)


# ------------------------------------------------------------
# LOAD MODEL
# ------------------------------------------------------------

print()
print("Loading trained LSTM model...")

model = BehavioralLSTM(
    input_size=7,
    hidden_size=64,
    num_layers=2
)

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device
)

# Support both:
# 1. plain state_dict
# 2. checkpoint dictionary

if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
    model.load_state_dict(checkpoint["model_state_dict"])
else:
    model.load_state_dict(checkpoint)

model.to(device)

model.eval()

print("Model loaded successfully.")

# ------------------------------------------------------------
# CONVERT TEST DATA TO TENSORS
# ------------------------------------------------------------

X_test_tensor = torch.tensor(
    X_test,
    dtype=torch.float32
).to(device)

# ------------------------------------------------------------
# PREDICTION
# ------------------------------------------------------------

print()
print("=" * 70)
print("RUNNING LSTM TEST")
print("=" * 70)

with torch.no_grad():

    logits = model(X_test_tensor)

    probabilities = torch.sigmoid(logits)

    predictions = (
        probabilities >= 0.5
    ).int().cpu().numpy()

actual = y_test.astype(int)

# ------------------------------------------------------------
# METRICS
# ------------------------------------------------------------

accuracy = accuracy_score(
    actual,
    predictions
)

precision = precision_score(
    actual,
    predictions,
    zero_division=0
)

recall = recall_score(
    actual,
    predictions,
    zero_division=0
)

f1 = f1_score(
    actual,
    predictions,
    zero_division=0
)

cm = confusion_matrix(
    actual,
    predictions
)

# ------------------------------------------------------------
# RESULTS
# ------------------------------------------------------------

print()
print("=" * 70)
print("LSTM TEST RESULTS")
print("=" * 70)

print(
    f"Accuracy  : {accuracy * 100:.2f}%"
)

print(
    f"Precision : {precision * 100:.2f}%"
)

print(
    f"Recall    : {recall * 100:.2f}%"
)

print(
    f"F1 Score  : {f1 * 100:.2f}%"
)

print()
print("Confusion Matrix:")
print(cm)

print()
print("Classification Report:")
print(
    classification_report(
        actual,
        predictions,
        target_names=[
            "NORMAL",
            "SUSPICIOUS"
        ],
        zero_division=0
    )
)

# ------------------------------------------------------------
# SAMPLE PREDICTIONS
# ------------------------------------------------------------

print()
print("=" * 70)
print("SAMPLE LSTM PREDICTIONS")
print("=" * 70)

sample_count = min(10, len(predictions))

for i in range(sample_count):

    probability = float(
        probabilities[i].cpu().item()
    )

    predicted_label = predictions[i]

    actual_label = actual[i]

    predicted_text = (
        "SUSPICIOUS"
        if predicted_label == 1
        else "NORMAL"
    )

    actual_text = (
        "SUSPICIOUS"
        if actual_label == 1
        else "NORMAL"
    )

    print(
        f"[{i + 1:02d}] "
        f"Prediction={predicted_text:<10} "
        f"Probability={probability:.4f} "
        f"Actual={actual_text}"
    )

# ------------------------------------------------------------
# FINAL MESSAGE
# ------------------------------------------------------------

print()
print("=" * 70)
print("LSTM MODEL TESTING COMPLETED")
print("=" * 70)

print()
print("Model:")
print(MODEL_PATH)

print()
print("Test dataset:")
print(DATA_PATH)

print()
print("Expected real-time input:")
print("(1, 10, 7)")

print()
print("Behavioral features:")
print("1. cpu_usage")
print("2. memory_usage")
print("3. process_count")
print("4. file_change_count")
print("5. network_connection_count")
print("6. suspicious_process_count")
print("7. suspicious_score")

print()
print("Next stage:")
print("Integrate LSTM predictions with the CyberShield-AI real-time monitor.")

print("=" * 70)