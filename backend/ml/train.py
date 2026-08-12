import os
import json
import joblib
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, f1_score, classification_report
from xgboost import XGBClassifier


# ============================================================
# CyberShield-AI - Correct ML Training Pipeline
# ============================================================

print("=" * 70)
print("CyberShield-AI - ML MODEL TRAINING")
print("=" * 70)


# ------------------------------------------------------------
# PATHS
# ------------------------------------------------------------

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

DATASET_PATH = os.path.join(
    BASE_DIR,
    "..",
    "datasets",
    "processed",
    "processed_dataset.csv"
)

MODEL_DIR = os.path.join(BASE_DIR, "models")
REPORT_DIR = os.path.join(BASE_DIR, "reports")

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(REPORT_DIR, exist_ok=True)


# ------------------------------------------------------------
# LOAD DATASET
# ------------------------------------------------------------

print("\nLoading processed dataset...")

df = pd.read_csv(DATASET_PATH)

print("Rows    :", len(df))
print("Columns :", len(df))


# ------------------------------------------------------------
# CHECK REQUIRED COLUMNS
# ------------------------------------------------------------

required_columns = ["Class", "Category", "Family"]

for column in required_columns:
    if column not in df.columns:
        raise ValueError(
            f"Required column '{column}' was not found in dataset."
        )


# ------------------------------------------------------------
# TARGET
# ------------------------------------------------------------

y = df["Class"]

print("\nTarget distribution:")
print(y.value_counts())

print("\nNumber of classes:", y.nunique())

if y.nunique() < 2:
    raise ValueError(
        "\nERROR: The Class column contains only one class."
        "\nThe dataset must contain both Benign and Malware."
    )


# ------------------------------------------------------------
# IMPORTANT:
# REMOVE TARGET + DATA LEAKAGE COLUMNS
# ------------------------------------------------------------

print("\nRemoving target and leakage columns...")

DROP_COLUMNS = [
    "Class",
    "Category",
    "Family"
]

X = df.drop(columns=DROP_COLUMNS)

print("Removed:")
print(" - Class")
print(" - Category")
print(" - Family")

print("\nActual ML features:", X.shape[1])


# ------------------------------------------------------------
# ENSURE ALL FEATURES ARE NUMERIC
# ------------------------------------------------------------

print("\nChecking feature types...")

non_numeric = X.select_dtypes(exclude=["number"]).columns.tolist()

if len(non_numeric) > 0:

    print("Non-numeric columns found:")
    print(non_numeric)

    raise ValueError(
        "\nERROR: Non-numeric features remain."
        "\nThe preprocessing pipeline must encode them before training."
    )

print("All ML features are numeric.")


# ------------------------------------------------------------
# HANDLE MISSING VALUES
# ------------------------------------------------------------

print("\nChecking missing values...")

missing_count = X.isnull().sum().sum()

print("Missing values:", missing_count)

if missing_count > 0:

    print("Replacing missing values with 0...")

    X = X.fillna(0)

else:

    print("No missing values.")


# ------------------------------------------------------------
# FEATURE COUNT CHECK
# ------------------------------------------------------------

EXPECTED_FEATURES = 72

if X.shape[1] != EXPECTED_FEATURES:

    raise ValueError(
        f"\nERROR: Expected {EXPECTED_FEATURES} ML features "
        f"but found {X.shape[1]}."
    )

print("\nFeature count verified:", X.shape[1])


# ------------------------------------------------------------
# TRAIN / TEST SPLIT
# ------------------------------------------------------------

print("\nSplitting dataset...")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

print("Training samples:", len(X_train))
print("Testing samples :", len(X_test))


# ------------------------------------------------------------
# MODELS
# ------------------------------------------------------------

models = {

    "Decision Tree": DecisionTreeClassifier(
        random_state=42,
        class_weight="balanced"
    ),

    "Random Forest": RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        n_jobs=-1,
        class_weight="balanced"
    ),

    "SVM": SVC(
        kernel="rbf",
        probability=True,
        random_state=42,
        class_weight="balanced"
    ),

    "XGBoost": XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric="logloss",
        n_jobs=-1
    )
}


# ------------------------------------------------------------
# TRAIN MODELS
# ------------------------------------------------------------

results = {}

print("\n")
print("=" * 70)
print("TRAINING MODELS")
print("=" * 70)


for model_name, model in models.items():

    print("\n" + "-" * 70)
    print("Training:", model_name)
    print("-" * 70)

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)

    f1 = f1_score(
        y_test,
        predictions,
        average="weighted"
    )

    print("Accuracy:", round(accuracy, 4))
    print("F1 Score:", round(f1, 4))

    print("\nClassification Report:")
    print(
        classification_report(
            y_test,
            predictions,
            target_names=["Benign", "Malware"]
        )
    )

    # Save model filename
    filename = model_name.lower().replace(" ", "_") + ".pkl"

    model_path = os.path.join(
        MODEL_DIR,
        filename
    )

    joblib.dump(model, model_path)

    print("Saved:", model_path)

    results[model_name] = {
        "accuracy": float(accuracy),
        "f1_score": float(f1)
    }


# ------------------------------------------------------------
# SAVE FEATURE NAMES
# ------------------------------------------------------------

feature_names_path = os.path.join(
    MODEL_DIR,
    "feature_names.pkl"
)

joblib.dump(
    list(X.columns),
    feature_names_path
)

print("\nFeature names saved:")
print(feature_names_path)


# ------------------------------------------------------------
# SAVE TRAINING REPORT
# ------------------------------------------------------------

report = {

    "dataset_rows": int(len(df)),

    "total_columns": int(len(df.columns)),

    "ml_features": int(X.shape[1]),

    "target": "Class",

    "label_mapping": {
        "0": "Benign",
        "1": "Malware"
    },

    "removed_columns": [
        "Class",
        "Category",
        "Family"
    ],

    "models": results
}


report_path = os.path.join(
    REPORT_DIR,
    "model_report.json"
)

with open(
    report_path,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        report,
        f,
        indent=4
    )


# ------------------------------------------------------------
# FINAL OUTPUT
# ------------------------------------------------------------

print("\n")
print("=" * 70)
print("MODEL TRAINING COMPLETED SUCCESSFULLY 🚀")
print("=" * 70)

for name, result in results.items():

    print(
        f"{name:<20}"
        f"Accuracy: {result['accuracy']:.4f} | "
        f"F1: {result['f1_score']:.4f}"
    )

print("\nModels saved in:")
print(MODEL_DIR)

print("\nFeature names saved in:")
print(feature_names_path)

print("\nReport saved in:")
print(report_path)

print("\nCyberShield-AI ML pipeline is READY! 🔥")