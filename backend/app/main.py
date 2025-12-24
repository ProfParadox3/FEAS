from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import app.workers.celery_app

from app.api.v1.endpoints.links import router as links_router
from app.api.v1.endpoints.social import router as social_router
from app.api.v1.endpoints.profile import router as profile_router
from app.api.v1.endpoints.dashboard import router as dashboard_router
from app.api.v1.endpoints.jobs import router as jobs_router
from app.api.v1.endpoints.auth import router as auth_router
from app.db.init_db import init_db
from app.db.session import get_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup"""
    from app.db.session import SessionLocal
    
    # Initialize database tables
    init_db()
    
    # Create default admin user
    db = SessionLocal()
    try:
        from app.db.init_db import create_default_admin
        create_default_admin(db)
    finally:
        db.close()
    
    yield
    # Cleanup on shutdown (if needed)


app = FastAPI(title="FEAS API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health():
    return {"status": "ok"}

# Root
@app.get("/")
async def root():
    return {"name": "FEAS", "version": "1.0.0"}

# Routers
app.include_router(auth_router)
app.include_router(links_router)
app.include_router(social_router)
app.include_router(profile_router)
app.include_router(dashboard_router)
app.include_router(jobs_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
