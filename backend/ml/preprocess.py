import os
import json
import joblib
import pandas as pd

from sklearn.preprocessing import StandardScaler, LabelEncoder


# ============================================================
# CyberShield-AI
# DATASET PREPROCESSING
# ============================================================

print("=" * 70)
print("CyberShield-AI - Dataset Preprocessing")
print("=" * 70)


# ============================================================
# PATHS
# ============================================================

BACKEND_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

PROJECT_DIR = os.path.dirname(
    BACKEND_DIR
)

DATASET_PATH = os.path.join(
    PROJECT_DIR,
    "datasets",
    "ransomware",
    "ransom.csv"
)

PROCESSED_DIR = os.path.join(
    PROJECT_DIR,
    "datasets",
    "processed"
)

MODELS_DIR = os.path.join(
    BACKEND_DIR,
    "models"
)

os.makedirs(
    PROCESSED_DIR,
    exist_ok=True
)

os.makedirs(
    MODELS_DIR,
    exist_ok=True
)


# ============================================================
# LOAD DATASET
# ============================================================

print("\nLoading Dataset...")

if not os.path.exists(DATASET_PATH):

    raise FileNotFoundError(
        f"\nDataset not found:\n{DATASET_PATH}"
    )

df = pd.read_csv(
    DATASET_PATH
)

print(
    "Rows    :",
    df.shape[0]
)

print(
    "Columns :",
    df.shape[1]
)


# ============================================================
# SHOW ORIGINAL LABELS
# ============================================================

print("\nOriginal Class distribution:")

print(
    df["Class"].value_counts()
)


# ============================================================
# REMOVE IDENTIFIER COLUMNS
# ============================================================

print("\nRemoving unnecessary columns...")

for column in [
    "md5",
    "sha1"
]:

    if column in df.columns:

        df.drop(
            columns=[column],
            inplace=True
        )

print("Done")


# ============================================================
# CREATE TARGET
# ============================================================
#
# Dataset:
#
# Benign  -> 0
# Malware -> 1
#
# This is the target used for binary
# malware detection.
# ============================================================

print("\nCreating target labels...")

df["Class"] = (
    df["Class"]
    .astype(str)
    .str.strip()
    .str.lower()
    .map({
        "benign": 0,
        "malware": 1
    })
)


# Check for unexpected labels

if df["Class"].isna().any():

    print(
        "\nWARNING: Unknown Class values detected:"
    )

    print(
        df.loc[
            df["Class"].isna()
        ]
    )

    raise ValueError(
        "Unknown Class label found in dataset."
    )


df["Class"] = df[
    "Class"
].astype(int)


print(
    "\nEncoded Class distribution:"
)

print(
    df["Class"].value_counts()
)


# ============================================================
# TARGET COLUMNS
# ============================================================

TARGET_COLUMNS = [
    "Class",
    "Category",
    "Family"
]


# ============================================================
# FEATURE COLUMNS
# ============================================================

FEATURE_COLUMNS = [
    column
    for column in df.columns
    if column not in TARGET_COLUMNS
]


print(
    "\nNumber of raw features:",
    len(FEATURE_COLUMNS)
)


# ============================================================
# CONVERT NUMERIC FEATURES
# ============================================================

print("\nConverting numeric columns...")

for column in FEATURE_COLUMNS:

    if df[column].dtype == "object":

        # Keep categorical columns for
        # LabelEncoder below.

        continue

    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )

print("Done")


# ============================================================
# HANDLE CATEGORICAL FEATURES
# ============================================================

print("\nEncoding categorical columns...")

label_encoders = {}

for column in FEATURE_COLUMNS:

    if df[column].dtype == "object":

        encoder = LabelEncoder()

        df[column] = encoder.fit_transform(
            df[column]
            .astype(str)
        )

        label_encoders[
            column
        ] = encoder

print("Done")


# ============================================================
# HANDLE MISSING VALUES
# ============================================================

print("\nHandling missing values...")

for column in FEATURE_COLUMNS:

    if df[column].isna().all():

        df[column] = 0

    else:

        median = df[column].median()

        if pd.isna(median):

            median = 0

        df[column] = df[
            column
        ].fillna(
            median
        )

print("Done")


# ============================================================
# PREPARE X AND Y
# ============================================================

X = df[
    FEATURE_COLUMNS
].copy()

y = df[
    "Class"
].copy()


# ============================================================
# SCALE FEATURES
# ============================================================

print("\nScaling features...")

scaler = StandardScaler()

X_scaled = scaler.fit_transform(
    X
)


X_scaled_df = pd.DataFrame(
    X_scaled,
    columns=FEATURE_COLUMNS
)


# ============================================================
# ADD TARGET COLUMNS
# ============================================================

processed_df = X_scaled_df.copy()


processed_df[
    "Class"
] = y.values


# Keep Category and Family
# for analysis/reference only.

processed_df[
    "Category"
] = df[
    "Category"
].values


processed_df[
    "Family"
] = df[
    "Family"
].values


# ============================================================
# SAVE PROCESSED DATASET
# ============================================================

processed_dataset_path = os.path.join(
    PROCESSED_DIR,
    "processed_dataset.csv"
)

processed_df.to_csv(
    processed_dataset_path,
    index=False
)


# ============================================================
# SAVE SCALER
# ============================================================

scaler_path = os.path.join(
    MODELS_DIR,
    "scaler.pkl"
)

joblib.dump(
    scaler,
    scaler_path
)


# ============================================================
# SAVE LABEL ENCODERS
# ============================================================

encoders_path = os.path.join(
    MODELS_DIR,
    "label_encoders.pkl"
)

joblib.dump(
    label_encoders,
    encoders_path
)


# ============================================================
# SAVE FEATURE INFORMATION
# ============================================================

feature_info = {

    "feature_columns":
        FEATURE_COLUMNS,

    "target_column":
        "Class",

    "number_of_features":
        len(FEATURE_COLUMNS),

    "class_mapping": {

        "Benign": 0,

        "Malware": 1
    },

    "classes": [
        0,
        1
    ]
}


feature_info_path = os.path.join(
    MODELS_DIR,
    "feature_info.json"
)


with open(
    feature_info_path,
    "w"
) as file:

    json.dump(
        feature_info,
        file,
        indent=4
    )


# ============================================================
# FINAL VALIDATION
# ============================================================

print("\n")
print("=" * 70)
print("PREPROCESSING COMPLETED SUCCESSFULLY")
print("=" * 70)

print(
    "\nProcessed rows:",
    len(processed_df)
)

print(
    "ML features:",
    len(FEATURE_COLUMNS)
)

print(
    "\nFinal Class distribution:"
)

print(
    processed_df[
        "Class"
    ].value_counts()
)

print(
    "\nSaved processed dataset:"
)

print(
    processed_dataset_path
)

print(
    "\nSaved scaler:"
)

print(
    scaler_path
)

print(
    "\nSaved encoders:"
)

print(
    encoders_path
)

print(
    "\nSaved feature information:"
)

print(
    feature_info_path
)

print(
    "\nCyberShield-AI preprocessing complete! 🚀"
)