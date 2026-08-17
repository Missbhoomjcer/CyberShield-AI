import os
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

# ============================================================
# CyberShield-AI
# LARGE LSTM SEQUENCE GENERATOR
#
# Input:
#   backend/datasets/behavioral/lstm_dataset_large.csv
#
# Output:
#   lstm_sequences.npz
#   lstm_scaler.npz
#
# Features MUST match the real-time monitor.
# ============================================================


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

BACKEND_DIR = os.path.dirname(
    BASE_DIR
)

DATASET_DIR = os.path.join(
    BACKEND_DIR,
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


# ============================================================
# HEADER
# ============================================================

print("=" * 70)
print("CYBERSHIELD-AI LARGE LSTM SEQUENCE GENERATOR")
print("=" * 70)


# ============================================================
# LOAD DATASET
# ============================================================

print("\nLoading large behavioral dataset...")

if not os.path.exists(INPUT_PATH):

    raise FileNotFoundError(
        f"\nDataset not found:\n{INPUT_PATH}"
    )

df = pd.read_csv(
    INPUT_PATH
)

print(
    "Total rows:",
    len(df)
)

print(
    "Columns:",
    len(df.columns)
)


# ============================================================
# CHECK FEATURES
# ============================================================

print("\nChecking required features...")

missing_features = [
    feature
    for feature in FEATURE_COLUMNS
    if feature not in df.columns
]

if missing_features:

    raise ValueError(
        f"Missing features: {missing_features}"
    )

print("All 7 behavioral features found.")


# ============================================================
# SELECT FEATURES
# ============================================================

X_raw = df[
    FEATURE_COLUMNS
].copy()

y_raw = df[
    LABEL_COLUMN
].astype(int)


# ============================================================
# CONVERT NUMERIC
# ============================================================

print("\nConverting features to numeric...")

for column in FEATURE_COLUMNS:

    X_raw[column] = pd.to_numeric(
        X_raw[column],
        errors="coerce"
    )

X_raw = X_raw.replace(
    [np.inf, -np.inf],
    np.nan
)

X_raw = X_raw.fillna(0)


# ============================================================
# NORMALIZATION
# ============================================================

print("\nNormalizing behavioral features...")

scaler = StandardScaler()

X_scaled = scaler.fit_transform(
    X_raw
)

print(
    "Normalized shape:",
    X_scaled.shape
)


# ============================================================
# CREATE TEMPORAL SEQUENCES
# ============================================================

print("\nCreating temporal sequences...")

print(
    "Sequence length:",
    SEQUENCE_LENGTH
)

X_sequences = []
y_sequences = []


for i in range(
    len(X_scaled) - SEQUENCE_LENGTH + 1
):

    sequence = X_scaled[
        i:i + SEQUENCE_LENGTH
    ]

    # Label comes from the final observation
    # in the temporal window.
    label = y_raw.iloc[
        i + SEQUENCE_LENGTH - 1
    ]

    X_sequences.append(
        sequence
    )

    y_sequences.append(
        label
    )


X_sequences = np.asarray(
    X_sequences,
    dtype=np.float32
)

y_sequences = np.asarray(
    y_sequences,
    dtype=np.int64
)


# ============================================================
# INFORMATION
# ============================================================

print("\n" + "=" * 70)
print("LSTM SEQUENCE DATASET INFORMATION")
print("=" * 70)

print(
    "X shape:",
    X_sequences.shape
)

print(
    "y shape:",
    y_sequences.shape
)

print(
    "Sequences:",
    len(X_sequences)
)

print(
    "Timesteps:",
    X_sequences.shape[1]
)

print(
    "Features:",
    X_sequences.shape[2]
)

print(
    "\nLabel distribution:"
)

unique_labels, counts = np.unique(
    y_sequences,
    return_counts=True
)

for label, count in zip(
    unique_labels,
    counts
):

    if label == 0:
        name = "NORMAL"
    else:
        name = "SUSPICIOUS"

    print(
        f"{name} ({label}): {count}"
    )


# ============================================================
# SAVE SEQUENCES
# ============================================================

print("\nSaving LSTM sequences...")

np.savez_compressed(
    SEQUENCE_PATH,
    X=X_sequences,
    y=y_sequences
)


# ============================================================
# SAVE SCALER
# ============================================================

print("Saving scaler information...")

# StandardScaler needs these values for real-time prediction.
np.savez(
    SCALER_PATH,
    mean=scaler.mean_,
    scale=scaler.scale_,
    feature_columns=np.array(
        FEATURE_COLUMNS
    )
)


# ============================================================
# FINAL INFORMATION
# ============================================================

print("\n" + "=" * 70)
print("LARGE LSTM SEQUENCE DATASET CREATED")
print("=" * 70)

print(
    "\nDataset:"
)

print(
    SEQUENCE_PATH
)

print(
    "\nScaler:"
)

print(
    SCALER_PATH
)

print(
    "\nInput shape:"
)

print(
    "(samples, timesteps, features)"
)

print(
    "\nExpected model input:"
)

print(
    f"(samples, {SEQUENCE_LENGTH}, {len(FEATURE_COLUMNS)})"
)

print(
    "\nReal-time feature order:"
)

for index, feature in enumerate(
    FEATURE_COLUMNS,
    start=1
):

    print(
        f"{index}. {feature}"
    )

print(
    "\n" + "=" * 70
)