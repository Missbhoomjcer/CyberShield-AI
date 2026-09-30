"""
CyberShield-AI Protection Engine

Converts a ThreatDecision into a safe protection action.

IMPORTANT:
This first version does NOT:
- kill processes
- delete files
- modify system files

It only determines what protection action SHOULD be taken.

Actual enforcement will be added through a controlled quarantine/
containment layer after this decision logic is tested.
"""

from dataclasses import dataclass
from typing import Optional


# ============================================================
# PROTECTION RESULT
# ============================================================

@dataclass
class ProtectionDecision:

    threat_level: str
    risk_score: float
    action: str
    protection_mode: str
    reason: str
    requires_confirmation: bool


# ============================================================
# PROTECTION ENGINE
# ============================================================

def decide_protection(
    threat_level: str,
    risk_score: float,
    recommended_action: str,
    suspicious_process_count: int = 0,
    file_change_count: int = 0,
) -> ProtectionDecision:

    threat_level = str(
        threat_level
    ).upper()

    recommended_action = str(
        recommended_action
    ).upper()

    risk_score = float(
        risk_score
    )

    # --------------------------------------------------------
    # CRITICAL
    # --------------------------------------------------------

    if threat_level == "CRITICAL":

        return ProtectionDecision(

            threat_level=threat_level,

            risk_score=round(
                risk_score,
                2
            ),

            action="BLOCK_AND_QUARANTINE",

            protection_mode="ACTIVE_PROTECTION",

            reason=(
                "Critical threat detected with strong "
                "malicious indicators."
            ),

            requires_confirmation=False,
        )

    # --------------------------------------------------------
    # HIGH
    # --------------------------------------------------------

    if threat_level == "HIGH":

        return ProtectionDecision(

            threat_level=threat_level,

            risk_score=round(
                risk_score,
                2
            ),

            action="CONTAIN_AND_QUARANTINE",

            protection_mode="ACTIVE_PROTECTION",

            reason=(
                "High-risk behavior detected. "
                "The affected activity should be contained "
                "and the suspicious artifact quarantined."
            ),

            requires_confirmation=False,
        )

    # --------------------------------------------------------
    # MEDIUM
    # --------------------------------------------------------

    if threat_level == "MEDIUM":

        return ProtectionDecision(

            threat_level=threat_level,

            risk_score=round(
                risk_score,
                2
            ),

            action="MONITOR_AND_INSPECT",

            protection_mode="MONITORING",

            reason=(
                "Suspicious activity detected, but confidence "
                "is not high enough for automatic blocking."
            ),

            requires_confirmation=True,
        )

    # --------------------------------------------------------
    # LOW
    # --------------------------------------------------------

    return ProtectionDecision(

        threat_level="LOW",

        risk_score=round(
            risk_score,
            2
        ),

        action="ALLOW",

        protection_mode="NORMAL",

        reason=(
            "No strong threat indicators detected."
        ),

        requires_confirmation=False,
    )


# ============================================================
# DISPLAY
# ============================================================

def print_protection_decision(
    result: ProtectionDecision
) -> None:

    print()

    print("=" * 65)

    print(
        "CYBERSHIELD-AI PROTECTION DECISION"
    )

    print("=" * 65)

    print(
        f"Threat Level              : "
        f"{result.threat_level}"
    )

    print(
        f"Risk Score                : "
        f"{result.risk_score:.2f}%"
    )

    print(
        f"Protection Action         : "
        f"{result.action}"
    )

    print(
        f"Protection Mode           : "
        f"{result.protection_mode}"
    )

    print(
        f"Confirmation Required     : "
        f"{result.requires_confirmation}"
    )

    print(
        f"Reason                    : "
        f"{result.reason}"
    )

    print("=" * 65)


# ============================================================
# SAFE TESTS
# ============================================================

if __name__ == "__main__":

    print(
        "\nTEST 1: LOW RISK"
    )

    result = decide_protection(

        threat_level="LOW",

        risk_score=5,

        recommended_action="ALLOW",

        suspicious_process_count=0,

        file_change_count=0,
    )

    print_protection_decision(
        result
    )

    print(
        "\nTEST 2: MEDIUM RISK"
    )

    result = decide_protection(

        threat_level="MEDIUM",

        risk_score=60,

        recommended_action="MONITOR_AND_INSPECT",

        suspicious_process_count=1,

        file_change_count=8,
    )

    print_protection_decision(
        result
    )

    print(
        "\nTEST 3: HIGH RISK"
    )

    result = decide_protection(

        threat_level="HIGH",

        risk_score=82,

        recommended_action="CONTAIN_AND_QUARANTINE",

        suspicious_process_count=3,

        file_change_count=30,
    )

    print_protection_decision(
        result
    )

    print(
        "\nTEST 4: CRITICAL RISK"
    )

    result = decide_protection(

        threat_level="CRITICAL",

        risk_score=96,

        recommended_action="BLOCK_AND_QUARANTINE",

        suspicious_process_count=6,

        file_change_count=70,
    )

    print_protection_decision(
        result
    )