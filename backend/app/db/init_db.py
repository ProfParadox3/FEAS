"""
Database initialization script
Creates tables and default admin user
"""
import logging
from sqlalchemy.orm import Session
from app.db.base import Base
from app.db.session import engine
from app.models.sql_models import User, UserProfile
from app.core.security import get_password_hash
from app.core.config import settings

logger = logging.getLogger(__name__)


def init_db(db: Session = None) -> None:
    """
    Initialize database:
    1. Create all tables
    2. Create default admin user if session provided
    """
    # Create all tables
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
    
    # Create default admin user if database session is provided
    if db is not None:
        create_default_admin(db)


def create_default_admin(db: Session) -> None:
    """Create default admin user from environment variables"""
    try:
        # Check if admin already exists
        admin_email = settings.DEFAULT_ADMIN_EMAIL
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if not existing_admin:
            # Hash the default password
            password_hash = get_password_hash(settings.DEFAULT_ADMIN_PASSWORD)
            
            # Create admin user
            admin_user = User(
                email=admin_email,
                password_hash=password_hash,
                is_active=True,
                is_admin=True
            )
            db.add(admin_user)
            db.flush()  # Get the user ID
            
            # Create admin profile
            admin_profile = UserProfile(
                user_id=admin_user.id,
                name="System Administrator",
                role="Admin",
                bio="Default system administrator account"
            )
            db.add(admin_profile)
            
            db.commit()
            logger.info(f"Default admin user created: {admin_email}")
        else:
            logger.info(f"Admin user already exists: {admin_email}")
            
    except Exception as e:
        logger.error(f"Error creating default admin: {str(e)}")
        db.rollback()
        raise
