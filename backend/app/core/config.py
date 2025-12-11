from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Forensic Evidence Acquisition System"
    
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8
    
    DATABASE_URL: str = "postgresql://user:password@localhost/forensic_db"
    
    STORAGE_TYPE: str = "local"
    LOCAL_STORAGE_PATH: str = "./evidence_storage"
    MAX_FILE_SIZE: int = 500 * 1024 * 1024
    
    S3_ENDPOINT: Optional[str] = None
    S3_ACCESS_KEY: Optional[str] = None
    S3_SECRET_KEY: Optional[str] = None
    S3_BUCKET_NAME: str = "forensic-evidence"
    S3_REGION: str = "us-east-1"
    S3_SECURE: bool = True
    
    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/0"
    
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
    
    RATE_LIMIT_PER_MINUTE: int = 60
    
    LOG_LEVEL: str = "INFO"
    CHAIN_OF_CUSTODY_LOG_PATH: str = "./chain_of_custody.log"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()