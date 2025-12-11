from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create the database engine using the URL from your .env / config
engine = create_engine(
    settings.DATABASE_URL, 
    pool_pre_ping=True,  # reliable connections
    pool_size=5,
    max_overflow=10
)

# Create a SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
