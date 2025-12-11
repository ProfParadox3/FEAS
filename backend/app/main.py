from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging

from app.api.v1.endpoints import jobs, health
from app.core.config import settings
from app.db.session import engine
from app.models import sql_models
from app.services.storage import StorageService
from app.core.logger import setup_logging

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Create database tables
sql_models.Base.metadata.create_all(bind=engine)

def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME,
        description="Forensic Evidence Acquisition System API",
        version="1.0.0",
        openapi_url=f"{settings.API_V1_STR}/openapi.json"
    )

    # --- CORS CONFIGURATION (Fixes Network Error) ---
    origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    application.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # --- ROUTERS ---
    application.include_router(health.router, prefix=settings.API_V1_STR, tags=["health"])
    application.include_router(jobs.router, prefix=settings.API_V1_STR, tags=["jobs"])

    # --- STARTUP EVENTS ---
    @application.on_event("startup")
    async def startup_event():
        logger.info("Starting up Forensic Evidence Acquisition System...")
        await StorageService.initialize()
        logger.info("Storage service initialized.")

    return application

app = create_application()

@app.get("/")
def root():
    return {"message": "Forensic Evidence Acquisition System API is Running"}