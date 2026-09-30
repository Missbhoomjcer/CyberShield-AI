"""
CyberShield-AI
Static + Behavioral Threat Fusion Validation

SAFE TEST ONLY:
Uses simulated numeric inputs.
Does NOT execute malware.
Does NOT modify files.
Does NOT kill processes.
"""

import os
import sys
import json


# ============================================================
# PATH SETUP
# ============================================================

CURRENT_DIR = os.path.dirname(
    os.path.abspath(__file__)
)

if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)


from threat_decision_engine import decide_threat


# ============================================================
# TEST SCENARIOS
# ============================================================

TEST_CASES = [

    {
        "name": "NORMAL WINDOWS ACTIVITY",

        "description":
            "Normal system with many processes but no "
            "security-relevant behavioral indicators.",

        "inputs": {
            "static_probability": 2,
            "lstm_probability": 5,

            "suspicious_score": 8,

            "cpu_usage": 25,
            "memory_usage": 85,

            "process_count": 325,

            "file_change_count": 0,
            "network_connection_count": 18,
            "suspicious_process_count": 0,
            "registry_change_count": 0,
        },

        "expected_level": "LOW",
        "expected_action": "ALLOW",
    },


    {
        "name": "HIGH PROCESS COUNT ONLY",

        "description":
            "Large process count must NOT create a threat "
            "because normal Windows systems can have many processes.",

        "inputs": {
            "static_probability": 2,
            "lstm_probability": 3,

            "suspicious_score": 0,

            "cpu_usage": 30,
            "memory_usage": 80,

            "process_count": 600,

            "file_change_count": 0,
            "network_connection_count": 10,
            "suspicious_process_count": 0,
            "registry_change_count": 0,
        },

        "expected_level": "LOW",
        "expected_action": "ALLOW",
    },


    {
        "name": "BEHAVIORAL SUSPICION",

        "description":
            "Moderately suspicious behavioral activity.",

        "inputs": {
            "static_probability": 65,
            "lstm_probability": 72,

            "suspicious_score": 65,

            "cpu_usage": 70,
            "memory_usage": 75,

            "process_count": 325,

            "file_change_count": 25,
            "network_connection_count": 25,
            "suspicious_process_count": 2,
            "registry_change_count": 6,
        },

        "expected_level": "MEDIUM",
        "expected_action": "MONITOR_AND_INSPECT",
    },


    {
        "name": "HIGH STATIC + BEHAVIORAL RISK",

        "description":
            "Both ML models identify a strong threat and "
            "behavioral indicators support the decision.",

        "inputs": {
            "static_probability": 90,
            "lstm_probability": 92,

            "suspicious_score": 75,

            "cpu_usage": 90,
            "memory_usage": 90,

            "process_count": 350,

            "file_change_count": 50,
            "network_connection_count": 50,
            "suspicious_process_count": 5,
            "registry_change_count": 20,
        },

        "expected_level": "CRITICAL",
        "expected_action": "BLOCK_AND_QUARANTINE",
    },


    {
        "name": "CRITICAL RANSOMWARE-LIKE BEHAVIOR",

        "description":
            "Very high static and behavioral risk with "
            "rapid file changes and multiple suspicious processes.",

        "inputs": {
            "static_probability": 98,
            "lstm_probability": 99,

            "suspicious_score": 95,

            "cpu_usage": 97,
            "memory_usage": 96,

            "process_count": 400,

            "file_change_count": 100,
            "network_connection_count": 80,
            "suspicious_process_count": 10,
            "registry_change_count": 30,
        },

        "expected_level": "CRITICAL",
        "expected_action": "BLOCK_AND_QUARANTINE",
    },


    {
        "name": "STATIC MODEL ONLY",

        "description":
            "XGBoost detects a threat while behavioral "
            "model is unavailable.",

        "inputs": {
            "static_probability": 90,
            "lstm_probability": None,

            "suspicious_score": 0,

            "cpu_usage": 20,
            "memory_usage": 50,

            "process_count": 250,

            "file_change_count": 0,
            "network_connection_count": 10,
            "suspicious_process_count": 0,
            "registry_change_count": 0,
        },

        "expected_level": "HIGH",
        "expected_action": "CONTAIN_AND_QUARANTINE",
    },


    {
        "name": "BEHAVIORAL MODEL ONLY",

        "description":
            "LSTM detects suspicious behavior while static "
            "model is unavailable.",

        "inputs": {
            "static_probability": None,
            "lstm_probability": 90,

            "suspicious_score": 80,

            "cpu_usage": 90,
            "memory_usage": 90,

            "process_count": 300,

            "file_change_count": 50,
            "network_connection_count": 50,
            "suspicious_process_count": 5,
            "registry_change_count": 20,
        },

        "expected_level": "HIGH",
        "expected_action": "CONTAIN_AND_QUARANTINE",
    },


    {
        "name": "LOW ML + STRONG BEHAVIOR",

        "description":
            "ML models are low-risk but behavioral evidence "
            "is strong. Used to check whether evidence can "
            "override weak ML predictions.",

        "inputs": {
            "static_probability": 10,
            "lstm_probability": 15,

            "suspicious_score": 90,

            "cpu_usage": 95,
            "memory_usage": 95,

            "process_count": 300,

            "file_change_count": 80,
            "network_connection_count": 60,
            "suspicious_process_count": 8,
            "registry_change_count": 25,
        },

        "expected_level": "MEDIUM",
        "expected_action": "MONITOR_AND_INSPECT",
    },

]


# ============================================================
# RESULT STORAGE
# ============================================================

results = []


# ============================================================
# HEADER
# ============================================================

print()
print("=" * 78)
print("        CYBERSHIELD-AI STATIC + BEHAVIORAL FUSION")
print("                    VALIDATION TEST")
print("=" * 78)


# ============================================================
# RUN TESTS
# ============================================================

passed = 0
failed = 0


for number, test in enumerate(
    TEST_CASES,
    start=1
):

    print()
    print("-" * 78)

    print(
        f"TEST {number}: {test['name']}"
    )

    print("-" * 78)

    print(
        "Description:",
        test["description"]
    )

    inputs = test["inputs"]

    # --------------------------------------------------------
    # Run decision engine
    # --------------------------------------------------------

    decision = decide_threat(
        **inputs
    )

    # --------------------------------------------------------
    # Display inputs
    # --------------------------------------------------------

    print()
    print("Inputs:")

    print(
        f"  Static probability       : "
        f"{inputs['static_probability']}"
    )

    print(
        f"  LSTM probability         : "
        f"{inputs['lstm_probability']}"
    )

    print(
        f"  Suspicious score         : "
        f"{inputs['suspicious_score']}"
    )

    print(
        f"  Process count            : "
        f"{inputs['process_count']}"
    )

    print(
        f"  File changes             : "
        f"{inputs['file_change_count']}"
    )

    print(
        f"  Network connections      : "
        f"{inputs['network_connection_count']}"
    )

    print(
        f"  Suspicious processes     : "
        f"{inputs['suspicious_process_count']}"
    )

    print(
        f"  Registry changes         : "
        f"{inputs['registry_change_count']}"
    )

    # --------------------------------------------------------
    # Display result
    # --------------------------------------------------------

    print()
    print("Decision:")

    print(
        f"  Static risk              : "
        f"{decision.static_risk:.2f}%"
    )

    print(
        f"  Behavioral risk          : "
        f"{decision.behavioral_risk:.2f}%"
    )

    print(
        f"  Evidence score           : "
        f"{decision.evidence_score:.2f}%"
    )

    print(
        f"  Overall risk             : "
        f"{decision.overall_risk:.2f}%"
    )

    print(
        f"  Threat level             : "
        f"{decision.threat_level}"
    )

    print(
        f"  Action                   : "
        f"{decision.action}"
    )

    print(
        f"  Confidence               : "
        f"{decision.confidence}"
    )

    print()

    print("  Reasons:")

    for reason in decision.reasons:

        print(
            f"    - {reason}"
        )

    # --------------------------------------------------------
    # Expected values
    # --------------------------------------------------------

    expected_level = (
        test["expected_level"]
    )

    expected_action = (
        test["expected_action"]
    )

    level_ok = (
        decision.threat_level
        == expected_level
    )

    action_ok = (
        decision.action
        == expected_action
    )

    # --------------------------------------------------------
    # Special safety check
    # --------------------------------------------------------

    process_count_safe = True

    if (
        test["name"]
        == "HIGH PROCESS COUNT ONLY"
    ):

        process_count_safe = (
            decision.evidence_score
            == 0
        )

    # --------------------------------------------------------
    # Final test status
    # --------------------------------------------------------

    test_passed = (
        level_ok
        and action_ok
        and process_count_safe
    )

    if test_passed:

        passed += 1

        status = "PASS"

    else:

        failed += 1

        status = "FAIL"

    print()
    print(
        f"  Expected threat level    : "
        f"{expected_level}"
    )

    print(
        f"  Expected action          : "
        f"{expected_action}"
    )

    print(
        f"  STATUS                   : "
        f"{status}"
    )

    # --------------------------------------------------------
    # Store result
    # --------------------------------------------------------

    results.append({

        "test":
            test["name"],

        "static_probability":
            inputs["static_probability"],

        "lstm_probability":
            inputs["lstm_probability"],

        "evidence_score":
            decision.evidence_score,

        "overall_risk":
            decision.overall_risk,

        "threat_level":
            decision.threat_level,

        "action":
            decision.action,

        "confidence":
            decision.confidence,

        "expected_level":
            expected_level,

        "expected_action":
            expected_action,

        "passed":
            test_passed,

        "reasons":
            decision.reasons,

    })


# ============================================================
# SUMMARY
# ============================================================

print()
print()
print("=" * 78)
print("                    FUSION TEST SUMMARY")
print("=" * 78)

print()

print(
    f"Total tests : {len(TEST_CASES)}"
)

print(
    f"Passed      : {passed}"
)

print(
    f"Failed      : {failed}"
)

print()

if failed == 0:

    print(
        "RESULT: ALL FUSION TESTS PASSED"
    )

else:

    print(
        "RESULT: SOME FUSION TESTS FAILED"
    )


# ============================================================
# SAVE REPORT
# ============================================================

REPORT_DIR = os.path.join(
    os.path.dirname(
        CURRENT_DIR
    ),
    "reports"
)

os.makedirs(
    REPORT_DIR,
    exist_ok=True
)

REPORT_PATH = os.path.join(
    REPORT_DIR,
    "threat_fusion_validation.json"
)

report = {

    "project":
        "CyberShield-AI",

    "test_type":
        "Static + Behavioral Threat Fusion",

    "total_tests":
        len(TEST_CASES),

    "passed":
        passed,

    "failed":
        failed,

    "all_passed":
        failed == 0,

    "tests":
        results,

}


with open(
    REPORT_PATH,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        report,
        file,
        indent=4
    )


print()
print(
    "Validation report saved:"
)

print(
    REPORT_PATH
)

print()
print("=" * 78)