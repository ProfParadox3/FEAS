import logging
from typing import Dict, Any
from datetime import datetime

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
        """Process a URL through the pipeline"""
        
        results = {
            'job_id': job_id,
            'url': url,
            'stages': [],
            'errors': []
        }
        
        try:
            # Stage 1: URL Validation
            logger.info(f"Job {job_id}: Validating URL")
            ForensicLogger.log_processing(
                job_id=job_id,
                investigator_id=investigator_id,
                stage="url_validation",
                details={"url": url}
            )
            
            validation = self.downloader.validate_url(url)
            if not validation:
                raise ValueError("URL validation failed")
            
            platform = self.downloader.detect_platform(url)
            results['platform'] = platform.value if platform else 'web'
            
            # Stage 2: Download
            logger.info(f"Job {job_id}: Downloading content")
            ForensicLogger.log_processing(
                job_id=job_id,
                investigator_id=investigator_id,
                stage="download",
                details={"platform": results['platform']}
            )
            
            download_result = await self.downloader.download(url)
            
            if not download_result['success']:
                raise Exception(f"Download failed: {download_result.get('error')}")
            
            results['download_result'] = download_result
            
            # Stage 3: Unified Processing
            logger.info(f"Job {job_id}: Starting forensic processing")
            
            process_result = await self.unified_pipeline.process(
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
            
            # Combine results
            results.update(process_result)
            results['success'] = True
            results['completed_at'] = datetime.utcnow().isoformat()
            results['stages'] = ['validation', 'download', 'forensic_processing']
            
            return results
            
        except Exception as e:
            logger.error(f"URL pipeline failed for job {job_id}: {str(e)}")
            
            ForensicLogger.log_processing(
                job_id=job_id,
                investigator_id=investigator_id,
                stage="pipeline_error",
                details={"error": str(e), "url": url}
            )
            
            results['success'] = False
            results['error'] = str(e)
            results['errors'].append(str(e))
            
            return results