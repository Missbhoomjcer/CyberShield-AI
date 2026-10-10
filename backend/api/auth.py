from fastapi import APIRouter, Depends

from backend.core.firebase_auth import verify_firebase_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.get("/me")
def get_current_user(
    current_user: dict = Depends(verify_firebase_token),
):
    return {
        "authenticated": True,
        "user": current_user,
    }