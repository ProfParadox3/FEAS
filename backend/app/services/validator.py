import magic
from typing import Dict, Any
import logging
from fastapi import UploadFile
from urllib.parse import urlparse

from app.core.config import settings

logger = logging.getLogger(__name__)

class FileValidator:
    """Validates files and URLs for forensic processing"""
    
    def __init__(self):
        self.allowed_mime_types = settings.ALLOWED_MIME_TYPES
        self.max_file_size = settings.MAX_FILE_SIZE
        self.allowed_domains = settings.ALLOWED_URL_DOMAINS
    
    def validate_upload_file(self, file: UploadFile) -> Dict[str, Any]:
        """Validate uploaded file"""
        try:
            # Check file size
            file.file.seek(0, 2)  # Seek to end
            file_size = file.file.tell()
            file.file.seek(0)  # Reset to beginning
            
            if file_size > self.max_file_size:
                return {
                    'valid': False,
                    'error': f'File size {file_size} exceeds maximum allowed {self.max_file_size}'
                }
            
            # Check file extension
            filename = file.filename.lower()
            allowed_extensions = ['.jpg', '.jpeg', '.png', '.heic', '.heif', 
                                 '.mp4', '.mov', '.avi', '.mp3', '.wav']
            
            if not any(filename.endswith(ext) for ext in allowed_extensions):
                return {
                    'valid': False,
                    'error': f'File extension not allowed. Allowed: {allowed_extensions}'
                }
            
            # Read first 2048 bytes for MIME detection
            file_bytes = file.file.read(2048)
            file.file.seek(0)
            
            mime = magic.Magic(mime=True)
            mime_type = mime.from_buffer(file_bytes)
            
            if mime_type not in self.allowed_mime_types:
                return {
                    'valid': False,
                    'error': f'MIME type {mime_type} not allowed'
                }
            
            return {
                'valid': True,
                'file_size': file_size,
                'mime_type': mime_type
            }
            
        except Exception as e:
            logger.error(f"File validation failed: {str(e)}")
            return {
                'valid': False,
                'error': f'Validation error: {str(e)}'
            }
    
    def validate_url(self, url: str) -> Dict[str, Any]:
        """Validate URL for acquisition"""
        try:
            parsed = urlparse(url)
            
            if not parsed.scheme in ['http', 'https']:
                return {
                    'valid': False,
                    'error': 'URL must use HTTP or HTTPS protocol'
                }
            
            domain = parsed.netloc.lower()
            if domain.startswith("www."):
                domain = domain[4:]
            
            if not any(allowed in domain for allowed in self.allowed_domains):
                return {
                    'valid': False,
                    'error': f'Domain {domain} not in allowed list'
                }
            
            return {
                'valid': True,
                'domain': domain,
                'platform': self._detect_platform(domain)
            }
            
        except Exception as e:
            logger.error(f"URL validation failed: {str(e)}")
            return {
                'valid': False,
                'error': f'URL validation error: {str(e)}'
            }
    
    def _detect_platform(self, domain: str) -> str:
        """Detect platform from domain"""
        if "twitter.com" in domain or "x.com" in domain:
            return "twitter"
        elif "youtube.com" in domain or "youtu.be" in domain:
            return "youtube"
        return "web"
    
    def validate_filename(self, filename: str) -> bool:
        """Validate filename for security"""
        import re
        
        # Prevent path traversal
        if '..' in filename or '/' in filename or '\\' in filename:
            return False
        
        # Allow only safe characters
        if not re.match(r'^[\w\-. ]+$', filename):
            return False
        
        # Limit length
        if len(filename) > 255:
            return False
        
        return True
    
    def check_file_safety(self, file_path: str) -> Dict[str, Any]:
        """Perform additional safety checks on file"""
        try:
            import os
            from pathlib import Path
            
            path = Path(file_path)
            
            # Check if file exists
            if not path.exists():
                return {'safe': False, 'error': 'File does not exist'}
            
            # Check file size
            file_size = path.stat().st_size
            if file_size > self.max_file_size:
                return {'safe': False, 'error': 'File too large'}
            
            # Check MIME type
            mime = magic.Magic(mime=True)
            mime_type = mime.from_file(str(path))
            
            if mime_type not in self.allowed_mime_types:
                return {'safe': False, 'error': f'Unsupported MIME type: {mime_type}'}
            
            return {
                'safe': True,
                'file_size': file_size,
                'mime_type': mime_type
            }
            
        except Exception as e:
            return {'safe': False, 'error': str(e)}