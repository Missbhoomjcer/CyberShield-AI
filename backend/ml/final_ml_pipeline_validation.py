from pathlib import Path
import json
import sys
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]

sys.path.insert(0, str(PROJECT_ROOT / "backend"))

from ml.combined_predictor import CombinedPredictor
from dl.lstm_predictor import predict as lstm_predict
from dl.threat_decision_engine import decide_threat


DATASET_PATH = Path(r"C:\CyberShieldData\ransom.csv")

REPORT_PATH = (
    PROJECT_ROOT
    / "backend"
    / "reports"
    / "final_ml_pipeline_validation.json"
)


print("=" * 80)
print("CYBERSHIELD-AI FINAL END-TO-END ML PIPELINE VALIDATION")
print("=" * 80)


# ============================================================
# LOAD DATASET
# ============================================================

print("\nLoading static dataset...")

df = pd.read_csv(DATASET_PATH)

print(f"Dataset shape: {df.shape}")


# ============================================================
# INITIALIZE STATIC ML
# ============================================================

print("\nInitializing combined static ML predictor...")

combined_predictor = CombinedPredictor()

print("Combined predictor initialized successfully.")


# ============================================================
# TEST SCENARIOS
# ============================================================

scenarios = [

    {
        "name": "Benign + Normal Behavior",

        "dataset_index": 0,

        "behavior": {
            "cpu_usage": 20.0,
            "memory_usage": 35.0,
            "process_count": 120.0,
            "file_change_count": 2.0,
            "network_connection_count": 5.0,
            "suspicious_process_count": 0.0,
            "suspicious_score": 5.0,
            "registry_change_count": 0.0,
        },

        "expected_behavior": "NORMAL"
    },


    {
        "name": "Malware + Suspicious Behavior",

        "dataset_index": None,

        "behavior": {
            "cpu_usage": 75.0,
            "memory_usage": 70.0,
            "process_count": 150.0,
            "file_change_count": 25.0,
            "network_connection_count": 35.0,
            "suspicious_process_count": 3.0,
            "suspicious_score": 70.0,
            "registry_change_count": 6.0,
        },

        "expected_behavior": "SUSPICIOUS"
    },


    {
        "name": "Ransomware-like Extreme Behavior",

        "dataset_index": None,

        "behavior": {
            "cpu_usage": 95.0,
            "memory_usage": 92.0,
            "process_count": 160.0,
            "file_change_count": 80.0,
            "network_connection_count": 70.0,
            "suspicious_process_count": 8.0,
            "suspicious_score": 95.0,
            "registry_change_count": 25.0,
        },

        "expected_behavior": "SUSPICIOUS"
    }
]


results = []


# ============================================================
# RUN END-TO-END TESTS
# ============================================================

for scenario in scenarios:

    print("\n" + "-" * 80)
    print(f"SCENARIO: {scenario['name']}")
    print("-" * 80)


    # ========================================================
    # SELECT STATIC SAMPLE
    # ========================================================

    index = scenario["dataset_index"]


    if index is not None:

        sample = df.iloc[[index]].copy()

        print(
            f"Static dataset sample: row {index}"
        )

    else:

        malicious_rows = df[
            df["Family"]
            .astype(str)
            .str.lower()
            != "benign"
        ]

        if len(malicious_rows) == 0:

            print(
                "ERROR: No malicious sample found."
            )

            results.append({
                "scenario": scenario["name"],
                "status": "FAIL",
                "error": "No malicious sample found"
            })

            continue

        sample = malicious_rows.iloc[[0]].copy()

        print(
            "Static dataset sample: first malicious row"
        )


    # ========================================================
    # STATIC XGBOOST + FAMILY CLASSIFIER
    # ========================================================

    try:

        static_result = combined_predictor.predict(
            sample
        )

    except Exception as e:

        print(
            "\nCombined predictor ERROR:"
        )

        print(str(e))

        results.append({
            "scenario": scenario["name"],
            "status": "FAIL",
            "error": str(e)
        })

        continue


    malware_probability = float(
        static_result.get(
            "malware_probability",
            0.0
        )
    )


    family = static_result.get(
        "family",
        "UNKNOWN"
    )


    family_confidence = float(
        static_result.get(
            "family_confidence",
            0.0
        )
    )


    print(
        f"\nMalware probability : "
        f"{malware_probability:.4f}%"
    )


    print(
        f"Family prediction   : "
        f"{family}"
    )


    print(
        f"Family confidence   : "
        f"{family_confidence:.2f}%"
    )


    # ========================================================
    # LSTM BEHAVIORAL PREDICTION
    # ========================================================

    behavior = scenario["behavior"]


    behavior_row = [

        behavior["cpu_usage"],

        behavior["memory_usage"],

        behavior["process_count"],

        behavior["file_change_count"],

        behavior["network_connection_count"],

        behavior["suspicious_process_count"],

        behavior["suspicious_score"],
    ]


    behavior_sequence = [
        behavior_row.copy()
        for _ in range(10)
    ]


    try:

        lstm_result = lstm_predict(
            behavior_sequence
        )

    except Exception as e:

        print(
            "\nLSTM predictor ERROR:"
        )

        print(str(e))

        results.append({
            "scenario": scenario["name"],
            "status": "FAIL",
            "error": str(e)
        })

        continue


    behavioral_probability = float(
        lstm_result["probability"]
    )


    behavioral_label = lstm_result["label"]


    print(
        f"\nBehavior probability : "
        f"{behavioral_probability * 100:.4f}%"
    )


    print(
        f"Behavior prediction  : "
        f"{behavioral_label}"
    )


    # ========================================================
    # THREAT DECISION ENGINE
    # ========================================================

    try:

        decision = decide_threat(

            static_probability=
                malware_probability,

            lstm_probability=
                behavioral_probability,

            suspicious_score=
                behavior["suspicious_score"],

            cpu_usage=
                behavior["cpu_usage"],

            memory_usage=
                behavior["memory_usage"],

            process_count=
                behavior["process_count"],

            file_change_count=
                behavior["file_change_count"],

            network_connection_count=
                behavior["network_connection_count"],

            suspicious_process_count=
                behavior["suspicious_process_count"],

            registry_change_count=
                behavior["registry_change_count"],
        )


    except Exception as e:

        print(
            "\nThreat Decision Engine ERROR:"
        )

        print(str(e))

        results.append({
            "scenario": scenario["name"],
            "status": "FAIL",
            "error": str(e)
        })

        continue


    # ========================================================
    # DISPLAY FINAL DECISION
    # ========================================================

    print(
        f"\nStatic risk          : "
        f"{decision.static_risk:.2f}%"
    )


    print(
        f"Behavioral risk      : "
        f"{decision.behavioral_risk:.2f}%"
    )


    print(
        f"Evidence score       : "
        f"{decision.evidence_score:.2f}%"
    )


    print(
        f"Overall risk         : "
        f"{decision.overall_risk:.2f}%"
    )


    print(
        f"Threat level         : "
        f"{decision.threat_level}"
    )


    print(
        f"Recommended action   : "
        f"{decision.action}"
    )


    print(
        f"Confidence           : "
        f"{decision.confidence}"
    )


    print(
        "\nReasons:"
    )


    for reason in decision.reasons:

        print(
            f"  - {reason}"
        )


    # ========================================================
    # VALIDATION
    # ========================================================

    behavior_match = (
        behavioral_label
        == scenario["expected_behavior"]
    )


    status = (
        "PASS"
        if behavior_match
        else "CHECK"
    )


    if status == "CHECK":

        print(
            "\nWARNING: Behavioral prediction "
            "did not match the expected scenario."
        )


    else:

        print(
            "\nScenario validation: PASS"
        )


    # ========================================================
    # SAVE RESULT
    # ========================================================

    results.append({

        "scenario":
            scenario["name"],

        "static": {

            "malware_probability":
                malware_probability,

            "family":
                family,

            "family_confidence":
                family_confidence
        },

        "behavioral": {

            "probability":
                behavioral_probability,

            "prediction":
                behavioral_label,

            "expected":
                scenario["expected_behavior"],

            "match":
                behavior_match
        },

        "decision": {

            "static_risk":
                decision.static_risk,

            "behavioral_risk":
                decision.behavioral_risk,

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

            "reasons":
                decision.reasons
        },

        "status":
            status
    })


# ============================================================
# SUMMARY
# ============================================================

passed = sum(
    result["status"] == "PASS"
    for result in results
)


checked = sum(
    result["status"] == "CHECK"
    for result in results
)


failed = sum(
    result["status"] == "FAIL"
    for result in results
)


print("\n" + "=" * 80)
print("FINAL ML PIPELINE VALIDATION SUMMARY")
print("=" * 80)


print(
    f"Total scenarios : {len(results)}"
)


print(
    f"Passed          : {passed}"
)


print(
    f"Check           : {checked}"
)


print(
    f"Failed          : {failed}"
)


if failed == 0 and checked == 0:

    overall_status = (
        "ALL END-TO-END ML TESTS PASSED"
    )

    print(
        "\nRESULT: "
        "ALL END-TO-END ML TESTS PASSED"
    )

elif failed == 0:

    overall_status = (
        "PIPELINE EXECUTED - REVIEW CHECKED SCENARIOS"
    )

    print(
        "\nRESULT: "
        "PIPELINE EXECUTED - "
        "REVIEW CHECKED SCENARIOS"
    )

else:

    overall_status = (
        "END-TO-END ML VALIDATION FAILED"
    )

    print(
        "\nRESULT: "
        "END-TO-END ML VALIDATION FAILED"
    )


# ============================================================
# SAVE REPORT
# ============================================================

report = {

    "project":
        "CyberShield-AI",

    "validation":
        "Final End-to-End ML Pipeline Validation",

    "components": [

        "XGBoost Binary Malware Classifier",

        "Random Forest Family Classifier",

        "LSTM Behavioral Detector",

        "Threat Decision Engine"

    ],

    "dataset":
        str(DATASET_PATH),

    "dataset_shape":
        list(df.shape),

    "total_scenarios":
        len(results),

    "passed":
        passed,

    "checked":
        checked,

    "failed":
        failed,

    "overall_status":
        overall_status,

    "results":
        results
}


REPORT_PATH.parent.mkdir(
    parents=True,
    exist_ok=True
)


with open(
    REPORT_PATH,
    "w"
) as f:

    json.dump(
        report,
        f,
        indent=4
    )


print(
    "\nReport saved:"
)


print(
    REPORT_PATH
)


print(
    "\n" + "=" * 80
)


print(
    "FINAL ML PIPELINE VALIDATION COMPLETED"
)


print(
    "=" * 80
)
