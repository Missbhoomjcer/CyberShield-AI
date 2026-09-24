"""
CyberShield-AI Threat Decision Engine

Combines:
1. Static ML risk
2. Behavioral LSTM risk
3. Real-time behavioral evidence

The engine produces:
- overall risk score
- threat level
- recommended protection action
- confidence
- reasons

Important:
This module only makes a threat decision.
It does not kill processes or delete files.
Actual protection is handled by the protection/quarantine layer.
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
    #
    # 0.0 - 1.0
    #
    # OR
    #
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
    # process_count is deliberately NOT used as threat
    # evidence.
    #
    # A large number of Windows processes can be normal
    # because of browsers, VS Code, Python, Windows services,
    # antivirus software, drivers and background applications.
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
    # COUNT AVAILABLE ML MODELS
    # ========================================================

    available_models = sum(
        value is not None
        for value in [
            static_risk,
            behavioral_risk
        ]
    )

    # ========================================================
    # ML RISK FUSION
    #
    # BOTH MODELS:
    #
    # XGBoost = 55%
    # LSTM    = 45%
    #
    # ONLY STATIC:
    #
    # Static model is used directly.
    #
    # ONLY LSTM:
    #
    # LSTM model is used directly.
    #
    # NO MODEL:
    #
    # ML risk = 0.
    # ========================================================

    if (
        static_risk is not None
        and behavioral_risk is not None
    ):

        ml_risk = (
            static_risk * 0.55
            + behavioral_risk * 0.45
        )

    elif static_risk is not None:

        ml_risk = static_risk

    elif behavioral_risk is not None:

        ml_risk = behavioral_risk

    else:

        ml_risk = 0.0

    ml_risk = clamp(
        ml_risk
    )

    # ========================================================
    # BASE FINAL RISK
    #
    # BOTH MODELS:
    #
    # ML risk       = 80%
    # Evidence      = 20%
    #
    # ONE MODEL:
    #
    # Same base fusion is used, but a high-confidence
    # single-model prediction is preserved instead of being
    # artificially reduced because the second model is absent.
    #
    # NO MODEL:
    #
    # Behavioral evidence provides the initial risk.
    # ========================================================

    if available_models == 2:

        overall_risk = (
            ml_risk * 0.80
            + evidence_score * 0.20
        )

    elif available_models == 1:

        overall_risk = (
            ml_risk * 0.80
            + evidence_score * 0.20
        )

        # Preserve a high-risk single-model prediction.
        #
        # Example:
        # Static = 90%
        #
        # Without this safeguard:
        # 90 × 0.80 = 72%
        #
        # That would incorrectly downgrade a 90% model
        # prediction to MEDIUM.
        if ml_risk >= 75:

            overall_risk = max(
                overall_risk,
                ml_risk
            )

    else:

        # No ML model available.
        #
        # Behavioral evidence alone is intentionally
        # conservative.
        overall_risk = (
            evidence_score * 0.50
        )

    # ========================================================
    # CORRELATED RANSOMWARE-LIKE BEHAVIOR
    #
    # A single behavioral indicator should NOT automatically
    # trigger quarantine.
    #
    # However, the following combination is meaningful:
    #
    #   1. High suspicious behavior score
    #   2. Rapid file changes
    #   3. Multiple suspicious processes
    #
    # This prevents strong ransomware-like behavior from
    # incorrectly remaining LOW simply because the ML scores
    # are temporarily low.
    # ========================================================

    ransomware_behavior_pattern = (

        suspicious_score >= 60

        and file_change_count >= 50

        and suspicious_process_count >= 2
    )

    if ransomware_behavior_pattern:

        # ----------------------------------------------------
        # Strong ML + strong behavioral evidence
        # ----------------------------------------------------

        if ml_risk >= 75:

            overall_risk = max(
                overall_risk,
                75.0
            )

        # ----------------------------------------------------
        # Weak ML + strong behavioral evidence
        #
        # Do not automatically quarantine.
        # Raise to MEDIUM for inspection.
        # ----------------------------------------------------

        else:

            overall_risk = max(
                overall_risk,
                50.0
            )

            if (
                "Correlated ransomware-like "
                "behavioral pattern detected"
                not in reasons
            ):

                reasons.append(
                    "Correlated ransomware-like "
                    "behavioral pattern detected"
                )

    # ========================================================
    # FINAL CLAMP
    # ========================================================

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
    # CRITICAL DECISION SAFEGUARD
    #
    # When only one ML model is available, we do not allow
    # that single model to independently produce CRITICAL.
    #
    # A CRITICAL decision requires corroboration from both
    # ML models.
    #
    # This reduces the chance that one model's false positive
    # immediately causes the highest protection action.
    # ========================================================

    if (
        threat_level == "CRITICAL"
        and available_models < 2
    ):

        threat_level = "HIGH"

        if (
            "Critical level requires "
            "multi-model corroboration"
            not in reasons
        ):

            reasons.append(
                "Critical level requires "
                "multi-model corroboration"
            )

    # ========================================================
    # CONFIDENCE
    # ========================================================

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
    # TEST 1: NORMAL WINDOWS ACTIVITY
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