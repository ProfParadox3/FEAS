import logging
import shutil
import json
from pathlib import Path
from datetime import datetime
import uuid
from typing import Dict, Any

from app.core.config import settings

logger = logging.getLogger(__name__)

class StorageService:
    """Storage service for handling evidence files"""
    
    storage_type = settings.STORAGE_TYPE
    
    @classmethod
    async def initialize(cls):
        """Initialize storage service"""
        if cls.storage_type == "local":
            Path(settings.LOCAL_STORAGE_PATH).mkdir(parents=True, exist_ok=True)
            logger.info(f"Local storage initialized at {settings.LOCAL_STORAGE_PATH}")
    
    @classmethod
    async def store_evidence(cls, file_path: str, job_id: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Store evidence file"""
        if cls.storage_type == "local":
            return await cls._store_local(file_path, job_id, metadata)
        else:
            raise ValueError(f"Unsupported storage type: {cls.storage_type}")

    @classmethod
    async def _store_local(cls, file_path: str, job_id: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Store file in local filesystem"""
        source_path = Path(file_path)
        
        # Create job directory
        job_dir = Path(settings.LOCAL_STORAGE_PATH) / job_id
        job_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        original_name = metadata.get('basic', {}).get('file_name', 'evidence')
        file_ext = Path(original_name).suffix
        if not file_ext:
            file_ext = source_path.suffix
            
        storage_name = f"{uuid.uuid4().hex}{file_ext}"
        dest_path = job_dir / storage_name
        
        # Copy file
        shutil.copy2(source_path, dest_path)
        
        # Create metadata file
        metadata_file = job_dir / "metadata.json"
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2, default=str)
        
        return {
            'success': True,
            'path': str(dest_path),
            'location': f"local://{dest_path}",
            'size': dest_path.stat().st_size,
            'stored_at': datetime.utcnow().isoformat()
        }