from typing import List, Optional, Union
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator
import secrets

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Forensic Evidence Acquisition System"
    
    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    
    # Database
    DATABASE_URL: str = "postgresql://user:password@localhost/forensic_db"
    
    # Storage
    STORAGE_TYPE: str = "local"  # "local" or "s3"
    LOCAL_STORAGE_PATH: str = "./evidence_storage"
    MAX_FILE_SIZE: int = 500 * 1024 * 1024  # 500MB
    
    # S3 Configuration
    S3_ENDPOINT: Optional[str] = None
    S3_ACCESS_KEY: Optional[str] = None
    S3_SECRET_KEY: Optional[str] = None
    S3_BUCKET_NAME: str = "forensic-evidence"
    S3_REGION: str = "us-east-1"
    S3_SECURE: bool = True
    
    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
    # Security Whitelists
    ALLOWED_URL_DOMAINS: List[str] = [
        "twitter.com",
        "x.com",
        "youtube.com",
        "youtu.be"
    ]
    
    ALLOWED_MIME_TYPES: List[str] = [
        "image/jpeg",
        "image/png",
        "image/heic",
        "image/heif",
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo",
        "audio/mpeg",
        "audio/wav"
    ]
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 10
    
    # Logging
    LOG_LEVEL: str = "INFO"
    CHAIN_OF_CUSTODY_LOG_PATH: str = "./chain_of_custody.log"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()