from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session  # <- add Session
from app.core.config import settings

# Database engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
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
