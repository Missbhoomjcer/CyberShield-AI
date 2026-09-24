import pickle
from pathlib import Path

import numpy as np
import pandas as pd


class FamilyPredictor:
    """
    Ransomware / malware family classification module.

    Uses the trained Random Forest family classifier
    and the preprocessing artifacts saved during training.
    """

    def __init__(self):

        # ====================================================
        # PATHS
        # ====================================================

        project_root = Path(__file__).resolve().parents[2]

        models_dir = project_root / "backend" / "models"

        self.model_path = (
            models_dir / "family_classifier.pkl"
        )

        self.label_encoder_path = (
            models_dir / "family_label_encoder.pkl"
        )

        self.feature_encoders_path = (
            models_dir / "family_feature_encoders.pkl"
        )

        self.feature_names_path = (
            models_dir / "family_feature_names.pkl"
        )

        # ====================================================
        # LOAD MODEL
        # ====================================================

        with open(
            self.model_path,
            "rb"
        ) as f:
            self.model = pickle.load(f)

        # ====================================================
        # LOAD FAMILY LABEL ENCODER
        # ====================================================

        with open(
            self.label_encoder_path,
            "rb"
        ) as f:
            self.label_encoder = pickle.load(f)

        # ====================================================
        # LOAD FEATURE ENCODERS
        # ====================================================

        with open(
            self.feature_encoders_path,
            "rb"
        ) as f:
            self.feature_encoders = pickle.load(f)

        # ====================================================
        # LOAD FEATURE NAMES
        # ====================================================

        with open(
            self.feature_names_path,
            "rb"
        ) as f:
            self.feature_names = pickle.load(f)

        print(
            "[FamilyPredictor] Model loaded successfully"
        )

        print(
            "[FamilyPredictor] Classes:",
            len(self.label_encoder.classes_)
        )

        print(
            "[FamilyPredictor] Features:",
            len(self.feature_names)
        )

    # ========================================================
    # PREPROCESS FEATURES
    # ========================================================

    def preprocess(self, features):

        # Convert input into DataFrame
        if isinstance(features, pd.DataFrame):

            X = features.copy()

        elif isinstance(features, dict):

            X = pd.DataFrame([features])

        else:

            raise TypeError(
                "features must be a dictionary or pandas DataFrame"
            )

        # ----------------------------------------------------
        # Remove target / metadata columns if present
        # ----------------------------------------------------

        X = X.drop(
            columns=[
                "Family",
                "Category",
                "Class",
                "md5",
                "sha1"
            ],
            errors="ignore"
        )

        # ----------------------------------------------------
        # Ensure all training features exist
        # ----------------------------------------------------

        for feature in self.feature_names:

            if feature not in X.columns:

                X[feature] = 0

        # ----------------------------------------------------
        # Remove unexpected columns
        # ----------------------------------------------------

        X = X[
            self.feature_names
        ].copy()

        # ----------------------------------------------------
        # Fast categorical encoding
        # ----------------------------------------------------

        for column, encoder in self.feature_encoders.items():

            if column not in X.columns:
                continue

            mapping = {
                value: index
                for index, value
                in enumerate(
                    encoder.classes_
                )
            }

            X[column] = (
                X[column]
                .astype(str)
                .map(mapping)
                .fillna(-1)
                .astype(int)
            )

        # ----------------------------------------------------
        # Clean numeric values
        # ----------------------------------------------------

        X = X.replace(
            [np.inf, -np.inf],
            np.nan
        )

        X = X.fillna(0)

        return X

    # ========================================================
    # PREDICT FAMILY
    # ========================================================

    def predict(self, features):

        X = self.preprocess(features)

        # ----------------------------------------------------
        # Prediction
        # ----------------------------------------------------

        prediction = self.model.predict(X)

        predicted_family = (
            self.label_encoder
            .inverse_transform(
                prediction.astype(int)
            )[0]
        )

        # ----------------------------------------------------
        # Probabilities
        # ----------------------------------------------------

        probabilities = (
            self.model.predict_proba(X)[0]
        )

        # ----------------------------------------------------
        # Top-3 predictions
        # ----------------------------------------------------

        top_indices = np.argsort(
            probabilities
        )[::-1][:3]

        top_3 = []

        for index in top_indices:

            top_3.append(
                {
                    "family": str(
                        self.label_encoder
                        .classes_[index]
                    ),
                    "confidence": round(
                        float(
                            probabilities[index]
                        ) * 100,
                        2
                    )
                }
            )

        # ----------------------------------------------------
        # Main confidence
        # ----------------------------------------------------

        confidence = round(
            float(
                np.max(probabilities)
            ) * 100,
            2
        )

        # ----------------------------------------------------
        # Return structured result
        # ----------------------------------------------------

        return {
            "family": str(
                predicted_family
            ),
            "confidence": confidence,
            "top_3": top_3
        }


# ============================================================
# SIMPLE TEST
# ============================================================

if __name__ == "__main__":

    print()
    print("=" * 70)
    print("CYBERSHIELD-AI FAMILY PREDICTOR")
    print("=" * 70)

    predictor = FamilyPredictor()

    print()
    print("Family classes:")
    print(
        list(
            predictor.label_encoder.classes_
        )
    )

    print()
    print("Family predictor initialized successfully.")