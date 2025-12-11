from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging
import os
from app.db.session import engine
from app.db.base import Base
from app.api.v1.endpoints import jobs, health
from app.core.config import settings
from app.core.logger import setup_logging


@app.on_event("startup")
async def startup_event():
    logger.info("Forensic Evidence Acquisition System starting up")
    
    # Create Tables automatically (Production usually uses Alembic migrations, but this works for now)
    Base.metadata.create_all(bind=engine)

setup_logging()
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

def create_application() -> FastAPI:
    app = FastAPI(
        title="Forensic Evidence Acquisition System",
        description="Investigator-grade forensic evidence acquisition and chain-of-custody tracking",
        version="1.0.0",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
    )
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
    app.include_router(health.router, prefix=settings.API_V1_STR)
    app.include_router(jobs.router, prefix=settings.API_V1_STR)
    
    @app.middleware("http")
    async def add_security_headers(request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response
    
    @app.on_event("startup")
    async def startup_event():
        logger.info("Forensic Evidence Acquisition System starting up")
        
        # Create necessary directories
        os.makedirs(settings.LOCAL_STORAGE_PATH, exist_ok=True)
        os.makedirs(os.path.dirname(settings.CHAIN_OF_CUSTODY_LOG_PATH), exist_ok=True)
        
        # Initialize storage
        from app.services.storage import StorageService
        await StorageService.initialize()
        logger.info("Storage service initialized")
    
    return app

app = create_application()
