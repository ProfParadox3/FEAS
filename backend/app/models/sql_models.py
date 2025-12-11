from sqlalchemy import Column, String, Float, DateTime, JSON, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.db.base import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    status = Column(String, index=True)  # pending, completed, failed
    source = Column(String)  # url, local_upload
    progress = Column(Float, default=0.0)
    stage = Column(String)
    
    # Metadata
    filename = Column(String, nullable=True)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String, nullable=True)
    sha256_hash = Column(String, index=True, nullable=True)
    
    # Investigation Info
    investigator_id = Column(String, index=True)
    case_number = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    original_url = Column(String, nullable=True)
    
    # Storage
    storage_path = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    custody_logs = relationship("ChainOfCustody", back_populates="job", cascade="all, delete-orphan")

class ChainOfCustody(Base):
    __tablename__ = "chain_of_custody"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(String, ForeignKey("jobs.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    event = Column(String)
    investigator_id = Column(String)
    details = Column(JSON)
    hash_verification = Column(String, nullable=True)

    job = relationship("Job", back_populates="custody_logs")
