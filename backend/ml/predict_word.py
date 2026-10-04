from pathlib import Path
import sys
import json
import pickle
import numpy as np

from backend.ml.word_feature_extractor import extract_word_features


BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_PATH = BASE_DIR / "models" / "word_xgboost_model.pkl"
FEATURE_NAMES_PATH = BASE_DIR / "models" / "word_feature_names.json"


def load_model():
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)


def load_feature_names():
    with open(FEATURE_NAMES_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def predict_word(file_path):

    file_path = Path(file_path)

    if not file_path.exists():
        raise FileNotFoundError(
            f"File not found: {file_path}"
        )

    # --------------------------------------------------
    # Load model
    # --------------------------------------------------

    model = load_model()
    feature_names = load_feature_names()

    # --------------------------------------------------
    # Extract features
    # --------------------------------------------------

    features = extract_word_features(file_path)

    # --------------------------------------------------
    # Create feature vector in EXACT model order
    # --------------------------------------------------

    feature_vector = []

    for feature_name in feature_names:

        if feature_name == "label":
            continue

        feature_vector.append(
            features.get(feature_name, 0)
        )

    X = np.array(
        feature_vector,
        dtype=float
    ).reshape(1, -1)

    # --------------------------------------------------
    # Prediction
    # --------------------------------------------------

    prediction = int(
        model.predict(X)[0]
    )

    probabilities = model.predict_proba(X)[0]

    benign_probability = float(
        probabilities[0]
    )

    malicious_probability = float(
        probabilities[1]
    )

    # --------------------------------------------------
    # Result
    # --------------------------------------------------

    if prediction == 1:
        verdict = "MALICIOUS"
        confidence = malicious_probability
    else:
        verdict = "BENIGN"
        confidence = benign_probability

    return {
        "file": str(file_path),
        "file_type": file_path.suffix.lower(),
        "prediction": prediction,
        "verdict": verdict,
        "benign_probability": benign_probability,
        "malicious_probability": malicious_probability,
        "confidence": confidence,
        "features_extracted": len(feature_vector),
    }


if __name__ == "__main__":

    if len(sys.argv) < 2:

        print(
            'Usage: python backend\\ml\\predict_word.py "C:\\path\\file.docx"'
        )

        sys.exit(1)

    file_path = sys.argv[1]

    print("=" * 60)
    print("CYBERSHIELD-AI DOC/DOCX DETECTOR")
    print("=" * 60)

    try:

        result = predict_word(file_path)

        print()
        print(f"File                 : {result['file']}")
        print(f"File type            : {result['file_type']}")
        print(f"Features extracted   : {result['features_extracted']}")
        print()
        print(f"Prediction           : {result['verdict']}")
        print(
            f"Benign probability   : {result['benign_probability']:.4f}"
        )
        print(
            f"Malicious probability: {result['malicious_probability']:.4f}"
        )
        print(
            f"Confidence           : {result['confidence']:.4f}"
        )

        print()
        print("=" * 60)

    except Exception as e:

        print()
        print("ERROR:")
        print(str(e))
        print()

        sys.exit(1)

