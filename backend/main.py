from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.llm import router as llm_router
from backend.api.auth import router as auth_router

from backend.api.history import router as history_router
from backend.api.upload import router as upload_router
from backend.api.monitoring import router as monitoring_router
from backend.api.quarantine import router as quarantine_router
from backend.api.threats import router as threats_router


app = FastAPI(
    title="CyberShield AI",
    description="AI-Powered Ransomware Detection and Threat Hunting Platform",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(upload_router)
app.include_router(history_router)
app.include_router(monitoring_router)
app.include_router(quarantine_router, prefix="/quarantine")
app.include_router(threats_router)
app.include_router(llm_router)
app.include_router(auth_router)



@app.get("/")
def home():
    return {
        "project": "CyberShield AI",
        "version": "1.0.0",
        "status": "Backend Running Successfully"
    }


@app.get("/health")
def health():
    return {
        "status": "Healthy",
        "message": "Backend is working perfectly!"
    }
