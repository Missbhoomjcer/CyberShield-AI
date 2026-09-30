import json
from pathlib import Path

import joblib


PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODELS_DIR = PROJECT_ROOT / "backend" / "models"
REPORTS_DIR = PROJECT_ROOT / "backend" / "reports"


def run_test(name, test_function):
    try:
        test_function()
        print(f"[PASS] {name}")
        return True
    except Exception as exc:
        print(f"[FAIL] {name}")
        print(f"       {exc}")
        return False


def test_xgboost():
    model_path = MODELS_DIR / "xgboost_model.pkl"
    scaler_path = MODELS_DIR / "scaler.pkl"
    feature_info_path = MODELS_DIR / "feature_info.json"

    assert model_path.exists(), f"Missing model: {model_path}"
    assert scaler_path.exists(), f"Missing scaler: {scaler_path}"
    assert feature_info_path.exists(), f"Missing feature info: {feature_info_path}"

    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)

    assert model is not None
    assert scaler is not None

    with open(feature_info_path, "r", encoding="utf-8") as file:
        info = json.load(file)

    assert info is not None


def test_family_classifier():
    model_path = MODELS_DIR / "family_classifier.pkl"
    encoder_path = MODELS_DIR / "family_label_encoder.pkl"

    assert model_path.exists(), f"Missing family model: {model_path}"
    assert encoder_path.exists(), f"Missing family label encoder: {encoder_path}"

    model = joblib.load(model_path)
    encoder = joblib.load(encoder_path)

    assert model is not None
    assert encoder is not None
    assert len(encoder.classes_) > 0


def test_lstm():
    model_path = MODELS_DIR / "lstm_behavioral_model.pth"
    scaler_path = PROJECT_ROOT / "backend" / "datasets" / "behavioral" / "lstm_scaler_large.npz"

    assert model_path.exists(), f"Missing LSTM model: {model_path}"
    assert scaler_path.exists(), f"Missing LSTM scaler: {scaler_path}"

    import torch
    import numpy as np

    checkpoint = torch.load(
        model_path,
        map_location="cpu",
        weights_only=False
    )

    scaler = np.load(scaler_path)

    assert checkpoint is not None
    assert scaler is not None
    assert "mean" in scaler
    assert "scale" in scaler


def test_reports():
    required_reports = [
        "evaluation_results.csv",
        "evaluation_results.json",
        "family_classification_report.json",
        "lstm_evaluation.json",
        "lstm_robustness_test.json",
        "threat_fusion_validation.json",
    ]

    for report_name in required_reports:
        report_path = REPORTS_DIR / report_name
        assert report_path.exists(), f"Missing report: {report_path}"

        assert report_path.stat().st_size > 0, (
            f"Empty report: {report_path}"
        )


def test_combined_predictor():
    from backend.dl.combined_predictor import combined_predict

    assert callable(combined_predict)


def test_threat_decision_engine():
    from backend.dl.threat_decision_engine import decide_threat

    result = decide_threat(
        static_probability=0.01,
        lstm_probability=0.01,
        suspicious_score=5,
        cpu_usage=20,
        memory_usage=40,
        process_count=100,
        file_change_count=0,
        network_connection_count=5,
        suspicious_process_count=0,
        registry_change_count=0,
    )

    assert result is not None
    assert result.threat_level == "LOW"
    assert result.action == "ALLOW"


def main():
    print("=" * 70)
    print("CYBERSHIELD-AI ML REGRESSION TEST")
    print("=" * 70)

    tests = [
        (
            "XGBoost model and 72-feature pipeline",
            test_xgboost,
        ),
        (
            "Ransomware family classifier",
            test_family_classifier,
        ),
        (
            "LSTM behavioral model and scaler",
            test_lstm,
        ),
        (
            "ML evaluation and validation reports",
            test_reports,
        ),
        (
            "Combined predictor import",
            test_combined_predictor,
        ),
        (
            "Threat decision engine",
            test_threat_decision_engine,
        ),
    ]

    passed = 0
    failed = 0

    for name, test_function in tests:
        if run_test(name, test_function):
            passed += 1
        else:
            failed += 1

    print()
    print("=" * 70)
    print(f"Total tests : {len(tests)}")
    print(f"Passed      : {passed}")
    print(f"Failed      : {failed}")

    status = "PASSED" if failed == 0 else "FAILED"
    print(f"Status      : {status}")
    print("=" * 70)

    report_path = REPORTS_DIR / "ml_regression_test.json"

    report = {
        "total_tests": len(tests),
        "passed": passed,
        "failed": failed,
        "status": status,
    }

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    with open(report_path, "w", encoding="utf-8") as file:
        json.dump(report, file, indent=4)

    print(f"\nReport saved: {report_path}")

    return 0 if failed == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
