from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pathlib import Path
import shutil
import sys

from sqlalchemy.orm import Session

from database.database import get_db
from database.crud import create_scan


# =========================================================
# ROUTER
# =========================================================

router = APIRouter()


# =========================================================
# PATHS
# =========================================================

BACKEND_DIR = Path(__file__).resolve().parent.parent

UPLOAD_DIR = BACKEND_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


# =========================================================
# LOAD PREDICTION ENGINE
# =========================================================

sys.path.insert(0, str(BACKEND_DIR))

try:
    from ml.predict_file import predict_file

    PREDICTOR_AVAILABLE = True
    PREDICTOR_ERROR = None

except Exception as e:
    PREDICTOR_AVAILABLE = False
    PREDICTOR_ERROR = str(e)


# =========================================================
# UPLOAD ENDPOINT
# =========================================================

@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # Check filename
    # -----------------------------------------------------

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    # -----------------------------------------------------
    # Secure filename
    # -----------------------------------------------------

    filename = Path(file.filename).name

    file_path = UPLOAD_DIR / filename

    # -----------------------------------------------------
    # Save uploaded file
    # -----------------------------------------------------

    try:

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer
            )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"File could not be saved: {str(e)}"
        )

    # -----------------------------------------------------
    # Basic information
    # -----------------------------------------------------

    file_size = file_path.stat().st_size

    extension = file_path.suffix.lower()

    # -----------------------------------------------------
    # Check ML prediction engine
    # -----------------------------------------------------

    if not PREDICTOR_AVAILABLE:

        return {
            "status": "Upload Successful",
            "filename": filename,
            "extension": extension,
            "size": file_size,
            "ml_status": "Prediction engine unavailable",
            "error": PREDICTOR_ERROR
        }

    # -----------------------------------------------------
    # Run ML prediction
    # -----------------------------------------------------

    try:

        result = predict_file(
            str(file_path)
        )

        # -------------------------------------------------
        # Save scan result to database
        # -------------------------------------------------

        scan_data = {
            "filename": filename,
            "file_type": extension,
            "file_size": file_size,
            "sha256": result.get("sha256"),
            "entropy": result.get("entropy"),
            "prediction": result.get("prediction"),
            "threat_score": result.get("threat_score"),
            "confidence": result.get("probability"),
            "model": result.get("model")
        }

        saved_scan = create_scan(
            db,
            scan_data
        )

        # -------------------------------------------------
        # Return result
        # -------------------------------------------------

        return {
            "status": "Analysis Completed",
            "scan_id": saved_scan.id,
            "filename": filename,
            "extension": extension,
            "size": file_size,
            "prediction": result
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"ML analysis failed: {str(e)}"
        )