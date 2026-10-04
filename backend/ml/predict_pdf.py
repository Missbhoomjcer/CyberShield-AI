import sys
import json
import pickle
import numpy as np

from backend.ml.pdf_feature_extractor import extract_pdf_features


MODEL_PATH = "backend/models/pdf_xgboost_model.pkl"
FEATURES_PATH = "backend/models/pdf_feature_names.json"


# Features that indicate active/suspicious PDF content.
HIGH_RISK_FEATURES = [
    "JS",
    "Javascript",
    "AA",
    "Launch",
    "EmbeddedFile",
    "XFA",
    "RichMedia",
    "JBIG2Decode",
]


def inspect_pdf_security(features):
    """
    Structural security inspection.

    Normal PDF structures such as xref, obj, stream and
    startxref are NOT treated as malware indicators.
    """

    indicators = []

    for feature in HIGH_RISK_FEATURES:
        value = features.get(feature, 0)

        if value > 0:
            indicators.append(
                f"{feature}={value}"
            )

    return indicators


def predict_pdf(file_path):

    print("=" * 60)
    print("CYBERSHIELD-AI PDF MALWARE DETECTOR")
    print("=" * 60)
    print(f"File: {file_path}")
    print()

    print("Extracting PDF features...")

    features = extract_pdf_features(file_path)

    if not isinstance(features, dict):
        raise TypeError(
            f"Expected dictionary, got {type(features).__name__}"
        )

    print(f"Extractor returned {len(features)} features.")

    # ---------------------------------------------------------
    # Security inspection
    # ---------------------------------------------------------

    suspicious_indicators = inspect_pdf_security(features)

    # ---------------------------------------------------------
    # Load ML model
    # ---------------------------------------------------------

    print("Loading PDF XGBoost model...")

    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)

    with open(FEATURES_PATH, "r") as f:
        feature_names = json.load(f)

    missing = [
        name for name in feature_names
        if name not in features
    ]

    if missing:
        raise ValueError(
            f"Missing model features: {missing}"
        )

    X = np.asarray(
        [features[name] for name in feature_names],
        dtype=float
    ).reshape(1, -1)

    probabilities = model.predict_proba(X)[0]

    benign_probability = float(probabilities[0])
    malicious_probability = float(probabilities[1])

    # ---------------------------------------------------------
    # Final decision
    # ---------------------------------------------------------
    #
    # IMPORTANT:
    # Ordinary PDF structural objects are NOT enough to
    # classify a document as malicious.
    #
    # If there are no active/suspicious PDF indicators,
    # classify the document as BENIGN.
    #
    # ML probability is retained for transparency.
    # ---------------------------------------------------------

    if not suspicious_indicators:

        prediction = "BENIGN"

        # For the displayed confidence, use the structural
        # security decision rather than the mismatched ML
        # probability.
        confidence = 1.0

        decision_reason = (
            "No active/suspicious PDF content indicators detected."
        )

    else:

        prediction = "MALICIOUS"
        confidence = malicious_probability

        decision_reason = (
            "Suspicious active PDF content detected: "
            + ", ".join(suspicious_indicators)
        )

    print()
    print("=" * 60)
    print("PDF ANALYSIS RESULT")
    print("=" * 60)

    print(f"File                  : {file_path}")
    print(f"Prediction            : {prediction}")
    print(f"Malicious probability : {malicious_probability:.4f}")
    print(f"Benign probability    : {benign_probability:.4f}")
    print(f"Confidence            : {confidence:.4f}")

    print()
    print(f"Security assessment   : {decision_reason}")

    print("=" * 60)

    return {
        "file": file_path,
        "prediction": prediction,
        "malicious_probability": malicious_probability,
        "benign_probability": benign_probability,
        "confidence": confidence,
        "suspicious_indicators": suspicious_indicators,
        "decision_reason": decision_reason,
    }


if __name__ == "__main__":

    if len(sys.argv) != 2:
        print(
            'Usage: python backend\\ml\\predict_pdf.py "PATH_TO_PDF"'
        )
        sys.exit(1)

    pdf_path = sys.argv[1]

    try:
        predict_pdf(pdf_path)

    except FileNotFoundError:
        print(f"ERROR: File not found: {pdf_path}")
        sys.exit(1)

    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)

