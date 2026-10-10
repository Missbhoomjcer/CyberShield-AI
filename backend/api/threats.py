from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.database.database import get_db
from backend.database.crud import (
    get_all_threats,
    update_threat_status
)


router = APIRouter(
    prefix="/threats",
    tags=["Threats"]
)


@router.get("/")
def get_threats(
    db: Session = Depends(get_db)
):
    threats = get_all_threats(db)

    return {
        "count": len(threats),
        "threats": [
            {
                "id": threat.id,
                "threat_type": threat.threat_type,
                "severity": threat.severity,
                "description": threat.description,
                "source": threat.source,
                "confidence": threat.confidence,
                "status": threat.status,
                "created_at": threat.created_at
            }
            for threat in threats
        ]
    }


@router.patch("/{threat_id}/status")
def change_threat_status(
    threat_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    threat = update_threat_status(
        db,
        threat_id,
        status
    )

    if threat is None:
        raise HTTPException(
            status_code=404,
            detail="Threat not found."
        )

    return {
        "status": "success",
        "message": "Threat status updated.",
        "threat": {
            "id": threat.id,
            "threat_type": threat.threat_type,
            "severity": threat.severity,
            "description": threat.description,
            "source": threat.source,
            "confidence": threat.confidence,
            "status": threat.status,
            "created_at": threat.created_at
        }
    }
