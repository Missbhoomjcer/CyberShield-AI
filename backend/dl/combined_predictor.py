"""
CyberShield-AI Combined Predictor

Combines:
    1. Static XGBoost malware detection
    2. Behavioral LSTM detection
    3. Threat Decision Engine

The predictor does NOT invent a static probability when no file
has been statically scanned.
"""

from typing import Optional, Sequence, Dict, Any

from backend.ml.predict_file import predict_file
from backend.dl.lstm_predict import predict_sequence
from backend.dl.threat_decision_engine import decide_threat


# ============================================================
# BEHAVIORAL FEATURE ORDER
# ============================================================

BEHAVIOR_FEATURES = [
    "cpu_usage",
    "memory_usage",
    "process_count",
    "file_change_count",
    "network_connection_count",
    "suspicious_process_count",
    "suspicious_score",
]


# ============================================================
# HELPER
# ============================================================

def _get_probability(result: Optional[Dict[str, Any]]) -> Optional[float]:
    """
    Extract malware probability from the static prediction result.
    """

    if not result:
        return None

    probability = result.get("malware_probability")

    if probability is None:
        probability = result.get("probability")

    if probability is None:
        return None

    return float(probability)


def _get_behavior_value(
    behavior: Optional[Dict[str, Any]],
    key: str,
    default: float = 0.0
) -> float:
    """
    Safely read a behavioral metric.
    """

    if not behavior:
        return default

    value = behavior.get(key, default)

    try:
        return float(value)
    except (TypeError, ValueError):
        return default


def _build_behavior_sequence(
    sequence: Sequence,
) -> list:
    """
    Validate the LSTM sequence.

    Expected:
        sequence_length x 7

    The LSTM model currently expects 7 behavioral features.
    """

    if sequence is None:
        raise ValueError("Behavior sequence cannot be None.")

    sequence = list(sequence)

    if len(sequence) == 0:
        raise ValueError("Behavior sequence cannot be empty.")

    validated = []

    for index, row in enumerate(sequence):

        row = list(row)

        if len(row) != len(BEHAVIOR_FEATURES):
            raise ValueError(
                f"Invalid behavioral row at index {index}. "
                f"Expected {len(BEHAVIOR_FEATURES)} features, "
                f"got {len(row)}."
            )

        try:
            validated.append(
                [float(value) for value in row]
            )

        except (TypeError, ValueError) as exc:

            raise ValueError(
                f"Invalid numeric value in behavioral row "
                f"{index}: {row}"
            ) from exc

    return validated


# ============================================================
# STATIC + BEHAVIORAL COMBINED PREDICTION
# ============================================================

def combined_predict(
    file_path: Optional[str] = None,
    behavior_sequence: Optional[Sequence] = None,
    behavior: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Run the CyberShield-AI combined detection pipeline.

    Parameters
    ----------
    file_path:
        Optional path to a Windows PE file.

        If supplied:
            XGBoost static analysis is performed.

        If omitted:
            No static probability is invented.

    behavior_sequence:
        Optional LSTM sequence.

        Expected shape:
            sequence_length x 7

        Feature order:
            cpu_usage
            memory_usage
            process_count
            file_change_count
            network_connection_count
            suspicious_process_count
            suspicious_score

    behavior:
        Optional current behavioral metrics used by the
        Threat Decision Engine.

    Returns
    -------
    dict
        Contains:
            static_result
            behavioral_result
            threat_decision
            model probabilities
            final risk
            action
    """

    # ========================================================
    # INITIALIZE
    # ========================================================

    static_result = None
    behavioral_result = None

    static_probability = None
    lstm_probability = None

    # ========================================================
    # STATIC ANALYSIS
    # ========================================================

    if file_path is not None:

        static_result = predict_file(
            file_path
        )

        static_probability = _get_probability(
            static_result
        )

    # ========================================================
    # BEHAVIORAL LSTM ANALYSIS
    # ========================================================

    if behavior_sequence is not None:

        sequence = _build_behavior_sequence(
            behavior_sequence
        )

        lstm_probability = float(
            predict_sequence(
                sequence
            )
        )

        behavioral_result = {
            "model": "LSTM",
            "probability": lstm_probability,
            "prediction": (
                "Suspicious"
                if lstm_probability >= 0.50
                else "Normal"
            ),
            "sequence_length": len(sequence),
            "features": BEHAVIOR_FEATURES,
        }

    # ========================================================
    # BEHAVIORAL METRICS
    # ========================================================

    suspicious_score = _get_behavior_value(
        behavior,
        "suspicious_score"
    )

    cpu_usage = _get_behavior_value(
        behavior,
        "cpu_usage"
    )

    memory_usage = _get_behavior_value(
        behavior,
        "memory_usage"
    )

    process_count = _get_behavior_value(
        behavior,
        "process_count"
    )

    file_change_count = _get_behavior_value(
        behavior,
        "file_change_count"
    )

    network_connection_count = _get_behavior_value(
        behavior,
        "network_connection_count"
    )

    suspicious_process_count = _get_behavior_value(
        behavior,
        "suspicious_process_count"
    )

    registry_change_count = _get_behavior_value(
        behavior,
        "registry_change_count"
    )

    # ========================================================
    # THREAT DECISION ENGINE
    # ========================================================

    threat_decision = decide_threat(
        static_probability=static_probability,
        lstm_probability=lstm_probability,

        suspicious_score=suspicious_score,
        cpu_usage=cpu_usage,
        memory_usage=memory_usage,
        process_count=process_count,
        file_change_count=file_change_count,
        network_connection_count=network_connection_count,
        suspicious_process_count=suspicious_process_count,
        registry_change_count=registry_change_count,
    )

    # ========================================================
    # CONVERT DECISION OBJECT
    # ========================================================

    if hasattr(
        threat_decision,
        "__dict__"
    ):
        decision_dict = vars(
            threat_decision
        )

    else:
        decision_dict = threat_decision

    # ========================================================
    # FINAL RESULT
    # ========================================================

    result = {

        "static_analysis": static_result,

        "behavioral_analysis": behavioral_result,

        "model_probabilities": {
            "xgboost": static_probability,
            "lstm": lstm_probability,
        },

        "threat_decision": decision_dict,

        "overall_risk": decision_dict.get(
            "overall_risk"
        ),

        "threat_level": decision_dict.get(
            "threat_level"
        ),

        "action": decision_dict.get(
            "action"
        ),

        "confidence": decision_dict.get(
            "confidence"
        ),

        "reasons": decision_dict.get(
            "reasons",
            []
        ),
    }

    return result