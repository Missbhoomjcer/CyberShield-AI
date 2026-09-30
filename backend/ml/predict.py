import os
import json
import joblib
import pandas as pd


# ============================================================
# CyberShield-AI
# ML Prediction Engine
#
# IMPORTANT:
# Class 0 = Benign
# Class 1 = Malware
# ============================================================


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

MODELS_DIR = os.path.join(
    BASE_DIR,
    "models"
)

MODEL_PATH = os.path.join(
    MODELS_DIR,
    "xgboost.pkl"
)

SCALER_PATH = os.path.join(
    MODELS_DIR,
    "scaler.pkl"
)

ENCODERS_PATH = os.path.join(
    MODELS_DIR,
    "label_encoders.pkl"
)

FEATURE_INFO_PATH = os.path.join(
    MODELS_DIR,
    "feature_info.json"
)


# ============================================================
# LOAD MODEL
# ============================================================

print("Loading CyberShield-AI XGBoost model...")

model = joblib.load(
    MODEL_PATH
)

print("XGBoost model loaded successfully.")


# ============================================================
# LOAD SCALER
# ============================================================

scaler = None

if os.path.exists(
    SCALER_PATH
):

    scaler = joblib.load(
        SCALER_PATH
    )

    print("Feature scaler loaded successfully.")

else:

    print(
        "WARNING: Scaler not found."
    )


# ============================================================
# LOAD LABEL ENCODERS
# ============================================================

label_encoders = {}

if os.path.exists(
    ENCODERS_PATH
):

    label_encoders = joblib.load(
        ENCODERS_PATH
    )

    print(
        "Label encoders loaded successfully."
    )


# ============================================================
# LOAD FEATURE INFORMATION
# ============================================================

with open(
    FEATURE_INFO_PATH,
    "r"
) as file:

    feature_info = json.load(
        file
    )


FEATURE_COLUMNS = feature_info[
    "feature_columns"
]


# ============================================================
# FIXED CLASS MAPPING
# ============================================================

CLASS_MAPPING = {
    0: "Benign",
    1: "Malware"
}


print(
    "Features expected:",
    len(FEATURE_COLUMNS)
)

print(
    "Class mapping:",
    CLASS_MAPPING
)


# ============================================================
# PREPARE INPUT
# ============================================================

def prepare_features(
    features
):

    input_data = {}

    for column in FEATURE_COLUMNS:

        # ----------------------------------------------------
        # Get feature value
        # ----------------------------------------------------

        value = features.get(
            column,
            0
        )

        if value is None:

            value = 0


        # ----------------------------------------------------
        # Handle categorical features
        # ----------------------------------------------------

        if column in label_encoders:

            encoder = label_encoders[
                column
            ]

            try:

                value_string = str(
                    value
                )

                if value_string in encoder.classes_:

                    value = encoder.transform(
                        [value_string]
                    )[0]

                else:

                    # Unknown category
                    value = 0

            except Exception:

                value = 0


        # ----------------------------------------------------
        # Convert numeric values
        # ----------------------------------------------------

        try:

            value = float(
                value
            )

        except (
            ValueError,
            TypeError
        ):

            value = 0


        input_data[
            column
        ] = value


    # --------------------------------------------------------
    # EXACT FEATURE ORDER
    # --------------------------------------------------------

    df = pd.DataFrame(
        [input_data],
        columns=FEATURE_COLUMNS
    )


    # --------------------------------------------------------
    # CLEAN INVALID VALUES
    # --------------------------------------------------------

    df = df.replace(
        [
            float("inf"),
            float("-inf")
        ],
        float("nan")
    )

    df = df.fillna(
        0
    )


    return df


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict_ransomware(
    features
):

    # --------------------------------------------------------
    # PREPARE FEATURES
    # --------------------------------------------------------

    df = prepare_features(
        features
    )


    # --------------------------------------------------------
    # KEEP ORIGINAL FEATURES FOR MODEL
    #
    # IMPORTANT:
    # Check what the XGBoost model was trained on.
    #
    # If train.py uses processed_dataset.csv,
    # the model expects scaled data.
    # --------------------------------------------------------

    model_input = df.copy()


    # --------------------------------------------------------
    # APPLY SCALING
    # --------------------------------------------------------

    if scaler is not None:

        scaled_values = scaler.transform(
            df[FEATURE_COLUMNS]
        )

        model_input = pd.DataFrame(
            scaled_values,
            columns=FEATURE_COLUMNS
        )


    # --------------------------------------------------------
    # MODEL PREDICTION
    # --------------------------------------------------------

    prediction = int(
        model.predict(
            model_input
        )[0]
    )


    # --------------------------------------------------------
    # MALWARE PROBABILITY
    #
    # Always specifically get probability of class 1.
    # --------------------------------------------------------

    malware_probability = None
    benign_probability = None


    if hasattr(
        model,
        "predict_proba"
    ):

        probabilities = model.predict_proba(
            model_input
        )[0]

        classes = list(
            model.classes_
        )


        # Probability of BENIGN = class 0

        if 0 in classes:

            benign_index = classes.index(
                0
            )

            benign_probability = float(
                probabilities[
                    benign_index
                ]
            )


        # Probability of MALWARE = class 1

        if 1 in classes:

            malware_index = classes.index(
                1
            )

            malware_probability = float(
                probabilities[
                    malware_index
                ]
            )


    # --------------------------------------------------------
    # CLASS LABEL
    # --------------------------------------------------------

    prediction_label = CLASS_MAPPING.get(
        prediction,
        "Unknown"
    )


    # --------------------------------------------------------
    # THREAT SCORE
    #
    # Threat score must ALWAYS represent malware probability.
    # --------------------------------------------------------

    if malware_probability is not None:

        threat_score = round(
            malware_probability * 100,
            2
        )

    else:

        threat_score = None


    # --------------------------------------------------------
    # FINAL RESULT
    # --------------------------------------------------------

    result = {

        "prediction":
            prediction_label,

        "class":
            prediction,

        "threat_probability":
            malware_probability,

        "benign_probability":
            benign_probability,

        "threat_score":
            threat_score,

        "model":
            "XGBoost",

        "features_used":
            len(FEATURE_COLUMNS)
    }


    return result


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print()

    print(
        "=" * 70
    )

    print(
        "CyberShield-AI Prediction Engine"
    )

    print(
        "=" * 70
    )

    print(
        "Model:",
        "XGBoost"
    )

    print(
        "Features expected:",
        len(FEATURE_COLUMNS)
    )

    print(
        "Class 0:",
        "Benign"
    )

    print(
        "Class 1:",
        "Malware"
    )

    print()

    print(
        "Prediction engine loaded successfully."
    )

    print(
        "=" * 70
    )