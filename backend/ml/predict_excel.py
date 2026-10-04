import sys
import json
import pickle
import numpy as np

from backend.ml.excel_feature_extractor import extract_excel_features


MODEL_PATH = "backend/models/excel_xgboost_model.pkl"
FEATURES_PATH = "backend/models/excel_feature_names.json"


def predict_excel(file_path):

    print()
    print("=" * 60)
    print("CYBERSHIELD EXCEL ANALYSIS")
    print("=" * 60)
    print(f"File: {file_path}")
    print()

    # ---------------------------------------------------------
    # Load model
    # ---------------------------------------------------------

    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)

    with open(FEATURES_PATH, "r", encoding="utf-8") as f:
        feature_names = json.load(f)

    print(f"Model expects {len(feature_names)} features.")

    # ---------------------------------------------------------
    # Extract features
    # ---------------------------------------------------------

    features = extract_excel_features(file_path)

    print(f"Extractor returned {len(features)} features.")

    if len(features) != len(feature_names):
        raise ValueError(
            f"Feature mismatch: model expects {len(feature_names)} "
            f"features but extractor returned {len(features)}."
        )

    feature_map = dict(zip(feature_names, features))

    # ---------------------------------------------------------
    # Security inspection
    # ---------------------------------------------------------

    has_macro = int(feature_map.get("has_macro", 0))
    uses_file_api = int(feature_map.get("uses_file_api", 0))
    uses_network_api = int(feature_map.get("uses_network_api", 0))
    uses_process_api = int(feature_map.get("uses_process_api", 0))

    macro_chr_count = float(feature_map.get("macro_chr_count", 0))
    macro_string_functions = float(
        feature_map.get("macro_string_function_count", 0)
    )
    macro_callbyname = float(
        feature_map.get("macro_callbyname_count", 0)
    )
    macro_concat = float(
        feature_map.get("macro_concatenation_count", 0)
    )
    macro_assignments = float(
        feature_map.get("macro_count_assignments", 0)
    )
    macro_max_line = float(
        feature_map.get("macro_max_line_length", 0)
    )
    remote_template = float(
        feature_map.get("remote_template_present", 0)
    )
    formula_count = float(
        feature_map.get("formula_count", 0)
    )
    file_size = float(
        feature_map.get("file_size", 0)
    )

    suspicious_reasons = []

    if has_macro:
        suspicious_reasons.append("Macro/VBA content detected")

    if uses_file_api:
        suspicious_reasons.append(
            "File-system API indicators detected"
        )

    if uses_network_api:
        suspicious_reasons.append(
            "Network API indicators detected"
        )

    if uses_process_api:
        suspicious_reasons.append(
            "Process-execution API indicators detected"
        )

    if macro_chr_count >= 10:
        suspicious_reasons.append(
            "Suspicious Chr/ChrW usage detected"
        )

    if macro_string_functions >= 5:
        suspicious_reasons.append(
            "Heavy string-function usage detected"
        )

    if macro_callbyname > 0:
        suspicious_reasons.append(
            "CallByName usage detected"
        )

    if macro_concat >= 20:
        suspicious_reasons.append(
            "Heavy string concatenation detected"
        )

    if macro_assignments >= 20:
        suspicious_reasons.append(
            "Large number of assignments detected"
        )

    if macro_max_line >= 500:
        suspicious_reasons.append(
            "Abnormally long macro line detected"
        )

    if remote_template >= 10:
        suspicious_reasons.append(
            "Multiple remote-template references detected"
        )

    if formula_count >= 1000:
        suspicious_reasons.append(
            "Large number of formulas detected"
        )

    if file_size > 50_000_000:
        suspicious_reasons.append(
            "Unusually large Excel file"
        )

    # ---------------------------------------------------------
    # ML prediction
    # ---------------------------------------------------------

    X = np.asarray(features, dtype=float).reshape(1, -1)

    probabilities = model.predict_proba(X)[0]

    raw_benign_probability = float(probabilities[0])
    raw_malicious_probability = float(probabilities[1])

    ml_prediction = (
        "MALICIOUS"
        if raw_malicious_probability >= 0.50
        else "BENIGN"
    )

    ml_confidence = max(
        raw_benign_probability,
        raw_malicious_probability
    )

    # ---------------------------------------------------------
    # Security assessment
    # ---------------------------------------------------------

    security_clean = len(suspicious_reasons) == 0

    if security_clean:
        security_assessment = "CLEAN"
    else:
        security_assessment = "SUSPICIOUS"

    # ---------------------------------------------------------
    # Final operational decision
    #
    # ML probability is kept visible but is NOT treated as
    # sufficient evidence for automatic quarantine when the
    # extractor/model compatibility is uncertain.
    # ---------------------------------------------------------

    if security_clean and ml_prediction == "MALICIOUS":
        final_prediction = "SUSPICIOUS"
        final_confidence = ml_confidence
        decision_reason = (
            "The ML model produced a high malicious probability, "
            "but the workbook contains no detected macro, file, "
            "network, process, or other configured security indicators. "
            "The file is therefore flagged for inspection rather than "
            "automatically classified as malicious."
        )

    elif security_clean:
        final_prediction = "BENIGN"
        final_confidence = ml_confidence
        decision_reason = (
            "No configured suspicious workbook indicators were detected."
        )

    else:
        final_prediction = "MALICIOUS"
        final_confidence = ml_confidence
        decision_reason = (
            "Suspicious workbook security indicators were detected."
        )

    # ---------------------------------------------------------
    # Output
    # ---------------------------------------------------------

    print()
    print("=" * 60)
    print("CYBERSHIELD EXCEL DETECTION RESULT")
    print("=" * 60)

    print(f"ML prediction:         {ml_prediction}")
    print(f"ML confidence:        {ml_confidence:.4f}")
    print(f"ML malicious prob.:   {raw_malicious_probability:.4f}")

    print()
    print(f"Security assessment:   {security_assessment}")

    print()
    print("Security inspection:")
    print(f"  Macro detected:      {'YES' if has_macro else 'NO'}")
    print(f"  File API:            {'YES' if uses_file_api else 'NO'}")
    print(f"  Network API:         {'YES' if uses_network_api else 'NO'}")
    print(f"  Process API:         {'YES' if uses_process_api else 'NO'}")
    print(f"  Chr/ChrW indicators: {macro_chr_count:g}")
    print(f"  Remote templates:    {remote_template:g}")

    print()
    print(f"Final prediction:      {final_prediction}")
    print(f"Final confidence:      {final_confidence:.4f}")

    if suspicious_reasons:
        print()
        print("Suspicious indicators:")
        for reason in suspicious_reasons:
            print(f"  - {reason}")
    else:
        print()
        print("Suspicious indicators: NONE")

    print()
    print(f"Decision reason: {decision_reason}")
    print("=" * 60)

    return {
        "file": file_path,

        "prediction": final_prediction,
        "confidence": final_confidence,

        "ml_prediction": ml_prediction,
        "ml_confidence": ml_confidence,

        "raw_ml_benign_probability": raw_benign_probability,
        "raw_ml_malicious_probability": raw_malicious_probability,

        "security_assessment": security_assessment,
        "clearly_clean": security_clean,

        "suspicious_reasons": suspicious_reasons,
        "features": feature_map,

        "decision_reason": decision_reason,
    }


if __name__ == "__main__":

    if len(sys.argv) != 2:
        print(
            'Usage: python -m backend.ml.predict_excel '
            '"PATH_TO_EXCEL_FILE.xlsx"'
        )
        sys.exit(1)

    try:
        predict_excel(sys.argv[1])

    except FileNotFoundError:
        print()
        print("ERROR: Excel file not found.")
        print(f"Path: {sys.argv[1]}")
        sys.exit(1)

    except Exception as e:
        print()
        print("ERROR:", str(e))
        sys.exit(1)
