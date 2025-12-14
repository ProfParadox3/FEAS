from celery import shared_task
import logging
import asyncio
from datetime import datetime

from app.pipelines.url_pipeline import URLPipeline
from app.pipelines.upload_pipeline import UploadPipeline
from app.services.pdf_generator import PDFReportGenerator
from app.core.logger import ForensicLogger

logger = logging.getLogger(__name__)

@shared_task(bind=True, name="process_url_job")
def process_url_job(self, job_id: str, url: str, investigator_id: str, case_number: str = None):
    """Celery task for processing URL jobs"""
    try:
        logger.info(f"Starting URL job {job_id} for {url}")
        
        pipeline = URLPipeline()
        # Fix: Run async pipeline in sync task
        result = asyncio.run(pipeline.process_url(job_id, url, investigator_id, case_number))
        
        if result['success']:
            logger.info(f"URL job {job_id} completed successfully")
        else:
            logger.error(f"URL job {job_id} failed: {result.get('error')}")
        
        return result
        
    except Exception as e:
        logger.error(f"URL job task {job_id} failed: {str(e)}")
        raise

@shared_task(bind=True, name="process_upload_job")
def process_upload_job(self, job_id: str, file_path: str, filename: str, 
                      investigator_id: str, case_number: str = None):
    """Celery task for processing upload jobs"""
    try:
        logger.info(f"Starting upload job {job_id} for {filename}")
        
        pipeline = UploadPipeline()
        # Fix: Run async pipeline in sync task and use correct method 'process_file_path'
        result = asyncio.run(pipeline.process_file_path(
            file_path, filename, job_id, investigator_id
        ))
        
        if result['success']:
            logger.info(f"Upload job {job_id} completed successfully")
        else:
            logger.error(f"Upload job {job_id} failed: {result.get('error')}")
        
        return result
        
    except Exception as e:
        logger.error(f"Upload job task {job_id} failed: {str(e)}")
        raise

@shared_task(bind=True, name="generate_pdf_report")
def generate_pdf_report(self, job_data: dict):
    """Celery task for generating PDF reports"""
    try:
        job_id = job_data.get('job_id')
        logger.info(f"Generating PDF report for job {job_id}")
        
        generator = PDFReportGenerator()
        
        # This would require actual job details from database
        # For now, we'll log and return a placeholder
        logger.info(f"PDF generation requested for {job_id}")
        
        return {
            'success': True,
            'job_id': job_id,
            'task': 'pdf_generation',
            'timestamp': datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"PDF generation task failed: {str(e)}")
        raise

@shared_task(bind=True, name="verify_integrity_task")
def verify_integrity_task(self, job_id: str, file_path: str, 
                         original_hash: str, investigator_id: str):
    """Celery task for verifying integrity"""
    try:
        logger.info(f"Verifying integrity for job {job_id}")
        
        from app.pipelines.unified_pipeline import UnifiedForensicPipeline
        pipeline = UnifiedForensicPipeline()
        
        result = pipeline.verify_integrity(
            file_path, original_hash, job_id, investigator_id
        )
        
        # Log the verification
        ForensicLogger.log_verification(
            job_id=job_id,
            investigator_id=investigator_id,
            original_hash=original_hash,
            current_hash=result.get('current_hash', ''),
            matches=result.get('matches', False)
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Integrity verification task failed: {str(e)}")
        raise
