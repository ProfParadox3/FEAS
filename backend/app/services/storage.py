from typing import Dict, Any, Optional
import logging
from pathlib import Path
import shutil
from datetime import datetime
import uuid
import os

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
        elif cls.storage_type == "s3":
            await cls._initialize_s3()
    
    @classmethod
    async def _initialize_s3(cls):
        """Initialize S3 storage"""
        try:
            import boto3
            from botocore.exceptions import ClientError
            
            cls.s3_client = boto3.client(
                's3',
                endpoint_url=settings.S3_ENDPOINT,
                aws_access_key_id=settings.S3_ACCESS_KEY,
                aws_secret_access_key=settings.S3_SECRET_KEY,
                region_name=settings.S3_REGION
            )
            
            # Create bucket if it doesn't exist
            try:
                cls.s3_client.head_bucket(Bucket=settings.S3_BUCKET_NAME)
            except ClientError:
                cls.s3_client.create_bucket(Bucket=settings.S3_BUCKET_NAME)
            
            logger.info(f"S3 storage initialized with bucket {settings.S3_BUCKET_NAME}")
            
        except ImportError:
            logger.error("boto3 not installed. Install with: pip install boto3")
            raise
        except Exception as e:
            logger.error(f"S3 initialization failed: {str(e)}")
            raise
    
    @classmethod
    async def store_evidence(cls, file_path: str, job_id: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Store evidence file"""
        try:
            if cls.storage_type == "local":
                return await cls._store_local(file_path, job_id, metadata)
            elif cls.storage_type == "s3":
                return await cls._store_s3(file_path, job_id, metadata)
            else:
                raise ValueError(f"Unsupported storage type: {cls.storage_type}")
                
        except Exception as e:
            logger.error(f"Evidence storage failed: {str(e)}")
            raise
    
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
        storage_name = f"{uuid.uuid4().hex}{file_ext}"
        dest_path = job_dir / storage_name
        
        # Copy file
        shutil.copy2(source_path, dest_path)
        
        # Create metadata file
        metadata_file = job_dir / "metadata.json"
        with open(metadata_file, 'w') as f:
            import json
            json.dump(metadata, f, indent=2, default=str)
        
        return {
            'success': True,
            'path': str(dest_path),
            'location': f"local://{dest_path}",
            'size': dest_path.stat().st_size,
            'stored_at': datetime.utcnow().isoformat()
        }
    
    @classmethod
    async def _store_s3(cls, file_path: str, job_id: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Store file in S3"""
        try:
            source_path = Path(file_path)
            original_name = metadata.get('basic', {}).get('file_name', 'evidence')
            file_ext = Path(original_name).suffix
            s3_key = f"{job_id}/{uuid.uuid4().hex}{file_ext}"
            
            # Upload file to S3
            cls.s3_client.upload_file(
                str(source_path),
                settings.S3_BUCKET_NAME,
                s3_key
            )
            
            # Upload metadata
            metadata_key = f"{job_id}/metadata.json"
            import json
            metadata_json = json.dumps(metadata, default=str)
            
            cls.s3_client.put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=metadata_key,
                Body=metadata_json,
                ContentType='application/json'
            )
            
            return {
                'success': True,
                'path': s3_key,
                'location': f"s3://{settings.S3_BUCKET_NAME}/{s3_key}",
                'size': source_path.stat().st_size,
                'stored_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"S3 storage failed: {str(e)}")
            raise
    
    @classmethod
    async def retrieve_evidence(cls, job_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve evidence file"""
        try:
            if cls.storage_type == "local":
                job_dir = Path(settings.LOCAL_STORAGE_PATH) / job_id
                if not job_dir.exists():
                    return None
                
                # Find evidence file
                evidence_files = list(job_dir.glob("*"))
                evidence_files = [f for f in evidence_files if f.name != "metadata.json"]
                
                if not evidence_files:
                    return None
                
                evidence_file = evidence_files[0]
                metadata_file = job_dir / "metadata.json"
                
                metadata = {}
                if metadata_file.exists():
                    import json
                    with open(metadata_file, 'r') as f:
                        metadata = json.load(f)
                
                return {
                    'path': str(evidence_file),
                    'metadata': metadata,
                    'size': evidence_file.stat().st_size
                }
            
            elif cls.storage_type == "s3":
                # List objects in job directory
                response = cls.s3_client.list_objects_v2(
                    Bucket=settings.S3_BUCKET_NAME,
                    Prefix=f"{job_id}/"
                )
                
                if 'Contents' not in response:
                    return None
                
                # Find evidence file (not metadata.json)
                objects = response['Contents']
                evidence_obj = None
                metadata_obj = None
                
                for obj in objects:
                    key = obj['Key']
                    if key.endswith('metadata.json'):
                        metadata_obj = obj
                    elif not key.endswith('/'):
                        evidence_obj = obj
                
                if not evidence_obj:
                    return None
                
                # Download metadata
                metadata = {}
                if metadata_obj:
                    metadata_resp = cls.s3_client.get_object(
                        Bucket=settings.S3_BUCKET_NAME,
                        Key=metadata_obj['Key']
                    )
                    import json
                    metadata = json.loads(metadata_resp['Body'].read().decode('utf-8'))
                
                return {
                    'path': evidence_obj['Key'],
                    'metadata': metadata,
                    'size': evidence_obj['Size']
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Evidence retrieval failed: {str(e)}")
            return None
    
    @classmethod
    async def check_health(cls) -> Dict[str, Any]:
        """Check storage health"""
        try:
            if cls.storage_type == "local":
                storage_path = Path(settings.LOCAL_STORAGE_PATH)
                if storage_path.exists():
                    # Check disk space
                    import shutil
                    total, used, free = shutil.disk_usage(str(storage_path))
                    
                    return {
                        'status': 'healthy',
                        'type': 'local',
                        'path': str(storage_path),
                        'disk_space': {
                            'total': total,
                            'used': used,
                            'free': free,
                            'percent_used': (used / total) * 100
                        }
                    }
                else:
                    return {'status': 'unhealthy', 'error': 'Storage path does not exist'}
            
            elif cls.storage_type == "s3":
                try:
                    cls.s3_client.head_bucket(Bucket=settings.S3_BUCKET_NAME)
                    return {
                        'status': 'healthy',
                        'type': 's3',
                        'bucket': settings.S3_BUCKET_NAME
                    }
                except Exception as e:
                    return {'status': 'unhealthy', 'error': str(e)}
            
            return {'status': 'unknown', 'error': 'Unknown storage type'}
            
        except Exception as e:
            return {'status': 'unhealthy', 'error': str(e)}