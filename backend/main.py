from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os
import joblib

# Import routes
from api.routes import prediction_router
from api.predict_api import batch_router
from api.dashboard import dashboard_router
from api.notifications import notifications_router
from api.training import training_router
from api import auth
from utils.models import NetworkIntrusionDetector

# Initialize model directory and create a default model if it doesn't exist
def initialize_models():
    model_dir = Path("models")
    model_dir.mkdir(parents=True, exist_ok=True)
    
    default_model_path = model_dir / "default_model.pkl"
    
    if not default_model_path.exists():
        print("Default model not found, creating a new one...")
        model = NetworkIntrusionDetector()
        joblib.dump(model, default_model_path)
        print(f"Created default model at {default_model_path}")

# Initialize models before starting the app
initialize_models()

app = FastAPI(
    title="Network Intrusion Detection System API",
    description="API for detecting network intrusions using machine learning models",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create static directory if it doesn't exist
static_dir = Path("eval/plots")
static_dir.mkdir(parents=True, exist_ok=True)

# Mount static files directory for serving plots and other static content
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Include routers
app.include_router(prediction_router, prefix="/api", tags=["prediction"])
app.include_router(batch_router, prefix="/api", tags=["batch"])
app.include_router(dashboard_router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(notifications_router, prefix="/api/notifications", tags=["notifications"])
app.include_router(training_router, prefix="/api/training", tags=["training"])
app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "Welcome to NIDS API. Go to /docs for documentation."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 