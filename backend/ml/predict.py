import os
import json
import joblib
import pandas as pd


# ============================================================
# CyberShield-AI
# ML Prediction Engine
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

FEATURE_INFO_PATH = os.path.join(
    MODELS_DIR,
    "feature_info.json"
)


# ============================================================
# LOAD MODEL
# ============================================================

print("Loading CyberShield-AI XGBoost model...")

model = joblib.load(MODEL_PATH)

print("XGBoost model loaded successfully.")


# ============================================================
# LOAD FEATURE INFORMATION
# ============================================================

with open(
    FEATURE_INFO_PATH,
    "r"
) as file:

    feature_info = json.load(file)


FEATURE_COLUMNS = feature_info[
    "feature_columns"
]

TARGET_MAPPING = feature_info.get(
    "target_mapping",
    {}
)


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict_ransomware(features):
    """
    Predict whether a file is benign or malicious.

    Parameters
    ----------
    features : dict
        Dictionary containing the features extracted
        from the uploaded file.

    Returns
    -------
    dict
        Prediction result.
    """

    # --------------------------------------------------------
    # Create dataframe
    # --------------------------------------------------------

    input_data = {}

    for column in FEATURE_COLUMNS:

        if column in features:

            value = features[column]

            if value is None:
                value = 0

            input_data[column] = value

        else:

            # Missing features are temporarily filled with 0.
            input_data[column] = 0


    df = pd.DataFrame(
        [input_data],
        columns=FEATURE_COLUMNS
    )


    # --------------------------------------------------------
    # Clean values
    # --------------------------------------------------------

    df = df.replace(
        [float("inf"), float("-inf")],
        float("nan")
    )

    df = df.fillna(0)


    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    prediction = model.predict(df)[0]


    # --------------------------------------------------------
    # Probability
    # --------------------------------------------------------

    threat_probability = None

    if hasattr(
        model,
        "predict_proba"
    ):

        probabilities = model.predict_proba(
            df
        )[0]

        classes = list(
            model.classes_
        )

        if prediction in classes:

            prediction_index = classes.index(
                prediction
            )

            threat_probability = float(
                probabilities[
                    prediction_index
                ]
            )


    # --------------------------------------------------------
    # Convert prediction
    # --------------------------------------------------------

    prediction_label = str(
        prediction
    )

    if str(prediction) in TARGET_MAPPING:

        prediction_label = TARGET_MAPPING[
            str(prediction)
        ]


    # --------------------------------------------------------
    # Threat score
    # --------------------------------------------------------

    if threat_probability is not None:

        threat_score = round(
            threat_probability * 100,
            2
        )

    else:

        threat_score = None


    # --------------------------------------------------------
    # Result
    # --------------------------------------------------------

    result = {

        "prediction": prediction_label,

        "class": int(prediction),

        "threat_probability":
            threat_probability,

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

    print("\n")
    print("=" * 60)
    print("CyberShield-AI Prediction Engine")
    print("=" * 60)

    print(
        "Model:",
        "XGBoost"
    )

    print(
        "Features expected:",
        len(FEATURE_COLUMNS)
    )

    print(
        "Prediction engine loaded successfully."
    )

    print("=" * 60)