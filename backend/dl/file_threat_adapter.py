from typing import Any, Optional

from backend.dl.threat_decision_engine import decide_threat


def get_detector_verdict(result: Optional[dict[str, Any]]) -> Optional[str]:
    """
    Get the detector's final security verdict.

    The detector's final verdict takes priority over raw ML
    probabilities because some detectors apply additional
    security rules after model inference.
    """

    if not isinstance(result, dict):
        return None

    verdict = result.get("verdict")

    if isinstance(verdict, str):
        verdict = verdict.upper()

        if verdict in {
            "BENIGN",
            "MALICIOUS",
            "SUSPICIOUS",
            "THREAT"
        }:
            return verdict

    prediction = result.get("prediction")

    if isinstance(prediction, str):
        prediction = prediction.upper()

        if prediction in {
            "BENIGN",
            "MALICIOUS",
            "SUSPICIOUS",
            "THREAT"
        }:
            return prediction

    return None


def extract_probability(
    result: Optional[dict[str, Any]]
) -> Optional[float]:

    if not isinstance(result, dict):
        return None

    for key in (
        "malicious_probability",
        "malware_probability",
        "risk_probability",
    ):
        value = result.get(key)

        if isinstance(value, (int, float)):
            return float(value)

    prediction = result.get("prediction")

    if isinstance(prediction, dict):
        return extract_probability(prediction)

    if isinstance(prediction, (int, float)):
        return float(prediction)

    return None


def normalize_file_probability(
    result: Optional[dict[str, Any]]
) -> Optional[float]:

    if not isinstance(result, dict):
        return None

    verdict = get_detector_verdict(result)

    # Final security verdict takes priority.
    if verdict == "BENIGN":
        return 0.0

    if verdict in {"MALICIOUS", "THREAT"}:
        return 100.0

    if verdict == "SUSPICIOUS":
        return 75.0

    probability = extract_probability(result)

    if probability is None:
        return None

    if 0 <= probability <= 1:
        probability *= 100

    return max(0.0, min(probability, 100.0))


def decide_file_threat(
    detector_result: dict[str, Any],
    detector_name: str,
):
    """
    Convert an individual file detector result into
    the common CyberShield ThreatDecision format.

    The detector's final security verdict is preferred
    over raw model probability.
    """

    probability = normalize_file_probability(
        detector_result
    )

    result = decide_threat(
        static_probability=probability,
        lstm_probability=None,
    )

    return {
        "detector": detector_name,
        "static_risk": result.static_risk,
        "behavioral_risk": result.behavioral_risk,
        "evidence_score": result.evidence_score,
        "overall_risk": result.overall_risk,
        "threat_level": result.threat_level,
        "action": result.action,
        "confidence": result.confidence,
        "reasons": result.reasons,
    }


def aggregate_zip_threat(
    scanned_files: list[dict[str, Any]]
) -> dict[str, Any]:

    decisions = []

    for item in scanned_files:

        prediction = item.get("prediction")

        if not isinstance(prediction, dict):
            continue

        detector = item.get(
            "detector",
            "Unknown Detector"
        )

        decision = decide_file_threat(
            prediction,
            detector
        )

        decision["file"] = item.get(
            "file",
            "unknown"
        )

        decisions.append(decision)

    if not decisions:
        return {
            "overall_risk": 0,
            "threat_level": "LOW",
            "action": "ALLOW",
            "confidence": "LOW",
            "reasons": [
                "No supported files were successfully scanned."
            ],
            "file_decisions": []
        }

    highest = max(
        decisions,
        key=lambda x: x["overall_risk"]
    )

    return {
        "overall_risk": highest["overall_risk"],
        "threat_level": highest["threat_level"],
        "action": highest["action"],
        "confidence": highest["confidence"],
        "reasons": [
            f"Highest-risk file: {highest['file']}"
        ] + highest["reasons"],
        "file_decisions": decisions,
    }