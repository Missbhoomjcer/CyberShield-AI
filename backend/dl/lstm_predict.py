# ============================================================
# LSTM SEQUENCE PREDICTION
# ============================================================

def predict_sequence(sequence):
    """
    Predict behavioral suspicious probability for a sequence.

    Expected:
        sequence = 10 observations
        each observation contains 7 behavioral features

    Returns:
        float between 0.0 and 1.0
    """

    normalized_sequence = np.array(
        [normalize_features(row) for row in sequence],
        dtype=np.float32
    )

    if normalized_sequence.shape != (
        SEQUENCE_LENGTH,
        FEATURE_COUNT
    ):
        raise ValueError(
            f"Invalid sequence shape: "
            f"{normalized_sequence.shape}. "
            f"Expected "
            f"({SEQUENCE_LENGTH}, {FEATURE_COUNT})."
        )

    tensor = torch.tensor(
        normalized_sequence,
        dtype=torch.float32
    )

    tensor = tensor.unsqueeze(0)
    tensor = tensor.to(DEVICE)

    with torch.no_grad():

        output = model(tensor)

        probability = torch.sigmoid(
            output
        ).item()

    return float(probability)