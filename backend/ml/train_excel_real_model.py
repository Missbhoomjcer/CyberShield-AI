import json
from pathlib import Path

import joblib
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


# ---------------------------------------------------------
# PATHS
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATASET = Path(r"C:\Users\01bho\Downloads\Excel_All_Features.csv")

MODEL_DIR = PROJECT_ROOT / "backend" / "models"
REPORT_DIR = PROJECT_ROOT / "backend" / "reports"

MODEL_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------
# FEATURES THAT OUR REAL XLSX EXTRACTOR CAN MEASURE
# ---------------------------------------------------------

FEATURES = [
    "file_size",
    "sheet_count",
    "max_rows",
    "max_cols",
    "total_cells",
    "non_empty_cells",
    "numeric_cell_count",
    "string_cell_count",
    "formula_count",
    "hyperlink_count",
    "avg_cell_length",
    "entropy_of_text",
    "base64_pattern_count",
    "hex_pattern_count",
    "has_macro",
    "remote_template_present",
    "merged_cells_count",
    "hidden_sheets_count",
    "protected_sheets_count",
    "named_ranges_count",
    "empty_sheet_count",
    "rich_text_formatting_count",
]


# ---------------------------------------------------------
# LOAD DATASET
# ---------------------------------------------------------

print("=" * 60)
print("CYBERSHIELD REAL EXCEL MODEL TRAINING")
print("=" * 60)

if not DATASET.exists():
    raise FileNotFoundError(f"Dataset not found: {DATASET}")

df = pd.read_csv(DATASET)

print(f"\nDataset shape: {df.shape}")

if "label" not in df.columns:
    raise ValueError("Dataset does not contain 'label' column.")


# ---------------------------------------------------------
# CHECK FEATURES
# ---------------------------------------------------------

missing_features = [f for f in FEATURES if f not in df.columns]

if missing_features:
    raise ValueError(
        f"These features are missing from the dataset:\n{missing_features}"
    )

X = df[FEATURES].copy()
y = df["label"].astype(int)

X = X.apply(pd.to_numeric, errors="coerce")
X = X.fillna(0)

print(f"Number of selected features: {len(FEATURES)}")
print(f"Benign samples: {(y == 0).sum()}")
print(f"Malicious samples: {(y == 1).sum()}")


# ---------------------------------------------------------
# TRAIN / TEST SPLIT
# ---------------------------------------------------------

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    stratify=y,
    random_state=42,
)

print(f"Training samples: {len(X_train)}")
print(f"Testing samples: {len(X_test)}")


# ---------------------------------------------------------
# XGBOOST
# ---------------------------------------------------------

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

print("\nTraining XGBoost...")

model.fit(X_train, y_train)


# ---------------------------------------------------------
# EVALUATION
# ---------------------------------------------------------

y_pred = model.predict(X_test)
y_prob = model.predict_proba(X_test)[:, 1]

accuracy = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, zero_division=0)
recall = recall_score(y_test, y_pred, zero_division=0)
f1 = f1_score(y_test, y_pred, zero_division=0)
roc_auc = roc_auc_score(y_test, y_prob)

tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()

fpr = fp / (fp + tn) if (fp + tn) else 0
fnr = fn / (fn + tp) if (fn + tp) else 0


# ---------------------------------------------------------
# RESULTS
# ---------------------------------------------------------

print("\n" + "=" * 60)
print("REAL EXCEL XGBOOST RESULTS")
print("=" * 60)

print(f"Accuracy : {accuracy:.4f} ({accuracy * 100:.2f}%)")
print(f"Precision: {precision:.4f}")
print(f"Recall   : {recall:.4f}")
print(f"F1 Score : {f1:.4f}")
print(f"ROC-AUC  : {roc_auc:.4f}")

print("\nConfusion Matrix")
print(f"TN: {tn}")
print(f"FP: {fp}")
print(f"FN: {fn}")
print(f"TP: {tp}")

print(f"\nFalse Positive Rate: {fpr:.4f} ({fpr * 100:.2f}%)")
print(f"False Negative Rate: {fnr:.4f} ({fnr * 100:.2f}%)")


# ---------------------------------------------------------
# SAVE MODEL
# ---------------------------------------------------------

model_path = MODEL_DIR / "excel_real_xgboost_model.pkl"
features_path = MODEL_DIR / "excel_real_feature_names.json"
report_path = REPORT_DIR / "excel_real_evaluation.json"

joblib.dump(model, model_path)

with open(features_path, "w", encoding="utf-8") as f:
    json.dump(FEATURES, f, indent=2)

report = {
    "dataset": str(DATASET),
    "samples": len(df),
    "features": FEATURES,
    "feature_count": len(FEATURES),
    "accuracy": accuracy,
    "precision": precision,
    "recall": recall,
    "f1": f1,
    "roc_auc": roc_auc,
    "tn": int(tn),
    "fp": int(fp),
    "fn": int(fn),
    "tp": int(tp),
    "false_positive_rate": fpr,
    "false_negative_rate": fnr,
}

with open(report_path, "w", encoding="utf-8") as f:
    json.dump(report, f, indent=2)


print("\n" + "=" * 60)
print("FILES SAVED")
print("=" * 60)

print(model_path)
print(features_path)
print(report_path)

print("\nTraining complete.")