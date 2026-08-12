import json
from feature_engineering import extract_pe_features


# ============================================================
# CyberShield-AI
# PE Feature Extraction Test
# ============================================================

FILE_PATH = r"C:\Windows\System32\notepad.exe"


print("=" * 70)
print("CyberShield-AI - PE FEATURE EXTRACTION TEST")
print("=" * 70)

print("\nAnalyzing:")
print(FILE_PATH)

try:

    features = extract_pe_features(FILE_PATH)

    print("\nFeature extraction successful! ✅")

    print("\nNumber of extracted values:")

    print(len(features))

    print("\nExtracted features:")

    for key, value in features.items():

        print(
            f"{key:35s}: {value}"
        )

    # Save for inspection

    output_file = "pe_test_features.json"

    with open(
        output_file,
        "w"
    ) as file:

        json.dump(
            features,
            file,
            indent=4,
            default=str
        )

    print("\nSaved feature output to:")

    print(output_file)

except Exception as error:

    print("\n❌ Feature extraction failed.")

    print(
        "Error:",
        error
    )

print("\n" + "=" * 70)