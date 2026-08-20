import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler


# ============================================================
# CYBERSHIELD-AI
# LEAKAGE-SAFE LSTM SEQUENCE GENERATOR
# ============================================================

print("=" * 70)
print("CYBERSHIELD-AI LEAKAGE-SAFE LSTM SEQUENCE GENERATOR")
print("=" * 70)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
)

DATASET_DIR = os.path.join(
    BASE_DIR,
    "backend",
    "datasets",
    "behavioral"
)

INPUT_PATH = os.path.join(
    DATASET_DIR,
    "lstm_dataset_large.csv"
)

SEQUENCE_PATH = os.path.join(
    DATASET_DIR,
    "lstm_sequences_large.npz"
)

SCALER_PATH = os.path.join(
    DATASET_DIR,
    "lstm_scaler_large.npz"
)


# ============================================================
# CONFIGURATION
# ============================================================

SEQUENCE_LENGTH = 10

FEATURE_COLUMNS = [
    "cpu_usage",
    "memory_usage",
    "process_count",
    "file_change_count",
    "network_connection_count",
    "suspicious_process_count",
    "suspicious_score"
]

LABEL_COLUMN = "label"

TRAIN_RATIO = 0.80


# ============================================================
# LOAD DATA
# ============================================================

print("\nLoading behavioral dataset...")

if not os.path.exists(INPUT_PATH):
    raise FileNotFoundError(
        f"\nDataset not found:\n{INPUT_PATH}"
    )

df = pd.read_csv(INPUT_PATH)

print("Total rows:", len(df))


# ============================================================
# CHECK COLUMNS
# ============================================================

missing = [
    column
    for column in FEATURE_COLUMNS + [LABEL_COLUMN]
    if column not in df.columns
]

if missing:
    raise ValueError(
        f"Missing columns: {missing}"
    )


# ============================================================
# CLEAN DATA
# ============================================================

df = df[
    FEATURE_COLUMNS + [LABEL_COLUMN]
].copy()

for column in FEATURE_COLUMNS:

    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )

df[LABEL_COLUMN] = pd.to_numeric(
    df[LABEL_COLUMN],
    errors="coerce"
)

df = df.replace(
    [np.inf, -np.inf],
    np.nan
)

df = df.dropna()

df[LABEL_COLUMN] = (
    df[LABEL_COLUMN]
    .astype(int)
)


# ============================================================
# TEMPORAL TRAIN / VALIDATION SPLIT
# ============================================================

split_index = int(
    len(df) * TRAIN_RATIO
)

train_df = df.iloc[
    :split_index
].copy()

validation_df = df.iloc[
    split_index:
].copy()


print("\nTemporal split:")
print("Training rows   :", len(train_df))
print("Validation rows :", len(validation_df))

print("\nTraining labels:")
print(
    train_df[LABEL_COLUMN]
    .value_counts()
    .sort_index()
)

print("\nValidation labels:")
print(
    validation_df[LABEL_COLUMN]
    .value_counts()
    .sort_index()
)


# ============================================================
# FIT SCALER ONLY ON TRAINING DATA
# ============================================================

print("\nFitting StandardScaler on TRAINING data only...")

scaler = StandardScaler()

X_train_raw = train_df[
    FEATURE_COLUMNS
].values

X_validation_raw = validation_df[
    FEATURE_COLUMNS
].values

X_train_scaled = scaler.fit_transform(
    X_train_raw
)

X_validation_scaled = scaler.transform(
    X_validation_raw
)


# ============================================================
# SEQUENCE CREATION
# ============================================================

def create_sequences(
    X,
    y,
    sequence_length
):

    sequences = []
    labels = []

    for i in range(
        len(X) - sequence_length + 1
    ):

        sequence = X[
            i:i + sequence_length
        ]

        label = y[
            i + sequence_length - 1
        ]

        sequences.append(
            sequence
        )

        labels.append(
            label
        )

    return (
        np.asarray(
            sequences,
            dtype=np.float32
        ),
        np.asarray(
            labels,
            dtype=np.int64
        )
    )


# ============================================================
# CREATE TRAINING SEQUENCES
# ============================================================

print("\nCreating training sequences...")

X_train, y_train = create_sequences(
    X_train_scaled,
    train_df[LABEL_COLUMN].values,
    SEQUENCE_LENGTH
)


# ============================================================
# CREATE VALIDATION SEQUENCES
# ============================================================

print("Creating validation sequences...")

X_validation, y_validation = create_sequences(
    X_validation_scaled,
    validation_df[LABEL_COLUMN].values,
    SEQUENCE_LENGTH
)


# ============================================================
# INFORMATION
# ============================================================

print("\n" + "=" * 70)
print("LEAKAGE-SAFE LSTM DATASET")
print("=" * 70)

print("\nTraining:")
print("X:", X_train.shape)
print("y:", y_train.shape)

print("\nValidation:")
print("X:", X_validation.shape)
print("y:", y_validation.shape)

print("\nTraining label distribution:")
for label, count in zip(
    *np.unique(
        y_train,
        return_counts=True
    )
):

    name = (
        "NORMAL"
        if label == 0
        else "SUSPICIOUS"
    )

    print(
        f"{name} ({label}): {count}"
    )


print("\nValidation label distribution:")
for label, count in zip(
    *np.unique(
        y_validation,
        return_counts=True
    )
):

    name = (
        "NORMAL"
        if label == 0
        else "SUSPICIOUS"
    )

    print(
        f"{name} ({label}): {count}"
    )


# ============================================================
# SAVE DATASET
# ============================================================

print("\nSaving leakage-safe LSTM dataset...")

np.savez_compressed(
    SEQUENCE_PATH,
    X_train=X_train,
    y_train=y_train,
    X_validation=X_validation,
    y_validation=y_validation
)


# ============================================================
# SAVE SCALER
# ============================================================

print("Saving training scaler...")

np.savez(
    SCALER_PATH,
    mean=scaler.mean_,
    scale=scaler.scale_,
    feature_columns=np.array(
        FEATURE_COLUMNS
    )
)


# ============================================================
# FINAL
# ============================================================

print("\n" + "=" * 70)
print("SEQUENCE GENERATION COMPLETED")
print("=" * 70)

print("\nDataset:")
print(SEQUENCE_PATH)

print("\nScaler:")
print(SCALER_PATH)

print("\nSequence length:", SEQUENCE_LENGTH)
print("Features:", len(FEATURE_COLUMNS))

print("\nReal-time feature order:")

for index, feature in enumerate(
    FEATURE_COLUMNS,
    start=1
):

    print(
        f"{index}. {feature}"
    )

print("\nImportant:")
print(
    "Scaler fitted ONLY on training data."
)

print(
    "Validation data was never used during scaling."
)

print(
    "Training and validation sequences are temporally separated."
)

print("=" * 70)