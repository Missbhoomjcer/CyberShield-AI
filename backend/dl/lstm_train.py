import os
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader


# ============================================================
# CYBERSHIELD-AI
# LEAKAGE-SAFE LSTM TRAINING
# ============================================================

print("=" * 70)
print("CYBERSHIELD-AI LEAKAGE-SAFE LSTM TRAINING")
print("=" * 70)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        ".."
    )
)

DATA_PATH = os.path.join(
    BASE_DIR,
    "backend",
    "datasets",
    "behavioral",
    "lstm_sequences_large.npz"
)

MODEL_DIR = os.path.join(
    BASE_DIR,
    "backend",
    "models"
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "lstm_behavioral_model.pth"
)

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)


# ============================================================
# DEVICE
# ============================================================

device = torch.device(
    "cuda"
    if torch.cuda.is_available()
    else "cpu"
)

print()
print("Device:", device)


# ============================================================
# LOAD DATA
# ============================================================

print()
print("Loading leakage-safe LSTM dataset...")

if not os.path.exists(DATA_PATH):

    raise FileNotFoundError(
        f"""
LSTM dataset not found:

{DATA_PATH}

Run:

python backend\\dl\\sequence_generator.py
"""
    )


data = np.load(
    DATA_PATH
)


# ============================================================
# LOAD TRAINING / VALIDATION DATA
# ============================================================

X_train = data["X_train"]
y_train = data["y_train"]

X_validation = data["X_validation"]
y_validation = data["y_validation"]


print()
print("Dataset loaded.")

print(
    "Training X:",
    X_train.shape
)

print(
    "Training y:",
    y_train.shape
)

print(
    "Validation X:",
    X_validation.shape
)

print(
    "Validation y:",
    y_validation.shape
)


# ============================================================
# DATA INFORMATION
# ============================================================

samples = X_train.shape[0]
timesteps = X_train.shape[1]
features = X_train.shape[2]

print()
print("=" * 70)
print("DATASET INFORMATION")
print("=" * 70)

print(
    "Training samples   :",
    samples
)

print(
    "Validation samples :",
    X_validation.shape[0]
)

print(
    "Timesteps           :",
    timesteps
)

print(
    "Features             :",
    features
)

print()
print("Training labels:")

print(
    "NORMAL     :",
    int(np.sum(y_train == 0))
)

print(
    "SUSPICIOUS :",
    int(np.sum(y_train == 1))
)

print()
print("Validation labels:")

print(
    "NORMAL     :",
    int(np.sum(y_validation == 0))
)

print(
    "SUSPICIOUS :",
    int(np.sum(y_validation == 1))
)


# ============================================================
# PYTORCH TENSORS
# ============================================================

X_train_tensor = torch.tensor(
    X_train,
    dtype=torch.float32
)

y_train_tensor = torch.tensor(
    y_train,
    dtype=torch.float32
)

X_validation_tensor = torch.tensor(
    X_validation,
    dtype=torch.float32
)

y_validation_tensor = torch.tensor(
    y_validation,
    dtype=torch.float32
)


# ============================================================
# DATASETS
# ============================================================

train_dataset = TensorDataset(
    X_train_tensor,
    y_train_tensor
)

validation_dataset = TensorDataset(
    X_validation_tensor,
    y_validation_tensor
)


# ============================================================
# DATA LOADERS
# ============================================================

BATCH_SIZE = 64

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True
)

validation_loader = DataLoader(
    validation_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False
)


# ============================================================
# LSTM MODEL
# ============================================================

class BehavioralLSTM(nn.Module):

    def __init__(
        self,
        input_size,
        hidden_size=64,
        num_layers=2,
        dropout=0.3
    ):

        super().__init__()

        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=0.2
            if num_layers > 1
            else 0
        )

        self.dropout = nn.Dropout(
            dropout
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

        result = self.fc(
            last_output
        )

        return result.squeeze(1)


# ============================================================
# CREATE MODEL
# ============================================================

model = BehavioralLSTM(
    input_size=features,
    hidden_size=64,
    num_layers=2,
    dropout=0.3
)

model = model.to(device)


print()
print("=" * 70)
print("LSTM ARCHITECTURE")
print("=" * 70)

print(model)


# ============================================================
# LOSS
# ============================================================

criterion = nn.BCEWithLogitsLoss()


# ============================================================
# OPTIMIZER
# ============================================================

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.001
)


# ============================================================
# TRAINING SETTINGS
# ============================================================

EPOCHS = 30

best_val_loss = float(
    "inf"
)

patience = 5

patience_counter = 0


# ============================================================
# TRAINING
# ============================================================

print()
print("=" * 70)
print("STARTING LSTM TRAINING")
print("=" * 70)


for epoch in range(
    EPOCHS
):


    # ========================================================
    # TRAIN
    # ========================================================

    model.train()

    train_loss = 0.0

    train_correct = 0
    train_total = 0


    for batch_X, batch_y in train_loader:

        batch_X = batch_X.to(
            device
        )

        batch_y = batch_y.to(
            device
        )


        optimizer.zero_grad()


        outputs = model(
            batch_X
        )


        loss = criterion(
            outputs,
            batch_y
        )


        loss.backward()


        optimizer.step()


        train_loss += (
            loss.item()
            * batch_X.size(0)
        )


        probabilities = torch.sigmoid(
            outputs
        )


        predictions = (
            probabilities >= 0.5
        ).float()


        train_correct += (
            predictions == batch_y
        ).sum().item()


        train_total += (
            batch_y.size(0)
        )


    train_loss /= len(
        train_loader.dataset
    )


    train_accuracy = (
        train_correct
        / train_total
    ) * 100


    # ========================================================
    # VALIDATION
    # ========================================================

    model.eval()

    val_loss = 0.0

    val_correct = 0

    val_total = 0


    with torch.no_grad():

        for batch_X, batch_y in validation_loader:

            batch_X = batch_X.to(
                device
            )

            batch_y = batch_y.to(
                device
            )


            outputs = model(
                batch_X
            )


            loss = criterion(
                outputs,
                batch_y
            )


            val_loss += (
                loss.item()
                * batch_X.size(0)
            )


            probabilities = torch.sigmoid(
                outputs
            )


            predictions = (
                probabilities >= 0.5
            ).float()


            val_correct += (
                predictions == batch_y
            ).sum().item()


            val_total += (
                batch_y.size(0)
            )


    val_loss /= len(
        validation_loader.dataset
    )


    val_accuracy = (
        val_correct
        / val_total
    ) * 100


    # ========================================================
    # SAVE BEST MODEL
    # ========================================================

    if val_loss < best_val_loss:

        best_val_loss = val_loss

        patience_counter = 0


        torch.save(
            {
                "model_state_dict":
                    model.state_dict(),

                "input_size":
                    features,

                "hidden_size":
                    64,

                "num_layers":
                    2,

                "dropout":
                    0.3,

                "timesteps":
                    timesteps
            },
            MODEL_PATH
        )


        saved = "  <-- BEST"


    else:

        patience_counter += 1

        saved = ""


    # ========================================================
    # PRINT
    # ========================================================

    print(
        f"Epoch [{epoch + 1:02d}/{EPOCHS}] "
        f"Train Loss: {train_loss:.4f} | "
        f"Train Acc: {train_accuracy:.2f}% | "
        f"Val Loss: {val_loss:.4f} | "
        f"Val Acc: {val_accuracy:.2f}%"
        f"{saved}"
    )


    # ========================================================
    # EARLY STOPPING
    # ========================================================

    if patience_counter >= patience:

        print()
        print(
            "Early stopping triggered."
        )

        break


# ============================================================
# TRAINING COMPLETE
# ============================================================

print()
print("=" * 70)
print("LSTM TRAINING COMPLETED")
print("=" * 70)

print()
print("Best validation loss:")
print(
    f"{best_val_loss:.6f}"
)

print()
print("Model saved to:")
print(
    MODEL_PATH
)

print()
print("Model input:")
print(
    f"(batch, {timesteps}, {features})"
)

print()
print("Behavioral features:")

FEATURE_NAMES = [
    "cpu_usage",
    "memory_usage",
    "process_count",
    "file_change_count",
    "network_connection_count",
    "suspicious_process_count",
    "suspicious_score"
]

for index, feature in enumerate(
    FEATURE_NAMES,
    start=1
):

    print(
        f"{index}. {feature}"
    )

print()
print(
    "Leakage-safe LSTM model is ready."
)

print("=" * 70)