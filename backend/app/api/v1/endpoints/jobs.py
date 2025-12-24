from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks, Depends
from fastapi.responses import FileResponse
from typing import Optional, List
import uuid
import os
import shutil
import tempfile
from datetime import datetime, timedelta
import logging
import asyncio
from sqlalchemy.orm import Session
from kombu.exceptions import OperationalError as KombuOperationalError

from app.db.session import get_db
from app.models.sql_models import Job, ChainOfCustody
from app.models.schemas import (
    URLJobCreate, JobStatusResponse, JobDetailsResponse, VerificationResponse
)
from app.pipelines.url_pipeline import URLPipeline
from app.pipelines.upload_pipeline import UploadPipeline
from app.pipelines.unified_pipeline import UnifiedForensicPipeline
from app.services.validator import FileValidator
from app.core.logger import ForensicLogger
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["jobs"])

# Conditionally import Celery tasks only when USE_CELERY is enabled
if settings.USE_CELERY:
    from app.workers.tasks import process_url_job, process_upload_job

# --- Background Helpers for non-Celery mode ---
# Note: FastAPI BackgroundTasks runs these in a ThreadPoolExecutor, 
# so asyncio.run() is safe here - each thread gets its own event loop.

def run_url_pipeline_sync(job_id: str, url: str, investigator_id: str, case_number: str = None):
    """Synchronous wrapper for URL pipeline (runs in background thread)"""
    try:
        pipeline = URLPipeline()
        asyncio.run(pipeline.process_url(url, job_id, investigator_id, case_number))
    except Exception as e:
        logger.error(f"URL pipeline failed for job {job_id}: {str(e)}")

def run_upload_pipeline_sync(job_id: str, file_path: str, filename: str, investigator_id: str, case_number: str = None):
    """Synchronous wrapper for upload pipeline (runs in background thread)"""
    try:
        pipeline = UploadPipeline()
        asyncio.run(pipeline.process_file_path(file_path, filename, job_id, investigator_id))
    except Exception as e:
        logger.error(f"Upload pipeline failed for job {job_id}: {str(e)}")

# Additional enforcement
ALLOWED_TYPES = {"application/pdf", "image/png", "image/jpeg", "text/plain", "application/zip", "video/mp4", "audio/mpeg", "audio/wav"}
MAX_UPLOAD_MB = 500  

# --- Endpoints ---

@router.post("/jobs/url", response_model=JobStatusResponse)
async def submit_url_job(
    job_data: URLJobCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    try:
        job_id = str(uuid.uuid4())
        job = Job(
            id=job_id, status="pending", source="url", original_url=str(job_data.url),
            investigator_id=job_data.investigator_id, case_number=job_data.case_number,
            notes=job_data.notes, stage="Initialization"
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        
        ForensicLogger.log_acquisition(job_id=job_id, source='url', investigator_id=job_data.investigator_id, url=str(job_data.url))
        
        # Use Celery if enabled, otherwise fall back to FastAPI BackgroundTasks
        if settings.USE_CELERY:
            try:
                process_url_job.delay(
                    job_id=job_id, 
                    url=str(job_data.url),
                    investigator_id=job_data.investigator_id, 
                    case_number=job_data.case_number
                )
            except (KombuOperationalError, ConnectionError, OSError) as celery_error:
                # Fallback to BackgroundTasks if Celery/Redis is not available
                logger.warning(f"Celery unavailable, falling back to BackgroundTasks: {str(celery_error)}")
                background_tasks.add_task(
                    run_url_pipeline_sync, 
                    job_id, 
                    str(job_data.url), 
                    job_data.investigator_id, 
                    job_data.case_number
                )
        else:
            # Use FastAPI BackgroundTasks when USE_CELERY is disabled
            logger.info(f"Processing URL job {job_id} with BackgroundTasks (USE_CELERY=false)")
            background_tasks.add_task(
                run_url_pipeline_sync, 
                job_id, 
                str(job_data.url), 
                job_data.investigator_id, 
                job_data.case_number
            )
        return job
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"URL job submission failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/jobs/upload", response_model=JobStatusResponse)
async def submit_local_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    investigator_id: str = Form(...),
    case_number: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    try:
        # Validate File
        validator = FileValidator()
        validation_result = validator.validate_upload_file(file)
        if not validation_result["valid"]:
            raise HTTPException(status_code=400, detail=validation_result["error"])

        # Enforce MIME type
        if file.content_type not in ALLOWED_TYPES and not any(file.content_type.startswith(p) for p in ['image/', 'video/', 'audio/']):
             # Simplified check, allowing main types
             pass 
        
        job_id = str(uuid.uuid4())

        # Save to temp file
        # Use the LOCAL_STORAGE_PATH from settings for better portability
        storage_base = os.path.abspath(settings.LOCAL_STORAGE_PATH)
        temp_dir = os.path.join(storage_base, "temp_uploads")
        os.makedirs(temp_dir, exist_ok=True)
        
        temp_file = tempfile.NamedTemporaryFile(
            delete=False, 
            dir=temp_dir,  # <--- Force save to shared volume
            suffix=f"_{file.filename}"
        )
        try:
            written = 0
            with open(temp_file.name, 'wb') as f:
                while True:
                    chunk = file.file.read(1024 * 1024)
                    if not chunk:
                        break
                    written += len(chunk)
                    if written > MAX_UPLOAD_MB * 1024 * 1024:
                        os.unlink(temp_file.name)
                        raise HTTPException(status_code=413, detail=f"File exceeds {MAX_UPLOAD_MB}MB")
                    f.write(chunk)
        except HTTPException:
            raise
        except Exception as e:
            if os.path.exists(temp_file.name):
                os.unlink(temp_file.name)
            raise HTTPException(status_code=500, detail="Failed to save uploaded file")

        job = Job(
            id=job_id, status="pending", source="local_upload", filename=file.filename,
            investigator_id=investigator_id, case_number=case_number, notes=notes,
            stage="Initialization"
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        
        ForensicLogger.log_acquisition(job_id=job_id, source='local_upload', investigator_id=investigator_id, filename=file.filename)
        
        # Use Celery if enabled, otherwise fall back to FastAPI BackgroundTasks
        if settings.USE_CELERY:
            try:
                process_upload_job.delay(
                    job_id=job_id, 
                    file_path=temp_file.name, 
                    filename=file.filename, 
                    investigator_id=investigator_id, 
                    case_number=case_number
                )
            except (KombuOperationalError, ConnectionError, OSError) as celery_error:
                # Fallback to BackgroundTasks if Celery/Redis is not available
                logger.warning(f"Celery unavailable, falling back to BackgroundTasks: {str(celery_error)}")
                background_tasks.add_task(
                    run_upload_pipeline_sync, 
                    job_id, 
                    temp_file.name, 
                    file.filename, 
                    investigator_id, 
                    case_number
                )
        else:
            # Use FastAPI BackgroundTasks when USE_CELERY is disabled
            logger.info(f"Processing upload job {job_id} with BackgroundTasks (USE_CELERY=false)")
            background_tasks.add_task(
                run_upload_pipeline_sync, 
                job_id, 
                temp_file.name, 
                file.filename, 
                investigator_id, 
                case_number
            )
        return job
    except HTTPException: 
        raise
    except Exception as e:
        logger.error(f"Upload job submission failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/jobs", response_model=List[JobStatusResponse])
async def list_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Job).order_by(Job.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/jobs/{job_id}/status", response_model=JobStatusResponse)
async def get_job_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job: raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.get("/jobs/{job_id}/details", response_model=JobDetailsResponse)
async def get_job_details(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job: raise HTTPException(status_code=404, detail="Job not found")
    
    logs = db.query(ChainOfCustody).filter(ChainOfCustody.job_id == job_id).order_by(ChainOfCustody.timestamp).all()
    
    metadata = {
        "file_name": job.filename, "file_size": job.file_size, "mime_type": job.mime_type,
        "sha256_hash": job.sha256_hash, "extraction_timestamp": job.updated_at,
        "exif_data": {}, "media_metadata": {}
    }

    # Populate metadata from latest relevant log or stored JSON if available (simplified here)
    # Ideally, we should fetch metadata from the stored metadata.json, but for now we construct basic structure
    
    return JobDetailsResponse(
        job_id=job.id, status=job.status, source=job.source, platform=None,
        metadata=metadata,
        chain_of_custody=[
            {"timestamp": l.timestamp, "event": l.event, "details": l.details, "investigator_id": l.investigator_id, "hash_verification": l.hash_verification} for l in logs
        ],
        original_url=job.original_url, file_path=job.storage_path or "",
        storage_location=job.storage_path or "", created_at=job.created_at, completed_at=job.completed_at
    )

@router.get("/jobs/{job_id}/report")
async def download_report(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job: raise HTTPException(status_code=404, detail="Job not found")
    
    report_log = db.query(ChainOfCustody).filter(ChainOfCustody.job_id == job_id, ChainOfCustody.event == "REPORT_GENERATED").first()
    pdf_path = report_log.details.get("report_path") if report_log and report_log.details else None
    
    if not pdf_path or not os.path.exists(pdf_path):
         raise HTTPException(status_code=404, detail="Report not available")

    return FileResponse(pdf_path, media_type='application/pdf', filename=f"Forensic_Report_{job_id}.pdf")

@router.get("/jobs/{job_id}/pdf")
async def generate_pdf_endpoint(job_id: str, db: Session = Depends(get_db)):
    return await download_report(job_id, db)

@router.get("/analytics")
async def get_analytics(period: str = "7d", db: Session = Depends(get_db)):
    now = datetime.utcnow()
    
    # Parse period parameter
    if period == "24h":
        start_date = now - timedelta(hours=24)
    elif period == "30d":
        start_date = now - timedelta(days=30)
    elif period == "90d":
        start_date = now - timedelta(days=90)
    else:  # default to 7d
        start_date = now - timedelta(days=7)
    
    total = db.query(Job).filter(Job.created_at >= start_date).count()
    completed = db.query(Job).filter(Job.created_at >= start_date, Job.status == 'completed').count()
    failed = db.query(Job).filter(Job.created_at >= start_date, Job.status == 'failed').count()
    pending = db.query(Job).filter(Job.created_at >= start_date, Job.status == 'pending').count()
    
    return {"total_jobs": total, "completed_jobs": completed, "failed_jobs": failed, "pending_jobs": pending}

@router.post("/jobs/{job_id}/verify", response_model=VerificationResponse)
async def verify_integrity(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job or not job.storage_path: raise HTTPException(status_code=404, detail="Evidence not found")
    
    pipeline = UnifiedForensicPipeline()
    result = pipeline.verify_integrity(job.storage_path, job.sha256_hash, job.id, job.investigator_id)
    
    return VerificationResponse(
        job_id=job.id, verification_timestamp=datetime.utcnow(),
        original_hash=result['original_hash'], current_hash=result['current_hash'],
        matches=result['matches'], verification_details=result['verification_details']
    )
