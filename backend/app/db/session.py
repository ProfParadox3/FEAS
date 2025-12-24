from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
import os

# Database engine
# Check if USE_SQLITE environment variable is set, otherwise use DATABASE_URL from settings
USE_SQLITE = os.getenv("USE_SQLITE", "false").lower() == "true"

if USE_SQLITE:
    # Use SQLite for development/testing
    database_url = "sqlite:///./forensic_test.db"
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        connect_args={"check_same_thread": False}
    )
else:
    # Use PostgreSQL or other database from settings
    database_url = settings.DATABASE_URL
    
    # Check if it's SQLite or PostgreSQL
    if database_url.startswith("sqlite"):
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
            connect_args={"check_same_thread": False}
        )
    else:
        # PostgreSQL or other database
        engine = create_engine(
            database_url,
            pool_pre_ping=True,
        )

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency
def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
