from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pathlib import Path
import shutil
import hashlib
import math
import time
import traceback
import importlib
import json
from datetime import datetime
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.crud import create_scan
from backend.dl.file_threat_adapter import decide_file_threat
from backend.ml.quarantine_manager import quarantine_file
from backend.core.firebase_auth import verify_firebase_token


router = APIRouter()

BACKEND_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BACKEND_DIR / "uploads"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def calculate_sha256(file_path: Path) -> str:
    sha256 = hashlib.sha256()

    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            sha256.update(chunk)

    return sha256.hexdigest()


def calculate_entropy(file_path: Path) -> float:
    with open(file_path, "rb") as f:
        data = f.read()

    if not data:
        return 0.0

    frequency = [0] * 256

    for byte in data:
        frequency[byte] += 1

    length = len(data)
    entropy = 0.0

    for count in frequency:
        if count:
            probability = count / length
            entropy -= probability * math.log2(probability)

    return round(entropy, 4)


def load_predictor(module_name, function_name):
    module = importlib.import_module(module_name)
    predictor = getattr(module, function_name)

    return predictor


def analyze_file(file_path: Path, extension: str):
    extension = extension.lower()

    if extension in {".exe", ".dll", ".sys"}:
        predict_file = load_predictor(
            "backend.ml.predict",
            "predict_file"
        )

        return predict_file(str(file_path)), "PE/XGBoost"

    if extension == ".pdf":
        predict_pdf = load_predictor(
            "backend.ml.predict_pdf",
            "predict_pdf"
        )

        return predict_pdf(str(file_path)), "PDF/XGBoost"

    if extension == ".zip":
        inspect_zip = load_predictor(
            "backend.ml.predict_zip",
            "inspect_zip"
        )

        return inspect_zip(str(file_path)), "ZIP/Archive Inspector"

    if extension in {".doc", ".docx"}:
        predict_word = load_predictor(
            "backend.ml.predict_word",
            "predict_word"
        )

        return predict_word(str(file_path)), "Word/XGBoost"

    if extension in {".xls", ".xlsx"}:
        predict_excel = load_predictor(
            "backend.ml.predict_excel",
            "predict_excel"
        )

        return predict_excel(str(file_path)), "Excel/XGBoost"

    raise ValueError(
        "Unsupported file type. Supported types: "
        ".exe, .dll, .sys, .pdf, .zip, .doc, .docx, .xls, .xlsx"
    )


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No filename provided"
        )

    filename = Path(file.filename).name
    extension = Path(filename).suffix.lower()

    allowed_extensions = {
        ".exe",
        ".dll",
        ".sys",
        ".pdf",
        ".zip",
        ".doc",
        ".docx",
        ".xls",
        ".xlsx",
    }

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {extension}"
        )

    file_path = UPLOAD_DIR / filename

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        file_size = file_path.stat().st_size

        analysis_time = datetime.now().astimezone().isoformat()

        scan_start_time = time.perf_counter()

        # ---------------------------------------------------------
        # BASIC FILE FEATURES
        # ---------------------------------------------------------

        sha256 = calculate_sha256(file_path)
        entropy = calculate_entropy(file_path)

        # ---------------------------------------------------------
        # AI / ML ANALYSIS
        # ---------------------------------------------------------

        prediction_result, model_name = analyze_file(
            file_path,
            extension
        )

        # ---------------------------------------------------------
        # UNIFIED THREAT DECISION
        # ---------------------------------------------------------

        if (
            extension == ".zip"
            and isinstance(prediction_result, dict)
            and "threat_decision" in prediction_result
        ):
            threat_decision = prediction_result["threat_decision"]
        else:
            threat_decision = decide_file_threat(
                prediction_result,
                model_name
            )

        # ---------------------------------------------------------
        # NORMALIZE PREDICTION RESULT
        # ---------------------------------------------------------

        if isinstance(prediction_result, dict):

            prediction = prediction_result.get(
                "prediction",
                prediction_result.get(
                    "label",
                    "UNKNOWN"
                )
            )

            threat_score = prediction_result.get(
                "threat_score",
                prediction_result.get(
                    "malicious_probability",
                    prediction_result.get(
                        "score",
                        0
                    )
                )
            )

            confidence = prediction_result.get(
                "confidence",
                0
            )

        else:
            prediction = str(prediction_result)
            threat_score = 0
            confidence = 0

        # ---------------------------------------------------------
        # EXTRACT THREAT DECISION FIELDS
        # ---------------------------------------------------------

        overall_risk = threat_decision.get(
            "overall_risk",
            threat_decision.get(
                "risk_score",
                threat_score
            )
        )

        threat_level = threat_decision.get(
            "threat_level",
            threat_decision.get(
                "level",
                "UNKNOWN"
            )
        )

        action = threat_decision.get(
            "action",
            "UNKNOWN"
        )

        threat_reasons = threat_decision.get(
            "threat_reasons",
            threat_decision.get(
                "reasons",
                []
            )
        )

        # SQLAlchemy Text field needs a string.
        if isinstance(threat_reasons, (dict, list)):
            threat_reasons = json.dumps(
                threat_reasons,
                default=str
            )
        elif threat_reasons is None:
            threat_reasons = ""
        else:
            threat_reasons = str(threat_reasons)

        # Make sure numeric values are actually numeric.
        try:
            threat_score = float(threat_score)
        except (TypeError, ValueError):
            threat_score = 0.0

        try:
            confidence = float(confidence)
        except (TypeError, ValueError):
            confidence = 0.0

        try:
            overall_risk = float(overall_risk)
        except (TypeError, ValueError):
            overall_risk = threat_score

        # ---------------------------------------------------------
        # SAVE SCAN TO DATABASE
        # ---------------------------------------------------------

        scan_data = {
            "filename": filename,
            "file_type": extension,
            "file_size": file_size,
            "sha256": sha256,
            "entropy": entropy,
            "prediction": str(prediction),
            "threat_score": threat_score,
            "confidence": confidence,
            "model": model_name,
            "overall_risk": overall_risk,
            "threat_level": str(threat_level),
            "action": str(action),
            "threat_reasons": threat_reasons
        }

        saved_scan = create_scan(
            db=db,
            scan_data=scan_data
        )

        # ---------------------------------------------------------
        # QUARANTINE IF REQUIRED
        # ---------------------------------------------------------

        quarantine_record = None

        if action in {
            "BLOCK_AND_QUARANTINE",
            "CONTAIN_AND_QUARANTINE"
        }:
            quarantine_record = quarantine_file(
                str(file_path),
                threat_decision
            )

        # ---------------------------------------------------------
        # SCAN TIME
        # ---------------------------------------------------------

        scan_time_seconds = round(
            time.perf_counter() - scan_start_time,
            3
        )

        # ---------------------------------------------------------
        # RESPONSE
        # ---------------------------------------------------------

        return {
            "status": "Analysis Completed",
            "scan_id": saved_scan.id,
            "filename": filename,
            "extension": extension,
            "size": file_size,
            "file_size": file_size,
            "analysis_time": analysis_time,
            "scan_time_seconds": scan_time_seconds,
            "sha256": sha256,
            "entropy": entropy,
            "detector": model_name,
            "prediction": prediction_result,
            "threat_decision": threat_decision,
            "quarantine": quarantine_record
        }

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc)
        )

    except HTTPException:
        raise

    except Exception as exc:
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(exc)}"
        )