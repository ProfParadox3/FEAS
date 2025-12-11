import asyncio
import tempfile
import os
import shutil
import magic
from datetime import datetime
from sqlalchemy.orm import Session

# Import the new DB model and session
from app.db.session import SessionLocal
from app.models.sql_models import ChainOfCustody, Job
from app.services.hashing import Hasher
from app.services.metadata import MetadataExtractor
from app.services.storage import StorageService
from app.services.pdf_generator import PDFReportGenerator
from app.core.logger import ForensicLogger

logger = ForensicLogger()
hasher = Hasher()
metadata_extractor = MetadataExtractor()
storage_service = StorageService()
pdf_generator = PDFReportGenerator()

logger = logging.getLogger(__name__)

class UnifiedForensicPipeline:
    """Unified pipeline for processing all evidence types"""
    
    async def process(self, file_path: str, job_id: str, investigator_id: str, source: str, filename: str = None):
        """Main processing pipeline for both URL and Upload jobs."""
        db: Session = SessionLocal()
        job = db.query(Job).filter(Job.id == job_id).first()
        
        if not job:
            db.close()
            raise ValueError(f"Job ID {job_id} not found.")

        try:
            # --- 1. Hashing & Verification (Critical Chain of Custody Step) ---
            job.stage = "Hashing"
            job.progress = 5.0 if source == 'url' else 25.0 # Progress adjusted
            db.commit()

            sha256_hash = hasher.calculate_hash(file_path)

            log = ChainOfCustody(
                job_id=job_id,
                event="HASH_CALCULATED",
                investigator_id=investigator_id,
                details={"algorithm": "SHA256"},
                hash_verification=sha256_hash
            )
            db.add(log)
            db.commit()

            # --- 2. Metadata Extraction ---
            job.stage = "Metadata Extraction"
            job.progress += 10.0
            db.commit()

            metadata = metadata_extractor.extract(file_path)
            mime_type = magic.from_file(file_path, mime=True)
            file_size = os.path.getsize(file_path)

            log = ChainOfCustody(
                job_id=job_id,
                event="METADATA_EXTRACTED",
                investigator_id=investigator_id,
                details=metadata
            )
            db.add(log)
            db.commit()
            
            # --- 3. Persistent Storage (Saving the Evidence File) ---
            job.stage = "Evidence Storage"
            job.progress += 10.0
            db.commit()
            
            # Determine the final file name for storage
            final_filename = filename or os.path.basename(file_path)
            
            # The storage service moves the file to the final storage location
            storage_path = await storage_service.save_file(
                file_path=file_path, 
                job_id=job_id, 
                original_filename=final_filename
            )

            log = ChainOfCustody(
                job_id=job_id,
                event="EVIDENCE_STORED",
                investigator_id=investigator_id,
                details={"storage_path": storage_path, "sha256_hash_on_storage": sha256_hash}
            )
            db.add(log)
            db.commit()
            
            # --- 4. Forensic Analysis (Placeholder for ImageDetecter) ---
            job.stage = "Forensic Analysis"
            job.progress = 70.0
            db.commit()
            
            # TODO: Integrate your specific Image Detecter code here
            analysis_results = {"status": "Analysis Placeholder: Image analysis performed."}
            
            log = ChainOfCustody(
                job_id=job_id,
                event="FORENSIC_ANALYSIS_COMPLETE",
                investigator_id=investigator_id,
                details=analysis_results
            )
            db.add(log)
            db.commit()

            # --- 5. Generate Final Report (PDF) ---
            job.stage = "Generating Report"
            job.progress = 90.0
            db.commit()
            
            # Pass all collected data and logs to the generator
            pdf_path = pdf_generator.generate_report(
                job_details={
                    "job": job, 
                    "metadata": metadata, 
                    "hash": sha256_hash, 
                    "logs": job.custody_logs,
                    "analysis": analysis_results
                }
            )
            
            log = ChainOfCustody(
                job_id=job_id,
                event="REPORT_GENERATED",
                investigator_id=investigator_id,
                details={"report_path": pdf_path}
            )
            db.add(log)
            db.commit()
            
            return {
                "success": True, 
                "storage_path": storage_path, 
                "sha256_hash": sha256_hash, 
                "metadata": {"mime_type": mime_type, "file_size": file_size, **metadata},
                "pdf_path": pdf_path # Return the PDF path for safety
            }

        except Exception as e:
            logger.error(f"Pipeline failed for job {job_id}: {str(e)}")
            raise
        finally:
            db.close()
    
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