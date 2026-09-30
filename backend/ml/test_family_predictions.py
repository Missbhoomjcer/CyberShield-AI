import pandas as pd

from family_predictor import FamilyPredictor


# ============================================================
# LOAD DATA
# ============================================================

DATASET_PATH = r"C:\CyberShieldData\ransom.csv"

print()
print("=" * 70)
print("CYBERSHIELD-AI FAMILY PREDICTION TEST")
print("=" * 70)

print()
print("Loading dataset...")

df = pd.read_csv(DATASET_PATH)

print("Dataset loaded:", df.shape)


# ============================================================
# INITIALIZE PREDICTOR
# ============================================================

print()
print("Loading family predictor...")

predictor = FamilyPredictor()


# ============================================================
# SELECT TEST SAMPLES
# ============================================================

# Select a few known families so we can verify predictions.

families_to_test = [
    "Benign",
    "Phobos",
    "Ryuk",
    "LockBit",
    "RedLine"
]

print()
print("Testing families:")
print(families_to_test)


# ============================================================
# RUN PREDICTIONS
# ============================================================

results = []

for family in families_to_test:

    sample = df[
        df["Family"] == family
    ]

    if sample.empty:
        print(
            f"WARNING: No sample found for {family}"
        )
        continue

    # Take first sample
    row = sample.iloc[0].copy()

    actual_family = row["Family"]

    # Remove target so predictor receives only features
    features = row.drop(
        labels=["Family"]
    ).to_dict()

    print()
    print("-" * 70)
    print("Actual family :", actual_family)

    result = predictor.predict(
        features
    )

    print(
        "Predicted family :",
        result["family"]
    )

    print(
        "Confidence       :",
        f'{result["confidence"]:.2f}%'
    )

    print()
    print("Top-3 predictions:")

    for rank, item in enumerate(
        result["top_3"],
        start=1
    ):

        print(
            f'  {rank}. '
            f'{item["family"]:<15} '
            f'{item["confidence"]:.2f}%'
        )

    correct = (
        actual_family
        == result["family"]
    )

    print()
    print(
        "Prediction:",
        "CORRECT" if correct else "INCORRECT"
    )

    results.append(
        {
            "actual": actual_family,
            "predicted": result["family"],
            "confidence": result["confidence"],
            "correct": correct
        }
    )


# ============================================================
# SUMMARY
# ============================================================

print()
print("=" * 70)
print("FAMILY PREDICTION TEST SUMMARY")
print("=" * 70)

total = len(results)

correct = sum(
    result["correct"]
    for result in results
)

accuracy = (
    (correct / total) * 100
    if total > 0
    else 0
)

print(
    f"Samples tested : {total}"
)

print(
    f"Correct        : {correct}"
)

print(
    f"Incorrect      : {total - correct}"
)

print(
    f"Accuracy       : {accuracy:.2f}%"
)

print()

if correct == total:
    print(
        "RESULT: ALL SAMPLE PREDICTIONS PASSED"
    )
else:
    print(
        "RESULT: SOME SAMPLE PREDICTIONS DIFFERED"
    )

print("=" * 70)