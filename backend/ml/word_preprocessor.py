from pathlib import Path

import pandas as pd


LABEL_COLUMN = "label"


def load_word_dataset(csv_path):
    """
    Load and validate the DOC/DOCX malware dataset.
    """

    csv_path = Path(csv_path)

    if not csv_path.exists():
        raise FileNotFoundError(
            f"Dataset not found: {csv_path}"
        )

    df = pd.read_csv(csv_path)

    if LABEL_COLUMN not in df.columns:
        raise ValueError(
            "Dataset must contain a 'label' column."
        )

    # Separate features and target
    X = df.drop(columns=[LABEL_COLUMN]).copy()
    y = df[LABEL_COLUMN].astype(int)

    # Ensure all feature columns are numeric
    for column in X.columns:
        X[column] = pd.to_numeric(
            X[column],
            errors="coerce"
        )

    return X, y


def fit_preprocessor(X_train):
    """
    Fit median values using TRAINING data only.
    """

    medians = X_train.median()

    return medians


def transform_features(X, medians):
    """
    Apply the fitted preprocessing to feature data.
    """

    X = X.copy()

    for column in X.columns:
        X[column] = pd.to_numeric(
            X[column],
            errors="coerce"
        )

    X = X.fillna(medians)

    return X


if __name__ == "__main__":

    dataset_path = (
        r"C:\Users\01bho\Downloads\Word_All_features.csv"
    )

    X, y = load_word_dataset(dataset_path)

    print("=" * 60)
    print("DOC/DOCX DATASET PREPROCESSOR")
    print("=" * 60)

    print(f"Samples       : {len(X)}")
    print(f"Features      : {X.shape[1]}")
    print(f"Benign        : {(y == 0).sum()}")
    print(f"Malicious     : {(y == 1).sum()}")
    print(
        f"Missing values: {X.isna().sum().sum()}"
    )

    print("\nFeature columns:")
    for column in X.columns:
        print(f"  {column}")

    print("=" * 60)
