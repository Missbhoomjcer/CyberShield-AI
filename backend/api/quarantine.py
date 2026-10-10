from fastapi import APIRouter, HTTPException

from backend.ml.quarantine_manager import (
    list_quarantined_files,
    get_quarantined_file,
    delete_quarantined_file
)

router = APIRouter()


# =========================================================
# LIST QUARANTINED FILES
# =========================================================

@router.get("/")
def get_quarantine():
    return {
        "status": "success",
        "count": len(list_quarantined_files()),
        "files": list_quarantined_files()
    }


# =========================================================
# GET ONE QUARANTINED FILE
# =========================================================

@router.get("/{quarantine_id}")
def get_quarantine_item(quarantine_id: str):

    item = get_quarantined_file(quarantine_id)

    if item is None:
        raise HTTPException(
            status_code=404,
            detail="Quarantined file not found."
        )

    return {
        "status": "success",
        "file": item
    }


# =========================================================
# DELETE QUARANTINED FILE
# =========================================================

@router.delete("/{quarantine_id}")
def delete_quarantine_item(quarantine_id: str):

    deleted = delete_quarantined_file(quarantine_id)

    if not deleted:
        raise HTTPException(
            status_code=404,
            detail="Quarantined file not found."
        )

    return {
        "status": "success",
        "message": "Quarantined file permanently deleted.",
        "quarantine_id": quarantine_id
    }