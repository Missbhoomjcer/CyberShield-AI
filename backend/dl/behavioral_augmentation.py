import os
import numpy as np
import pandas as pd

# ============================================================
# CyberShield-AI
# LARGE BEHAVIORAL DATASET GENERATOR
#
# IMPORTANT:
# Uses the SAME 7 features collected by the real-time monitor.
#
# No malware is executed.
# No files are modified.
# ============================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

BACKEND_DIR = os.path.dirname(BASE_DIR)

INPUT_PATH = os.path.join(
    BACKEND_DIR,
    "datasets",
    "behavioral",
    "lstm_dataset.csv"
)

OUTPUT_PATH = os.path.join(
    BACKEND_DIR,
    "datasets",
    "behavioral",
    "lstm_dataset_large.csv"
)

# ============================================================
# EXACT FEATURES USED BY REAL-TIME MONITOR
# ============================================================

FEATURES = [
    "cpu_usage",
    "memory_usage",
    "process_count",
    "file_change_count",
    "network_connection_count",
    "suspicious_process_count",
    "suspicious_score"
]

LABEL_COLUMN = "label"

RANDOM_SEED = 42

# Number of additional samples per class
NORMAL_SAMPLES = 5000
SUSPICIOUS_SAMPLES = 5000

rng = np.random.default_rng(RANDOM_SEED)


# ============================================================
# LOAD EXISTING DATA
# ============================================================

print("=" * 70)
print("CYBERSHIELD-AI LARGE BEHAVIORAL DATASET GENERATOR")
print("=" * 70)

print("\nLoading existing dataset...")

df = pd.read_csv(INPUT_PATH)

print("Existing rows:", len(df))

# Check required columns
required_columns = FEATURES + [LABEL_COLUMN]

missing = [
    column
    for column in required_columns
    if column not in df.columns
]

if missing:
    raise ValueError(
        f"Missing required columns: {missing}"
    )

print("\nRequired behavioral features:")
for feature in FEATURES:
    print(" -", feature)


# ============================================================
# CLEAN DATA
# ============================================================

df = df[required_columns].copy()

for column in FEATURES:
    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )

df[LABEL_COLUMN] = pd.to_numeric(
    df[LABEL_COLUMN],
    errors="coerce"
)

df = df.dropna()

df[LABEL_COLUMN] = df[LABEL_COLUMN].astype(int)

print("\nExisting label distribution:")
print(df[LABEL_COLUMN].value_counts().sort_index())


# ============================================================
# FEATURE RANGES
# ============================================================

# These ranges deliberately overlap.
#
# This is important.
#
# We DO NOT want:
#
# NORMAL = always low
# SUSPICIOUS = always high
#
# because that would make the LSTM unrealistically easy.
# ============================================================

NORMAL_RANGES = {
    "cpu_usage": (10.0, 65.0),
    "memory_usage": (45.0, 95.0),
    "process_count": (220.0, 390.0),
    "file_change_count": (0.0, 20.0),
    "network_connection_count": (20.0, 130.0),
    "suspicious_process_count": (0.0, 8.0),
    "suspicious_score": (0.0, 35.0)
}

SUSPICIOUS_RANGES = {
    "cpu_usage": (45.0, 100.0),
    "memory_usage": (60.0, 99.0),
    "process_count": (280.0, 450.0),
    "file_change_count": (8.0, 110.0),
    "network_connection_count": (60.0, 200.0),
    "suspicious_process_count": (3.0, 20.0),
    "suspicious_score": (35.0, 100.0)
}


# ============================================================
# GENERATE TEMPORAL DATA
# ============================================================

def generate_behavioral_samples(
    count,
    label
):

    if label == 0:
        ranges = NORMAL_RANGES
    else:
        ranges = SUSPICIOUS_RANGES

    rows = []

    # Start values
    current = {}

    for feature in FEATURES:

        low, high = ranges[feature]

        current[feature] = rng.uniform(
            low,
            high
        )

    for i in range(count):

        row = {}

        for feature in FEATURES:

            low, high = ranges[feature]

            # ------------------------------------------------
            # Temporal random walk
            #
            # Instead of completely random values,
            # each observation slightly depends on the
            # previous observation.
            #
            # This makes the data more suitable for LSTM.
            # ------------------------------------------------

            previous = current[feature]

            feature_range = high - low

            noise = rng.normal(
                0,
                feature_range * 0.06
            )

            # Occasional behavioral spike
            if rng.random() < 0.04:

                noise += rng.normal(
                    0,
                    feature_range * 0.12
                )

            value = previous + noise

            # Pull slowly toward the valid range
            value = np.clip(
                value,
                low,
                high
            )

            current[feature] = value

            row[feature] = value

        row[LABEL_COLUMN] = label

        rows.append(row)

    return pd.DataFrame(rows)


# ============================================================
# GENERATE NORMAL DATA
# ============================================================

print("\nGenerating normal behavioral samples...")

normal_df = generate_behavioral_samples(
    NORMAL_SAMPLES,
    0
)

print(
    "Generated normal samples:",
    len(normal_df)
)


# ============================================================
# GENERATE SUSPICIOUS DATA
# ============================================================

print("\nGenerating suspicious behavioral samples...")

suspicious_df = generate_behavioral_samples(
    SUSPICIOUS_SAMPLES,
    1
)

print(
    "Generated suspicious samples:",
    len(suspicious_df)
)


# ============================================================
# COMBINE
# ============================================================

print("\nCombining datasets...")

large_df = pd.concat(
    [
        df,
        normal_df,
        suspicious_df
    ],
    ignore_index=True
)


# ============================================================
# SHUFFLE
# ============================================================

large_df = large_df.sample(
    frac=1,
    random_state=RANDOM_SEED
).reset_index(drop=True)


# ============================================================
# ROUND VALUES
# ============================================================

large_df["cpu_usage"] = large_df[
    "cpu_usage"
].round(2)

large_df["memory_usage"] = large_df[
    "memory_usage"
].round(2)

large_df["process_count"] = large_df[
    "process_count"
].round(0).astype(int)

large_df["file_change_count"] = large_df[
    "file_change_count"
].round(0).astype(int)

large_df["network_connection_count"] = large_df[
    "network_connection_count"
].round(0).astype(int)

large_df["suspicious_process_count"] = large_df[
    "suspicious_process_count"
].round(0).astype(int)

large_df["suspicious_score"] = large_df[
    "suspicious_score"
].round(2)

large_df["label"] = large_df[
    "label"
].astype(int)


# ============================================================
# SAVE
# ============================================================

os.makedirs(
    os.path.dirname(OUTPUT_PATH),
    exist_ok=True
)

large_df.to_csv(
    OUTPUT_PATH,
    index=False
)


# ============================================================
# INFORMATION
# ============================================================

print("\n" + "=" * 70)
print("LARGE BEHAVIORAL DATASET CREATED")
print("=" * 70)

print(
    "\nSaved to:"
)

print(
    OUTPUT_PATH
)

print(
    "\nDataset shape:",
    large_df.shape
)

print(
    "\nLabel distribution:"
)

print(
    large_df["label"].value_counts()
)

print(
    "\nFeatures:",
    len(FEATURES)
)

print(
    "\nFeature columns:"
)

for feature in FEATURES:
    print(
        " -",
        feature
    )

print(
    "\nFirst 5 rows:"
)

print(
    large_df.head().to_string(
        index=False
    )
)

print(
    "\n" + "=" * 70
)

print(
    "IMPORTANT:"
)

print(
    "This dataset contains synthetic behavioral telemetry."
)

print(
    "No malware was executed."
)

print(
    "The real-time monitor can use the SAME 7 features."
)

print(
    "=" * 70
)