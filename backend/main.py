from api.history import router as history_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.upload import router as upload_router
from api.monitoring import router as monitoring_router
# Create FastAPI app FIRST
app = FastAPI(
    title="CyberShield AI",
    description="AI-Powered Ransomware Detection and Threat Hunting Platform",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register APIs AFTER app is created
app.include_router(upload_router)
app.include_router(history_router)
app.include_router(monitoring_router)
@app.get("/")
def home():
    return {
        "project": "CyberShield AI",
        "version": "1.0.0",
        "status": "Backend Running Successfully 🚀"
    }

@app.get("/health")
def health():
    return {
        "status": "Healthy",
        "message": "Backend is working perfectly!"
    }