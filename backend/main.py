from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.upload import router as upload_router
from api.monitor import router as monitor_router


# =========================================================
# CREATE FASTAPI APP
# =========================================================

app = FastAPI(
    title="CyberShield AI",
    description="AI-Powered Ransomware Detection and Threat Hunting Platform",
    version="1.0.0"
)


# =========================================================
# ENABLE CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# REGISTER API ROUTERS
# =========================================================

app.include_router(upload_router)

app.include_router(monitor_router)


# =========================================================
# HOME API
# =========================================================

@app.get("/")
def home():

    return {
        "project": "CyberShield AI",
        "version": "1.0.0",
        "status": "Backend Running Successfully 🚀"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():

    return {
        "status": "Healthy",
        "message": "Backend is working perfectly!"
    }