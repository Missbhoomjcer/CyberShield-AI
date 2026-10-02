from pathlib import Path
import json

import pandas as pd
import joblib

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


DATASET_PATH = Path(
    r"C:\Users\01bho\Downloads\Word_All_features.csv"
)

MODEL_DIR = Path("backend/models")
REPORT_DIR = Path("backend/reports")

MODEL_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)

MODEL_PATH = MODEL_DIR / "word_xgboost_model.pkl"
FEATURES_PATH = MODEL_DIR / "word_feature_names.json"
REPORT_PATH = REPORT_DIR / "word_evaluation.json"


def main():

    print("=" * 60)
    print("CYBERSHIELD-AI DOC/DOCX XGBOOST TRAINING")
    print("=" * 60)

    # ---------------------------------------------------------
    # Load dataset
    # ---------------------------------------------------------

    df = pd.read_csv(DATASET_PATH)

    print(f"Dataset shape: {df.shape}")

    X = df.drop(columns=["label"]).copy()
    y = df["label"].astype(int)

    # ---------------------------------------------------------
    # Convert features to numeric
    # ---------------------------------------------------------

    for column in X.columns:
        X[column] = pd.to_numeric(
            X[column],
            errors="coerce"
        )

    # ---------------------------------------------------------
    # Train/test split BEFORE imputation
    # ---------------------------------------------------------

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    print(f"Training samples: {len(X_train)}")
    print(f"Testing samples : {len(X_test)}")

    # ---------------------------------------------------------
    # Median imputation fitted ONLY on training data
    # ---------------------------------------------------------

    medians = X_train.median()

    X_train = X_train.fillna(medians)
    X_test = X_test.fillna(medians)

    # ---------------------------------------------------------
    # Train XGBoost
    # ---------------------------------------------------------

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

    # ---------------------------------------------------------
    # Predictions
    # ---------------------------------------------------------

    predictions = model.predict(X_test)
    probabilities = model.predict_proba(X_test)[:, 1]

    # ---------------------------------------------------------
    # Metrics
    # ---------------------------------------------------------

    accuracy = accuracy_score(y_test, predictions)
    precision = precision_score(y_test, predictions)
    recall = recall_score(y_test, predictions)
    f1 = f1_score(y_test, predictions)
    roc_auc = roc_auc_score(y_test, probabilities)

    tn, fp, fn, tp = confusion_matrix(
        y_test,
        predictions
    ).ravel()

    fpr = fp / (fp + tn)
    fnr = fn / (fn + tp)

    print("\n" + "=" * 60)
    print("DOC/DOCX MODEL EVALUATION")
    print("=" * 60)

    print(f"Accuracy  : {accuracy:.4f}")
    print(f"Precision : {precision:.4f}")
    print(f"Recall    : {recall:.4f}")
    print(f"F1 Score  : {f1:.4f}")
    print(f"ROC-AUC   : {roc_auc:.4f}")

    print("\nConfusion Matrix")
    print(f"TN: {tn}")
    print(f"FP: {fp}")
    print(f"FN: {fn}")
    print(f"TP: {tp}")

    print(f"\nFalse Positive Rate: {fpr:.4f}")
    print(f"False Negative Rate: {fnr:.4f}")

    # ---------------------------------------------------------
    # Save model
    # ---------------------------------------------------------

    joblib.dump(model, MODEL_PATH)

    # Save exact feature order
    with open(FEATURES_PATH, "w") as f:
        json.dump(
            list(X.columns),
            f,
            indent=2
        )

    # ---------------------------------------------------------
    # Save evaluation report
    # ---------------------------------------------------------

    report = {
        "dataset": str(DATASET_PATH),
        "samples": int(len(df)),
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
            "tn": int(tn),
            "fp": int(fp),
            "fn": int(fn),
            "tp": int(tp),
        },
    }

    with open(REPORT_PATH, "w") as f:
        json.dump(
            report,
            f,
            indent=2
        )

    print("\nSaved:")
    print(f"Model    : {MODEL_PATH}")
    print(f"Features : {FEATURES_PATH}")
    print(f"Report   : {REPORT_PATH}")

    print("=" * 60)


if __name__ == "__main__":
    main()