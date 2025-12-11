from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks, Depends
from fastapi.responses import FileResponse
from typing import Optional, List
import uuid
import os
import shutil
import tempfile
from datetime import datetime, timedelta
import logging
from sqlalchemy.orm import Session

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

logger = logging.getLogger(__name__)
router = APIRouter()

# --- Background Helpers ---
async def run_url_pipeline(job_id: str, url: str, investigator_id: str, case_number: str = None):
    pipeline = URLPipeline()
    await pipeline.process_url(url, job_id, investigator_id, case_number)

async def run_upload_pipeline(job_id: str, file_path: str, filename: str, investigator_id: str, case_number: str = None):
    pipeline = UploadPipeline()
    await pipeline.process_file_path(file_path, filename, job_id, investigator_id)

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
        
        background_tasks.add_task(
            run_url_pipeline, job_id=job_id, url=str(job_data.url),
            investigator_id=job_data.investigator_id, case_number=job_data.case_number
        )
        return job
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
        validator = FileValidator()
        validation_result = validator.validate_upload_file(file)
        if not validation_result["valid"]:
            raise HTTPException(status_code=400, detail=validation_result["error"])
        
        job_id = str(uuid.uuid4())
        
        # Save temp file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}")
        try:
            with open(temp_file.name, 'wb') as f:
                shutil.copyfileobj(file.file, f)
        except Exception:
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
        
        background_tasks.add_task(
            run_upload_pipeline, job_id=job_id, file_path=temp_file.name,
            filename=file.filename, investigator_id=investigator_id, case_number=case_number
        )
        return job
    except HTTPException: raise
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
    start_date = now - timedelta(days=7) # Simplify for now
    
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