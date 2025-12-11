import asyncio
import tempfile
from typing import Dict, Any, Optional
import logging
from pathlib import Path
from datetime import datetime

from app.services.hashing import HashService
from app.services.metadata import MetadataExtractor
from app.services.storage import StorageService
from app.services.chain_of_custody import ChainOfCustodyLogger
from app.models.schemas import EvidenceSource
from app.core.logger import ForensicLogger

logger = logging.getLogger(__name__)

class UnifiedForensicPipeline:
    """Unified pipeline for processing all evidence types"""
    
    def __init__(self):
        self.hash_service = HashService()
        self.metadata_extractor = MetadataExtractor()
        self.storage_service = StorageService()
        self.custody_logger = ChainOfCustodyLogger()
    
    async def process(self,
                     file_path: str,
                     job_id: str,
                     investigator_id: str,
                     source: EvidenceSource,
                     platform_info: Optional[Dict[str, Any]] = None,
                     original_url: Optional[str] = None,
                     filename: Optional[str] = None) -> Dict[str, Any]:
        """Process evidence through unified forensic pipeline"""
        
        results = {
            'job_id': job_id,
            'source': source,
            'platform_info': platform_info,
            'original_url': original_url,
            'processing_stages': [],
            'errors': []
        }
        
        try:
            # Stage 1: Initial Verification
            await self._update_stage(job_id, "initial_verification", 10)
            ForensicLogger.log_processing(
                job_id=job_id,
                investigator_id=investigator_id,
                stage="initial_verification",
                details={"file_path": file_path}
            )
            
            # Verify file exists
            file_path_obj = Path(file_path)
            if not file_path_obj.exists():
                raise FileNotFoundError(f"File not found: {file_path}")
            
            # Stage 2: Compute Hash
            await self._update_stage(job_id, "hashing", 30)
            ForensicLogger.log_processing(
                job_id=job_id,
                investigator_id=investigator_id,
                stage="hashing",
                details={"algorithm": "SHA-256"}
            )
            
            sha256_hash = self.hash_service.compute_file_hash(file_path)
            if not sha256_hash:
                raise ValueError("Failed to compute file hash")
            
            results['sha256_hash'] = sha256_hash
            ForensicLogger.log_hash_computation(job_id, investigator_id, sha256_hash)
            
            # Stage 3: Extract Metadata
            await self._update_stage(job_id, "metadata_extraction", 50)
            ForensicLogger.log_processing(
                job_id=job_id,
                investigator_id=investigator_id,
                stage="metadata_extraction",
                details={"tools": ["ExifTool", "FFprobe"]}
            )
            
            metadata = self.metadata_extractor.extract_all_metadata(file_path)
            
            # Combine with basic info
            combined_metadata = {
                'file_name': filename or file_path_obj.name,
                'file_size': file_path_obj.stat().st_size,
                'mime_type': metadata.get('basic', {}).get('mime_type', 'unknown'),
                'sha256_hash': sha256_hash,
                'exif_data': metadata.get('exif'),
                'platform_metadata': platform_info.get('metadata') if platform_info else None,
                'media_metadata': metadata.get('media'),
                'extraction_timestamp': datetime.utcnow()
            }
            
            results['metadata'] = combined_metadata
            
            # Stage 4: Store Evidence
            await self._update_stage(job_id, "storage", 70)
            ForensicLogger.log_processing(
                job_id=job_id,
                investigator_id=investigator_id,
                stage="storage",
                details={"storage_type": self.storage_service.storage_type}
            )
            
            storage_result = await self.storage_service.store_evidence(
                file_path=file_path,
                job_id=job_id,
                metadata={
                    'basic': metadata.get('basic', {}),
                    'exif': metadata.get('exif', {}),
                    'media': metadata.get('media', {}),
                    'platform': platform_info,
                    'processing_info': {
                        'sha256_hash': sha256_hash,
                        'source': source.value,
                        'investigator_id': investigator_id,
                        'original_url': original_url,
                        'processing_timestamp': datetime.utcnow().isoformat()
                    }
                }
            )
            
            results['storage_location'] = storage_result['location']
            results['storage_path'] = storage_result['path']
            results['storage_result'] = storage_result
            
            # Stage 5: Finalize
            await self._update_stage(job_id, "finalization", 90)
            ForensicLogger.log_processing(
                job_id=job_id,
                investigator_id=investigator_id,
                stage="finalization",
                details={
                    "success": True,
                    "file_hash": sha256_hash,
                    "storage_location": storage_result['location']
                }
            )
            
            results['success'] = True
            results['completed_at'] = datetime.utcnow().isoformat()
            results['processing_stages'] = ['initialization', 'hashing', 'metadata_extraction', 'storage', 'finalization']
            
            # Cleanup temporary file if it was downloaded
            if source == EvidenceSource.URL and 'tmp' in file_path:
                try:
                    file_path_obj.unlink(missing_ok=True)
                    logger.info(f"Cleaned up temporary file: {file_path}")
                except Exception as e:
                    logger.warning(f"Failed to cleanup temp file: {str(e)}")
            
            return results
            
        except Exception as e:
            logger.error(f"Pipeline processing failed: {str(e)}")
            
            ForensicLogger.log_processing(
                job_id=job_id,
                investigator_id=investigator_id,
                stage="error",
                details={"error": str(e), "failed_stage": "pipeline_processing"}
            )
            
            results['success'] = False
            results['error'] = str(e)
            results['errors'].append(str(e))
            
            return results
    
    async def _update_stage(self, job_id: str, stage: str, progress: float):
        """Update processing stage"""
        logger.info(f"Job {job_id}: Stage {stage} - Progress: {progress}%")
        await asyncio.sleep(0.1)  # Simulate processing time
    
    def verify_integrity(self, 
                        file_path: str, 
                        original_hash: str,
                        job_id: str,
                        investigator_id: str) -> Dict[str, Any]:
        """Verify file integrity"""
        try:
            current_hash = self.hash_service.compute_file_hash(file_path)
            matches = current_hash == original_hash
            
            verification_details = {
                'original_hash': original_hash,
                'current_hash': current_hash,
                'matches': matches,
                'verification_timestamp': datetime.utcnow().isoformat(),
                'file_path': file_path
            }
            
            self.custody_logger.log_event(
                job_id=job_id,
                event="INTEGRITY_VERIFICATION",
                details=verification_details,
                investigator_id=investigator_id,
                hash_verification=current_hash
            )
            
            return {
                'success': True,
                'matches': matches,
                'original_hash': original_hash,
                'current_hash': current_hash,
                'verification_details': verification_details
            }
            
        except Exception as e:
            logger.error(f"Integrity verification failed: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'matches': False
            }