import pandas as pd

from backend.ml.combined_predictor import CombinedPredictor


# ============================================================
# CONFIGURATION
# ============================================================

DATASET_PATH = r"C:\CyberShieldData\ransom.csv"


# ============================================================
# HEADER
# ============================================================

print()
print("=" * 80)
print("CYBERSHIELD-AI COMBINED ML PREDICTION TEST")
print("=" * 80)


# ============================================================
# LOAD DATASET
# ============================================================

print()
print("Loading dataset...")

df = pd.read_csv(
    DATASET_PATH
)

print(
    "Dataset loaded:",
    df.shape
)


# ============================================================
# INITIALIZE COMBINED PREDICTOR
# ============================================================

print()
print("Initializing combined predictor...")

predictor = CombinedPredictor()


# ============================================================
# SELECT TEST SAMPLES
# ============================================================

# We deliberately test different families so that
# both binary malware detection and family identification
# are exercised.

families_to_test = [
    "Benign",
    "Phobos",
    "Ryuk",
    "LockBit",
    "RedLine"
]

print()
print("Families selected for testing:")

for family in families_to_test:
    print(
        f"  - {family}"
    )


# ============================================================
# RUN TESTS
# ============================================================

results = []


for family in families_to_test:

    sample = df[
        df["Family"] == family
    ]

    if sample.empty:

        print()
        print(
            f"WARNING: No sample found for {family}"
        )

        continue

    # --------------------------------------------------------
    # Select first sample
    # --------------------------------------------------------

    row = sample.iloc[0].copy()

    actual_family = str(
        row["Family"]
    )

    actual_class = str(
        row["Class"]
    )

    actual_category = str(
        row["Category"]
    )

    # --------------------------------------------------------
    # Remove target fields
    # --------------------------------------------------------

    features = row.drop(
        labels=[
            "Family",
            "Category",
            "Class"
        ]
    ).to_dict()

    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    print()
    print("-" * 80)

    print(
        "Actual family   :",
        actual_family
    )

    print(
        "Actual category :",
        actual_category
    )

    print(
        "Actual class    :",
        actual_class
    )

    print()
    print("Running combined prediction...")

    result = predictor.predict(
        features
    )

    # --------------------------------------------------------
    # DISPLAY BINARY RESULT
    # --------------------------------------------------------

    print()
    print("BINARY MALWARE DETECTION")
    print(
        "Malware prediction :",
        result["malware_prediction"]
    )

    print(
        "Malware probability:",
        f'{result["malware_probability"]:.2f}%'
    )

    print(
        "Benign probability :",
        f'{result["benign_probability"]:.2f}%'
    )

    # --------------------------------------------------------
    # DISPLAY FAMILY RESULT
    # --------------------------------------------------------

    print()
    print("FAMILY CLASSIFICATION")

    print(
        "Predicted family   :",
        result["family"]
    )

    print(
        "Family confidence  :",
        f'{result["family_confidence"]:.2f}%'
    )

    print()
    print("Top-3 family predictions:")

    for rank, item in enumerate(
        result["family_top_3"],
        start=1
    ):

        print(
            f'  {rank}. '
            f'{item["family"]:<15} '
            f'{item["confidence"]:.2f}%'
        )

    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    family_correct = (
        actual_family
        == result["family"]
    )

    results.append(
        {
            "actual_family":
                actual_family,

            "predicted_family":
                result["family"],

            "family_confidence":
                result["family_confidence"],

            "family_correct":
                family_correct,

            "malware_probability":
                result["malware_probability"]
        }
    )

    print()
    print(
        "Family prediction:",
        "CORRECT"
        if family_correct
        else "INCORRECT"
    )


# ============================================================
# SUMMARY
# ============================================================

print()
print("=" * 80)
print("COMBINED PREDICTION TEST SUMMARY")
print("=" * 80)

total = len(results)

correct = sum(
    result["family_correct"]
    for result in results
)

accuracy = (
    (correct / total) * 100
    if total > 0
    else 0
)

print(
    f"Samples tested       : {total}"
)

print(
    f"Correct families     : {correct}"
)

print(
    f"Incorrect families   : {total - correct}"
)

print(
    f"Family test accuracy : {accuracy:.2f}%"
)

print()

print(
    "RESULT:",
    "COMBINED PREDICTOR TEST PASSED"
    if total > 0 and correct == total
    else "CHECK PREDICTIONS"
)

print("=" * 80)