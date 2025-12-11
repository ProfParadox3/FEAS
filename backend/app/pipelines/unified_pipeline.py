import asyncio
import os
import magic # Requires `pip install python-magic`
from datetime import datetime
from sqlalchemy.orm import Session

# Import database models and session manager
from app.db.session import SessionLocal
from app.models.sql_models import ChainOfCustody, Job
# Import Pydantic schemas for data validation and PDF generation
from app.models.schemas import JobDetailsResponse, EvidenceSource, JobStatus
# Import all required services
from app.services.hashing import HashService
from app.services.metadata import MetadataExtractor
from app.services.storage import StorageService
from app.services.pdf_generator import PDFReportGenerator
from app.core.logger import ForensicLogger

logger = ForensicLogger()

class UnifiedForensicPipeline:
    
    def __init__(self):
        """Initializes all necessary services for the pipeline stages."""
        self.hash_service = HashService()
        self.metadata_extractor = MetadataExtractor()
        self.storage_service = StorageService()
        self.pdf_generator = PDFReportGenerator()

    async def process(self, file_path: str, job_id: str, investigator_id: str, source: str, filename: str = None):
        """
        Main processing pipeline:
        1. Hashes the file (integrity).
        2. Extracts metadata.
        3. Stores the evidence in defined storage.
        4. Generates a comprehensive PDF report.
        5. Logs all steps in the Chain of Custody (database).
        """
        db: Session = SessionLocal()
        job = db.query(Job).filter(Job.id == job_id).first()
        
        if not job:
            db.close()
            raise ValueError(f"Job ID {job_id} not found in database.")

        try:
            # --- 1. Hashing ---
            job.stage = "Hashing"
            job.progress = 10.0
            db.commit()

            # Correct method name: compute_file_hash
            sha256_hash = self.hash_service.compute_file_hash(file_path)

            log = ChainOfCustody(
                job_id=job_id,
                event="HASH_CALCULATED",
                investigator_id=investigator_id,
                details={"algorithm": "SHA256"},
                hash_verification=sha256_hash
            )
            db.add(log)
            db.commit()

            # --- 2. Metadata ---
            job.stage = "Metadata Extraction"
            job.progress = 30.0
            db.commit()

            # Correct method name: extract_all_metadata
            metadata = self.metadata_extractor.extract_all_metadata(file_path)
            
            # Determine MIME type using python-magic
            try:
                mime_type = magic.from_file(file_path, mime=True)
            except Exception:
                mime_type = "application/octet-stream"
            
            file_size = os.path.getsize(file_path)

            log = ChainOfCustody(
                job_id=job_id,
                event="METADATA_EXTRACTED",
                investigator_id=investigator_id,
                details={"mime_type": mime_type, "file_size": file_size}
            )
            db.add(log)
            db.commit()
            
            # --- 3. Storage ---
            job.stage = "Evidence Storage"
            job.progress = 60.0
            db.commit()
            
            final_filename = filename or os.path.basename(file_path)
            
            # Prepare metadata dict for storage service
            storage_metadata = {
                'basic': {'file_name': final_filename, 'file_size': file_size, 'mime_type': mime_type},
                'processing_info': {'sha256_hash': sha256_hash, 'investigator_id': investigator_id}
            }

            # Correct method name: store_evidence
            storage_result = await self.storage_service.store_evidence(
                file_path=file_path, 
                job_id=job_id, 
                metadata=storage_metadata
            )

            # Update Job record with final details
            job.storage_path = storage_result.get('path')
            job.sha256_hash = sha256_hash
            job.file_size = file_size
            job.mime_type = mime_type
            
            log = ChainOfCustody(
                job_id=job_id,
                event="EVIDENCE_STORED",
                investigator_id=investigator_id,
                details={"location": storage_result.get('location')}
            )
            db.add(log)
            db.commit()

            # --- 4. Report Generation ---
            job.stage = "Generating Report"
            job.progress = 90.0
            db.commit()
            
            # Fetch all logs for the Chain of Custody section in the report
            current_logs = db.query(ChainOfCustody).filter(ChainOfCustody.job_id == job_id).order_by(ChainOfCustody.timestamp).all()
            
            # Construct the Pydantic model (JobDetailsResponse) for the PDF Generator
            job_details_obj = JobDetailsResponse(
                job_id=job.id,
                status=JobStatus.COMPLETED,
                source=job.source,
                platform=None, 
                metadata={
                    "file_name": job.filename or final_filename,
                    "file_size": job.file_size,
                    "mime_type": job.mime_type,
                    "sha256_hash": job.sha256_hash,
                    "extraction_timestamp": datetime.utcnow(),
                    "exif_data": metadata.get("exif"),
                    "media_metadata": metadata.get("media")
                },
                chain_of_custody=[
                    {
                        "timestamp": log.timestamp,
                        "event": log.event,
                        "details": log.details,
                        "investigator_id": log.investigator_id,
                        "hash_verification": log.hash_verification
                    } for log in current_logs
                ],
                created_at=job.created_at,
                completed_at=datetime.utcnow(),
                file_path=job.storage_path,
                storage_location=storage_result.get('location')
            )

            # Generate PDF
            pdf_path = self.pdf_generator.generate_report(job_details_obj)
            
            log = ChainOfCustody(
                job_id=job_id,
                event="REPORT_GENERATED",
                investigator_id=investigator_id,
                details={"report_path": pdf_path}
            )
            db.add(log)
            
            # Finalize Job
            job.status = 'completed'
            job.progress = 100.0
            job.completed_at = datetime.utcnow()
            db.commit()
            
            return {
                "success": True, 
                "storage_path": job.storage_path, 
                "sha256_hash": sha256_hash, 
                "pdf_path": pdf_path
            }

        except Exception as e:
            # Handle failure: set job status to failed and log the error
            logger.error(f"Pipeline failed for job {job_id}: {str(e)}")
            job.status = 'failed'
            job.notes = str(e)
            db.commit()
            raise 
        finally:
            db.close()
