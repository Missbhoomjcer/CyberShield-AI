from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.database import get_db
from database.crud import get_all_scans, get_scan


router = APIRouter(
    prefix="/history",
    tags=["Scan History"]
)


# =========================================================
# GET ALL SCANS
# =========================================================

@router.get("/")
def get_scan_history(
    db: Session = Depends(get_db)
):
    scans = get_all_scans(db)

    return {
        "count": len(scans),
        "scans": [
            {
                "id": scan.id,
                "filename": scan.filename,
                "file_type": scan.file_type,
                "file_size": scan.file_size,
                "sha256": scan.sha256,
                "entropy": scan.entropy,
                "prediction": scan.prediction,
                "threat_score": scan.threat_score,
                "confidence": scan.confidence,
                "model": scan.model,
                "created_at": scan.created_at
            }
            for scan in scans
        ]
    }


# =========================================================
# GET SINGLE SCAN
# =========================================================

@router.get("/{scan_id}")
def get_scan_by_id(
    scan_id: int,
    db: Session = Depends(get_db)
):
    scan = get_scan(db, scan_id)

    if scan is None:
        raise HTTPException(
            status_code=404,
            detail="Scan not found."
        )

    return {
        "id": scan.id,
        "filename": scan.filename,
        "file_type": scan.file_type,
        "file_size": scan.file_size,
        "sha256": scan.sha256,
        "entropy": scan.entropy,
        "prediction": scan.prediction,
        "threat_score": scan.threat_score,
        "confidence": scan.confidence,
        "model": scan.model,
        "created_at": scan.created_at
    }