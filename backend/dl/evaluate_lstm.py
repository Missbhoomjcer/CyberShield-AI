import os
import json
import numpy as np
import pandas as pd
import torch
import torch.nn as nn

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
)


# ============================================================
# CYBERSHIELD-AI
# LSTM BEHAVIORAL MODEL EVALUATION
# ============================================================

print("=" * 70)
print("        CYBERSHIELD-AI LSTM MODEL EVALUATION")
print("=" * 70)


# ============================================================
# PATHS
# ============================================================

CURRENT_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

BACKEND_DIR = os.path.dirname(
    CURRENT_DIR
)

DATASET_PATH = os.path.join(
    BACKEND_DIR,
    "datasets",
    "behavioral",
    "lstm_dataset_large.csv"
)

SEQUENCE_PATH = os.path.join(
    BACKEND_DIR,
    "datasets",
    "behavioral",
    "lstm_sequences_large.npz"
)

MODELS_DIR = os.path.join(
    BACKEND_DIR,
    "models"
)

REPORTS_DIR = os.path.join(
    BACKEND_DIR,
    "reports"
)

MODEL_PATH = os.path.join(
    MODELS_DIR,
    "lstm_behavioral_model.pth"
)


# ============================================================
# LSTM CONFIGURATION
# ============================================================

FEATURES = [
    "cpu_usage",
    "memory_usage",
    "process_count",
    "file_change_count",
    "network_connection_count",
    "suspicious_process_count",
    "suspicious_score",
]

INPUT_SIZE = 7
HIDDEN_SIZE = 64
NUM_LAYERS = 2


# ============================================================
# LSTM MODEL
# ============================================================

class LSTMDetector(nn.Module):

    def __init__(
        self,
        input_size=7,
        hidden_size=64,
        num_layers=2
    ):

        super().__init__()

        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.2
        )

        self.dropout = nn.Dropout(
            0.3
        )

        self.fc = nn.Linear(
            hidden_size,
            1
        )

    def forward(self, x):

        output, _ = self.lstm(x)

        last_output = output[:, -1, :]

        last_output = self.dropout(
            last_output
        )

        return self.fc(
            last_output
        )


# ============================================================
# LOAD DATASET
# ============================================================

def load_dataset():

    print("\nLoading behavioral dataset...")

    if not os.path.exists(
        DATASET_PATH
    ):

        raise FileNotFoundError(
            f"\nDataset not found:\n{DATASET_PATH}"
        )

    df = pd.read_csv(
        DATASET_PATH
    )

    print(
        "Rows    :",
        len(df)
    )

    print(
        "Columns :",
        len(df.columns)
    )

    print(
        "Features:",
        FEATURES
    )

    return df


# ============================================================
# LOAD EXISTING VALIDATION SEQUENCES
# ============================================================

def load_sequences():

    print(
        "\nLoading existing LSTM sequences..."
    )

    if not os.path.exists(
        SEQUENCE_PATH
    ):

        raise FileNotFoundError(
            f"\nSequence file not found:\n"
            f"{SEQUENCE_PATH}"
        )

    data = np.load(
        SEQUENCE_PATH
    )

    available = list(
        data.keys()
    )

    print(
        "Available arrays:",
        available
    )

    required = [
        "X_train",
        "y_train",
        "X_validation",
        "y_validation"
    ]

    for name in required:

        if name not in available:

            raise KeyError(
                f"\nMissing array: {name}\n"
                f"Available arrays: {available}"
            )

    X_train = data[
        "X_train"
    ]

    y_train = data[
        "y_train"
    ]

    X_validation = data[
        "X_validation"
    ]

    y_validation = data[
        "y_validation"
    ]

    print(
        "\nTraining sequences:",
        X_train.shape
    )

    print(
        "Training labels   :",
        y_train.shape
    )

    print(
        "Validation sequences:",
        X_validation.shape
    )

    print(
        "Validation labels   :",
        y_validation.shape
    )

    # --------------------------------------------------------
    # Verify shape
    # --------------------------------------------------------

    if X_validation.ndim != 3:

        raise ValueError(
            f"Expected validation data "
            f"to have 3 dimensions, "
            f"got {X_validation.ndim}"
        )

    if X_validation.shape[1] != 10:

        raise ValueError(
            f"Expected sequence length 10, "
            f"got {X_validation.shape[1]}"
        )

    if X_validation.shape[2] != 7:

        raise ValueError(
            f"Expected 7 behavioral features, "
            f"got {X_validation.shape[2]}"
        )

    # --------------------------------------------------------
    # Label distribution
    # --------------------------------------------------------

    print(
        "\nValidation label distribution:"
    )

    unique, counts = np.unique(
        y_validation,
        return_counts=True
    )

    for label, count in zip(
        unique,
        counts
    ):

        if int(label) == 0:

            name = "NORMAL"

        elif int(label) == 1:

            name = "SUSPICIOUS"

        else:

            name = "UNKNOWN"

        print(
            f"  {name} ({int(label)}): "
            f"{int(count)}"
        )

    return (
        X_validation,
        y_validation
    )


# ============================================================
# EXTRACT STATE DICT
# ============================================================

def extract_state_dict(
    checkpoint
):

    # --------------------------------------------------------
    # Direct state dictionary
    # --------------------------------------------------------

    if isinstance(
        checkpoint,
        dict
    ):

        # Most common training format
        if (
            "model_state_dict"
            in checkpoint
        ):

            return checkpoint[
                "model_state_dict"
            ]

        # Alternative naming
        if (
            "state_dict"
            in checkpoint
        ):

            return checkpoint[
                "state_dict"
            ]

        # Sometimes checkpoint itself is state_dict
        tensor_values = all(
            torch.is_tensor(value)
            for value in checkpoint.values()
        )

        if tensor_values:

            return checkpoint

    # --------------------------------------------------------
    # Entire model object
    # --------------------------------------------------------

    if isinstance(
        checkpoint,
        nn.Module
    ):

        return checkpoint.state_dict()

    raise RuntimeError(
        "\nUnable to identify model state "
        "dictionary from checkpoint."
    )


# ============================================================
# LOAD LSTM MODEL
# ============================================================

def load_model():

    print(
        "\nLoading LSTM model..."
    )

    print(
        "Path:",
        MODEL_PATH
    )

    if not os.path.exists(
        MODEL_PATH
    ):

        raise FileNotFoundError(
            f"\nLSTM model not found:\n"
            f"{MODEL_PATH}"
        )

    # --------------------------------------------------------
    # Load checkpoint
    # --------------------------------------------------------

    checkpoint = torch.load(
        MODEL_PATH,
        map_location="cpu"
    )

    print(
        "Checkpoint loaded."
    )

    # --------------------------------------------------------
    # If complete model was saved
    # --------------------------------------------------------

    if isinstance(
        checkpoint,
        nn.Module
    ):

        model = checkpoint

        model.eval()

        print(
            "Complete LSTM model loaded successfully."
        )

        return model

    # --------------------------------------------------------
    # Otherwise construct architecture
    # --------------------------------------------------------

    model = LSTMDetector(
        input_size=INPUT_SIZE,
        hidden_size=HIDDEN_SIZE,
        num_layers=NUM_LAYERS
    )

    # --------------------------------------------------------
    # Extract state dictionary
    # --------------------------------------------------------

    state_dict = extract_state_dict(
        checkpoint
    )

    # --------------------------------------------------------
    # Remove possible "module." prefix
    # --------------------------------------------------------

    cleaned_state_dict = {}

    for key, value in state_dict.items():

        if key.startswith(
            "module."
        ):

            new_key = key[
                len("module."):]
        else:

            new_key = key

        cleaned_state_dict[
            new_key
        ] = value

    # --------------------------------------------------------
    # Load weights
    # --------------------------------------------------------

    try:

        model.load_state_dict(
            cleaned_state_dict,
            strict=True
        )

    except RuntimeError as error:

        print(
            "\nLSTM architecture/checkpoint mismatch."
        )

        print(
            "\nExpected model keys:"
        )

        for key in model.state_dict().keys():

            print(
                " ",
                key
            )

        print(
            "\nCheckpoint keys:"
        )

        for key in cleaned_state_dict.keys():

            print(
                " ",
                key
            )

        raise RuntimeError(
            "\nCould not load the trained "
            "LSTM weights.\n\n"
            + str(error)
        )

    model.eval()

    print(
        "LSTM model loaded successfully."
    )

    return model


# ============================================================
# EVALUATE MODEL
# ============================================================

def evaluate(
    model,
    X_validation,
    y_validation
):

    print(
        "\nRunning LSTM validation..."
    )

    # --------------------------------------------------------
    # Convert data to tensors
    # --------------------------------------------------------

    X_tensor = torch.tensor(
        X_validation,
        dtype=torch.float32
    )

    # --------------------------------------------------------
    # Generate predictions
    # --------------------------------------------------------

    model.eval()

    with torch.no_grad():

        logits = model(
            X_tensor
        )

        probabilities = torch.sigmoid(
            logits
        ).reshape(
            -1
        ).cpu().numpy()

    # --------------------------------------------------------
    # Classification threshold
    # --------------------------------------------------------

    threshold = 0.50

    predictions = (
        probabilities >= threshold
    ).astype(
        int
    )

    y_true = np.asarray(
        y_validation
    ).reshape(
        -1
    ).astype(
        int
    )

    # --------------------------------------------------------
    # Metrics
    # --------------------------------------------------------

    accuracy = accuracy_score(
        y_true,
        predictions
    )

    precision = precision_score(
        y_true,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        y_true,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        y_true,
        predictions,
        zero_division=0
    )

    roc_auc = roc_auc_score(
        y_true,
        probabilities
    )

    # --------------------------------------------------------
    # Confusion matrix
    # --------------------------------------------------------

    cm = confusion_matrix(
        y_true,
        predictions,
        labels=[
            0,
            1
        ]
    )

    tn, fp, fn, tp = cm.ravel()

    # --------------------------------------------------------
    # Error rates
    # --------------------------------------------------------

    false_positive_rate = (

        fp / (fp + tn)

        if (fp + tn) > 0

        else 0.0
    )

    false_negative_rate = (

        fn / (fn + tp)

        if (fn + tp) > 0

        else 0.0
    )

    # ========================================================
    # RESULTS
    # ========================================================

    print("\n")

    print("=" * 70)

    print(
        "LSTM VALIDATION RESULTS"
    )

    print("=" * 70)

    print()

    print(
        f"Accuracy           : "
        f"{accuracy * 100:.2f}%"
    )

    print(
        f"Precision          : "
        f"{precision * 100:.2f}%"
    )

    print(
        f"Recall             : "
        f"{recall * 100:.2f}%"
    )

    print(
        f"F1 Score           : "
        f"{f1 * 100:.2f}%"
    )

    print(
        f"ROC-AUC            : "
        f"{roc_auc:.4f}"
    )

    print(
        f"False Positive Rate : "
        f"{false_positive_rate * 100:.2f}%"
    )

    print(
        f"False Negative Rate : "
        f"{false_negative_rate * 100:.2f}%"
    )

    # ========================================================
    # CONFUSION MATRIX
    # ========================================================

    print(
        "\nConfusion Matrix:"
    )

    print()

    print(
        "                    Predicted"
    )

    print(
        "                    Normal  Suspicious"
    )

    print(
        f"Actual Normal      "
        f"{tn:6d}  "
        f"{fp:10d}"
    )

    print(
        f"Actual Suspicious  "
        f"{fn:6d}  "
        f"{tp:10d}"
    )

    # ========================================================
    # CLASSIFICATION REPORT
    # ========================================================

    print(
        "\nClassification Report:"
    )

    print(
        classification_report(
            y_true,
            predictions,
            target_names=[
                "Normal",
                "Suspicious"
            ],
            zero_division=0
        )
    )

    # ========================================================
    # PROBABILITY INFORMATION
    # ========================================================

    print(
        "Probability statistics:"
    )

    print(
        f"Minimum probability : "
        f"{probabilities.min():.6f}"
    )

    print(
        f"Maximum probability : "
        f"{probabilities.max():.6f}"
    )

    print(
        f"Mean probability    : "
        f"{probabilities.mean():.6f}"
    )

    # --------------------------------------------------------
    # Return results
    # --------------------------------------------------------

    return {

        "model":
            "LSTM Behavioral Detector",

        "threshold":
            threshold,

        "accuracy":
            float(
                accuracy
            ),

        "precision":
            float(
                precision
            ),

        "recall":
            float(
                recall
            ),

        "f1_score":
            float(
                f1
            ),

        "roc_auc":
            float(
                roc_auc
            ),

        "false_positive_rate":
            float(
                false_positive_rate
            ),

        "false_negative_rate":
            float(
                false_negative_rate
            ),

        "true_negative":
            int(tn),

        "false_positive":
            int(fp),

        "false_negative":
            int(fn),

        "true_positive":
            int(tp),

        "validation_samples":
            int(
                len(y_true)
            )
    }


# ============================================================
# SAVE REPORT
# ============================================================

def save_report(
    results
):

    os.makedirs(
        REPORTS_DIR,
        exist_ok=True
    )

    report_path = os.path.join(
        REPORTS_DIR,
        "lstm_evaluation.json"
    )

    with open(
        report_path,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            results,
            file,
            indent=4
        )

    print(
        "\nReport saved:"
    )

    print(
        report_path
    )


# ============================================================
# MAIN
# ============================================================

def main():

    # --------------------------------------------------------
    # Dataset
    # --------------------------------------------------------

    load_dataset()

    # --------------------------------------------------------
    # Existing validation sequences
    # --------------------------------------------------------

    (
        X_validation,
        y_validation
    ) = load_sequences()

    # --------------------------------------------------------
    # Existing trained LSTM
    # --------------------------------------------------------

    model = load_model()

    # --------------------------------------------------------
    # Evaluation
    # --------------------------------------------------------

    results = evaluate(
        model,
        X_validation,
        y_validation
    )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    save_report(
        results
    )

    print(
        "\n"
        + "=" * 70
    )

    print(
        "LSTM evaluation completed successfully."
    )

    print(
        "=" * 70
    )


# ============================================================
# ENTRY POINT
# ============================================================

if __name__ == "__main__":

    main()