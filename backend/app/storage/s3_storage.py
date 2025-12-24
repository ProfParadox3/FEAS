import boto3
from botocore.exceptions import ClientError
from typing import Dict, Any, Optional
import json
from datetime import datetime
import uuid
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)

class S3Storage:
    """S3-compatible storage adapter"""
    
    def __init__(self):
        self.client = boto3.client(
            's3',
            endpoint_url=settings.S3_ENDPOINT,
            aws_access_key_id=settings.S3_ACCESS_KEY,
            aws_secret_access_key=settings.S3_SECRET_KEY,
            region_name=settings.S3_REGION
        )
        self.bucket = settings.S3_BUCKET_NAME
        
        # Ensure bucket exists
        self._ensure_bucket()
    
    def _ensure_bucket(self):
        """Ensure the S3 bucket exists"""
        try:
            self.client.head_bucket(Bucket=self.bucket)
            logger.info(f"S3 bucket exists: {self.bucket}")
        except ClientError:
            try:
                self.client.create_bucket(Bucket=self.bucket)
                logger.info(f"Created S3 bucket: {self.bucket}")
            except Exception as e:
                logger.error(f"Failed to create S3 bucket: {str(e)}")
                raise
    
    async def store(self, file_path: str, job_id: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Store a file in S3"""
        try:
            import os
            from pathlib import Path
            
            source_path = Path(file_path)
            
            if not source_path.exists():
                raise FileNotFoundError(f"Source file not found: {file_path}")
            
            # Generate S3 key
            original_name = metadata.get('basic', {}).get('file_name', 'evidence')
            file_ext = Path(original_name).suffix or '.bin'
            s3_key = f"{job_id}/{uuid.uuid4().hex}{file_ext}"
            
            # Upload file
            self.client.upload_file(
                str(source_path),
                self.bucket,
                s3_key
            )
            
            # Upload metadata
            metadata_key = f"{job_id}/metadata.json"
            metadata_json = json.dumps(metadata, default=str)
            
            self.client.put_object(
                Bucket=self.bucket,
                Key=metadata_key,
                Body=metadata_json,
                ContentType='application/json'
            )
            
            # Get file info
            head_response = self.client.head_object(Bucket=self.bucket, Key=s3_key)
            
            return {
                'success': True,
                'path': s3_key,
                'location': f"s3://{self.bucket}/{s3_key}",
                'size': head_response['ContentLength'],
                'stored_at': datetime.utcnow().isoformat(),
                'etag': head_response.get('ETag', '')
            }
            
        except Exception as e:
            logger.error(f"S3 storage failed: {str(e)}")
            raise
    
    async def retrieve(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve a file from S3"""
        try:
            # List objects in job directory
            response = self.client.list_objects_v2(
                Bucket=self.bucket,
                Prefix=f"{job_id}/"
            )
            
            if 'Contents' not in response:
                return None
            
            # Find evidence file and metadata
            objects = response['Contents']
            evidence_key = None
            metadata_key = None
            
            for obj in objects:
                key = obj['Key']
                if key.endswith('metadata.json'):
                    metadata_key = key
                elif not key.endswith('/'):  # Not a directory
                    evidence_key = key
            
            if not evidence_key:
                return None
            
            # Get metadata
            metadata = {}
            if metadata_key:
                metadata_resp = self.client.get_object(
                    Bucket=self.bucket,
                    Key=metadata_key
                )
                metadata = json.loads(metadata_resp['Body'].read().decode('utf-8'))
            
            # Get evidence file info
            head_response = self.client.head_object(
                Bucket=self.bucket,
                Key=evidence_key
            )
            
            # Generate a presigned URL for download (valid for 1 hour)
            download_url = self.client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket, 'Key': evidence_key},
                ExpiresIn=3600
            )
            
            return {
                's3_key': evidence_key,
                'metadata': metadata,
                'size': head_response['ContentLength'],
                'download_url': download_url,
                'last_modified': head_response.get('LastModified')
            }
            
        except Exception as e:
            logger.error(f"S3 retrieval failed: {str(e)}")
            return None
    
    async def delete(self, job_id: str) -> bool:
        """Delete a job's files from S3"""
        try:
            # List all objects for this job
            response = self.client.list_objects_v2(
                Bucket=self.bucket,
                Prefix=f"{job_id}/"
            )
            
            if 'Contents' not in response:
                return True
            
            # Delete all objects
            objects = [{'Key': obj['Key']} for obj in response['Contents']]
            
            self.client.delete_objects(
                Bucket=self.bucket,
                Delete={'Objects': objects}
            )
            
            logger.info(f"Deleted {len(objects)} objects for job {job_id}")
            return True
            
        except Exception as e:
            logger.error(f"S3 deletion failed: {str(e)}")
            return False
    
    async def list_jobs(self) -> list:
        """List all jobs in S3"""
        try:
            jobs = []
            
            # List all prefixes (job directories)
            response = self.client.list_objects_v2(
                Bucket=self.bucket,
                Delimiter='/'
            )
            
            if 'CommonPrefixes' in response:
                for prefix in response['CommonPrefixes']:
                    job_id = prefix['Prefix'].rstrip('/')
                    
                    # Count files in this job
                    job_objects = self.client.list_objects_v2(
                        Bucket=self.bucket,
                        Prefix=f"{job_id}/"
                    )
                    
                    file_count = len(job_objects.get('Contents', [])) - 1  # Exclude metadata
                    
                    jobs.append({
                        'job_id': job_id,
                        'has_evidence': file_count > 0,
                        'file_count': file_count
                    })
            
            return jobs
            
        except Exception as e:
            logger.error(f"S3 listing failed: {str(e)}")
            return []