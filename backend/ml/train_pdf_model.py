from pathlib import Path
import json
import joblib

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
)
from xgboost import XGBClassifier

from pdf_preprocessor import load_pdf_dataset


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_DIR = BASE_DIR / "models"
REPORT_DIR = BASE_DIR / "reports"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = MODEL_DIR / "pdf_xgboost_model.pkl"
FEATURE_PATH = MODEL_DIR / "pdf_feature_names.json"
REPORT_PATH = REPORT_DIR / "pdf_evaluation.json"


# ============================================================
# LOAD DATA
# ============================================================

print("=" * 60)
print("PDF MALWARE XGBOOST TRAINING")
print("=" * 60)

X, y = load_pdf_dataset()

print(f"\nSamples : {len(X)}")
print(f"Features: {X.shape[1]}")

print("\nClass distribution:")
print(y.value_counts().to_dict())


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

print("\nTrain samples:", len(X_train))
print("Test samples :", len(X_test))


# ============================================================
# MODEL
# ============================================================

print("\nTraining XGBoost PDF malware classifier...")

model = XGBClassifier(
    n_estimators=300,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.85,
    colsample_bytree=0.85,
    objective="binary:logistic",
    eval_metric="logloss",
    random_state=42,
    n_jobs=-1,
)

model.fit(X_train, y_train)

print("Training completed.")


# ============================================================
# PREDICTION
# ============================================================

y_pred = model.predict(X_test)
y_probability = model.predict_proba(X_test)[:, 1]


# ============================================================
# METRICS
# ============================================================

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, zero_division=0)
recall = recall_score(y_test, y_pred, zero_division=0)
f1 = f1_score(y_test, y_pred, zero_division=0)
roc_auc = roc_auc_score(y_test, y_probability)

tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()

fpr = fp / (fp + tn) if (fp + tn) else 0
fnr = fn / (fn + tp) if (fn + tp) else 0


# ============================================================
# RESULTS
# ============================================================

print("\n" + "=" * 60)
print("PDF MODEL EVALUATION")
print("=" * 60)

print(f"\nAccuracy : {accuracy:.4f} ({accuracy * 100:.2f}%)")
print(f"Precision: {precision:.4f} ({precision * 100:.2f}%)")
print(f"Recall   : {recall:.4f} ({recall * 100:.2f}%)")
print(f"F1 Score : {f1:.4f} ({f1 * 100:.2f}%)")
print(f"ROC-AUC  : {roc_auc:.4f}")

print("\nConfusion Matrix:")
print(f"TN: {tn}")
print(f"FP: {fp}")
print(f"FN: {fn}")
print(f"TP: {tp}")

print(f"\nFalse Positive Rate: {fpr * 100:.2f}%")
print(f"False Negative Rate: {fnr * 100:.2f}%")

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred,
        target_names=["Benign", "Malicious"],
        zero_division=0,
    )
)


# ============================================================
# SAVE MODEL
# ============================================================

joblib.dump(model, MODEL_PATH)

with open(FEATURE_PATH, "w", encoding="utf-8") as f:
    json.dump(list(X.columns), f, indent=2)


# ============================================================
# SAVE EVALUATION REPORT
# ============================================================

report = {
    "dataset": "PDFMalware2022",
    "samples": int(len(X)),
    "features": int(X.shape[1]),
    "train_samples": int(len(X_train)),
    "test_samples": int(len(X_test)),
    "class_distribution": {
        "benign": int((y == 0).sum()),
        "malicious": int((y == 1).sum()),
    },
    "metrics": {
        "accuracy": float(accuracy),
        "precision": float(precision),
        "recall": float(recall),
        "f1": float(f1),
        "roc_auc": float(roc_auc),
        "false_positive_rate": float(fpr),
        "false_negative_rate": float(fnr),
    },
    "confusion_matrix": {
        "true_negative": int(tn),
        "false_positive": int(fp),
        "false_negative": int(fn),
        "true_positive": int(tp),
    },
    "feature_names": list(X.columns),
}

with open(REPORT_PATH, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2)


# ============================================================
# DONE
# ============================================================

print("\n" + "=" * 60)
print("FILES SAVED")
print("=" * 60)

print(f"Model   : {MODEL_PATH}")
print(f"Features: {FEATURE_PATH}")
print(f"Report  : {REPORT_PATH}")

print("\nPDF XGBoost training completed successfully.")