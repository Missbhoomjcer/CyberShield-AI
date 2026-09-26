import json
import pickle
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

from backend.ml.family_predictor import FamilyPredictor


class CombinedPredictor:
    """
    Combines the existing XGBoost binary malware classifier
    with the family classification model.

    This module does NOT modify the threat decision engine.
    """

    def __init__(self):

        # ====================================================
        # PATHS
        # ====================================================

        project_root = Path(__file__).resolve().parents[2]
        models_dir = project_root / "backend" / "models"

        self.binary_model_path = (
            models_dir / "xgboost_model.pkl"
        )

        self.scaler_path = (
            models_dir / "scaler.pkl"
        )

        self.feature_info_path = (
            models_dir / "feature_info.json"
        )

        # ====================================================
        # LOAD XGBOOST MODEL
        # ====================================================

        if not self.binary_model_path.exists():
            raise FileNotFoundError(
                f"XGBoost model not found: "
                f"{self.binary_model_path}"
            )

        with open(
            self.binary_model_path,
            "rb"
        ) as f:
            self.binary_model = pickle.load(f)

        print(
            "[CombinedPredictor] "
            "XGBoost model loaded"
        )

        # ====================================================
        # LOAD SCALER
        # ====================================================

        if not self.scaler_path.exists():
            raise FileNotFoundError(
                f"Scaler not found: "
                f"{self.scaler_path}"
            )

        self.scaler = joblib.load(
            self.scaler_path
        )

        print(
            "[CombinedPredictor] "
            "Scaler loaded"
        )

        # ====================================================
        # LOAD FEATURE INFORMATION
        # ====================================================

        if not self.feature_info_path.exists():
            raise FileNotFoundError(
                f"Feature information not found: "
                f"{self.feature_info_path}"
            )

        with open(
            self.feature_info_path,
            "r"
        ) as f:
            self.feature_info = json.load(f)

        print(
            "[CombinedPredictor] "
            "Feature information loaded"
        )

        # ====================================================
        # LOAD FAMILY PREDICTOR
        # ====================================================

        self.family_predictor = FamilyPredictor()

        print(
            "[CombinedPredictor] "
            "Family predictor loaded"
        )

    # ========================================================
    # PREPARE BINARY FEATURES
    # ========================================================

    def prepare_binary_features(self, features):

        if isinstance(features, pd.DataFrame):

            X = features.copy()

        elif isinstance(features, dict):

            X = pd.DataFrame([features])

        else:

            raise TypeError(
                "features must be a dictionary "
                "or pandas DataFrame"
            )

        # Remove metadata / target columns
        X = X.drop(
    columns=[
        "Class",
        "Category",
        "Family",
        "md5",
        "sha1",
        "_file_size",
        "_entropy",
        "_sha256",
        "_md5"
    ],
    errors="ignore"
)

        # Get expected feature names
        feature_names = self.feature_info.get(
            "feature_names",
            self.feature_info
        )

        if isinstance(feature_names, dict):

            feature_names = feature_names.get(
                "features",
                []
            )

        # Add missing features
        for feature in feature_names:

            if feature not in X.columns:
                X[feature] = 0

        # Keep only expected features
        if feature_names:

            X = X[
                feature_names
            ].copy()

        # Clean numeric values
        X = X.replace(
            [np.inf, -np.inf],
            np.nan
        )

        X = X.apply(
            pd.to_numeric,
            errors="coerce"
        )

        X = X.fillna(0)

        return X

    # ========================================================
    # PREDICT
    # ========================================================

    def predict(self, features):

        # Prepare features
        X_binary = self.prepare_binary_features(
            features
        )

        # Scale
        X_scaled = self.scaler.transform(
            X_binary
        )

        # ====================================================
        # XGBOOST BINARY PREDICTION
        # ====================================================

        binary_prediction = (
            self.binary_model.predict(
                X_scaled
            )[0]
        )

        binary_probabilities = (
            self.binary_model.predict_proba(
                X_scaled
            )[0]
        )

        benign_probability = float(
            binary_probabilities[0]
        )

        malware_probability = float(
            binary_probabilities[1]
        )

        # ====================================================
        # FAMILY PREDICTION
        # ====================================================

        family_result = (
            self.family_predictor.predict(
                features
            )
        )

        # ====================================================
        # COMBINED RESULT
        # ====================================================

        return {

            "malware_prediction":
                int(binary_prediction),

            "malware_probability":
                round(
                    malware_probability * 100,
                    2
                ),

            "benign_probability":
                round(
                    benign_probability * 100,
                    2
                ),

            "family":
                family_result["family"],

            "family_confidence":
                family_result["confidence"],

            "family_top_3":
                family_result["top_3"]
        }


# ============================================================
# INITIALIZATION TEST
# ============================================================

if __name__ == "__main__":

    print()
    print("=" * 70)
    print("CYBERSHIELD-AI COMBINED PREDICTOR")
    print("=" * 70)

    predictor = CombinedPredictor()

    print()
    print(
        "Combined predictor initialized successfully."
    )

    print()
    print("Available components:")

    print(
        "  [1] XGBoost binary malware classifier"
    )

    print(
        "  [2] Family Random Forest classifier"
    )

    print()
    print(
        "Threat Decision Engine was NOT modified."
    )

    print("=" * 70)