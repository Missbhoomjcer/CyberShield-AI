import re
from pathlib import Path

import numpy as np
import pandas as pd


DATASET_PATH = Path(r"C:\Users\01bho\Downloads\PDFMalware2022.csv")


def extract_leading_number(value):
    """
    Convert values such as:
        '12'    -> 12.0
        '1(1)'  -> 1.0
        '12(2)' -> 12.0
        '-1'    -> -1.0
        'pdfid.py' -> NaN
    """
    if pd.isna(value):
        return np.nan

    value = str(value).strip()

    match = re.match(r"^-?\d+(?:\.\d+)?", value)

    if match:
        return float(match.group())

    return np.nan


def extract_pdf_version(value):
    """
    Extract PDF version from header.

    Examples:
        %PDF-1.3 -> 1.3
        %PDF-1.7 -> 1.7
        %PDF-1.4" -> 1.4
    """
    if pd.isna(value):
        return np.nan

    value = str(value)

    match = re.search(r"%PDF-(\d+\.\d+)", value)

    if match:
        return float(match.group(1))

    return np.nan


def encode_text(value):
    """
    Encode the PDF text-presence feature.
    """
    mapping = {
        "No": 0,
        "Yes": 1,
        "unclear": 2,
        "-1": -1,
        "0": 0,
    }

    if pd.isna(value):
        return np.nan

    return mapping.get(str(value).strip(), np.nan)


def load_pdf_dataset(dataset_path=DATASET_PATH):
    """
    Load and preprocess the PDF malware dataset.
    """

    df = pd.read_csv(dataset_path)

    # Remove incomplete records.
    df = df.dropna().copy()

    # Remove identifier.
    df = df.drop(columns=["Fine name"])

    # Encode target.
    df["Class"] = df["Class"].map({
        "Benign": 0,
        "Malicious": 1,
    })

    # Encode text feature.
    df["text"] = df["text"].apply(encode_text)

    # Extract PDF version from header.
    df["header_version"] = df["header"].apply(extract_pdf_version)

    # Remove original header.
    df = df.drop(columns=["header"])

    # Columns that should contain numeric structural values.
    structural_columns = [
        "images",
        "obj",
        "endobj",
        "endstream",
        "xref",
        "startxref",
        "pageno",
        "JS",
        "Javascript",
        "AA",
        "OpenAction",
        "Acroform",
        "JBIG2Decode",
        "RichMedia",
        "launch",
        "EmbeddedFile",
        "XFA",
    ]

    for column in structural_columns:
        df[column] = df[column].apply(extract_leading_number)

    # Convert remaining feature columns to numeric.
    feature_columns = [c for c in df.columns if c != "Class"]

    for column in feature_columns:
        df[column] = pd.to_numeric(df[column], errors="coerce")

    # Replace any unexpected conversion failures with the median
    # calculated from the training-ready dataset.
    for column in feature_columns:
        if df[column].isna().any():
            df[column] = df[column].fillna(df[column].median())

    X = df[feature_columns].copy()
    y = df["Class"].astype(int).copy()

    return X, y


if __name__ == "__main__":
    X, y = load_pdf_dataset()

    print("PDF dataset loaded successfully")
    print("Samples:", len(X))
    print("Features:", X.shape[1])
    print("Feature names:")
    print(X.columns.tolist())

    print("\nClass distribution:")
    print(y.value_counts().to_dict())

    print("\nMissing values:")
    print(X.isnull().sum().sum())
