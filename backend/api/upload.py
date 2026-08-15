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
    # Run ML prediction
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
    # Prediction
    # -----------------------------------------------------

    try:

        result = predict_file(
            str(file_path)
        )

        return {

            "status": "Analysis Completed",

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