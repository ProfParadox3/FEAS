from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.models.sql_models import User, UserProfile
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter(prefix="/api/v1/profile", tags=["profile"])

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    role: Optional[str] = None

@router.get("/")
async def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get current user's profile"""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    
    if not profile:
        # Create default profile if doesn't exist
        profile = UserProfile(
            user_id=current_user.id,
            name="Investigator",
            role="Analyst",
            bio="Digital forensics specialist"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    return {
        "name": profile.name,
        "email": current_user.email,
        "role": profile.role,
        "bio": profile.bio,
        "is_admin": current_user.is_admin
    }

@router.patch("/")
async def update_profile(
    data: ProfileUpdate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)
    
    if data.name:
        profile.name = data.name
    if data.bio:
        profile.bio = data.bio
    if data.role:
        profile.role = data.role
    
    db.commit()
    db.refresh(profile)
    
    return {
        "ok": True, 
        "profile": {
            "name": profile.name,
            "email": current_user.email,
            "role": profile.role,
            "bio": profile.bio
        }
    }
