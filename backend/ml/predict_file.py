import os
import sys
import json
import joblib
import pandas as pd

# ============================================================
# CyberShield-AI
# COMPLETE FILE PREDICTION PIPELINE + SHAP EXPLAINABILITY
#
# PE Extraction -> Feature Mapping -> XGBoost -> SHAP
# ============================================================


CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
PROJECT_DIR = os.path.dirname(BACKEND_DIR)

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


# ============================================================
# ALLOW IMPORTING feature_engineering.py AND shap_explainer.py
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

print("XGBoost model loaded.")


# ============================================================
# LOAD FEATURE INFORMATION
# ============================================================

with open(FEATURE_INFO_PATH, "r") as file:
    feature_info = json.load(file)

FEATURE_COLUMNS = feature_info["feature_columns"]

TARGET_MAPPING = feature_info.get(
    "target_mapping",
    {}
)

print(
    "Expected ML features:",
    len(FEATURE_COLUMNS)
)


# ============================================================
# FILE EXTENSION ENCODING
# ============================================================

def encode_file_extension(extension):
    """
    Convert file extension into the numeric representation
    expected by the trained model.
    """

    if extension is None:
        return 0.0

    extension = str(
        extension
    ).lower().strip()

    extension_map = {

        ".exe": 0.0,
        ".dll": 1.0,
        ".sys": 2.0,
        ".scr": 3.0,
        ".com": 4.0,
        ".bat": 5.0,
        ".cmd": 6.0,
        ".msi": 7.0

    }

    return float(
        extension_map.get(
            extension,
            0.0
        )
    )


# ============================================================
# PREDICT FILE
# ============================================================

def predict_file(file_path):

    print("\n")
    print("=" * 70)
    print("CyberShield-AI FILE ANALYSIS")
    print("=" * 70)

    print(
        "File:",
        file_path
    )


    # ========================================================
    # STEP 1
    # PE FEATURE EXTRACTION
    # ========================================================

    print(
        "\n[1/4] Extracting PE features..."
    )

    features = extract_pe_features(
        file_path
    )

    print(
        "Extracted:",
        len(features),
        "values"
    )


    # ========================================================
    # STEP 2
    # PREPARE EXACT MODEL FEATURES
    # ========================================================

    print(
        "\n[2/4] Preparing ML features..."
    )

    model_features = {}


    for column in FEATURE_COLUMNS:

        if column in features:

            value = features[column]

        else:

            # Behavioral features are not yet
            # collected by our real-time monitor.

            value = 0


        # ----------------------------------------------------
        # file_extension
        # ----------------------------------------------------

        if column == "file_extension":

            value = encode_file_extension(
                value
            )


        model_features[column] = value


    # ========================================================
    # CREATE DATAFRAME
    # ========================================================

    X = pd.DataFrame(
        [model_features],
        columns=FEATURE_COLUMNS
    )


    # ========================================================
    # FORCE NUMERIC
    # ========================================================

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


    print(
        "ML features ready:",
        X.shape
    )


    # ========================================================
    # STEP 3
    # XGBOOST PREDICTION
    # ========================================================

    print(
        "\n[3/4] Running XGBoost..."
    )

    prediction = model.predict(
        X
    )[0]


    # ========================================================
    # PREDICTION PROBABILITY
    # ========================================================

    probability = None

    if hasattr(
        model,
        "predict_proba"
    ):

        probabilities = model.predict_proba(
            X
        )[0]

        classes = list(
            model.classes_
        )

        if prediction in classes:

            prediction_index = classes.index(
                prediction
            )

            probability = float(
                probabilities[
                    prediction_index
                ]
            )


    # ========================================================
    # LABEL
    # ========================================================

    prediction_label = str(
        prediction
    )

    if str(prediction) in TARGET_MAPPING:

        prediction_label = TARGET_MAPPING[
            str(prediction)
        ]


    # ========================================================
    # THREAT SCORE
    # ========================================================

    if probability is not None:

        threat_score = round(
            probability * 100,
            2
        )

    else:

        threat_score = None


    # ========================================================
    # SHAP EXPLAINABILITY
    # ========================================================

    print(
        "\n[4/4] Generating SHAP explanation..."
    )

    try:

        shap_explanation = explain_prediction(
            X
        )

        print("\n")
        print("=" * 70)
        print("TOP SHAP FEATURES")
        print("=" * 70)

        for index, item in enumerate(
            shap_explanation,
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
            int(prediction),

        "threat_score":
            threat_score,

        "probability":
            probability,

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

    print("\n")
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
        "Threat Score :",
        threat_score
    )

    print(
        "Probability  :",
        probability
    )

    print(
        "Model        :",
        "XGBoost"
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

    print(
        "\nSHAP Features:"
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
        "w"
    ) as file:

        json.dump(
            result,
            file,
            indent=4
        )


    print(
        "\nPrediction saved to:"
    )

    print(
        OUTPUT_PATH
    )