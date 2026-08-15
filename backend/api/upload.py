from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil
import sys

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
async def upload_file(file: UploadFile = File(...)):

    # -----------------------------------------------------
    # CHECK FILENAME
    # -----------------------------------------------------

    if not file.filename:

        raise HTTPException(
            status_code=400,
            detail="No file selected."
        )

    # -----------------------------------------------------
    # SECURE FILENAME
    # -----------------------------------------------------

    filename = Path(file.filename).name

    file_path = UPLOAD_DIR / filename

    # -----------------------------------------------------
    # SAVE UPLOADED FILE
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
    # BASIC FILE INFORMATION
    # -----------------------------------------------------

    file_size = file_path.stat().st_size

    extension = file_path.suffix.lower()

    # -----------------------------------------------------
    # CHECK PREDICTION ENGINE
    # -----------------------------------------------------

    if not PREDICTOR_AVAILABLE:

        return {

            "status": "Upload Successful",

            "filename": filename,

            "file_type": extension,

            "file_size": file_size,

            "ml_status": "Prediction engine unavailable",

            "error": PREDICTOR_ERROR
        }

    # -----------------------------------------------------
    # RUN ML PREDICTION
    # -----------------------------------------------------

    try:

        result = predict_file(
            str(file_path)
        )

        # -------------------------------------------------
        # RETURN ML RESULT DIRECTLY
        # IMPORTANT:
        # SHAP data must NOT be nested inside "prediction"
        # -------------------------------------------------

        return {

            "status": "Analysis Completed",

            "filename": result.get(
                "filename",
                filename
            ),

            "file_type": extension,

            "file_size": result.get(
                "file_size",
                file_size
            ),

            "prediction": result.get(
                "prediction"
            ),

            "class": result.get(
                "class"
            ),

            "threat_score": result.get(
                "threat_score"
            ),

            "probability": result.get(
                "probability"
            ),

            "model": result.get(
                "model"
            ),

            "features_used": result.get(
                "features_used"
            ),

            "entropy": result.get(
                "entropy"
            ),

            "sha256": result.get(
                "sha256"
            ),

            # =============================================
            # SHAP EXPLAINABILITY
            # =============================================

            "shap_explanation": result.get(
                "shap_explanation",
                []
            )
        }

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=f"ML analysis failed: {str(e)}"
        )