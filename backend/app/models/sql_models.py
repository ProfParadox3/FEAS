from sqlalchemy import Column, String, Float, DateTime, JSON, ForeignKey, Integer, Boolean
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

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship to profile
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    name = Column(String, default="Investigator")
    role = Column(String, default="Senior Analyst")
    bio = Column(String, default="Digital forensics specialist.")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship back to user
    user = relationship("User", back_populates="profile")

class SocialLink(Base):
    __tablename__ = "social_links"
    
    id = Column(Integer, primary_key=True, index=True)
    platform = Column(String) # e.g., "twitter"
    handle = Column(String)
    url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
