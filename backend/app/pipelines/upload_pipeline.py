import logging
from typing import Dict, Any
from datetime import datetime
import tempfile
import shutil

from app.pipelines.unified_pipeline import UnifiedForensicPipeline
from app.services.validator import FileValidator
from app.core.logger import ForensicLogger

logger = logging.getLogger(__name__)

class UploadPipeline:
    """Pipeline for processing uploaded files"""
    
    def __init__(self):
        self.validator = FileValidator()
        self.unified_pipeline = UnifiedForensicPipeline()
    
    async def process_upload(self,
                           file_content: bytes,
                           filename: str,
                           job_id: str,
                           investigator_id: str,
                           case_number: str = None) -> Dict[str, Any]:
        """Process an uploaded file through the pipeline"""
        
        results = {
            'job_id': job_id,
            'filename': filename,
            'stages': [],
            'errors': []
        }
        
        temp_file = None
        
        try:
            # Stage 1: Save to temporary file
            logger.info(f"Job {job_id}: Saving uploaded file")
            ForensicLogger.log_processing(
                job_id=job_id,
                investigator_id=investigator_id,
                stage="file_save",
                details={"filename": filename}
            )
            
            # Create temp file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=f"_{filename}")
            temp_file.write(file_content)
            temp_file.close()
            
            # Stage 2: File Validation
            logger.info(f"Job {job_id}: Validating file")
            ForensicLogger.log_processing(
                job_id=job_id,
                investigator_id=investigator_id,
                stage="file_validation",
                details={"temp_path": temp_file.name}
            )
            
            # Use the validator to check the saved file
            safety_check = self.validator.check_file_safety(temp_file.name)
            if not safety_check['safe']:
                raise ValueError(f"File safety check failed: {safety_check['error']}")
            
            # Stage 3: Unified Processing
            logger.info(f"Job {job_id}: Starting forensic processing")
            
            process_result = await self.unified_pipeline.process(
                file_path=temp_file.name,
                job_id=job_id,
                investigator_id=investigator_id,
                source='local_upload',
                filename=filename
            )
            
            if not process_result['success']:
                raise Exception(f"Processing failed: {process_result.get('error')}")
            
            # Combine results
            results.update(process_result)
            results['success'] = True
            results['completed_at'] = datetime.utcnow().isoformat()
            results['stages'] = ['file_save', 'validation', 'forensic_processing']
            
            return results
            
        except Exception as e:
            logger.error(f"Upload pipeline failed for job {job_id}: {str(e)}")
            
            ForensicLogger.log_processing(
                job_id=job_id,
                investigator_id=investigator_id,
                stage="pipeline_error",
                details={"error": str(e), "filename": filename}
            )
            
            results['success'] = False
            results['error'] = str(e)
            results['errors'].append(str(e))
            
            return results
            
        finally:
            # Cleanup temp file
            if temp_file:
                import os
                try:
                    os.unlink(temp_file.name)
                except:
                    pass
    
    async def process_file_path(self,
                              file_path: str,
                              filename: str,
                              job_id: str,
                              investigator_id: str) -> Dict[str, Any]:
        """Process an existing file through the pipeline"""
        
        try:
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
            logger.error(f"File path processing failed: {str(e)}")
            raise