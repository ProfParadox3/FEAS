import hashlib
from typing import Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class HashService:
    """SHA-256 hashing service with verification capabilities"""
    
    CHUNK_SIZE = 8192
    
    @staticmethod
    def compute_file_hash(file_path: str) -> Optional[str]:
        """Compute SHA-256 hash of a file"""
        try:
            sha256_hash = hashlib.sha256()
            
            with open(file_path, "rb") as f:
                for byte_block in iter(lambda: f.read(HashService.CHUNK_SIZE), b""):
                    sha256_hash.update(byte_block)
            
            return sha256_hash.hexdigest()
            
        except Exception as e:
            logger.error(f"Hash computation failed: {str(e)}")
            return None
    
    @staticmethod
    def verify_hash(file_path: str, expected_hash: str) -> bool:
        """Verify file integrity by comparing hashes"""
        current_hash = HashService.compute_file_hash(file_path)
        return current_hash == expected_hash if current_hash else False
    
    @staticmethod
    def compute_stream_hash(file_like_object) -> Optional[str]:
        """Compute SHA-256 hash from a file-like object"""
        try:
            sha256_hash = hashlib.sha256()
            
            file_like_object.seek(0)
            for byte_block in iter(lambda: file_like_object.read(HashService.CHUNK_SIZE), b""):
                sha256_hash.update(byte_block)
            
            file_like_object.seek(0)
            return sha256_hash.hexdigest()
            
        except Exception as e:
            logger.error(f"Stream hash computation failed: {str(e)}")
            return None
    
    @staticmethod
    def compute_hash_with_progress(file_path: str, progress_callback=None) -> Optional[str]:
        """Compute hash with progress reporting"""
        try:
            sha256_hash = hashlib.sha256()
            file_size = Path(file_path).stat().st_size
            bytes_processed = 0
            
            with open(file_path, "rb") as f:
                for byte_block in iter(lambda: f.read(HashService.CHUNK_SIZE), b""):
                    sha256_hash.update(byte_block)
                    bytes_processed += len(byte_block)
                    
                    if progress_callback and file_size > 0:
                        progress = (bytes_processed / file_size) * 100
                        progress_callback(progress)
            
            return sha256_hash.hexdigest()
            
        except Exception as e:
            logger.error(f"Hash computation with progress failed: {str(e)}")
            return None