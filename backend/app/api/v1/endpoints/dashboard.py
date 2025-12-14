from fastapi import APIRouter, Depends
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta

from app.db.session import get_db
from app.models.sql_models import Job, ChainOfCustody

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"]) 

@router.get("/cards", response_model=List[dict])
async def get_cards(db: Session = Depends(get_db)):
    """Get real-time statistics from the database"""
    total_jobs = db.query(Job).count()
    total_evidence = db.query(Job).filter(Job.storage_path.isnot(None)).count()
    
    # Calculate simple trends (last 24h vs previous 24h)
    now = datetime.utcnow()
    one_day_ago = now - timedelta(days=1)
    
    new_jobs_24h = db.query(Job).filter(Job.created_at >= one_day_ago).count()
    
    return [
        {"title": "Total Jobs", "value": total_jobs, "trend": f"+{new_jobs_24h} today"},
        {"title": "Evidence Secured", "value": total_evidence, "trend": "Active"},
        {"title": "Pending Processing", "value": db.query(Job).filter(Job.status == "pending").count(), "trend": "Queue"},
    ]

@router.get("/activity", response_model=List[dict])
async def get_activity(db: Session = Depends(get_db)):
    """Get the 10 most recent chain of custody events"""
    activities = db.query(ChainOfCustody)\
        .order_by(desc(ChainOfCustody.timestamp))\
        .limit(10)\
        .all()
    
    result = []
    for act in activities:
        # Fetch job filename for context if possible
        job = db.query(Job).filter(Job.id == act.job_id).first()
        subject = job.filename if job and job.filename else f"Job {act.job_id[:8]}..."
        
        result.append({
            "event": act.event.replace("_", " ").title(),
            "subject": subject,
            "by": act.investigator_id,
            "ts": act.timestamp
        })
        
    return result
