from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks, Depends
from fastapi.responses import FileResponse, JSONResponse
from typing import Optional
import uuid
import json
from datetime import datetime
import logging
from sqlalchemy.orm import Session
import tempfile
import shutil
from app.db.session import get_db
from app.models.schemas import (
    URLJobCreate, FileUploadRequest, JobStatusResponse, 
    JobDetailsResponse, VerificationResponse, ErrorResponse
)
from app.services.downloader import URLDownloader
from app.pipelines.unified_pipeline import UnifiedForensicPipeline
from app.services.chain_of_custody import ChainOfCustodyLogger
from app.services.validator import FileValidator
from app.services.pdf_generator import PDFReportGenerator
from app.core.logger import ForensicLogger

logger = logging.getLogger(__name__)
router = APIRouter()

# In-memory job store (replace with database in production)
job_store = {}

@router.get("/jobs/{job_id}/report")
async def download_report(job_id: str, db: Session = Depends(get_db)):
    """Download the forensic report PDF"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # We assume the PDF is stored in the same directory as the evidence file 
    # and named based on the job ID, which is common practice.
    pdf_dir = os.path.dirname(job.storage_path) if job.storage_path else None
    pdf_path = os.path.join(pdf_dir, f"report_{job_id}.pdf") if pdf_dir else None
    
    if not pdf_path or not os.path.exists(pdf_path) or job.status != 'completed':
        raise HTTPException(
            status_code=404, 
            detail="Report not found or job is not yet completed."
        )

    # Add a Chain of Custody Log for report download
    log = ChainOfCustody(
        job_id=job.id,
        event="REPORT_DOWNLOADED",
        investigator_id="API_User", # This should be replaced with actual user from auth
        details={"report_name": f"Forensic_Report_{job_id}.pdf"}
    )
    db.add(log)
    db.commit()
    
    return FileResponse(
        pdf_path,
        media_type='application/pdf',
        filename=f"Forensic_Report_{job_id}_{job.case_number or 'NoCase'}.pdf"
    )
    
@router.post("/jobs/url", response_model=JobStatusResponse)
async def submit_url_job(
    job_data: URLJobCreate,
    background_tasks: BackgroundTasks
):
    """Submit URL for forensic acquisition"""
    try:
        job_id = str(uuid.uuid4())
        created_at = datetime.utcnow()
        
        # Initialize job
        job_store[job_id] = {
            'id': job_id,
            'status': 'pending',
            'source': 'url',
            'data': job_data.dict(),
            'created_at': created_at,
            'updated_at': created_at,
            'progress': 0.0,
            'stage': 'initializing'
        }
        
        # Log acquisition
        ForensicLogger.log_acquisition(
            job_id=job_id,
            source='url',
            investigator_id=job_data.investigator_id,
            url=str(job_data.url)
        )
        
        # Start processing
        background_tasks.add_task(
            process_url_job,
            job_id=job_id,
            url=str(job_data.url),
            investigator_id=job_data.investigator_id,
            case_number=job_data.case_number
        )
        
        return JobStatusResponse(
            job_id=job_id,
            status='pending',
            progress=0.0,
            stage='submitted',
            created_at=created_at,
            updated_at=created_at
        )
        
    except Exception as e:
        logger.error(f"URL job submission failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/jobs/upload", response_model=JobStatusResponse)
async def submit_local_file(
    file: UploadFile = File(...),
    investigator_id: str = Form(...),
    case_number: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Upload local file for forensic processing"""
    try:
        # Validate file
        validator = FileValidator()
        validation_result = validator.validate_upload_file(file)
        
        if not validation_result["valid"]:
            raise HTTPException(status_code=400, detail=validation_result["error"])
        
        job_id = str(uuid.uuid4())
        created_at = datetime.utcnow()
        
        # Initialize job
        job_store[job_id] = {
            'id': job_id,
            'status': 'pending',
            'source': 'local_upload',
            'data': {
                'filename': file.filename,
                'investigator_id': investigator_id,
                'case_number': case_number,
                'notes': notes
            },
            'created_at': created_at,
            'updated_at': created_at,
            'progress': 0.0,
            'stage': 'initializing'
        }
        
        # Log acquisition
        ForensicLogger.log_acquisition(
            job_id=job_id,
            source='local_upload',
            investigator_id=investigator_id,
            filename=file.filename
        )
        
        # Create temporary file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}")
        with open(temp_file.name, 'wb') as f:
            shutil.copyfileobj(file.file, f)
        
        # Start processing
        background_tasks.add_task(
            process_upload_job,
            job_id=job_id,
            file_path=temp_file.name,
            filename=file.filename,
            investigator_id=investigator_id,
            case_number=case_number
        )
        
        return JobStatusResponse(
            job_id=job_id,
            status='pending',
            progress=0.0,
            stage='uploading',
            created_at=created_at,
            updated_at=created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload job submission failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/jobs/{job_id}/status", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """Get job processing status"""
    if job_id not in job_store:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = job_store[job_id]
    return JobStatusResponse(
        job_id=job_id,
        status=job['status'],
        progress=job.get('progress', 0.0),
        stage=job.get('stage', 'unknown'),
        created_at=job['created_at'],
        updated_at=job['updated_at']
    )

@router.get("/jobs/{job_id}/details", response_model=JobDetailsResponse)
async def get_job_details(job_id: str):
    """Get detailed job results"""
    if job_id not in job_store or 'results' not in job_store[job_id]:
        raise HTTPException(status_code=404, detail="Job results not available")
    
    job = job_store[job_id]
    results = job['results']
    
    # Get chain of custody logs
    custody_logger = ChainOfCustodyLogger()
    custody_logs = custody_logger.get_job_logs(job_id)
    
    return JobDetailsResponse(
        job_id=job_id,
        status=job['status'],
        source=job['source'],
        platform=results.get('platform_info', {}).get('platform'),
        metadata=results['metadata'],
        chain_of_custody=custody_logs,
        original_url=results.get('original_url'),
        file_path=results.get('storage_path'),
        storage_location=results.get('storage_location'),
        created_at=job['created_at'],
        completed_at=job.get('completed_at')
    )

@router.get("/jobs/{job_id}/pdf")
async def download_pdf_report(job_id: str):
    """Download PDF forensic report"""
    if job_id not in job_store or 'results' not in job_store[job_id]:
        raise HTTPException(status_code=404, detail="Job results not available")
    
    try:
        # Get job details
        job = job_store[job_id]
        results = job['results']
        
        # Generate PDF
        pdf_generator = PDFReportGenerator()
        
        # Create job details for PDF
        job_details = JobDetailsResponse(
            job_id=job_id,
            status=job['status'],
            source=job['source'],
            platform=results.get('platform_info', {}).get('platform'),
            metadata=results['metadata'],
            chain_of_custody=ChainOfCustodyLogger().get_job_logs(job_id),
            original_url=results.get('original_url'),
            file_path=results.get('storage_path'),
            storage_location=results.get('storage_location'),
            created_at=job['created_at'],
            completed_at=job.get('completed_at')
        )
        
        pdf_path = pdf_generator.generate_report(job_details)
        
        # Log PDF generation
        ForensicLogger.log_processing(
            job_id=job_id,
            investigator_id=job['data']['investigator_id'],
            stage="report_generation",
            details={"report_path": pdf_path}
        )
        
        return FileResponse(
            pdf_path,
            media_type='application/pdf',
            filename=f"forensic_report_{job_id}.pdf"
        )
        
    except Exception as e:
        logger.error(f"PDF generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/jobs/{job_id}/verify", response_model=VerificationResponse)
async def verify_integrity(job_id: str):
    """Verify evidence integrity"""
    if job_id not in job_store or 'results' not in job_store[job_id]:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = job_store[job_id]
    results = job['results']
    
    try:
        pipeline = UnifiedForensicPipeline()
        
        verification_result = pipeline.verify_integrity(
            file_path=results['storage_path'],
            original_hash=results['sha256_hash'],
            job_id=job_id,
            investigator_id=job['data']['investigator_id']
        )
        
        if not verification_result['success']:
            raise HTTPException(status_code=500, detail=verification_result['error'])
        
        # Log verification
        ForensicLogger.log_verification(
            job_id=job_id,
            investigator_id=job['data']['investigator_id'],
            original_hash=verification_result['original_hash'],
            current_hash=verification_result['current_hash'],
            matches=verification_result['matches']
        )
        
        return VerificationResponse(
            job_id=job_id,
            verification_timestamp=datetime.utcnow(),
            original_hash=verification_result['original_hash'],
            current_hash=verification_result['current_hash'],
            matches=verification_result['matches'],
            verification_details=verification_result['verification_details']
        )
        
    except Exception as e:
        logger.error(f"Integrity verification failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Background processing functions
async def process_url_job(job_id: str, url: str, investigator_id: str, case_number: Optional[str]):
    """Process URL job in background"""
    try:
        # Update job status
        job_store[job_id].update({
            'status': 'downloading',
            'progress': 20.0,
            'stage': 'downloading',
            'updated_at': datetime.utcnow()
        })
        
        # Download content
        downloader = URLDownloader()
        download_result = await downloader.download(url)
        
        if not download_result['success']:
            raise Exception(f"Download failed: {download_result.get('error')}")
        
        # Update job status
        job_store[job_id].update({
            'status': 'processing',
            'progress': 40.0,
            'stage': 'forensic_processing',
            'updated_at': datetime.utcnow()
        })
        
        # Process through unified pipeline
        pipeline = UnifiedForensicPipeline()
        process_result = await pipeline.process(
            file_path=download_result['file_path'],
            job_id=job_id,
            investigator_id=investigator_id,
            source='url',
            platform_info={
                'platform': download_result.get('platform'),
                'metadata': download_result.get('platform_metadata')
            },
            original_url=url
        )
        
        if not process_result['success']:
            raise Exception(f"Processing failed: {process_result.get('error')}")
        
        # Store results
        job_store[job_id].update({
            'status': 'completed',
            'progress': 100.0,
            'stage': 'completed',
            'results': process_result,
            'completed_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        })
        
    except Exception as e:
        logger.error(f"URL job processing failed: {str(e)}")
        job_store[job_id].update({
            'status': 'failed',
            'stage': 'failed',
            'error': str(e),
            'updated_at': datetime.utcnow()
        })

async def process_upload_job(job_id: str, file_path: str, filename: str, investigator_id: str, case_number: Optional[str]):
    """Process uploaded file in background"""
    try:
        # Update job status
        job_store[job_id].update({
            'status': 'processing',
            'progress': 30.0,
            'stage': 'forensic_processing',
            'updated_at': datetime.utcnow()
        })
        
        # Process through unified pipeline
        pipeline = UnifiedForensicPipeline()
        process_result = await pipeline.process(
            file_path=file_path,
            job_id=job_id,
            investigator_id=investigator_id,
            source='local_upload',
            filename=filename
        )
        
        if not process_result['success']:
            raise Exception(f"Processing failed: {process_result.get('error')}")
        
        # Store results
        job_store[job_id].update({
            'status': 'completed',
            'progress': 100.0,
            'stage': 'completed',
            'results': process_result,
            'completed_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        })
        
        # Cleanup temp file
        import os
        os.unlink(file_path)
        
    except Exception as e:
        logger.error(f"Upload job processing failed: {str(e)}")
        job_store[job_id].update({
            'status': 'failed',
            'stage': 'failed',
            'error': str(e),
            'updated_at': datetime.utcnow()
        })
