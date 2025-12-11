import subprocess
import json
import exifread
from typing import Dict, Any, Optional
import magic
from pathlib import Path
import logging
from datetime import datetime
import ffmpeg
import tempfile

logger = logging.getLogger(__name__)

class MetadataExtractor:
    """Extracts metadata from various file types"""
    
    @staticmethod
    def get_mime_type(file_path: str) -> str:
        """Get MIME type using python-magic"""
        try:
            mime = magic.Magic(mime=True)
            return mime.from_file(file_path)
        except Exception as e:
            logger.error(f"MIME type detection failed: {str(e)}")
            return "application/octet-stream"
    
    @staticmethod
    def extract_image_metadata(file_path: str) -> Dict[str, Any]:
        """Extract EXIF metadata from images"""
        try:
            with open(file_path, 'rb') as f:
                tags = exifread.process_file(f, details=False)
            
            metadata = {}
            for tag, value in tags.items():
                if tag not in ('JPEGThumbnail', 'TIFFThumbnail', 'Filename', 'EXIF MakerNote'):
                    try:
                        if hasattr(value, 'printable'):
                            metadata[tag] = str(value.printable)
                        else:
                            metadata[tag] = str(value)
                    except:
                        metadata[tag] = "Unserializable data"
            
            return metadata
            
        except Exception as e:
            logger.error(f"EXIF extraction failed: {str(e)}")
            return {}
    
    @staticmethod
    def extract_video_metadata(file_path: str) -> Dict[str, Any]:
        """Extract metadata from video files using ffprobe"""
        try:
            # Use ffmpeg-python to probe video
            probe = ffmpeg.probe(file_path)
            
            metadata = {
                'format': probe.get('format', {}),
                'streams': probe.get('streams', []),
            }
            
            # Extract basic info
            format_info = probe.get('format', {})
            if format_info:
                metadata.update({
                    'duration': format_info.get('duration'),
                    'bit_rate': format_info.get('bit_rate'),
                    'size': format_info.get('size'),
                    'format_name': format_info.get('format_name'),
                })
            
            # Extract video stream info
            video_streams = [s for s in probe.get('streams', []) if s.get('codec_type') == 'video']
            if video_streams:
                video = video_streams[0]
                metadata['video'] = {
                    'codec': video.get('codec_name'),
                    'width': video.get('width'),
                    'height': video.get('height'),
                    'frame_rate': video.get('r_frame_rate'),
                    'duration': video.get('duration'),
                }
            
            # Extract audio stream info
            audio_streams = [s for s in probe.get('streams', []) if s.get('codec_type') == 'audio']
            if audio_streams:
                audio = audio_streams[0]
                metadata['audio'] = {
                    'codec': audio.get('codec_name'),
                    'sample_rate': audio.get('sample_rate'),
                    'channels': audio.get('channels'),
                }
            
            return metadata
            
        except Exception as e:
            logger.error(f"FFprobe extraction failed: {str(e)}")
            return {}
    
    @staticmethod
    def extract_audio_metadata(file_path: str) -> Dict[str, Any]:
        """Extract metadata from audio files"""
        try:
            probe = ffmpeg.probe(file_path)
            
            metadata = {
                'format': probe.get('format', {}),
                'streams': probe.get('streams', []),
            }
            
            format_info = probe.get('format', {})
            if format_info:
                metadata.update({
                    'duration': format_info.get('duration'),
                    'bit_rate': format_info.get('bit_rate'),
                    'size': format_info.get('size'),
                    'format_name': format_info.get('format_name'),
                })
            
            return metadata
            
        except Exception as e:
            logger.error(f"Audio metadata extraction failed: {str(e)}")
            return {}
    
    @staticmethod
    def extract_all_metadata(file_path: str) -> Dict[str, Any]:
        """Extract all available metadata based on file type"""
        file_path_obj = Path(file_path)
        
        if not file_path_obj.exists():
            return {}
        
        mime_type = MetadataExtractor.get_mime_type(file_path)
        
        metadata = {
            'basic': {
                'file_name': file_path_obj.name,
                'file_size': file_path_obj.stat().st_size,
                'mime_type': mime_type,
                'last_modified': datetime.fromtimestamp(
                    file_path_obj.stat().st_mtime
                ).isoformat(),
                'extraction_timestamp': datetime.utcnow().isoformat()
            }
        }
        
        # Extract type-specific metadata
        if mime_type.startswith('image/'):
            exif_data = MetadataExtractor.extract_image_metadata(file_path)
            if exif_data:
                metadata['exif'] = exif_data
        elif mime_type.startswith('video/'):
            media_data = MetadataExtractor.extract_video_metadata(file_path)
            if media_data:
                metadata['media'] = media_data
        elif mime_type.startswith('audio/'):
            media_data = MetadataExtractor.extract_audio_metadata(file_path)
            if media_data:
                metadata['media'] = media_data
        
        return metadata