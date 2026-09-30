"""
CyberShield-AI Threat Decision Engine

Combines:
    1. Static XGBoost risk
    2. Behavioral LSTM risk
    3. Real-time behavioral evidence

Important:
    Process count is NOT considered a threat indicator.
    Windows systems can normally have hundreds of processes.
"""

from dataclasses import dataclass
from typing import Optional


# ============================================================
# THREAT DECISION RESULT
# ============================================================

@dataclass
class ThreatDecision:
    static_risk: float
    behavioral_risk: float
    evidence_score: float
    overall_risk: float
    threat_level: str
    action: str
    confidence: str
    reasons: list[str]


# ============================================================
# UTILITY
# ============================================================

def clamp(
    value: float,
    minimum: float = 0.0,
    maximum: float = 100.0
) -> float:

    return max(
        minimum,
        min(float(value), maximum)
    )


def normalize_probability(
    probability: Optional[float]
) -> Optional[float]:

    if probability is None:
        return None

    probability = float(probability)

    # Accept either:
    # 0.0 - 1.0
    # OR
    # 0 - 100

    if probability <= 1.0:
        probability *= 100.0

    return clamp(probability)


# ============================================================
# BEHAVIORAL EVIDENCE
# ============================================================

def calculate_behavior_evidence(
    suspicious_score: float = 0.0,
    cpu_usage: float = 0.0,
    memory_usage: float = 0.0,
    process_count: float = 0.0,
    file_change_count: float = 0.0,
    network_connection_count: float = 0.0,
    suspicious_process_count: float = 0.0,
    registry_change_count: float = 0.0,
) -> tuple[float, list[str]]:

    evidence = 0.0
    reasons = []

    # --------------------------------------------------------
    # SUSPICIOUS SCORE
    # --------------------------------------------------------

    suspicious_score = clamp(
        suspicious_score
    )

    if suspicious_score >= 80:

        evidence += 35

        reasons.append(
            "Very high suspicious behavior score"
        )

    elif suspicious_score >= 60:

        evidence += 25

        reasons.append(
            "High suspicious behavior score"
        )

    elif suspicious_score >= 40:

        evidence += 15

        reasons.append(
            "Elevated suspicious behavior score"
        )

    # --------------------------------------------------------
    # FILE CHANGES
    #
    # Rapid file modification is one of the strongest
    # ransomware-related behavioral indicators.
    # --------------------------------------------------------

    if file_change_count >= 50:

        evidence += 25

        reasons.append(
            "Rapid file-change activity detected"
        )

    elif file_change_count >= 20:

        evidence += 15

        reasons.append(
            "Elevated file-change activity detected"
        )

    elif file_change_count >= 10:

        evidence += 8

        reasons.append(
            "Increased file-change activity"
        )

    # --------------------------------------------------------
    # SUSPICIOUS PROCESSES
    # --------------------------------------------------------

    if suspicious_process_count >= 5:

        evidence += 20

        reasons.append(
            "Multiple suspicious processes detected"
        )

    elif suspicious_process_count >= 2:

        evidence += 12

        reasons.append(
            "Suspicious process activity detected"
        )

    # --------------------------------------------------------
    # NETWORK CONNECTIONS
    # --------------------------------------------------------

    if network_connection_count >= 50:

        evidence += 10

        reasons.append(
            "High network connection activity"
        )

    elif network_connection_count >= 20:

        evidence += 5

        reasons.append(
            "Elevated network connection activity"
        )

    # --------------------------------------------------------
    # REGISTRY CHANGES
    # --------------------------------------------------------

    if registry_change_count >= 20:

        evidence += 10

        reasons.append(
            "High registry-change activity"
        )

    elif registry_change_count >= 5:

        evidence += 5

        reasons.append(
            "Registry changes detected"
        )

    # --------------------------------------------------------
    # CPU
    #
    # Supporting evidence only.
    # High CPU by itself is NOT malware evidence.
    # --------------------------------------------------------

    if cpu_usage >= 90:

        evidence += 5

        reasons.append(
            "Very high CPU usage"
        )

    # --------------------------------------------------------
    # MEMORY
    #
    # Supporting evidence only.
    # High memory by itself is NOT malware evidence.
    # --------------------------------------------------------

    if memory_usage >= 90:

        evidence += 5

        reasons.append(
            "Very high memory usage"
        )

    # --------------------------------------------------------
    # PROCESS COUNT
    #
    # IMPORTANT:
    #
    # process_count is deliberately NOT used here.
    #
    # 300+ Windows processes can be completely normal because
    # of browsers, VS Code, Python, Windows services,
    # antivirus, drivers and background applications.
    #
    # Therefore:
    #
    # 325 processes -> NO THREAT SCORE
    # 500 processes -> NO THREAT SCORE
    #
    # Suspicious processes are handled separately through
    # suspicious_process_count.
    # --------------------------------------------------------

    return clamp(evidence), reasons


# ============================================================
# MAIN THREAT DECISION
# ============================================================

def decide_threat(
    static_probability: Optional[float] = None,
    lstm_probability: Optional[float] = None,
    suspicious_score: float = 0.0,
    cpu_usage: float = 0.0,
    memory_usage: float = 0.0,
    process_count: float = 0.0,
    file_change_count: float = 0.0,
    network_connection_count: float = 0.0,
    suspicious_process_count: float = 0.0,
    registry_change_count: float = 0.0,
) -> ThreatDecision:

    # ========================================================
    # NORMALIZE MODEL OUTPUTS
    # ========================================================

    static_risk = normalize_probability(
        static_probability
    )

    behavioral_risk = normalize_probability(
        lstm_probability
    )

    # ========================================================
    # BEHAVIORAL EVIDENCE
    # ========================================================

    evidence_score, reasons = calculate_behavior_evidence(

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
    # ML RISK FUSION
    #
    # XGBoost = 55%
    # LSTM    = 45%
    #
    # If only one model is available, use that model alone.
    # ========================================================

    weighted_total = 0.0
    weight_total = 0.0

    if static_risk is not None:

        weighted_total += (
            static_risk * 0.55
        )

        weight_total += 0.55

    if behavioral_risk is not None:

        weighted_total += (
            behavioral_risk * 0.45
        )

        weight_total += 0.45

    if weight_total > 0:

        ml_risk = (
            weighted_total / weight_total
        )

    else:

        ml_risk = 0.0

    # ========================================================
    # FINAL RISK
    #
    # ML models = 80%
    # Behavioral evidence = 20%
    # ========================================================

    overall_risk = (

        ml_risk * 0.80

        + evidence_score * 0.20
    )

    overall_risk = clamp(
        overall_risk
    )

    # ========================================================
    # THREAT LEVEL
    # ========================================================

    if overall_risk >= 90:

        threat_level = "CRITICAL"

    elif overall_risk >= 75:

        threat_level = "HIGH"

    elif overall_risk >= 50:

        threat_level = "MEDIUM"

    else:

        threat_level = "LOW"

    # ========================================================
    # CONFIDENCE
    # ========================================================

    available_models = sum(
        value is not None
        for value in [
            static_risk,
            behavioral_risk
        ]
    )

    if (
        available_models == 2
        and overall_risk >= 75
    ):

        confidence = "HIGH"

    elif (
        available_models >= 1
        and overall_risk >= 50
    ):

        confidence = "MEDIUM"

    else:

        confidence = "LOW"

    # ========================================================
    # PROTECTION ACTION
    # ========================================================

    if threat_level == "CRITICAL":

        action = "BLOCK_AND_QUARANTINE"

    elif threat_level == "HIGH":

        action = "CONTAIN_AND_QUARANTINE"

    elif threat_level == "MEDIUM":

        action = "MONITOR_AND_INSPECT"

    else:

        action = "ALLOW"

    # ========================================================
    # DEFAULT REASON
    # ========================================================

    if not reasons:

        reasons.append(
            "No strong behavioral indicators detected"
        )

    # ========================================================
    # RETURN RESULT
    # ========================================================

    return ThreatDecision(

        static_risk=round(
            static_risk or 0.0,
            2
        ),

        behavioral_risk=round(
            behavioral_risk or 0.0,
            2
        ),

        evidence_score=round(
            evidence_score,
            2
        ),

        overall_risk=round(
            overall_risk,
            2
        ),

        threat_level=threat_level,

        action=action,

        confidence=confidence,

        reasons=reasons,
    )


# ============================================================
# DISPLAY RESULT
# ============================================================

def print_decision(
    result: ThreatDecision
) -> None:

    print()

    print("=" * 65)

    print(
        "CYBERSHIELD-AI THREAT DECISION"
    )

    print("=" * 65)

    print(
        f"Static Risk               : "
        f"{result.static_risk:.2f}%"
    )

    print(
        f"Behavioral Risk           : "
        f"{result.behavioral_risk:.2f}%"
    )

    print(
        f"Evidence Score            : "
        f"{result.evidence_score:.2f}%"
    )

    print(
        f"Overall Risk              : "
        f"{result.overall_risk:.2f}%"
    )

    print(
        f"Threat Level              : "
        f"{result.threat_level}"
    )

    print(
        f"Recommended Action        : "
        f"{result.action}"
    )

    print(
        f"Confidence                : "
        f"{result.confidence}"
    )

    print()

    print("Reasons:")

    for reason in result.reasons:

        print(
            f" - {reason}"
        )

    print("=" * 65)


# ============================================================
# LOCAL TESTS
# ============================================================

if __name__ == "__main__":

    # --------------------------------------------------------
    # TEST 1: NORMAL WINDOWS MACHINE
    # --------------------------------------------------------

    print(
        "\nTEST 1: NORMAL WINDOWS ACTIVITY"
    )

    result = decide_threat(

        static_probability=2,

        lstm_probability=5,

        suspicious_score=8,

        cpu_usage=25,

        memory_usage=85,

        process_count=325,

        file_change_count=0,

        network_connection_count=18,

        suspicious_process_count=0,

        registry_change_count=0,
    )

    print_decision(
        result
    )

    # --------------------------------------------------------
    # TEST 2: SUSPICIOUS ACTIVITY
    # --------------------------------------------------------

    print(
        "\nTEST 2: SUSPICIOUS ACTIVITY"
    )

    result = decide_threat(

        static_probability=65,

        lstm_probability=72,

        suspicious_score=65,

        cpu_usage=70,

        memory_usage=75,

        process_count=325,

        file_change_count=25,

        network_connection_count=25,

        suspicious_process_count=2,

        registry_change_count=6,
    )

    print_decision(
        result
    )

    # --------------------------------------------------------
    # TEST 3: HIGH-RISK SIMULATED ACTIVITY
    # --------------------------------------------------------

    print(
        "\nTEST 3: HIGH-RISK SIMULATED ACTIVITY"
    )

    result = decide_threat(

        static_probability=95,

        lstm_probability=97,

        suspicious_score=90,

        cpu_usage=92,

        memory_usage=93,

        process_count=325,

        file_change_count=70,

        network_connection_count=60,

        suspicious_process_count=6,

        registry_change_count=25,
    )

    print_decision(
        result
    )