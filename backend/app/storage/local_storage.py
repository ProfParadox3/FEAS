import shutil
from pathlib import Path
from typing import Dict, Any, Optional
import json
from datetime import datetime
import uuid
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class LocalStorage:
    """Local filesystem storage adapter"""
    
    def __init__(self, base_path: str = None):
        self.base_path = Path(base_path or settings.LOCAL_STORAGE_PATH)
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    async def store(self, file_path: str, job_id: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Store a file locally"""
        try:
            source_path = Path(file_path)
            
            if not source_path.exists():
                raise FileNotFoundError(f"Source file not found: {file_path}")
            
            # Create job directory
            job_dir = self.base_path / job_id
            job_dir.mkdir(parents=True, exist_ok=True)
            
            # Generate unique filename
            original_name = metadata.get('basic', {}).get('file_name', 'evidence')
            file_ext = Path(original_name).suffix or '.bin'
            storage_name = f"{uuid.uuid4().hex}{file_ext}"
            dest_path = job_dir / storage_name
            
            # Copy file
            shutil.copy2(source_path, dest_path)
            
            # Store metadata
            metadata_path = job_dir / "metadata.json"
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2, default=str)
            
            return {
                'success': True,
                'path': str(dest_path),
                'location': f"local://{dest_path}",
                'size': dest_path.stat().st_size,
                'stored_at': datetime.utcnow().isoformat(),
                'job_dir': str(job_dir)
            }
            
        except Exception as e:
            logger.error(f"Local storage failed: {str(e)}")
            raise
    
    async def retrieve(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a file from local storage"""
        try:
            job_dir = self.base_path / job_id
            
            if not job_dir.exists():
                return None
            
            # Find the evidence file (skip metadata.json)
            evidence_files = [f for f in job_dir.iterdir() 
                            if f.is_file() and f.name != "metadata.json"]
            
            if not evidence_files:
                return None
            
            evidence_file = evidence_files[0]
            
            # Load metadata
            metadata_path = job_dir / "metadata.json"
            metadata = {}
            if metadata_path.exists():
                with open(metadata_path, 'r') as f:
                    metadata = json.load(f)
            
            return {
                'file_path': str(evidence_file),
                'metadata': metadata,
                'size': evidence_file.stat().st_size,
                'job_dir': str(job_dir)
            }
            
        except Exception as e:
            logger.error(f"Local retrieval failed: {str(e)}")
            return None
    
    async def delete(self, job_id: str) -> bool:
        """Delete a job's files"""
        try:
            job_dir = self.base_path / job_id
            
            if job_dir.exists():
                shutil.rmtree(job_dir)
                logger.info(f"Deleted job directory: {job_dir}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Local deletion failed: {str(e)}")
            return False
    
    async def list_jobs(self) -> list:
        """List all jobs in storage"""
        try:
            jobs = []
            
            for job_dir in self.base_path.iterdir():
                if job_dir.is_dir():
                    # Check if it has evidence files
                    evidence_files = [f for f in job_dir.iterdir() 
                                    if f.is_file() and f.name != "metadata.json"]
                    
                    if evidence_files:
                        jobs.append({
                            'job_id': job_dir.name,
                            'has_evidence': True,
                            'file_count': len(evidence_files)
                        })
            
            return jobs
            
        except Exception as e:
            logger.error(f"Local listing failed: {str(e)}")
            return []