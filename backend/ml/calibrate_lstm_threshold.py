from pathlib import Path
import json
import numpy as np
import torch
import torch.nn as nn
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

PROJECT_ROOT = Path(__file__).resolve().parents[2]

MODEL_PATH = PROJECT_ROOT / "backend" / "models" / "lstm_behavioral_model.pth"
SCALER_PATH = PROJECT_ROOT / "backend" / "datasets" / "behavioral" / "lstm_scaler_large.npz"
SEQUENCES_PATH = PROJECT_ROOT / "backend" / "datasets" / "behavioral" / "lstm_sequences_large.npz"

REPORT_PATH = PROJECT_ROOT / "backend" / "reports" / "lstm_threshold_calibration.json"


class LSTMBehavioralModel(nn.Module):
    def __init__(self, input_size=7, hidden_size=64, num_layers=2):
        super().__init__()

        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.2
        )

        self.dropout = nn.Dropout(0.3)
        self.fc = nn.Linear(hidden_size, 1)

    def forward(self, x):
        output, _ = self.lstm(x)
        output = output[:, -1, :]
        output = self.dropout(output)
        return self.fc(output)


print("=" * 80)
print("CYBERSHIELD-AI LSTM THRESHOLD / PROBABILITY CALIBRATION")
print("=" * 80)

device = torch.device("cpu")
print(f"\nDevice: {device}")

# ------------------------------------------------------------------
# Load model
# ------------------------------------------------------------------

print("\nLoading LSTM model...")

model = LSTMBehavioralModel()

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device,
    weights_only=False
)

if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
    model.load_state_dict(checkpoint["model_state_dict"])
else:
    model.load_state_dict(checkpoint)

model.to(device)
model.eval()

print("LSTM model loaded successfully.")

# ------------------------------------------------------------------
# Load validation sequences
# ------------------------------------------------------------------

print("\nLoading validation sequences...")

data = np.load(SEQUENCES_PATH)

print("Available arrays:", list(data.files))

X = data["X_validation"]
y = data["y_validation"]

print(f"Validation X shape: {X.shape}")
print(f"Validation y shape: {y.shape}")

# ------------------------------------------------------------------
# Generate probabilities
# ------------------------------------------------------------------

print("\nGenerating LSTM probabilities...")

X_tensor = torch.tensor(
    X,
    dtype=torch.float32
).to(device)

with torch.no_grad():
    logits = model(X_tensor)
    probabilities = torch.sigmoid(logits).cpu().numpy().flatten()

print("Probability generation completed.")

print(f"Minimum probability : {probabilities.min():.8f}")
print(f"Maximum probability : {probabilities.max():.8f}")
print(f"Mean probability    : {probabilities.mean():.8f}")

# ------------------------------------------------------------------
# Threshold evaluation
# ------------------------------------------------------------------

thresholds = [
    0.10,
    0.15,
    0.20,
    0.25,
    0.30,
    0.35,
    0.40,
    0.45,
    0.50,
    0.55,
    0.60,
    0.65,
    0.70,
    0.75,
    0.80,
    0.85,
    0.90
]

results = []

print("\n" + "=" * 80)
print("THRESHOLD ANALYSIS")
print("=" * 80)

print(
    f"{'Threshold':<12}"
    f"{'Accuracy':<12}"
    f"{'Precision':<12}"
    f"{'Recall':<12}"
    f"{'F1':<12}"
    f"{'FPR':<12}"
    f"{'FNR':<12}"
)

for threshold in thresholds:

    predictions = (probabilities >= threshold).astype(int)

    accuracy = accuracy_score(y, predictions)

    precision = precision_score(
        y,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        y,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        y,
        predictions,
        zero_division=0
    )

    tn, fp, fn, tp = confusion_matrix(
        y,
        predictions,
        labels=[0, 1]
    ).ravel()

    fpr = fp / (fp + tn) if (fp + tn) else 0
    fnr = fn / (fn + tp) if (fn + tp) else 0

    result = {
        "threshold": threshold,
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1),
        "false_positive_rate": float(fpr),
        "false_negative_rate": float(fnr),
        "tn": int(tn),
        "fp": int(fp),
        "fn": int(fn),
        "tp": int(tp)
    }

    results.append(result)

    print(
        f"{threshold:<12.2f}"
        f"{accuracy * 100:<12.2f}"
        f"{precision * 100:<12.2f}"
        f"{recall * 100:<12.2f}"
        f"{f1 * 100:<12.2f}"
        f"{fpr * 100:<12.2f}"
        f"{fnr * 100:<12.2f}"
    )

# ------------------------------------------------------------------
# Find threshold with highest F1
# ------------------------------------------------------------------

best_f1_result = max(
    results,
    key=lambda x: x["f1"]
)

print("\n" + "=" * 80)
print("BEST F1 THRESHOLD")
print("=" * 80)

print(
    f"Threshold : {best_f1_result['threshold']:.2f}\n"
    f"Accuracy  : {best_f1_result['accuracy'] * 100:.2f}%\n"
    f"Precision : {best_f1_result['precision'] * 100:.2f}%\n"
    f"Recall    : {best_f1_result['recall'] * 100:.2f}%\n"
    f"F1-score  : {best_f1_result['f1'] * 100:.2f}%\n"
    f"FPR       : {best_f1_result['false_positive_rate'] * 100:.2f}%\n"
    f"FNR       : {best_f1_result['false_negative_rate'] * 100:.2f}%"
)

# ------------------------------------------------------------------
# Save report
# ------------------------------------------------------------------

report = {
    "model": "LSTM Behavioral Detector",
    "validation_samples": int(len(y)),
    "positive_class": "SUSPICIOUS",
    "negative_class": "NORMAL",
    "thresholds_evaluated": thresholds,
    "probability_statistics": {
        "minimum": float(probabilities.min()),
        "maximum": float(probabilities.max()),
        "mean": float(probabilities.mean())
    },
    "threshold_results": results,
    "best_f1_threshold": best_f1_result
}

REPORT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

with open(REPORT_PATH, "w") as f:
    json.dump(
        report,
        f,
        indent=4
    )

print("\nCalibration report saved:")
print(REPORT_PATH)

print("\n" + "=" * 80)
print("THRESHOLD CALIBRATION COMPLETED")
print("=" * 80)
