import logging
from typing import Dict, Any
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.sql_models import Job
from app.pipelines.unified_pipeline import UnifiedForensicPipeline
from app.services.validator import FileValidator

# Use standard logger
logger = logging.getLogger(__name__)

class UploadPipeline:
    def __init__(self):
        self.validator = FileValidator()
        self.unified_pipeline = UnifiedForensicPipeline()
    
    async def process_file_path(self,
                              file_path: str,
                              filename: str,
                              job_id: str,
                              investigator_id: str) -> Dict[str, Any]:
        """Process an existing file through the pipeline"""
        db: Session = SessionLocal()
        job = db.query(Job).filter(Job.id == job_id).first()
        
        try:
            job.status = "processing"
            job.stage = "File Validation"
            job.progress = 5.0
            db.commit()

            # Validate the file
            safety_check = self.validator.check_file_safety(file_path)
            if not safety_check['safe']:
                raise ValueError(f"File safety check failed: {safety_check['error']}")
            
            # Process through unified pipeline
            process_result = await self.unified_pipeline.process(
                file_path=file_path,
                job_id=job_id,
                investigator_id=investigator_id,
                source='local_upload',
                filename=filename
            )
            
            return process_result
            
        except Exception as e:
            # Standard logger used here
            logger.error(f"File path processing failed: {str(e)}")
            if job:
                job.status = 'failed'
                job.notes = str(e)
                db.commit()
            raise
        finally:
            db.close()