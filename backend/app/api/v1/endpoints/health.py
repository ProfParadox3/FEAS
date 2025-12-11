from fastapi import APIRouter, Depends
from datetime import datetime
import psutil
import os

from app.models.schemas import HealthResponse
from app.services.storage import StorageService

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Check system health and service status"""
    
    services = {}
    
    # Check storage service
    try:
        storage_status = await StorageService.check_health()
        services["storage"] = storage_status["status"]
    except Exception as e:
        services["storage"] = f"error: {str(e)}"
    
    # Check disk space
    disk_usage = psutil.disk_usage('/')
    services["disk"] = f"{disk_usage.percent}% used"
    
    # Check memory
    memory = psutil.virtual_memory()
    services["memory"] = f"{memory.percent}% used"
    
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        timestamp=datetime.utcnow(),
        services=services
    )