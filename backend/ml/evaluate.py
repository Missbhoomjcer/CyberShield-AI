import os
import json
import warnings

import joblib
import numpy as np
import pandas as pd

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

warnings.filterwarnings("ignore")


# ============================================================
# CYBERSHIELD-AI
# ML MODEL EVALUATION
# ============================================================


print("=" * 70)
print("        CYBERSHIELD-AI ML MODEL EVALUATION")
print("=" * 70)


# ============================================================
# PATHS
# ============================================================

ML_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

BACKEND_DIR = os.path.dirname(
    ML_DIR
)

# Local dataset outside OneDrive
PROCESSED_DATASET = (
    r"C:\CyberShieldData\processed_dataset.csv"
)

MODELS_DIR = os.path.join(
    BACKEND_DIR,
    "models"
)

REPORTS_DIR = os.path.join(
    BACKEND_DIR,
    "reports"
)


# ============================================================
# MODEL FILES
# ============================================================

MODEL_FILES = {

    "Decision Tree":
        "decision_tree.pkl",

    "Random Forest":
        "random_forest.pkl",

    "SVM":
        "svm.pkl",

    "XGBoost":
        "xgboost.pkl",
}


# ============================================================
# LOAD DATASET
# ============================================================

def load_dataset():

    print("\nLoading processed dataset...")

    print("\nDataset path:")
    print(PROCESSED_DATASET)

    if not os.path.exists(
        PROCESSED_DATASET
    ):

        raise FileNotFoundError(
            "\nProcessed dataset not found:\n"
            + PROCESSED_DATASET
        )

    df = pd.read_csv(
        PROCESSED_DATASET
    )

    print(
        "\nDataset loaded successfully."
    )

    print(
        "Rows    :",
        len(df)
    )

    print(
        "Columns :",
        len(df.columns)
    )

    return df


# ============================================================
# PREPARE DATA
# ============================================================

def prepare_data(df):

    print("\nPreparing features...")

    if "Class" not in df.columns:

        raise ValueError(
            "Class column not found."
        )

    y = df[
        "Class"
    ]

    DROP_COLUMNS = [
        "Class",
        "Category",
        "Family"
    ]

    X = df.drop(
        columns=DROP_COLUMNS,
        errors="ignore"
    )

    print(
        "Number of ML features:",
        X.shape[1]
    )

    # CyberShield uses exactly 72 ML features
    if X.shape[1] != 72:

        raise ValueError(
            f"Expected 72 features, "
            f"but found {X.shape[1]}"
        )

    # Check missing values
    missing_values = (
        X.isnull()
        .sum()
        .sum()
    )

    if missing_values > 0:

        raise ValueError(
            f"Dataset contains "
            f"{missing_values} missing values."
        )

    # Check numeric data
    if not all(
        np.issubdtype(
            dtype,
            np.number
        )
        for dtype in X.dtypes
    ):

        raise ValueError(
            "Non-numeric feature detected."
        )

    return X, y


# ============================================================
# CREATE EXACT SAME SPLIT USED BY TRAINING
# ============================================================

def create_split(X, y):

    print(
        "\nCreating exact training/test split..."
    )

    X_train, X_test, y_train, y_test = (
        train_test_split(
            X,
            y,
            test_size=0.20,
            random_state=42,
            stratify=y
        )
    )

    print(
        "Training samples:",
        len(X_train)
    )

    print(
        "Testing samples :",
        len(X_test)
    )

    return (
        X_train,
        X_test,
        y_train,
        y_test
    )


# ============================================================
# LOAD MODEL USING JOBLIB
# ============================================================

def load_model(
    model_name,
    filename
):

    model_path = os.path.join(
        MODELS_DIR,
        filename
    )

    print(
        f"\nLoading {model_name}..."
    )

    print(
        "Path:",
        model_path
    )

    if not os.path.exists(
        model_path
    ):

        raise FileNotFoundError(
            "\nModel not found:\n"
            + model_path
        )

    try:

        model = joblib.load(
            model_path
        )

    except Exception as error:

        raise RuntimeError(
            f"\nCould not load "
            f"{model_name}.\n"
            f"File: {model_path}\n"
            f"Error: {error}"
        )

    print(
        f"{model_name} loaded successfully."
    )

    return model


# ============================================================
# GET MALWARE PROBABILITY
# ============================================================

def get_probability(
    model,
    X_test
):

    # Models such as Random Forest,
    # XGBoost and SVM with probability=True
    # provide predict_proba().

    if hasattr(
        model,
        "predict_proba"
    ):

        probabilities = (
            model.predict_proba(
                X_test
            )
        )

        if probabilities.shape[1] >= 2:

            return probabilities[
                :,
                1
            ]

    # Fallback for models that provide
    # decision_function().

    if hasattr(
        model,
        "decision_function"
    ):

        scores = (
            model.decision_function(
                X_test
            )
        )

        probabilities = (
            1.0 /
            (
                1.0 +
                np.exp(
                    -scores
                )
            )
        )

        return probabilities

    return None


# ============================================================
# EVALUATE MODEL
# ============================================================

def evaluate_model(
    model_name,
    model,
    X_test,
    y_test
):

    print("\n")
    print("=" * 70)
    print(
        f"MODEL: {model_name}"
    )
    print("=" * 70)

    # --------------------------------------------------------
    # Predictions
    # --------------------------------------------------------

    predictions = model.predict(
        X_test
    )

    # --------------------------------------------------------
    # Basic metrics
    # --------------------------------------------------------

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        y_test,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0
    )

    # --------------------------------------------------------
    # ROC-AUC
    # --------------------------------------------------------

    probabilities = get_probability(
        model,
        X_test
    )

    if probabilities is not None:

        roc_auc = roc_auc_score(
            y_test,
            probabilities
        )

    else:

        roc_auc = None

    # --------------------------------------------------------
    # Confusion matrix
    # --------------------------------------------------------

    cm = confusion_matrix(
        y_test,
        predictions,
        labels=[
            0,
            1
        ]
    )

    tn, fp, fn, tp = (
        cm.ravel()
    )

    # --------------------------------------------------------
    # False Positive Rate
    # --------------------------------------------------------

    if (
        fp + tn
    ) > 0:

        false_positive_rate = (
            fp /
            (
                fp + tn
            )
        )

    else:

        false_positive_rate = 0.0

    # --------------------------------------------------------
    # False Negative Rate
    # --------------------------------------------------------

    if (
        fn + tp
    ) > 0:

        false_negative_rate = (
            fn /
            (
                fn + tp
            )
        )

    else:

        false_negative_rate = 0.0

    # --------------------------------------------------------
    # Display metrics
    # --------------------------------------------------------

    print()

    print(
        f"Accuracy           : "
        f"{accuracy * 100:.2f}%"
    )

    print(
        f"Precision          : "
        f"{precision * 100:.2f}%"
    )

    print(
        f"Recall             : "
        f"{recall * 100:.2f}%"
    )

    print(
        f"F1 Score           : "
        f"{f1 * 100:.2f}%"
    )

    if roc_auc is not None:

        print(
            f"ROC-AUC            : "
            f"{roc_auc:.4f}"
        )

    else:

        print(
            "ROC-AUC            : N/A"
        )

    print(
        f"False Positive Rate : "
        f"{false_positive_rate * 100:.2f}%"
    )

    print(
        f"False Negative Rate : "
        f"{false_negative_rate * 100:.2f}%"
    )

    # --------------------------------------------------------
    # Confusion Matrix
    # --------------------------------------------------------

    print(
        "\nConfusion Matrix:"
    )

    print()

    print(
        "                 Predicted"
    )

    print(
        "                 Benign  Malware"
    )

    print(
        f"Actual Benign    "
        f"{tn:6d}  "
        f"{fp:7d}"
    )

    print(
        f"Actual Malware   "
        f"{fn:6d}  "
        f"{tp:7d}"
    )

    # --------------------------------------------------------
    # Classification Report
    # --------------------------------------------------------

    print(
        "\nClassification Report:"
    )

    report = classification_report(
        y_test,
        predictions,
        target_names=[
            "Benign",
            "Malware"
        ],
        zero_division=0
    )

    print(
        report
    )

    # --------------------------------------------------------
    # Return results
    # --------------------------------------------------------

    return {

        "model":
            model_name,

        "accuracy":
            float(
                accuracy
            ),

        "precision":
            float(
                precision
            ),

        "recall":
            float(
                recall
            ),

        "f1_score":
            float(
                f1
            ),

        "roc_auc":
            (
                float(
                    roc_auc
                )
                if roc_auc is not None
                else None
            ),

        "false_positive_rate":
            float(
                false_positive_rate
            ),

        "false_negative_rate":
            float(
                false_negative_rate
            ),

        "true_negative":
            int(tn),

        "false_positive":
            int(fp),

        "false_negative":
            int(fn),

        "true_positive":
            int(tp),

        "test_samples":
            int(
                len(y_test)
            )
    }


# ============================================================
# SAVE RESULTS
# ============================================================

def save_results(
    results
):

    os.makedirs(
        REPORTS_DIR,
        exist_ok=True
    )

    # --------------------------------------------------------
    # CSV
    # --------------------------------------------------------

    csv_path = os.path.join(
        REPORTS_DIR,
        "evaluation_results.csv"
    )

    results_df = pd.DataFrame(
        results
    )

    results_df.to_csv(
        csv_path,
        index=False
    )

    # --------------------------------------------------------
    # JSON
    # --------------------------------------------------------

    json_path = os.path.join(
        REPORTS_DIR,
        "evaluation_results.json"
    )

    with open(
        json_path,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            results,
            file,
            indent=4
        )

    print("\n")
    print("=" * 70)
    print(
        "EVALUATION REPORTS SAVED"
    )
    print("=" * 70)

    print()
    print(
        "CSV:"
    )

    print(
        csv_path
    )

    print()
    print(
        "JSON:"
    )

    print(
        json_path
    )


# ============================================================
# MAIN
# ============================================================

def main():

    print()

    # --------------------------------------------------------
    # Load dataset
    # --------------------------------------------------------

    df = load_dataset()

    # --------------------------------------------------------
    # Prepare data
    # --------------------------------------------------------

    X, y = prepare_data(
        df
    )

    # --------------------------------------------------------
    # Dataset verification
    # --------------------------------------------------------

    print(
        "\nDataset verification:"
    )

    print(
        "Total samples :",
        len(X)
    )

    print(
        "Total features:",
        X.shape[1]
    )

    print(
        "\nClass distribution:"
    )

    print(
        "Benign  (0):",
        int(
            (y == 0).sum()
        )
    )

    print(
        "Malware (1):",
        int(
            (y == 1).sum()
        )
    )

    # --------------------------------------------------------
    # Exact same split as train.py
    # --------------------------------------------------------

    (
        X_train,
        X_test,
        y_train,
        y_test
    ) = create_split(
        X,
        y
    )

    # --------------------------------------------------------
    # Evaluate every model
    # --------------------------------------------------------

    results = []

    for (
        model_name,
        filename
    ) in MODEL_FILES.items():

        model = load_model(
            model_name,
            filename
        )

        result = evaluate_model(
            model_name,
            model,
            X_test,
            y_test
        )

        results.append(
            result
        )

    # --------------------------------------------------------
    # Save reports
    # --------------------------------------------------------

    save_results(
        results
    )

    # --------------------------------------------------------
    # Final summary
    # --------------------------------------------------------

    print("\n")
    print("=" * 70)
    print(
        "                FINAL SUMMARY"
    )
    print("=" * 70)

    summary = pd.DataFrame(
        results
    )

    print()

    print(
        summary[
            [
                "model",
                "accuracy",
                "precision",
                "recall",
                "f1_score",
                "roc_auc",
                "false_positive_rate",
                "false_negative_rate"
            ]
        ].to_string(
            index=False,
            float_format=lambda x:
                f"{x:.4f}"
        )
    )

    print(
        "\nEvaluation completed successfully."
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()