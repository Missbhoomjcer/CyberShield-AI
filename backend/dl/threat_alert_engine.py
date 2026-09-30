"""
CyberShield-AI Threat Alert Engine

Combines LSTM prediction with behavioral indicators
to produce a final risk level.

This module is detection-only.
It does not execute, modify, delete, encrypt, or quarantine files.
"""

from dataclasses import dataclass


@dataclass
class ThreatResult:
    prediction: str
    lstm_probability: float
    behavioral_score: float
    final_risk: float
    risk_level: str
    alert: bool
    reasons: list


def clamp(value, minimum=0.0, maximum=100.0):
    return max(minimum, min(float(value), maximum))


def calculate_final_risk(
    lstm_probability,
    suspicious_score,
    cpu_usage,
    memory_usage,
    process_count,
    file_change_count,
    network_connection_count,
    suspicious_process_count,
    registry_change_count,
):
    """
    Calculate a combined risk score.

    LSTM probability is the main ML signal.
    Behavioral indicators provide supporting evidence.
    """

    lstm_probability = clamp(lstm_probability, 0, 1)
    suspicious_score = clamp(suspicious_score)

    # Convert LSTM probability to percentage.
    lstm_risk = lstm_probability * 100

    # Start with weighted ML + behavioral risk.
    final_risk = (
        lstm_risk * 0.65
        + suspicious_score * 0.35
    )

    reasons = []

    # Supporting behavioral indicators.
    if cpu_usage >= 90:
        final_risk += 5
        reasons.append("Very high CPU activity")
    elif cpu_usage >= 75:
        final_risk += 2
        reasons.append("Elevated CPU activity")

    if memory_usage >= 90:
        final_risk += 5
        reasons.append("Very high memory activity")
    elif memory_usage >= 80:
        final_risk += 2
        reasons.append("Elevated memory activity")

    if process_count >= 450:
        final_risk += 5
        reasons.append("High process activity")
    elif process_count >= 350:
        final_risk += 2
        reasons.append("Elevated process activity")

    if file_change_count >= 50:
        final_risk += 10
        reasons.append("High file-change activity")
    elif file_change_count >= 20:
        final_risk += 5
        reasons.append("Elevated file-change activity")

    if network_connection_count >= 150:
        final_risk += 5
        reasons.append("High network activity")
    elif network_connection_count >= 100:
        final_risk += 2
        reasons.append("Elevated network activity")

    if suspicious_process_count >= 5:
        final_risk += 10
        reasons.append("Multiple suspicious processes detected")
    elif suspicious_process_count >= 2:
        final_risk += 5
        reasons.append("Suspicious process activity detected")

    if registry_change_count > 0:
        final_risk += 8
        reasons.append("Registry activity detected")

    final_risk = round(clamp(final_risk), 2)

    # Risk classification.
    if final_risk >= 70:
        risk_level = "HIGH"
    elif final_risk >= 40:
        risk_level = "MEDIUM"
    else:
        risk_level = "LOW"

    # Alert only when the combined evidence reaches
    # the suspicious threshold.
    alert = risk_level == "HIGH"

    prediction = (
        "SUSPICIOUS"
        if alert
        else "NORMAL"
    )

    if not reasons:
        reasons.append("No significant suspicious behavioral indicators")

    return ThreatResult(
        prediction=prediction,
        lstm_probability=round(lstm_probability, 4),
        behavioral_score=round(suspicious_score, 2),
        final_risk=final_risk,
        risk_level=risk_level,
        alert=alert,
        reasons=reasons,
    )


def print_threat_result(result):
    print()
    print("=" * 65)
    print("CYBERSHIELD-AI THREAT ASSESSMENT")
    print("=" * 65)

    print(f"Prediction          : {result.prediction}")
    print(f"LSTM Probability    : {result.lstm_probability:.4f}")
    print(f"Behavioral Score    : {result.behavioral_score:.2f}")
    print(f"Final Risk          : {result.final_risk:.2f}%")
    print(f"Risk Level          : {result.risk_level}")
    print(f"Threat Alert        : {'YES' if result.alert else 'NO'}")

    print()
    print("Indicators:")

    for reason in result.reasons:
        print(f" - {reason}")

    print("=" * 65)


if __name__ == "__main__":

    print("=" * 65)
    print("CYBERSHIELD-AI THREAT ALERT ENGINE TEST")
    print("=" * 65)

    print()
    print("Test 1: Normal behavior")

    normal_result = calculate_final_risk(
        lstm_probability=0.01,
        suspicious_score=18,
        cpu_usage=20,
        memory_usage=70,
        process_count=290,
        file_change_count=0,
        network_connection_count=15,
        suspicious_process_count=0,
        registry_change_count=0,
    )

    print_threat_result(normal_result)

    print()
    print("Test 2: Simulated suspicious behavior")

    suspicious_result = calculate_final_risk(
        lstm_probability=0.95,
        suspicious_score=85,
        cpu_usage=92,
        memory_usage=93,
        process_count=470,
        file_change_count=75,
        network_connection_count=165,
        suspicious_process_count=6,
        registry_change_count=1,
    )

    print_threat_result(suspicious_result)

    print()
    print("=" * 65)
    print("THREAT ALERT ENGINE TEST COMPLETED")
    print("=" * 65)