from pathlib import Path

import firebase_admin
from firebase_admin import auth, credentials
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

PROJECT_ROOT = Path(__file__).resolve().parents[2]
SERVICE_ACCOUNT_PATH = (
    PROJECT_ROOT / "secrets" / "firebase-service-account.json"
)

security = HTTPBearer(auto_error=False)


def get_firebase_app():
    """Initialize Firebase Admin once."""
    try:
        return firebase_admin.get_app()
    except ValueError:
        if not SERVICE_ACCOUNT_PATH.is_file():
            raise RuntimeError(
                "Firebase service-account file is missing."
            )

        cred = credentials.Certificate(str(SERVICE_ACCOUNT_PATH))
        return firebase_admin.initialize_app(cred)


def verify_firebase_token(
    credentials_header: HTTPAuthorizationCredentials | None = Depends(security),
):
    """Verify the Firebase ID token."""
    if credentials_header is None:
        raise HTTPException(
            status_code=401,
            detail="Missing Firebase ID token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        get_firebase_app()
        decoded_token = auth.verify_id_token(
            credentials_header.credentials
        )

        return {
            "uid": decoded_token["uid"],
            "email": decoded_token.get("email"),
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired Firebase ID token.",
            headers={"WWW-Authenticate": "Bearer"},
        )