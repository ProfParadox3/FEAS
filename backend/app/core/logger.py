import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path
from datetime import datetime

from app.core.config import settings

def setup_logging():
    """Configure logging for the application"""
    
    # Create logs directory if it doesn't exist
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    # Configure root logger
    root_logger = logging.getLogger()
    #log_level_str = getattr(settings, "LOG_LEVEL", "INFO")
    root_logger.setLevel(getattr(logging, settings.LOG_LEVEL))
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(console_format)
    root_logger.addHandler(console_handler)
    
    # File handler for application logs
    file_handler = RotatingFileHandler(
        log_dir / 'forensic_app.log',
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_format = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
    )
    file_handler.setFormatter(file_format)
    root_logger.addHandler(file_handler)
    
    # Chain of custody specific logger
    custody_logger = logging.getLogger('chain_of_custody')
    custody_handler = RotatingFileHandler(
        settings.CHAIN_OF_CUSTODY_LOG_PATH,
        maxBytes=10*1024*1024,
        backupCount=10
    )
    custody_format = logging.Formatter(
        '%(asctime)s - %(levelname)s - JOB:%(job_id)s - INVESTIGATOR:%(investigator_id)s - %(message)s'
    )
    custody_handler.setFormatter(custody_format)
    custody_logger.addHandler(custody_handler)
    custody_logger.propagate = False
    
    # Suppress noisy logs
    logging.getLogger('uvicorn.access').disabled = True
    logging.getLogger('celery').setLevel(logging.WARNING)

def log_chain_of_custody(job_id: str, investigator_id: str, event: str, details: dict):
    """Log a chain of custody event"""
    logger = logging.getLogger('chain_of_custody')
    logger.info(
        event,
        extra={
            'job_id': job_id,
            'investigator_id': investigator_id,
            'details': str(details)
        }
    )

class ForensicLogger:
    """Custom logger for forensic operations"""
    
    @staticmethod
    def log_acquisition(job_id: str, source: str, investigator_id: str, url: str = None, filename: str = None):
        log_chain_of_custody(
            job_id,
            investigator_id,
            "EVIDENCE_ACQUISITION",
            {
                "source": source,
                "url": url,
                "filename": filename,
                "timestamp": datetime.now().isoformat()
            }
        )
    
    @staticmethod
    def log_processing(job_id: str, investigator_id: str, stage: str, details: dict):
        log_chain_of_custody(
            job_id,
            investigator_id,
            f"PROCESSING_{stage.upper()}",
            details
        )
    
    @staticmethod
    def log_hash_computation(job_id: str, investigator_id: str, hash_value: str):
        log_chain_of_custody(
            job_id,
            investigator_id,
            "HASH_COMPUTATION",
            {
                "algorithm": "SHA-256",
                "hash": hash_value,
                "timestamp": datetime.now().isoformat()
            }
        )
    
    @staticmethod
    def log_verification(job_id: str, investigator_id: str, original_hash: str, current_hash: str, matches: bool):
        log_chain_of_custody(
            job_id,
            investigator_id,
            "INTEGRITY_VERIFICATION",
            {
                "original_hash": original_hash,
                "current_hash": current_hash,
                "matches": matches,
                "timestamp": datetime.now().isoformat()
            }
        )   