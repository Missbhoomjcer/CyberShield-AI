import os
import sys
import json
import joblib
import pandas as pd


# ============================================================
# CyberShield-AI
# COMPLETE FILE PREDICTION PIPELINE + SHAP EXPLAINABILITY
#
# PE Extraction -> Exact Feature Alignment -> Same Encoding
# -> Same Scaling -> XGBoost -> SHAP
# ============================================================


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)

MODELS_DIR = os.path.join(
    BACKEND_DIR,
    "models"
)

MODEL_PATH = os.path.join(
    MODELS_DIR,
    "xgboost.pkl"
)

FEATURE_INFO_PATH = os.path.join(
    MODELS_DIR,
    "feature_info.json"
)

SCALER_PATH = os.path.join(
    MODELS_DIR,
    "scaler.pkl"
)

ENCODERS_PATH = os.path.join(
    MODELS_DIR,
    "label_encoders.pkl"
)


# ============================================================
# IMPORT FEATURE EXTRACTION AND SHAP
# ============================================================

if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from feature_engineering import extract_pe_features
from shap_explainer import explain_prediction


# ============================================================
# LOAD MODEL
# ============================================================

print("Loading XGBoost model...")

model = joblib.load(MODEL_PATH)

print("XGBoost model loaded successfully.")


# ============================================================
# LOAD FEATURE INFORMATION
# ============================================================

with open(
    FEATURE_INFO_PATH,
    "r",
    encoding="utf-8"
) as file:

    feature_info = json.load(file)


FEATURE_COLUMNS = feature_info[
    "feature_columns"
]


# ============================================================
# CLASS MAPPING
# ============================================================

CLASS_MAPPING = feature_info.get(
    "class_mapping",
    {
        "Benign": 0,
        "Malware": 1
    }
)


CLASS_NAMES = {
    int(value): key
    for key, value in CLASS_MAPPING.items()
}


print(
    "Features expected:",
    len(FEATURE_COLUMNS)
)

print(
    "Class mapping:",
    CLASS_NAMES
)


# ============================================================
# LOAD SCALER
# ============================================================

if not os.path.exists(SCALER_PATH):

    raise FileNotFoundError(
        f"Scaler not found: {SCALER_PATH}"
    )


scaler = joblib.load(
    SCALER_PATH
)

print(
    "Feature scaler loaded successfully."
)


# ============================================================
# LOAD LABEL ENCODERS
# ============================================================

if not os.path.exists(ENCODERS_PATH):

    raise FileNotFoundError(
        f"Label encoders not found: {ENCODERS_PATH}"
    )


label_encoders = joblib.load(
    ENCODERS_PATH
)

print(
    "Label encoders loaded successfully."
)


# ============================================================
# SAFE CATEGORICAL ENCODING
# ============================================================

def encode_categorical_features(df):

    for column, encoder in label_encoders.items():

        if column not in df.columns:
            continue

        value = str(
            df.at[0, column]
        )

        known_classes = set(
            str(item)
            for item in encoder.classes_
        )

        if value in known_classes:

            df[column] = encoder.transform(
                [value]
            )

        else:

            # Unknown categorical value.
            # Use the first known category safely.
            # This avoids crashing prediction.

            fallback_value = str(
                encoder.classes_[0]
            )

            df[column] = encoder.transform(
                [fallback_value]
            )

    return df


# ============================================================
# PREPARE EXACT MODEL FEATURES
# ============================================================

def prepare_features(features):

    model_features = {}


    for column in FEATURE_COLUMNS:

        value = features.get(
            column,
            0
        )

        if value is None:
            value = 0

        model_features[
            column
        ] = value


    # Create dataframe in EXACT training order

    X = pd.DataFrame(
        [model_features],
        columns=FEATURE_COLUMNS
    )


    # --------------------------------------------------------
    # APPLY SAME LABEL ENCODERS USED DURING TRAINING
    # --------------------------------------------------------

    X = encode_categorical_features(
        X
    )


    # --------------------------------------------------------
    # CONVERT EVERYTHING TO NUMERIC
    # --------------------------------------------------------

    for column in X.columns:

        X[column] = pd.to_numeric(
            X[column],
            errors="coerce"
        )


    # --------------------------------------------------------
    # CLEAN INVALID VALUES
    # --------------------------------------------------------

    X = X.replace(
        [float("inf"), float("-inf")],
        float("nan")
    )

    X = X.fillna(0)


    # --------------------------------------------------------
    # IMPORTANT
    # APPLY THE SAME SCALER USED DURING TRAINING
    # --------------------------------------------------------

    X_scaled = scaler.transform(
        X
    )


    X_scaled = pd.DataFrame(
        X_scaled,
        columns=FEATURE_COLUMNS
    )


    return X_scaled


# ============================================================
# GET MALWARE PROBABILITY
# ============================================================

def get_malware_probability(X):

    if not hasattr(
        model,
        "predict_proba"
    ):

        return None


    probabilities = model.predict_proba(
        X
    )[0]


    classes = list(
        model.classes_
    )


    # IMPORTANT:
    # Always get probability for class 1 = Malware

    if 1 in classes:

        malware_index = classes.index(
            1
        )

        return float(
            probabilities[
                malware_index
            ]
        )


    return None


# ============================================================
# PREDICT FILE
# ============================================================

def predict_file(file_path):

    print()
    print("=" * 70)
    print("CYBERSHIELD-AI FILE ANALYSIS")
    print("=" * 70)

    print(
        "File:",
        file_path
    )


    # ========================================================
    # STEP 1: EXTRACT FEATURES
    # ========================================================

    print()
    print(
        "[1/4] Extracting PE features..."
    )

    features = extract_pe_features(
        file_path
    )

    print(
        "Extracted values:",
        len(features)
    )


    # ========================================================
    # STEP 2: PREPARE FEATURES
    # ========================================================

    print()
    print(
        "[2/4] Preparing ML features..."
    )

    X = prepare_features(
        features
    )


    # Final safety check

    if list(X.columns) != FEATURE_COLUMNS:

        raise ValueError(
            "Feature order mismatch detected."
        )


    if X.shape[1] != len(FEATURE_COLUMNS):

        raise ValueError(
            f"Expected {len(FEATURE_COLUMNS)} features "
            f"but received {X.shape[1]}."
        )


    print(
        "ML features ready:",
        X.shape
    )


    # ========================================================
    # STEP 3: XGBOOST PREDICTION
    # ========================================================

    print()
    print(
        "[3/4] Running XGBoost..."
    )


    prediction = int(
        model.predict(X)[0]
    )


    # Always calculate probability of Malware = class 1

    malware_probability = (
        get_malware_probability(X)
    )


    if malware_probability is None:

        malware_probability = float(
            prediction
        )


    threat_score = round(
        malware_probability * 100,
        2
    )


    # ========================================================
    # CLASS LABEL
    # ========================================================

    prediction_label = CLASS_NAMES.get(
        prediction,
        "Unknown"
    )


    # ========================================================
    # STEP 4: SHAP
    # ========================================================

    print()
    print(
        "[4/4] Generating SHAP explanation..."
    )


    try:

        shap_explanation = explain_prediction(
            X
        )


        print()
        print("=" * 70)
        print("TOP SHAP FEATURES")
        print("=" * 70)


        for index, item in enumerate(
            shap_explanation,
            start=1
        ):

            print(
                f"{index}. "
                f"{item['feature']} | "
                f"SHAP: "
                f"{item['shap_value']:.6f} | "
                f"Impact: "
                f"{item['absolute_impact']:.6f}"
            )


        print("=" * 70)


    except Exception as error:

        print(
            "[SHAP] Explanation failed:",
            error
        )

        shap_explanation = []


    # ========================================================
    # FILE INFORMATION
    # ========================================================

    filename = os.path.basename(
        file_path
    )

    file_size = features.get(
        "_file_size",
        0
    )

    entropy = features.get(
        "_entropy",
        0
    )

    sha256 = features.get(
        "_sha256",
        ""
    )


    # ========================================================
    # FINAL RESULT
    # ========================================================

    result = {

        "filename":
            filename,

        "prediction":
            prediction_label,

        "class":
            prediction,

        "threat_score":
            threat_score,

        "probability":
            malware_probability,

        "model":
            "XGBoost",

        "features_used":
            len(FEATURE_COLUMNS),

        "file_size":
            file_size,

        "entropy":
            entropy,

        "sha256":
            sha256,

        "shap_explanation":
            shap_explanation
    }


    # ========================================================
    # DISPLAY RESULT
    # ========================================================

    print()
    print("=" * 70)
    print("CYBERSHIELD-AI RESULT")
    print("=" * 70)

    print(
        "Filename     :",
        filename
    )

    print(
        "Prediction   :",
        prediction_label
    )

    print(
        "Class        :",
        prediction
    )

    print(
        "Threat Score :",
        threat_score,
        "%"
    )

    print(
        "Malware Probability:",
        f"{malware_probability:.6f}"
    )

    print(
        "Model        : XGBoost"
    )

    print(
        "Features     :",
        len(FEATURE_COLUMNS)
    )

    print(
        "File Size    :",
        file_size
    )

    print(
        "Entropy      :",
        entropy
    )

    print(
        "SHA256       :",
        sha256
    )

    print()
    print(
        "SHAP Features:"
    )


    for index, item in enumerate(
        shap_explanation,
        start=1
    ):

        print(
            f"{index}. "
            f"{item['feature']} "
            f"(impact: "
            f"{item['absolute_impact']:.6f})"
        )


    print("=" * 70)


    return result


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    TEST_FILE = r"C:\Windows\System32\notepad.exe"


    if not os.path.exists(
        TEST_FILE
    ):

        print(
            "Test file not found:"
        )

        print(
            TEST_FILE
        )

        sys.exit(1)


    result = predict_file(
        TEST_FILE
    )


    # ========================================================
    # SAVE TEST RESULT
    # ========================================================

    REPORTS_DIR = os.path.join(
        BACKEND_DIR,
        "reports"
    )

    os.makedirs(
        REPORTS_DIR,
        exist_ok=True
    )


    OUTPUT_PATH = os.path.join(
        REPORTS_DIR,
        "test_prediction.json"
    )


    with open(
        OUTPUT_PATH,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            result,
            file,
            indent=4
        )


    print()
    print(
        "Prediction saved to:"
    )

    print(
        OUTPUT_PATH
    )