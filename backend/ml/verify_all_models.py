import json
import pickle
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import torch


PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODELS_DIR = PROJECT_ROOT / "backend" / "models"


def load_pickle_model(path):
    """Load models saved with either joblib or pickle."""
    try:
        return joblib.load(path)
    except Exception:
        with open(path, "rb") as f:
            return pickle.load(f)


def main():
    print("=" * 70)
    print("CYBERSHIELD-AI — COMPLETE MODEL VERIFICATION")
    print("=" * 70)

    # ---------------------------------------------------------
    # Load feature information
    # ---------------------------------------------------------
    feature_info_path = MODELS_DIR / "feature_info.json"

    with open(feature_info_path, "r", encoding="utf-8") as f:
        feature_info = json.load(f)

    feature_names = feature_info.get("feature_names")

    if feature_names is None:
        feature_names = feature_info.get("feature_columns")

    if isinstance(feature_names, dict):
        feature_names = feature_names.get("features", [])

    print(f"\nStatic features expected: {len(feature_names)}")

    # Dummy feature vector with correct dimensions
    X = pd.DataFrame(
        np.zeros((1, len(feature_names))),
        columns=feature_names,
    )

    # ---------------------------------------------------------
    # Load scaler
    # ---------------------------------------------------------
    scaler = joblib.load(MODELS_DIR / "scaler.pkl")

    X_scaled = scaler.transform(X)

    print("Scaler:                         PASS")

    # ---------------------------------------------------------
    # Static models
    # ---------------------------------------------------------
    static_models = [
        ("Decision Tree", "decision_tree.pkl"),
        ("Random Forest", "random_forest.pkl"),
        ("SVM", "svm.pkl"),
        ("XGBoost", "xgboost_model.pkl"),
    ]

    print("\n" + "-" * 70)
    print("STATIC ML MODELS")
    print("-" * 70)

    static_passed = 0

    for name, filename in static_models:
        path = MODELS_DIR / filename

        try:
            model = load_pickle_model(path)

            prediction = model.predict(X_scaled)[0]

            if hasattr(model, "predict_proba"):
                probability = model.predict_proba(X_scaled)[0]
                probability_text = np.round(probability, 4).tolist()
            else:
                probability_text = "N/A"

            print(f"\n{name}")
            print(f"  Artifact:   PASS")
            print(f"  Loaded:     PASS")
            print(f"  Prediction: {prediction}")
            print(f"  Probability:{probability_text}")
            print("  STATUS:     PASS")

            static_passed += 1

        except Exception as e:
            print(f"\n{name}")
            print("  STATUS:     FAIL")
            print(f"  Error:      {type(e).__name__}: {e}")

    # ---------------------------------------------------------
    # Family classifier
    # ---------------------------------------------------------
    print("\n" + "-" * 70)
    print("FAMILY CLASSIFIER")
    print("-" * 70)

    try:
        family_model = load_pickle_model(
            MODELS_DIR / "family_classifier.pkl"
        )

        family_encoder = load_pickle_model(
            MODELS_DIR / "family_label_encoder.pkl"
        )

        family_prediction = family_model.predict(X)[0]
        family_name = family_encoder.inverse_transform(
            [family_prediction]
        )[0]

        print("  Model loaded:       PASS")
        print(f"  Classes:            {len(family_encoder.classes_)}")
        print(f"  Prediction:         {family_name}")
        print("  STATUS:             PASS")

        family_passed = True

    except Exception as e:
        print("  STATUS:             FAIL")
        print(f"  Error:              {type(e).__name__}: {e}")
        family_passed = False

    # ---------------------------------------------------------
    # LSTM
    # ---------------------------------------------------------
    print("\n" + "-" * 70)
    print("LSTM BEHAVIORAL MODEL")
    print("-" * 70)

    try:
        lstm_path = MODELS_DIR / "lstm_behavioral_model.pth"

        checkpoint = torch.load(
            lstm_path,
            map_location="cpu",
            weights_only=False,
        )

        if isinstance(checkpoint, dict):
            print("  Model artifact:     PASS")
            print(f"  Checkpoint keys:    {list(checkpoint.keys())[:10]}")
        else:
            print("  Model artifact:     PASS")
            print(f"  Object type:        {type(checkpoint).__name__}")

        print("  Loaded:             PASS")
        print("  STATUS:             PASS")

        lstm_passed = True

    except Exception as e:
        print("  STATUS:             FAIL")
        print(f"  Error:              {type(e).__name__}: {e}")
        lstm_passed = False

    # ---------------------------------------------------------
    # Summary
    # ---------------------------------------------------------
    print("\n" + "=" * 70)
    print("VERIFICATION SUMMARY")
    print("=" * 70)

    print(
        f"Static models:        {static_passed}/{len(static_models)} PASS"
    )
    print(
        f"Family classifier:    {'PASS' if family_passed else 'FAIL'}"
    )
    print(
        f"LSTM behavioral:      {'PASS' if lstm_passed else 'FAIL'}"
    )

    total_components = len(static_models) + 2
    total_passed = (
        static_passed
        + int(family_passed)
        + int(lstm_passed)
    )

    print(
        f"\nTOTAL:                "
        f"{total_passed}/{total_components} COMPONENTS PASS"
    )

    if total_passed == total_components:
        print("\nALL MODEL ARTIFACTS VERIFIED SUCCESSFULLY")
    else:
        print("\nSOME MODEL COMPONENTS REQUIRE ATTENTION")

    print("=" * 70)


if __name__ == "__main__":
    main()