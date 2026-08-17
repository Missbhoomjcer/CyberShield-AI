import os
import json
import joblib
import pandas as pd
import shap


# ============================================================
# CyberShield-AI
# SHAP EXPLAINABILITY FOR XGBOOST
# ============================================================

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
MODELS_DIR = os.path.join(BACKEND_DIR, "models")

MODEL_PATH = os.path.join(
    MODELS_DIR,
    "xgboost.pkl"
)

FEATURE_INFO_PATH = os.path.join(
    MODELS_DIR,
    "feature_info.json"
)


# ============================================================
# LOAD XGBOOST MODEL
# ============================================================

print("Loading XGBoost model for SHAP...")

model = joblib.load(MODEL_PATH)

print("XGBoost model loaded.")


# ============================================================
# LOAD FEATURE INFORMATION
# ============================================================

with open(FEATURE_INFO_PATH, "r") as file:
    feature_info = json.load(file)

FEATURE_COLUMNS = feature_info["feature_columns"]

print(
    "Expected features:",
    len(FEATURE_COLUMNS)
)


# ============================================================
# CREATE SHAP EXPLAINER
# ============================================================

print("Creating SHAP TreeExplainer...")

explainer = shap.TreeExplainer(model)

print("SHAP explainer ready.")


# ============================================================
# EXPLAIN ONE FILE
# ============================================================

def explain_prediction(X):
    """
    Generate SHAP explanation for one prediction.

    X must be a pandas DataFrame containing
    the same features used by the XGBoost model.
    """

    # Make sure columns are in the exact order
    X = X.reindex(
        columns=FEATURE_COLUMNS,
        fill_value=0
    )

    # Force numeric values
    for column in X.columns:
        X[column] = pd.to_numeric(
            X[column],
            errors="coerce"
        )

    X = X.replace(
        [float("inf"), float("-inf")],
        float("nan")
    )

    X = X.fillna(0)


    # ========================================================
    # CALCULATE SHAP VALUES
    # ========================================================

    shap_values = explainer.shap_values(X)


    # ========================================================
    # HANDLE SHAP OUTPUT
    # ========================================================

    # XGBoost binary classification can return:
    #
    # [samples, features]
    #
    # or in some versions:
    #
    # [samples, features, classes]

    if isinstance(shap_values, list):

        # Binary classification
        # Use class 1 = malicious

        if len(shap_values) > 1:
            values = shap_values[1][0]
        else:
            values = shap_values[0][0]

    else:

        values = shap_values

        # Remove sample dimension
        if len(values.shape) > 1:
            values = values[0]

        # If class dimension exists
        if len(values.shape) > 1:
            values = values[:, 1]


    # ========================================================
    # CREATE FEATURE CONTRIBUTIONS
    # ========================================================

    contributions = []

    for feature, value in zip(
        FEATURE_COLUMNS,
        values
    ):

        contributions.append(
            {
                "feature": feature,
                "shap_value": float(value),
                "absolute_impact": float(
                    abs(value)
                )
            }
        )


    # ========================================================
    # SORT BY IMPORTANCE
    # ========================================================

    contributions.sort(
        key=lambda x: x["absolute_impact"],
        reverse=True
    )


    # ========================================================
    # TOP 10 FEATURES
    # ========================================================

    top_features = contributions[:10]


    # ========================================================
    # RETURN RESULT
    # ========================================================

    return top_features


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print()
    print("=" * 70)
    print("CYBERSHIELD-AI SHAP TEST")
    print("=" * 70)

    # --------------------------------------------------------
    # Create a test row using zeros
    # --------------------------------------------------------

    test_data = {
        column: 0
        for column in FEATURE_COLUMNS
    }

    X_test = pd.DataFrame(
        [test_data],
        columns=FEATURE_COLUMNS
    )

    # --------------------------------------------------------
    # Explain
    # --------------------------------------------------------

    explanation = explain_prediction(
        X_test
    )

    print()
    print("TOP SHAP FEATURES")
    print("-" * 70)

    for index, item in enumerate(
        explanation,
        start=1
    ):

        print(
            f"{index}. "
            f"{item['feature']} "
            f"| SHAP: "
            f"{item['shap_value']:.6f} "
            f"| Impact: "
            f"{item['absolute_impact']:.6f}"
        )

    print("=" * 70)