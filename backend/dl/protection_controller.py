"""
CyberShield-AI Protection Controller

Connects:

    Threat Decision Engine
            ↓
    Protection Engine
            ↓
    Quarantine Manager

Safe integration tests only.
No real malware is executed.
No system files are modified.
"""

from __future__ import annotations

import sys
from dataclasses import dataclass
from pathlib import Path
from typing import Optional


# ============================================================
# IMPORT PATH
# ============================================================

CURRENT_DIR = Path(
    __file__
).resolve().parent

if str(CURRENT_DIR) not in sys.path:

    sys.path.insert(
        0,
        str(CURRENT_DIR)
    )


# ============================================================
# IMPORT CYBERSHIELD COMPONENTS
# ============================================================

from threat_decision_engine import (
    decide_threat
)

from protection_engine import (
    decide_protection
)

from quarantine_manager import (
    quarantine_file
)


# ============================================================
# PROTECTION RESULT
# ============================================================

@dataclass
class ProtectionResult:

    threat_level: str

    risk_score: float

    confidence: str

    action: str

    protection_mode: str

    reason: str

    quarantined: bool

    quarantine_id: Optional[str] = None

    quarantine_path: Optional[str] = None


# ============================================================
# FORMAT REASONS
# ============================================================

def format_reasons(
    reasons
) -> str:

    if reasons is None:

        return (
            "No strong behavioral indicators detected"
        )

    if isinstance(
        reasons,
        list
    ):

        if len(reasons) == 0:

            return (
                "No strong behavioral indicators detected"
            )

        return "; ".join(
            str(reason)
            for reason in reasons
        )

    return str(
        reasons
    )


# ============================================================
# PROTECTION CONTROLLER
# ============================================================

def protect_file(
    file_path: str | Path,
    *,
    static_probability: Optional[float] = None,
    behavioral_metrics: Optional[dict] = None,
) -> ProtectionResult:
    """
    Complete CyberShield-AI protection pipeline.

    1. Threat Decision Engine
    2. Protection Engine
    3. Quarantine Manager
    """

    # ========================================================
    # STEP 1 — VALIDATE FILE
    # ========================================================

    file_path = Path(
        file_path
    ).resolve()

    if not file_path.exists():

        raise FileNotFoundError(
            f"File not found: {file_path}"
        )

    if not file_path.is_file():

        raise ValueError(
            f"Path is not a file: {file_path}"
        )

    # ========================================================
    # STEP 2 — BEHAVIORAL METRICS
    # ========================================================

    if behavioral_metrics is None:

        behavioral_metrics = {}

    # Safely obtain values.

    suspicious_process_count = int(
        behavioral_metrics.get(
            "suspicious_process_count",
            0
        )
    )

    file_change_count = int(
        behavioral_metrics.get(
            "file_change_count",
            0
        )
    )

    # ========================================================
    # STEP 3 — THREAT DECISION
    # ========================================================

    threat = decide_threat(

        static_probability=static_probability,

        **behavioral_metrics,
    )

    # ========================================================
    # STEP 4 — READ THREAT DECISION
    # ========================================================

    threat_level = str(
        threat.threat_level
    ).upper()

    overall_risk = float(
        threat.overall_risk
    )

    confidence = str(
        threat.confidence
    ).upper()

    reason = format_reasons(
        threat.reasons
    )

    # ========================================================
    # STEP 5 — PROTECTION DECISION
    # ========================================================

    protection = decide_protection(

        threat_level=threat_level,

        risk_score=overall_risk,

        recommended_action=threat.action,

        suspicious_process_count=(
            suspicious_process_count
        ),

        file_change_count=(
            file_change_count
        ),
    )

    # ========================================================
    # STEP 6 — INITIAL RESULT
    # ========================================================

    result = ProtectionResult(

        threat_level=threat_level,

        risk_score=overall_risk,

        confidence=confidence,

        action=str(
            protection.action
        ),

        protection_mode=str(
            protection.protection_mode
        ),

        reason=reason,

        quarantined=False,
    )

    # ========================================================
    # STEP 7 — QUARANTINE
    # ========================================================

    if result.action in (
        "BLOCK_AND_QUARANTINE",
        "CONTAIN_AND_QUARANTINE",
    ):

        quarantine_record = quarantine_file(

            file_path=file_path,

            threat_level=threat_level,

            risk_score=overall_risk,

            reason=reason,
        )

        result.quarantined = True

        result.quarantine_id = (
            quarantine_record[
                "quarantine_id"
            ]
        )

        result.quarantine_path = (
            quarantine_record[
                "quarantine_path"
            ]
        )

    # ========================================================
    # RETURN
    # ========================================================

    return result


# ============================================================
# PRINT RESULT
# ============================================================

def print_protection_result(
    result: ProtectionResult
) -> None:

    print()

    print(
        "=" * 65
    )

    print(
        "CYBERSHIELD-AI PROTECTION RESULT"
    )

    print(
        "=" * 65
    )

    print()

    print(
        f"Threat Level     : "
        f"{result.threat_level}"
    )

    print(
        f"Risk Score       : "
        f"{result.risk_score:.2f}%"
    )

    print(
        f"Confidence       : "
        f"{result.confidence}"
    )

    print(
        f"Action           : "
        f"{result.action}"
    )

    print(
        f"Protection Mode  : "
        f"{result.protection_mode}"
    )

    print(
        f"Reason           : "
        f"{result.reason}"
    )

    print(
        f"Quarantined      : "
        f"{result.quarantined}"
    )

    if result.quarantine_id:

        print(
            f"Quarantine ID    : "
            f"{result.quarantine_id}"
        )

    if result.quarantine_path:

        print(
            f"Quarantine Path  : "
            f"{result.quarantine_path}"
        )

    print()

    print(
        "=" * 65
    )


# ============================================================
# SAFE TEST FILE
# ============================================================

def create_safe_test_file(
    filename: str
) -> Path:

    project_root = Path(
        __file__
    ).resolve().parents[2]

    test_directory = (
        project_root
        / "backend"
        / "controller_test"
    )

    test_directory.mkdir(
        parents=True,
        exist_ok=True
    )

    test_file = (
        test_directory
        / filename
    )

    test_file.write_text(

        (
            "CYBERSHIELD-AI SAFE TEST FILE\n"
            "\n"
            "This file is completely harmless.\n"
            "It is used only for protection testing.\n"
        ),

        encoding="utf-8"
    )

    return test_file


# ============================================================
# TEST 1 — LOW RISK
# ============================================================

def test_low_risk():

    print()

    print(
        "[TEST 1] LOW RISK"
    )

    test_file = create_safe_test_file(
        "safe_low_risk_test.txt"
    )

    result = protect_file(

        file_path=test_file,

        static_probability=0.01,

        behavioral_metrics={

            "suspicious_score": 5,

            "file_change_count": 0,

            "suspicious_process_count": 0,

            "network_connection_count": 5,

            "registry_change_count": 0,

            "cpu_usage": 20,

            "memory_usage": 40,
        },
    )

    print_protection_result(
        result
    )

    # Cleanup because LOW risk should not quarantine.

    if test_file.exists():

        test_file.unlink()

        print(
            "\n[OK] Low-risk test file cleaned up."
        )


# ============================================================
# TEST 2 — HIGH / CRITICAL RISK
# ============================================================

def test_high_risk():

    print()

    print(
        "[TEST 2] HIGH RISK"
    )

    test_file = create_safe_test_file(
        "safe_high_risk_test.txt"
    )

    result = protect_file(

        file_path=test_file,

        static_probability=0.95,

        behavioral_metrics={

            "suspicious_score": 85,

            "file_change_count": 75,

            "suspicious_process_count": 6,

            "network_connection_count": 60,

            "registry_change_count": 10,

            "cpu_usage": 95,

            "memory_usage": 90,
        },
    )

    print_protection_result(
        result
    )

    if result.quarantined:

        print(
            "\n[OK] High-risk file successfully quarantined."
        )

    else:

        print(
            "\n[WARNING] High-risk test was NOT quarantined."
        )

        if test_file.exists():

            test_file.unlink()

            print(
                "[OK] Test file cleaned up."
            )


# ============================================================
# TEST 3 — BEHAVIOR ONLY
# ============================================================

def test_behavior_only():

    print()

    print(
        "[TEST 3] BEHAVIOR-ONLY TEST"
    )

    test_file = create_safe_test_file(
        "safe_behavior_test.txt"
    )

    result = protect_file(

        file_path=test_file,

        static_probability=None,

        behavioral_metrics={

            "suspicious_score": 70,

            "file_change_count": 30,

            "suspicious_process_count": 3,

            "network_connection_count": 25,

            "registry_change_count": 5,

            "cpu_usage": 80,

            "memory_usage": 75,
        },
    )

    print_protection_result(
        result
    )

    if result.quarantined:

        print(
            "\n[OK] Behavioral test triggered quarantine."
        )

    else:

        if test_file.exists():

            test_file.unlink()

            print(
                "\n[OK] Behavior-only test file cleaned up."
            )


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    print()

    print(
        "=" * 65
    )

    print(
        "CYBERSHIELD-AI PROTECTION CONTROLLER TEST"
    )

    print(
        "=" * 65
    )

    print()

    print(
        "Running safe integration tests..."
    )

    # Test LOW

    test_low_risk()

    # Test HIGH / CRITICAL

    test_high_risk()

    # Test behavioral-only

    test_behavior_only()

    print()

    print(
        "=" * 65
    )

    print(
        "PROTECTION CONTROLLER TEST COMPLETED"
    )

    print(
        "=" * 65
    )

    print()

    print(
        "No real malware was executed."
    )

    print(
        "No system files were modified."
    )

    print(
        "Only harmless test artifacts were used."
    )