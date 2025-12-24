from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.models.sql_models import SocialLink

router = APIRouter(prefix="/api/v1/social", tags=["social"])

class SocialCreate(BaseModel):
    platform: str
    handle: str
    url: str

@router.get("/", response_model=List[dict])
async def list_social(q: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(SocialLink).filter(SocialLink.platform != "generic")
    if q:
        query = query.filter(SocialLink.handle.contains(q))
    
    items = query.all()
    return [{"platform": i.platform, "handle": i.handle, "url": i.url} for i in items]

@router.post("/", status_code=201)
async def add_social(item: SocialCreate, db: Session = Depends(get_db)):
    if not item.url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid URL")
        
    new_social = SocialLink(platform=item.platform, handle=item.handle, url=item.url)
    db.add(new_social)
    db.commit()
    return {"ok": True, "social": item}
