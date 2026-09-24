import os
import sys
import json
import pandas as pd


# ============================================================
# CyberShield-AI
# FINAL FILE PREDICTION PIPELINE
#
# Uses:
# - PE feature extraction
# - Final XGBoost model
# - Static scaler
# - Family classifier
# - SHAP explainability
#
# Public API:
#     predict_file(file_path)
# ============================================================


CURRENT_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

BACKEND_DIR = os.path.dirname(
    CURRENT_DIR
)

MODELS_DIR = os.path.join(
    BACKEND_DIR,
    "models"
)


# ============================================================
# IMPORT PROJECT MODULES
# ============================================================

if BACKEND_DIR not in sys.path:

    sys.path.insert(
        0,
        BACKEND_DIR
    )


from ml.feature_engineering import (
    extract_pe_features
)

from ml.combined_predictor import (
    CombinedPredictor
)

from ml.shap_explainer import (
    explain_prediction
)


# ============================================================
# LOAD FEATURE INFORMATION
# ============================================================

FEATURE_INFO_PATH = os.path.join(
    MODELS_DIR,
    "feature_info.json"
)


with open(
    FEATURE_INFO_PATH,
    "r"
) as file:

    FEATURE_INFO = json.load(
        file
    )


FEATURE_COLUMNS = FEATURE_INFO[
    "feature_columns"
]


# ============================================================
# INITIALIZE FINAL PREDICTOR
# ============================================================

print(
    "[predict_file] Initializing final ML predictor..."
)

PREDICTOR = CombinedPredictor()

print(
    "[predict_file] Final ML predictor ready."
)


# ============================================================
# PREDICT FILE
# ============================================================

def predict_file(file_path):
    """
    Analyze a Windows PE file using the finalized
    CyberShield-AI ML pipeline.

    Pipeline:

        PE file
            ↓
        Feature extraction
            ↓
        XGBoost binary classification
            ↓
        Family classification
            ↓
        SHAP explainability

    Returns a dictionary compatible with the
    existing upload API.
    """

    # ========================================================
    # VALIDATE FILE
    # ========================================================

    if not os.path.exists(file_path):

        raise FileNotFoundError(
            f"File not found: {file_path}"
        )


    # ========================================================
    # EXTRACT PE FEATURES
    # ========================================================

    features = extract_pe_features(
        file_path
    )


    # ========================================================
    # FINAL COMBINED PREDICTION
    # ========================================================

    prediction_result = PREDICTOR.predict(
        features
    )


    # ========================================================
    # PREPARE SHAP INPUT
    #
    # SHAP expects exactly the same 72 features
    # used by the XGBoost model.
    #
    # Metadata fields such as:
    # _file_size
    # _entropy
    # _sha256
    # _md5
    #
    # are deliberately excluded.
    # ========================================================

    shap_input = pd.DataFrame(
        [features]
    ).reindex(
        columns=FEATURE_COLUMNS,
        fill_value=0
    )


    # ========================================================
    # SHAP EXPLANATION
    # ========================================================

    try:

        shap_explanation = explain_prediction(
            shap_input
        )

    except Exception as e:

        print(
            "[predict_file] SHAP explanation failed:",
            str(e)
        )

        shap_explanation = []


    # ========================================================
    # FILE METADATA
    # ========================================================

    filename = os.path.basename(
        file_path
    )

    file_size = features.get(
        "_file_size",
        os.path.getsize(file_path)
    )

    entropy = features.get(
        "_entropy",
        0.0
    )

    sha256 = features.get(
        "_sha256",
        ""
    )


    # ========================================================
    # RESULT
    # ========================================================

    result = {

        # ----------------------------------------------------
        # Existing API fields
        # ----------------------------------------------------

        "filename":
            filename,

        "prediction":
            (
                "Malware"
                if prediction_result[
                    "malware_prediction"
                ] == 1
                else "Benign"
            ),

        "class":
            prediction_result[
                "malware_prediction"
            ],

        "threat_score":
            prediction_result[
                "malware_probability"
            ],

        "probability":
            prediction_result[
                "malware_probability"
            ],

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
            shap_explanation,


        # ----------------------------------------------------
        # New family-classification fields
        # ----------------------------------------------------

        "family":
            prediction_result[
                "family"
            ],

        "family_confidence":
            prediction_result[
                "family_confidence"
            ],

        "family_top_3":
            prediction_result[
                "family_top_3"
            ],


        # ----------------------------------------------------
        # Explicit probability fields
        # ----------------------------------------------------

        "malware_probability":
            prediction_result[
                "malware_probability"
            ],

        "benign_probability":
            prediction_result[
                "benign_probability"
            ]
    }


    return result


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print()
    print("=" * 70)
    print(
        "CYBERSHIELD-AI FINAL FILE PREDICTION TEST"
    )
    print("=" * 70)

    test_file = (
        r"C:\Windows\System32\notepad.exe"
    )

    try:

        result = predict_file(
            test_file
        )

        print()
        print(
            "Filename:",
            result["filename"]
        )

        print(
            "Prediction:",
            result["prediction"]
        )

        print(
            "Malware probability:",
            result["malware_probability"],
            "%"
        )

        print(
            "Benign probability:",
            result["benign_probability"],
            "%"
        )

        print(
            "Family:",
            result["family"]
        )

        print(
            "Family confidence:",
            result["family_confidence"],
            "%"
        )

        print(
            "Top 3 families:"
        )

        for item in result[
            "family_top_3"
        ]:

            print(
                "  -",
                item["family"],
                ":",
                item["confidence"],
                "%"
            )

        print()
        print(
            "Top SHAP features:"
        )

        for index, item in enumerate(
            result[
                "shap_explanation"
            ],
            start=1
        ):

            print(
                f"  {index}. "
                f"{item['feature']} "
                f"| SHAP: "
                f"{item['shap_value']:.6f}"
            )

        print()
        print(
            "Features used:",
            result["features_used"]
        )

        print(
            "Entropy:",
            result["entropy"]
        )

        print(
            "SHA256:",
            result["sha256"]
        )

        print()
        print(
            "FINAL FILE PREDICTION TEST PASSED"
        )

    except Exception as e:

        print()
        print(
            "FINAL FILE PREDICTION TEST FAILED"
        )

        print(
            "Error:",
            str(e)
        )

        raise