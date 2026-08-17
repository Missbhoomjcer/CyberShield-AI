import os
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import TensorDataset, DataLoader, random_split


# ============================================================
# CYBERSHIELD-AI LSTM BEHAVIORAL DETECTION
# ============================================================

print("=" * 70)
print("CYBERSHIELD-AI LSTM BEHAVIORAL DETECTION")
print("=" * 70)

# ------------------------------------------------------------
# PATHS
# ------------------------------------------------------------

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..")
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

os.makedirs(MODEL_DIR, exist_ok=True)


# ------------------------------------------------------------
# DEVICE
# ------------------------------------------------------------

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print()
print("Device:", device)


# ------------------------------------------------------------
# LOAD LARGE LSTM DATASET
# ------------------------------------------------------------

print()
print("Loading LARGE LSTM sequence dataset...")

if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(
        f"""
LSTM dataset not found:

{DATA_PATH}

Run this first:

python backend\\dl\\sequence_generator.py
"""
    )

data = np.load(DATA_PATH)

X = data["X"]
y = data["y"]

print("X shape:", X.shape)
print("y shape:", y.shape)


# ------------------------------------------------------------
# CHECK DATA
# ------------------------------------------------------------

if X.ndim != 3:
    raise ValueError(
        f"Expected X to have 3 dimensions "
        f"(samples, timesteps, features), got {X.shape}"
    )

if y.ndim != 1:
    y = y.reshape(-1)

samples, timesteps, features = X.shape

print()
print("LSTM dataset information:")
print("Samples   :", samples)
print("Timesteps :", timesteps)
print("Features  :", features)

print()
print("Label distribution:")
print("NORMAL (0):", int(np.sum(y == 0)))
print("SUSPICIOUS (1):", int(np.sum(y == 1)))


# ------------------------------------------------------------
# CONVERT TO PYTORCH TENSORS
# ------------------------------------------------------------

X_tensor = torch.tensor(X, dtype=torch.float32)
y_tensor = torch.tensor(y, dtype=torch.float32)


# ------------------------------------------------------------
# DATASET
# ------------------------------------------------------------

dataset = TensorDataset(X_tensor, y_tensor)


# ------------------------------------------------------------
# TRAIN / VALIDATION SPLIT
# ------------------------------------------------------------

train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size

generator = torch.Generator().manual_seed(42)

train_dataset, val_dataset = random_split(
    dataset,
    [train_size, val_size],
    generator=generator
)

print()
print("Dataset split:")
print("Training samples  :", len(train_dataset))
print("Validation samples:", len(val_dataset))


# ------------------------------------------------------------
# DATA LOADERS
# ------------------------------------------------------------

BATCH_SIZE = 64

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True
)

val_loader = DataLoader(
    val_dataset,
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
            dropout=0.2 if num_layers > 1 else 0
        )

        self.dropout = nn.Dropout(dropout)

        self.fc = nn.Linear(
            hidden_size,
            1
        )

    def forward(self, x):

        output, (hidden, cell) = self.lstm(x)

        # Last timestep
        last_output = output[:, -1, :]

        last_output = self.dropout(last_output)

        result = self.fc(last_output)

        return result.squeeze(1)


# ------------------------------------------------------------
# CREATE MODEL
# ------------------------------------------------------------

model = BehavioralLSTM(
    input_size=features,
    hidden_size=64,
    num_layers=2,
    dropout=0.3
)

model = model.to(device)

print()
print("LSTM architecture:")
print(model)


# ------------------------------------------------------------
# LOSS FUNCTION
# ------------------------------------------------------------

criterion = nn.BCEWithLogitsLoss()


# ------------------------------------------------------------
# OPTIMIZER
# ------------------------------------------------------------

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=0.001
)


# ------------------------------------------------------------
# TRAINING SETTINGS
# ------------------------------------------------------------

EPOCHS = 30

best_val_loss = float("inf")


# ============================================================
# TRAINING
# ============================================================

print()
print("=" * 70)
print("STARTING LSTM TRAINING")
print("=" * 70)

for epoch in range(EPOCHS):

    # --------------------------------------------------------
    # TRAIN
    # --------------------------------------------------------

    model.train()

    train_loss = 0.0

    for batch_X, batch_y in train_loader:

        batch_X = batch_X.to(device)
        batch_y = batch_y.to(device)

        optimizer.zero_grad()

        outputs = model(batch_X)

        loss = criterion(
            outputs,
            batch_y
        )

        loss.backward()

        optimizer.step()

        train_loss += loss.item() * batch_X.size(0)

    train_loss /= len(train_loader.dataset)


    # --------------------------------------------------------
    # VALIDATION
    # --------------------------------------------------------

    model.eval()

    val_loss = 0.0

    correct = 0
    total = 0

    with torch.no_grad():

        for batch_X, batch_y in val_loader:

            batch_X = batch_X.to(device)
            batch_y = batch_y.to(device)

            outputs = model(batch_X)

            loss = criterion(
                outputs,
                batch_y
            )

            val_loss += loss.item() * batch_X.size(0)

            probabilities = torch.sigmoid(outputs)

            predictions = (
                probabilities >= 0.5
            ).float()

            correct += (
                predictions == batch_y
            ).sum().item()

            total += batch_y.size(0)

    val_loss /= len(val_loader.dataset)

    val_accuracy = (
        correct / total
    ) * 100


    # --------------------------------------------------------
    # SAVE BEST MODEL
    # --------------------------------------------------------

    if val_loss < best_val_loss:

        best_val_loss = val_loss

        torch.save(
            {
                "model_state_dict": model.state_dict(),
                "input_size": features,
                "hidden_size": 64,
                "num_layers": 2,
                "dropout": 0.3,
                "timesteps": timesteps
            },
            MODEL_PATH
        )


    # --------------------------------------------------------
    # PRINT PROGRESS
    # --------------------------------------------------------

    print(
        f"Epoch [{epoch + 1:02d}/{EPOCHS}] "
        f"Train Loss: {train_loss:.4f} | "
        f"Val Loss: {val_loss:.4f} | "
        f"Val Accuracy: {val_accuracy:.2f}%"
    )


# ============================================================
# COMPLETED
# ============================================================

print()
print("=" * 70)
print("LSTM TRAINING COMPLETED")
print("=" * 70)

print()
print("Best model saved to:")
print(MODEL_PATH)

print()
print("LSTM input shape:")
print(
    f"(samples={samples}, "
    f"timesteps={timesteps}, "
    f"features={features})"
)

print()
print("Expected real-time input:")
print(f"(1, {timesteps}, {features})")

print()
print("Behavioral features:")
print("1. cpu_usage")
print("2. memory_usage")
print("3. process_count")
print("4. file_change_count")
print("5. network_connection_count")
print("6. suspicious_process_count")
print("7. suspicious_score")

print()
print("LSTM behavioral detector is ready.")
print("=" * 70)