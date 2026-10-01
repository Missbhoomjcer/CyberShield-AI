import json
import pickle
from pathlib import Path

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
)
from xgboost import XGBClassifier


# ============================================================
# Paths
# ============================================================

DATASET = Path(r"C:\Users\01bho\Downloads\Excel_All_Features.csv")

BASE_DIR = Path(__file__).resolve().parents[1]
MODEL_DIR = BASE_DIR / "models"
REPORT_DIR = BASE_DIR / "reports"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# Load dataset
# ============================================================

print("Loading dataset...")
df = pd.read_csv(DATASET)

print(f"Dataset shape: {df.shape}")


# ============================================================
# Prepare features
# ============================================================

# file_path is metadata and must not be used for ML.
DROP_COLUMNS = ["file_path"]

X = df.drop(columns=DROP_COLUMNS + ["label"])
y = df["label"].astype(int)

# Make sure every feature is numeric.
X = X.apply(pd.to_numeric, errors="coerce")

if X.isnull().sum().sum() > 0:
    print("Missing values detected after conversion. Filling with 0.")
    X = X.fillna(0)


feature_names = X.columns.tolist()

print(f"Number of features: {len(feature_names)}")
print(f"Benign samples: {(y == 0).sum()}")
print(f"Malicious samples: {(y == 1).sum()}")


# ============================================================
# Train / test split
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y,
)

print(f"Training samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")


# ============================================================
# XGBoost
# ============================================================

print("\nTraining XGBoost...")

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


# ============================================================
# Evaluation
# ============================================================

y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred)
recall = recall_score(y_test, y_pred)
f1 = f1_score(y_test, y_pred)
roc_auc = roc_auc_score(y_test, y_prob)

tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()

fpr = fp / (fp + tn)
fnr = fn / (fn + tp)

print("\n==============================")
print("EXCEL XGBOOST RESULTS")
print("==============================")

print(f"Accuracy :  {accuracy:.4f} ({accuracy * 100:.2f}%)")
print(f"Precision:  {precision:.4f} ({precision * 100:.2f}%)")
print(f"Recall   :  {recall:.4f} ({recall * 100:.2f}%)")
print(f"F1 Score :  {f1:.4f} ({f1 * 100:.2f}%)")
print(f"ROC-AUC  :  {roc_auc:.4f}")

print("\nConfusion Matrix")
print(f"TN: {tn}")
print(f"FP: {fp}")
print(f"FN: {fn}")
print(f"TP: {tp}")

print(f"\nFalse Positive Rate: {fpr:.4f} ({fpr * 100:.2f}%)")
print(f"False Negative Rate: {fnr:.4f} ({fnr * 100:.2f}%)")


# ============================================================
# Save model
# ============================================================

model_path = MODEL_DIR / "excel_xgboost_model.pkl"

with open(model_path, "wb") as f:
    pickle.dump(model, f)


# ============================================================
# Save feature names
# ============================================================

feature_path = MODEL_DIR / "excel_feature_names.json"

with open(feature_path, "w", encoding="utf-8") as f:
    json.dump(feature_names, f, indent=2)


# ============================================================
# Feature importance
# ============================================================

importance = (
    pd.DataFrame(
        {
            "feature": feature_names,
            "importance": model.feature_importances_,
        }
    )
    .sort_values("importance", ascending=False)
)

importance_path = REPORT_DIR / "excel_feature_importance.csv"
importance.to_csv(importance_path, index=False)


# ============================================================
# Save evaluation report
# ============================================================

report = {
    "dataset": str(DATASET),
    "samples": int(len(df)),
    "features": int(len(feature_names)),
    "benign_samples": int((y == 0).sum()),
    "malicious_samples": int((y == 1).sum()),
    "test_size": 0.20,
    "random_state": 42,
    "model": "XGBClassifier",
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
        "tn": int(tn),
        "fp": int(fp),
        "fn": int(fn),
        "tp": int(tp),
    },
}

report_path = REPORT_DIR / "excel_evaluation.json"

with open(report_path, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2)


print("\n==============================")
print("FILES SAVED")
print("==============================")
print(model_path)
print(feature_path)
print(importance_path)
print(report_path)

print("\nExcel model training complete.")