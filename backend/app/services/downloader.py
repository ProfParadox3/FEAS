import yt_dlp
import requests
import tempfile
import asyncio
from typing import Optional, Dict, Any
from urllib.parse import urlparse
import logging
from datetime import datetime
import os

from app.core.config import settings
from app.models.schemas import Platform

logger = logging.getLogger(__name__)

class URLDownloader:
    """Handles downloading of content from various platforms"""
    
    def __init__(self):
        self.allowed_domains = settings.ALLOWED_URL_DOMAINS
        
    def _is_domain_match(self, domain: str, allowed_domain: str) -> bool:
        """Securely check if domain matches or is a subdomain of allowed domain"""
        # Remove www. prefix
        if domain.startswith("www."):
            domain = domain[4:]
        
        # Exact match
        if domain == allowed_domain:
            return True
        
        # Subdomain match (must end with .allowed_domain)
        if domain.endswith("." + allowed_domain):
            return True
        
        return False
    
    def validate_url(self, url: str) -> bool:
        """Validate URL against whitelist using secure domain matching"""
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        
        if domain.startswith("www."):
            domain = domain[4:]
            
        return any(self._is_domain_match(domain, allowed) for allowed in self.allowed_domains)
    
    def detect_platform(self, url: str) -> Optional[Platform]:
        """Detect which platform the URL belongs to"""
        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        
        if domain.startswith("www."):
            domain = domain[4:]
        
        # Use secure domain matching
        if self._is_domain_match(domain, "twitter.com") or self._is_domain_match(domain, "x.com"):
            return Platform.TWITTER
        elif self._is_domain_match(domain, "youtube.com") or self._is_domain_match(domain, "youtu.be"):
            return Platform.YOUTUBE
        elif self._is_domain_match(domain, "facebook.com") or self._is_domain_match(domain, "fb.watch") or self._is_domain_match(domain, "fb.com"):
            return Platform.FACEBOOK
        elif self._is_domain_match(domain, "instagram.com"):
            return Platform.INSTAGRAM
        return None
    
    async def download_youtube(self, url: str) -> Dict[str, Any]:
        """Download content from YouTube"""
        ydl_opts = {
            'format': 'best[ext=mp4]/best',
            'outtmpl': '%(title)s.%(ext)s',
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
        }
        
        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                ydl_opts['outtmpl'] = os.path.join(tmpdir, '%(title)s.%(ext)s')
                
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=True)
                    filename = ydl.prepare_filename(info)
                    
                    # Get actual downloaded file
                    if os.path.exists(filename):
                        # Create a permanent temp file
                        permanent_temp = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
                        with open(filename, 'rb') as src, open(permanent_temp.name, 'wb') as dst:
                            dst.write(src.read())
                        
                        return {
                            'success': True,
                            'file_path': permanent_temp.name,
                            'platform_metadata': {
                                'title': info.get('title'),
                                'uploader': info.get('uploader'),
                                'upload_date': info.get('upload_date'),
                                'duration': info.get('duration'),
                                'view_count': info.get('view_count'),
                                'like_count': info.get('like_count')
                            },
                            'platform': Platform.YOUTUBE
                        }
                    
            return {'success': False, 'error': 'Download completed but file not found'}
                
        except Exception as e:
            logger.error(f"YouTube download failed: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    async def download_twitter(self, url: str) -> Dict[str, Any]:
        """Download content from Twitter/X"""
        ydl_opts = {
            'format': 'best',
            'outtmpl': '%(id)s.%(ext)s',
            'quiet': True,
            'no_warnings': True,
        }
        
        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                ydl_opts['outtmpl'] = os.path.join(tmpdir, '%(id)s.%(ext)s')
                
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=True)
                    filename = ydl.prepare_filename(info)
                    
                    if os.path.exists(filename):
                        permanent_temp = tempfile.NamedTemporaryFile(delete=False, suffix='.mp4')
                        with open(filename, 'rb') as src, open(permanent_temp.name, 'wb') as dst:
                            dst.write(src.read())
                        
                        return {
                            'success': True,
                            'file_path': permanent_temp.name,
                            'platform_metadata': {
                                'id': info.get('id'),
                                'uploader': info.get('uploader'),
                                'upload_date': info.get('upload_date'),
                                'title': info.get('title'),
                                'description': info.get('description')
                            },
                            'platform': Platform.TWITTER
                        }
            
            return {'success': False, 'error': 'Download completed but file not found'}
                
        except Exception as e:
            logger.error(f"Twitter download failed: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    async def download_facebook(self, url: str) -> Dict[str, Any]:
        """Download content from Facebook"""
        ydl_opts = {
            'format': 'best[ext=mp4]/best',
            'outtmpl': '%(id)s.%(ext)s',
            'quiet': True,
            'no_warnings': True,
        }
        
        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                ydl_opts['outtmpl'] = os.path.join(tmpdir, '%(id)s.%(ext)s')
                
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=True)
                    filename = ydl.prepare_filename(info)
                    
                    if os.path.exists(filename):
                        # Determine extension based on format
                        ext = os.path.splitext(filename)[1] or '.mp4'
                        permanent_temp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
                        with open(filename, 'rb') as src, open(permanent_temp.name, 'wb') as dst:
                            dst.write(src.read())
                        
                        return {
                            'success': True,
                            'file_path': permanent_temp.name,
                            'platform_metadata': {
                                'id': info.get('id'),
                                'title': info.get('title'),
                                'uploader': info.get('uploader'),
                                'upload_date': info.get('upload_date'),
                                'duration': info.get('duration'),
                                'view_count': info.get('view_count'),
                                'description': info.get('description')
                            },
                            'platform': Platform.FACEBOOK
                        }
            
            return {'success': False, 'error': 'Download completed but file not found'}
                
        except Exception as e:
            logger.error(f"Facebook download failed: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    async def download_instagram(self, url: str) -> Dict[str, Any]:
        """Download content from Instagram"""
        ydl_opts = {
            'format': 'best[ext=mp4]/best',
            'outtmpl': '%(id)s.%(ext)s',
            'quiet': True,
            'no_warnings': True,
        }
        
        try:
            with tempfile.TemporaryDirectory() as tmpdir:
                ydl_opts['outtmpl'] = os.path.join(tmpdir, '%(id)s.%(ext)s')
                
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info = ydl.extract_info(url, download=True)
                    filename = ydl.prepare_filename(info)
                    
                    if os.path.exists(filename):
                        # Determine extension based on format
                        ext = os.path.splitext(filename)[1] or '.mp4'
                        permanent_temp = tempfile.NamedTemporaryFile(delete=False, suffix=ext)
                        with open(filename, 'rb') as src, open(permanent_temp.name, 'wb') as dst:
                            dst.write(src.read())
                        
                        return {
                            'success': True,
                            'file_path': permanent_temp.name,
                            'platform_metadata': {
                                'id': info.get('id'),
                                'title': info.get('title'),
                                'uploader': info.get('uploader') or info.get('channel'),
                                'upload_date': info.get('upload_date'),
                                'duration': info.get('duration'),
                                'like_count': info.get('like_count'),
                                'comment_count': info.get('comment_count'),
                                'description': info.get('description')
                            },
                            'platform': Platform.INSTAGRAM
                        }
            
            return {'success': False, 'error': 'Download completed but file not found'}
                
        except Exception as e:
            logger.error(f"Instagram download failed: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    async def download_generic(self, url: str) -> Dict[str, Any]:
        """Download content from generic URLs"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, stream=True, timeout=30)
            response.raise_for_status()
            
            # Create temp file
            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=self._get_extension(url))
            
            # Download content
            file_size = 0
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    temp_file.write(chunk)
                    file_size += len(chunk)
                    
                    if file_size > settings.MAX_FILE_SIZE:
                        temp_file.close()
                        os.unlink(temp_file.name)
                        raise ValueError(f"File exceeds maximum size of {settings.MAX_FILE_SIZE} bytes")
            
            temp_file.close()
            
            return {
                'success': True,
                'file_path': temp_file.name,
                'platform_metadata': {
                    'url': url,
                    'content_type': response.headers.get('content-type'),
                    'file_size': file_size,
                    'download_timestamp': datetime.utcnow().isoformat()
                },
                'platform': None
            }
            
        except Exception as e:
            logger.error(f"Generic download failed: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _get_extension(self, url: str) -> str:
        """Extract file extension from URL"""
        parsed = urlparse(url)
        path = parsed.path
        if '.' in path:
            ext = '.' + path.split('.')[-1].split('?')[0]
            if len(ext) < 10:  # Sanity check for extension length
                return ext
        return '.bin'
    
    async def download(self, url: str) -> Dict[str, Any]:
        """Main download method"""
        if not self.validate_url(url):
            return {'success': False, 'error': 'URL domain not whitelisted'}
        
        platform = self.detect_platform(url)
        
        if platform == Platform.YOUTUBE:
            return await self.download_youtube(url)
        elif platform == Platform.TWITTER:
            return await self.download_twitter(url)
        elif platform == Platform.FACEBOOK:
            return await self.download_facebook(url)
        elif platform == Platform.INSTAGRAM:
            return await self.download_instagram(url)
        else:
            return await self.download_generic(url)