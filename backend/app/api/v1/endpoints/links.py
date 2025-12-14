from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.models.sql_models import SocialLink

router = APIRouter(prefix="/api/v1/links", tags=["links"])

class LinkCreate(BaseModel):
    url: str
    description: Optional[str] = None

@router.get("/", response_model=List[str])
async def list_links(q: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(SocialLink).filter(SocialLink.platform == "generic")
    if q:
        query = query.filter(SocialLink.url.contains(q))
    
    links = query.all()
    # Return just URLs to match frontend expectation
    return [link.url for link in links]

@router.post("/", status_code=201)
async def add_link(link_data: LinkCreate, db: Session = Depends(get_db)):
    if not (link_data.url.startswith("http://") or link_data.url.startswith("https://")):
        raise HTTPException(status_code=400, detail="Invalid URL")
    
    new_link = SocialLink(platform="generic", url=link_data.url, handle=link_data.description)
    db.add(new_link)
    db.commit()
    db.refresh(new_link)
    return {"ok": True, "url": new_link.url}
