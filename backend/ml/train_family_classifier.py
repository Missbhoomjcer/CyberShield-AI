import pickle
import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATASET_PATH = Path(r"C:\CyberShieldData\ransom.csv")

MODEL_PATH = PROJECT_ROOT / "backend" / "models" / "family_classifier.pkl"
LABEL_ENCODER_PATH = PROJECT_ROOT / "backend" / "models" / "family_label_encoder.pkl"
FEATURE_ENCODERS_PATH = PROJECT_ROOT / "backend" / "models" / "family_feature_encoders.pkl"
FEATURE_NAMES_PATH = PROJECT_ROOT / "backend" / "models" / "family_feature_names.pkl"

REPORT_PATH = PROJECT_ROOT / "backend" / "reports" / "family_prediction_test.json"


# ============================================================
# LOAD MODEL + ARTIFACTS
# ============================================================

print("=" * 70)
print("CYBERSHIELD-AI FAMILY PREDICTION TEST")
print("=" * 70)

print("\nLoading model and preprocessing artifacts...")

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(LABEL_ENCODER_PATH, "rb") as f:
    label_encoder = pickle.load(f)

with open(FEATURE_ENCODERS_PATH, "rb") as f:
    feature_encoders = pickle.load(f)

with open(FEATURE_NAMES_PATH, "rb") as f:
    feature_names = pickle.load(f)

print("Model loaded:", type(model).__name__)
print("Family classes:", len(label_encoder.classes__))
print("Input features:", len(feature_names))


# ============================================================
# LOAD DATASET
# ============================================================

print("\nLoading dataset...")

df = pd.read_csv(DATASET_PATH)

print("Dataset shape:", df.shape)


# ============================================================
# PREPARE FEATURES
# ============================================================

TARGET = "Family"

X = df.drop(
    columns=[
        "Family",
        "Category",
        "Class",
        "md5",
        "sha1"
    ],
    errors="ignore"
)

y = df[TARGET].astype(str)


# Keep exact training feature order
X = X[feature_names].copy()


# ============================================================
# APPLY SAME FEATURE ENCODERS
# ============================================================

for column, encoder in feature_encoders.items():

    if column not in X.columns:
        continue

    values = X[column].astype(str)

    known_values = set(encoder.classes_)

    # Unknown values are mapped to -1
    X[column] = values.apply(
        lambda value: (
            encoder.transform([value])[0]
            if value in known_values
            else -1
        )
    )


# ============================================================
# NUMERIC CLEANUP
# ============================================================

X = X.replace([np.inf, -np.inf], np.nan)

X = X.fillna(0)


# ============================================================
# TEST SPLIT
# ============================================================

_, X_test, _, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Test samples:", len(X_test))


# ============================================================
# PREDICTIONS
# ============================================================

print("\nGenerating predictions...")

predicted_encoded = model.predict(X_test)

predicted_family = label_encoder.inverse_transform(
    predicted_encoded.astype(int)
)

accuracy = accuracy_score(
    y_test,
    predicted_family
)

print("\nTest accuracy:", f"{accuracy * 100:.2f}%")


# ============================================================
# PROBABILITY PREDICTIONS
# ============================================================

probabilities = model.predict_proba(X_test)

class_names = label_encoder.classes_


# ============================================================
# DISPLAY SAMPLE PREDICTIONS
# ============================================================

print("\n" + "=" * 70)
print("SAMPLE FAMILY PREDICTIONS")
print("=" * 70)

sample_count = min(15, len(X_test))

results = []

for i in range(sample_count):

    probs = probabilities[i]

    # Top 3 probabilities
    top_indices = np.argsort(probs)[::-1][:3]

    top_predictions = []

    for index in top_indices:

        top_predictions.append({
            "family": str(class_names[index]),
            "confidence": round(float(probs[index]) * 100, 2)
        })

    actual = str(y_test.iloc[i])
    predicted = str(predicted_family[i])

    confidence = float(
        np.max(probs)
    ) * 100

    print(f"\nSample {i + 1}")
    print("-" * 40)

    print("Actual family    :", actual)
    print("Predicted family :", predicted)
    print("Confidence       :", f"{confidence:.2f}%")

    print("Top 3:")

    for rank, item in enumerate(top_predictions, start=1):

        print(
            f"  {rank}. "
            f"{item['family']} "
            f"({item['confidence']:.2f}%)"
        )

    results.append({
        "sample": i + 1,
        "actual_family": actual,
        "predicted_family": predicted,
        "confidence": round(confidence, 2),
        "top_3": top_predictions
    })


# ============================================================
# CONFIDENCE SUMMARY
# ============================================================

max_probabilities = probabilities.max(axis=1)

mean_confidence = float(
    np.mean(max_probabilities) * 100
)

minimum_confidence = float(
    np.min(max_probabilities) * 100
)

maximum_confidence = float(
    np.max(max_probabilities) * 100
)


print("\n" + "=" * 70)
print("CONFIDENCE SUMMARY")
print("=" * 70)

print(
    "Mean prediction confidence :",
    f"{mean_confidence:.2f}%"
)

print(
    "Minimum confidence         :",
    f"{minimum_confidence:.2f}%"
)

print(
    "Maximum confidence         :",
    f"{maximum_confidence:.2f}%"
)


# ============================================================
# SAVE REPORT
# ============================================================

report = {
    "model": "RandomForestClassifier",
    "number_of_classes": int(len(label_encoder.classes_)),
    "number_of_features": int(len(feature_names)),
    "test_samples": int(len(X_test)),
    "accuracy": round(float(accuracy), 6),
    "mean_confidence": round(mean_confidence, 2),
    "minimum_confidence": round(minimum_confidence, 2),
    "maximum_confidence": round(maximum_confidence, 2),
    "sample_predictions": results
}

REPORT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)

with open(REPORT_PATH, "w", encoding="utf-8") as f:
    json.dump(
        report,
        f,
        indent=4
    )


print("\nReport saved:")
print(REPORT_PATH)

print("\n" + "=" * 70)
print("FAMILY PREDICTION TEST COMPLETED")
print("=" * 70)