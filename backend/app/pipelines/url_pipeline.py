import logging
from typing import Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.sql_models import Job
from app.services.downloader import URLDownloader
from app.pipelines.unified_pipeline import UnifiedForensicPipeline
from app.core.logger import ForensicLogger

logger = logging.getLogger(__name__)

class URLPipeline:
    """Pipeline for processing URLs"""
    
    def __init__(self):
        self.downloader = URLDownloader()
        self.unified_pipeline = UnifiedForensicPipeline()
    
    async def process_url(self, 
                         url: str, 
                         job_id: str, 
                         investigator_id: str, 
                         case_number: str = None) -> Dict[str, Any]:
        
        db: Session = SessionLocal()
        job = db.query(Job).filter(Job.id == job_id).first()
        
        try:
            # Stage 1: Validation & Status Update
            job.status = "processing"
            job.stage = "URL Validation"
            job.progress = 5.0
            db.commit()

            validation = self.downloader.validate_url(url)
            if not validation:
                raise ValueError("URL validation failed")
            
            platform = self.downloader.detect_platform(url)
            platform_str = platform.value if platform else 'web'
            
            # Stage 2: Download
            job.stage = "Downloading"
            job.progress = 15.0
            db.commit()
            
            ForensicLogger.log_processing(
                job_id=job_id,
                investigator_id=investigator_id,
                stage="download",
                details={"platform": platform_str}
            )
            
            download_result = await self.downloader.download(url)
            
            if not download_result['success']:
                raise Exception(f"Download failed: {download_result.get('error')}")
            
            # Stage 3: Unified Processing
            process_result = await self.unified_pipeline.process(
                file_path=download_result['file_path'],
                job_id=job_id,
                investigator_id=investigator_id,
                source='url',
                filename=os.path.basename(download_result['file_path']),
                original_url=url,
                platform_info={
                    'platform': platform_str,
                    'metadata': download_result.get('platform_metadata')
                }
            )
            
            return process_result
            
        except Exception as e:
            logger.error(f"URL pipeline failed for job {job_id}: {str(e)}")
            job.status = 'failed'
            job.notes = str(e)
            db.commit()
            return {'success': False, 'error': str(e)}
        finally:
            db.close()