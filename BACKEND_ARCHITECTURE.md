# FEAS Backend Architecture Documentation

## Forensic Evidence Acquisition System - Backend

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Technology Stack:** Python 3.11+, FastAPI, SQLAlchemy, Celery, Redis, PostgreSQL

---

## Table of Contents

1. [High-Level System Overview](#1-high-level-system-overview)
2. [Directory Structure](#2-directory-structure)
3. [Entry Points & Initialization](#3-entry-points--initialization)
4. [Application Flow & Navigation](#4-application-flow--navigation)
5. [Modules, Components, and Core Units](#5-modules-components-and-core-units)
6. [API Endpoints](#6-api-endpoints)
7. [Services and External Integrations](#7-services-and-external-integrations)
8. [State Management & Data Handling](#8-state-management--data-handling)
9. [Configuration](#9-configuration)
10. [Utilities and Helpers](#10-utilities-and-helpers)
11. [Data Flow Examples](#11-data-flow-examples)
12. [Feature Walkthroughs](#12-feature-walkthroughs)
13. [Third-Party Libraries](#13-third-party-libraries)

---

## 1. High-Level System Overview

### Technical Explanation

The FEAS backend is a **forensic evidence acquisition and processing system** built using FastAPI as the web framework. It implements a microservices-inspired architecture with the following components:

- **FastAPI Application Server**: Handles HTTP requests, routing, and API responses
- **Celery Workers**: Asynchronous task processing for long-running evidence acquisition jobs
- **Redis**: Message broker for Celery task queue and result backend
- **PostgreSQL/SQLite**: Persistent storage for jobs, users, and chain of custody logs
- **Local/S3 Storage**: Evidence file storage

The system follows a **pipeline architecture** where evidence flows through discrete processing stages:

```
URL/Upload → Validation → Download → Hashing → Metadata Extraction → Storage → PDF Report Generation
```

### Plain-English Explanation

Think of FEAS backend as a digital evidence locker with an assembly line. When investigators submit evidence (either from social media URLs or file uploads), the system:

1. **Receives the submission** through API endpoints
2. **Queues the job** for processing (like putting it on a conveyor belt)
3. **Downloads content** from social media platforms (Twitter, YouTube, Facebook, Instagram)
4. **Creates a digital fingerprint** (SHA-256 hash) that uniquely identifies the evidence
5. **Extracts metadata** (creation date, camera info, video duration, etc.)
6. **Stores everything securely** with a complete audit trail
7. **Generates a professional PDF report** for court use

### Why This Architecture Was Chosen

**Tradeoffs:**

| Decision | Benefit | Cost |
|----------|---------|------|
| FastAPI | Automatic API docs, async support, type safety | Less mature ecosystem than Django |
| Celery + Redis | Reliable async processing, scalable | Additional infrastructure complexity |
| Pipeline pattern | Clear separation of concerns, easy debugging | More files to maintain |
| SQLAlchemy ORM | Database agnostic, type-safe queries | Slight performance overhead vs raw SQL |

---

## 2. Directory Structure

```
backend/
├── app/
│   ├── __init__.py                 # Package initializer
│   ├── main.py                     # FastAPI application entry point
│   ├── config.py                   # Application settings (duplicate of core/config.py)
│   │
│   ├── api/                        # API layer
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── endpoints/          # Route handlers
│   │           ├── __init__.py
│   │           ├── auth.py         # Authentication endpoints
│   │           ├── dashboard.py    # Dashboard statistics
│   │           ├── health.py       # Health check endpoint
│   │           ├── jobs.py         # Evidence processing jobs
│   │           ├── links.py        # Generic link management
│   │           ├── profile.py      # User profile management
│   │           └── social.py       # Social media link tracking
│   │
│   ├── core/                       # Core application utilities
│   │   ├── __init__.py
│   │   ├── config.py               # Pydantic settings configuration
│   │   ├── logger.py               # Logging configuration & forensic logger
│   │   └── security.py             # Password hashing, JWT tokens
│   │
│   ├── db/                         # Database layer
│   │   ├── base.py                 # SQLAlchemy declarative base
│   │   ├── init_db.py              # Database initialization
│   │   └── session.py              # Database session management
│   │
│   ├── models/                     # Data models
│   │   ├── __init__.py
│   │   ├── enums.py                # Enumeration types
│   │   ├── schemas.py              # Pydantic request/response schemas
│   │   └── sql_models.py           # SQLAlchemy ORM models
│   │
│   ├── pipelines/                  # Evidence processing pipelines
│   │   ├── __init__.py
│   │   ├── unified_pipeline.py     # Main processing pipeline
│   │   ├── upload_pipeline.py      # File upload processing
│   │   └── url_pipeline.py         # URL download processing
│   │
│   ├── services/                   # Business logic services
│   │   ├── __init__.py
│   │   ├── chain_of_custody.py     # Chain of custody logging
│   │   ├── downloader.py           # URL content downloader
│   │   ├── hashing.py              # SHA-256 hash computation
│   │   ├── metadata.py             # Metadata extraction
│   │   ├── pdf_generator.py        # ReportLab PDF generation
│   │   ├── pdf_service.py          # Playwright-based PDF (alternative)
│   │   ├── storage.py              # Evidence file storage
│   │   └── validator.py            # File/URL validation
│   │
│   ├── storage/                    # Storage adapters
│   │   ├── __init__.py
│   │   ├── local_storage.py        # Local filesystem storage
│   │   └── s3_storage.py           # AWS S3 storage (optional)
│   │
│   └── workers/                    # Celery workers
│       ├── __init__.py
│       ├── celery_app.py           # Celery configuration
│       └── tasks.py                # Async task definitions
│
├── requirements.txt                # Python dependencies
├── Dockerfile                      # Container definition
├── docker-compose.yml              # Multi-container orchestration
├── .env.example                    # Environment variable template
└── chain_of_custody.log           # Append-only custody log file
```

### File-by-File Explanation

#### `app/main.py` - Application Entry Point

**Responsibility:** Initializes and configures the FastAPI application, sets up middleware, registers routers, and handles application lifecycle.

**Why It Exists:** Every FastAPI application needs a central entry point that wires together all components.

```python
[Lines 1-14]
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
```

**Technical:** Imports FastAPI framework components, CORS middleware for cross-origin requests, and all API routers.

**Plain English:** This brings in all the building blocks needed to create the web server and connect it to different parts of the application.

```python
[Lines 16-33]
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
```

**Technical:** The `lifespan` context manager is FastAPI's modern approach to startup/shutdown events. It creates database tables and seeds the default admin user before accepting requests.

**Plain English:** When the server starts, this code sets up the database and creates an admin account so the system is ready to use immediately.

```python
[Lines 36-62]
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
```

**Technical:** Creates the FastAPI instance, adds CORS middleware with permissive settings (should be restricted in production), defines health/root endpoints, and mounts all routers.

**Plain English:** This creates the actual web server, allows requests from any website (for development), and connects all the different API sections.

---

## 3. Entry Points & Initialization

### Execution Order

1. **Python interpreter loads `main.py`**
2. **Imports execute** - All routers and dependencies are loaded
3. **`lifespan` context manager starts**:
   - `init_db()` creates database tables via SQLAlchemy
   - `create_default_admin()` seeds admin user if not exists
4. **FastAPI application is ready** to accept HTTP requests
5. **Uvicorn ASGI server** handles incoming connections

### Initialization Steps

#### Database Initialization (`app/db/init_db.py`)

```python
[Lines 16-28]
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
```

**Technical:** Uses SQLAlchemy's `create_all()` to generate database schema from ORM models. This is idempotent - running it multiple times is safe.

**Plain English:** This looks at all the data models we've defined and creates the corresponding database tables. If tables already exist, it leaves them alone.

#### Default Admin Creation (`app/db/init_db.py`)

```python
[Lines 31-69]
def create_default_admin(db: Session) -> None:
    """Create default admin user from environment variables"""
    try:
        admin_email = settings.DEFAULT_ADMIN_EMAIL
        existing_admin = db.query(User).filter(User.email == admin_email).first()
        
        if not existing_admin:
            password_hash = get_password_hash(settings.DEFAULT_ADMIN_PASSWORD)
            
            admin_user = User(
                email=admin_email,
                password_hash=password_hash,
                is_active=True,
                is_admin=True
            )
            db.add(admin_user)
            db.flush()
            
            admin_profile = UserProfile(
                user_id=admin_user.id,
                name="System Administrator",
                role="Admin",
                bio="Default system administrator account"
            )
            db.add(admin_profile)
            db.commit()
```

**Technical:** Checks if admin exists via database query, creates User and UserProfile records with bcrypt-hashed password if not.

**Plain English:** Creates a default admin account so you can log in immediately after starting the system for the first time.

### Configuration Loading (`app/core/config.py`)

```python
[Lines 5-53]
class Settings(BaseSettings):
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Forensic Evidence Acquisition System"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8

    # --- Database Settings ---
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "forensic_db"
    DATABASE_URL: Optional[str] = None

    @validator("DATABASE_URL", pre=True, always=True)
    def assemble_db_connection(cls, v: Optional[str], values: dict) -> str:
        if isinstance(v, str):
            return v
        return f"postgresql://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}@{values.get('POSTGRES_SERVER')}:{values.get('POSTGRES_PORT')}/{values.get('POSTGRES_DB')}"
```

**Technical:** Pydantic-settings class that loads configuration from environment variables with defaults. Validators automatically construct connection URLs.

**Plain English:** This is the application's configuration center. It reads settings from environment variables (like database passwords) or uses sensible defaults.

---

## 4. Application Flow & Navigation

### Request Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT REQUEST                              │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                           FASTAPI APPLICATION                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                       CORS Middleware                            │   │
│  │   - Validates origin headers                                     │   │
│  │   - Adds access control headers                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                      │                                   │
│                                      ▼                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         Router Layer                             │   │
│  │   /api/v1/auth/*     → auth.py                                   │   │
│  │   /api/v1/jobs/*     → jobs.py                                   │   │
│  │   /api/v1/profile/*  → profile.py                                │   │
│  │   /api/v1/dashboard/*→ dashboard.py                              │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          ENDPOINT HANDLER                                │
│  - Validates request data (Pydantic schemas)                            │
│  - Authenticates user (JWT verification)                                │
│  - Creates database session (dependency injection)                      │
│  - Executes business logic                                              │
│  - Returns response                                                      │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
                    ┌─────────────────┴─────────────────┐
                    │                                   │
                    ▼                                   ▼
┌───────────────────────────────┐   ┌───────────────────────────────────┐
│       SYNC OPERATIONS         │   │        ASYNC OPERATIONS           │
│  - Database queries           │   │  - Celery task dispatch           │
│  - Simple validations         │   │  - Background processing          │
│  - Report downloads           │   │  - Email notifications            │
└───────────────────────────────┘   └───────────────────────────────────┘
                                                    │
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          CELERY WORKER                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    PROCESSING PIPELINE                           │   │
│  │  1. Download content from URL                                    │   │
│  │  2. Compute SHA-256 hash                                         │   │
│  │  3. Extract metadata (EXIF, video info)                          │   │
│  │  4. Store evidence files                                         │   │
│  │  5. Generate PDF report                                          │   │
│  │  6. Update job status in database                                │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### State Transitions

Jobs flow through the following states:

```
PENDING → PROCESSING → COMPLETED
           │
           └──────────→ FAILED
```

Each state transition is logged in the chain of custody.

---

## 5. Modules, Components, and Core Units

### 5.1 Core Configuration (`app/core/config.py`)

**Role:** Centralized configuration management using Pydantic BaseSettings

**Responsibilities:**
- Load environment variables
- Provide type-safe configuration access
- Validate and transform configuration values

**Inputs:** Environment variables, `.env` file
**Outputs:** `settings` singleton object

```python
[Lines 97-107]
model_config = {
    "env_file": ".env",
    "case_sensitive": True,
    "extra": "ignore"  # This prevents crashes if .env has extra keys
}

settings = Settings()
```

**Why It Exists:** Centralizes all configuration in one place, making it easy to change settings between development/production environments without code changes.

### 5.2 Security Module (`app/core/security.py`)

**Role:** Authentication and security utilities

**Responsibilities:**
- Password hashing with bcrypt
- JWT token creation and verification
- API key generation
- Filename sanitization

```python
[Lines 10-18]
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Generate password hash"""
    return pwd_context.hash(password)
```

**Technical:** Uses passlib's `CryptContext` with bcrypt scheme. The `deprecated="auto"` setting allows automatic migration to newer hash algorithms.

**Plain English:** Securely stores passwords by converting them into unreadable hashes. Even if someone steals the database, they can't see the actual passwords.

```python
[Lines 20-31]
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt
```

**Technical:** Creates JSON Web Tokens with expiration timestamps, signed using HS256 algorithm with the application's secret key.

**Plain English:** Creates a digital "pass" that proves who you are. The pass automatically expires after a set time for security.

### 5.3 Database Layer

#### Base Model (`app/db/base.py`)

```python
[Lines 1-12]
from typing import Any
from sqlalchemy.ext.declarative import as_declarative, declared_attr

@as_declarative()
class Base:
    id: Any
    __name__: str
    
    # Generate __tablename__ automatically
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
```

**Technical:** SQLAlchemy declarative base with automatic table name generation from class names.

**Plain English:** This is the foundation for all database tables. It automatically creates table names from class names (e.g., `User` class → `user` table).

#### Session Management (`app/db/session.py`)

```python
[Lines 6-45]
USE_SQLITE = os.getenv("USE_SQLITE", "false").lower() == "true"

if USE_SQLITE:
    database_url = "sqlite:///./forensic_test.db"
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
        connect_args={"check_same_thread": False}
    )
else:
    database_url = settings.DATABASE_URL
    engine = create_engine(
        database_url,
        pool_pre_ping=True,
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Technical:** Creates database engine with connection pooling and `pool_pre_ping` for connection health checking. The `get_db` generator is used as a FastAPI dependency.

**Plain English:** Sets up database connections. The `pool_pre_ping` option checks if connections are still alive before using them, preventing errors from dropped connections.

### 5.4 Data Models (`app/models/sql_models.py`)

#### Job Model

```python
[Lines 8-38]
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

    custody_logs = relationship("ChainOfCustody", back_populates="job", cascade="all, delete-orphan")
```

**Technical:** SQLAlchemy ORM model representing forensic processing jobs. Uses UUID primary keys, indexes on frequently queried columns, and a one-to-many relationship with chain of custody logs.

**Plain English:** This defines what information we store about each evidence processing job - its status, the file details, who submitted it, and where it's stored.

#### Chain of Custody Model

```python
[Lines 40-51]
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
```

**Technical:** Append-only audit log table. The JSON column stores flexible event details.

**Plain English:** Records every action taken on evidence - like a visitor log at a museum. Once written, entries cannot be changed (append-only).

### 5.5 Processing Pipelines

#### Unified Pipeline (`app/pipelines/unified_pipeline.py`)

**Role:** Main evidence processing orchestrator

**Responsibilities:**
- Coordinate processing stages
- Update job progress
- Create chain of custody entries
- Generate PDF reports

```python
[Lines 29-76]
async def process(self, 
                 file_path: str, 
                 job_id: str, 
                 investigator_id: str, 
                 source: str, 
                 filename: str = None,
                 original_url: str = None,
                 platform_info: Dict[str, Any] = None):
    """Main processing pipeline."""
    db: Session = SessionLocal()
    job = db.query(Job).filter(Job.id == job_id).first()
    
    try:
        # --- 1. Hashing ---
        job.stage = "Hashing"
        job.progress = 10.0
        job.status = "processing"
        db.commit()

        sha256_hash = self.hash_service.compute_file_hash(file_path)

        log = ChainOfCustody(
            job_id=job_id,
            event="HASH_CALCULATED",
            investigator_id=investigator_id,
            details={"algorithm": "SHA256"},
            hash_verification=sha256_hash
        )
        db.add(log)
        db.commit()
```

**Technical:** Async pipeline method that processes evidence through discrete stages. Each stage updates job progress and creates chain of custody entries.

**Plain English:** This is the "assembly line" that processes evidence. It calculates the hash, extracts metadata, stores the file, and generates a report - all while keeping a detailed log of what happened.

#### URL Pipeline (`app/pipelines/url_pipeline.py`)

```python
[Lines 1-5]
import logging
import os
from typing import Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
```

**Note:** The `os` import was added as a bug fix - it's required for `os.path.basename()` on line 67.

```python
[Lines 56-75]
download_result = await self.downloader.download(url)

if not download_result['success']:
    raise Exception(f"Download failed: {download_result.get('error')}")

# Stage 3: Unified Processing
process_result = await self.unified_pipeline.process(
    file_path=download_result['file_path'],
    job_id=job_id,
    investigator_id=investigator_id,
    source='url',
    filename=os.path.basename(download_result['file_path']),
    original_url=url,
    platform_info={
        'platform': platform_str,
        'metadata': download_result.get('platform_metadata')
    }
)
```

**Technical:** Downloads content from social media platforms and delegates to unified pipeline.

**Plain English:** Handles URL submissions by downloading the content first, then passing it to the main processing pipeline.

---

## 6. API Endpoints

### 6.1 Authentication (`app/api/v1/endpoints/auth.py`)

#### POST `/api/v1/auth/register`

**Purpose:** Create new user accounts

```python
[Lines 65-121]
@router.post("/register", response_model=Token)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user with proper password hashing"""
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    password_hash = get_password_hash(user_data.password)
    
    new_user = User(
        email=user_data.email,
        password_hash=password_hash,
        is_active=True,
        is_admin=False
    )
    db.add(new_user)
    db.flush()
    
    new_profile = UserProfile(
        user_id=new_user.id,
        name=user_data.name,
        role=user_data.role,
        bio=f"Digital forensics {user_data.role.lower()}",
    )
    db.add(new_profile)
    db.commit()
```

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@agency.gov",
  "password": "secure123",
  "role": "Analyst"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@agency.gov",
    "role": "Analyst",
    "bio": "Digital forensics analyst",
    "is_admin": false
  }
}
```

#### POST `/api/v1/auth/login`

**Purpose:** Authenticate users and issue JWT tokens

```python
[Lines 123-186]
@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, ...)
    
    if not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, ...)
    
    access_token = create_access_token(data={"sub": user.email, "id": user.id})
```

**Technical:** Uses OAuth2 password flow. Verifies bcrypt hash and returns JWT.

**Plain English:** Checks username and password, then gives you a token to use for future requests.

### 6.2 Jobs (`app/api/v1/endpoints/jobs.py`)

#### POST `/api/v1/jobs/url`

**Purpose:** Submit URL for evidence acquisition

```python
[Lines 43-84]
@router.post("/jobs/url", response_model=JobStatusResponse)
async def submit_url_job(
    job_data: URLJobCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    job_id = str(uuid.uuid4())
    job = Job(
        id=job_id, 
        status="pending", 
        source="url", 
        original_url=str(job_data.url),
        investigator_id=job_data.investigator_id, 
        case_number=job_data.case_number,
        stage="Initialization"
    )
    db.add(job)
    db.commit()
    
    try:
        process_url_job.delay(
            job_id=job_id, 
            url=str(job_data.url),
            investigator_id=job_data.investigator_id, 
            case_number=job_data.case_number
        )
    except (KombuOperationalError, ConnectionError, OSError):
        job.status = "failed"
        job.stage = "Task submission failed - Celery worker may not be running"
        db.commit()
        raise HTTPException(status_code=503, detail="Background processing service unavailable")
```

**Request:**
```json
{
  "url": "https://twitter.com/user/status/123456789",
  "investigator_id": "INV-2023-001",
  "case_number": "CASE-456",
  "notes": "Relevant to investigation"
}
```

**Technical:** Creates job record, dispatches Celery task via `.delay()`, handles Celery unavailability gracefully.

**Plain English:** Creates a new processing job and puts it in the work queue. If the queue isn't running, it tells you instead of silently failing.

#### POST `/api/v1/jobs/upload`

**Purpose:** Submit local file for processing

```python
[Lines 86-175]
@router.post("/jobs/upload", response_model=JobStatusResponse)
async def submit_local_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    investigator_id: str = Form(...),
    case_number: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    # Validate File
    validator = FileValidator()
    validation_result = validator.validate_upload_file(file)
    if not validation_result["valid"]:
        raise HTTPException(status_code=400, detail=validation_result["error"])
    
    # Save to temp file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}")
    with open(temp_file.name, 'wb') as f:
        while True:
            chunk = file.file.read(1024 * 1024)  # 1MB chunks
            if not chunk:
                break
            f.write(chunk)
    
    process_upload_job.delay(
        job_id=job_id, 
        file_path=temp_file.name, 
        filename=file.filename, 
        investigator_id=investigator_id, 
        case_number=case_number
    )
```

**Technical:** Accepts `multipart/form-data`, validates MIME type using python-magic, streams file to temp storage to handle large files, dispatches Celery task with file path.

**Plain English:** Accepts file uploads, checks they're safe, saves them temporarily, and queues them for processing.

#### GET `/api/v1/jobs/{job_id}/report`

**Purpose:** Download generated PDF report

```python
[Lines 213-224]
@router.get("/jobs/{job_id}/report")
async def download_report(job_id: str, db: Session = Depends(get_db)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job: 
        raise HTTPException(status_code=404, detail="Job not found")
    
    report_log = db.query(ChainOfCustody).filter(
        ChainOfCustody.job_id == job_id, 
        ChainOfCustody.event == "REPORT_GENERATED"
    ).first()
    pdf_path = report_log.details.get("report_path") if report_log and report_log.details else None
    
    if not pdf_path or not os.path.exists(pdf_path):
        raise HTTPException(status_code=404, detail="Report not available")

    return FileResponse(pdf_path, media_type='application/pdf', filename=f"Forensic_Report_{job_id}.pdf")
```

**Technical:** Queries chain of custody for report path, returns `FileResponse` for efficient streaming.

**Plain English:** Finds where the PDF report was saved and sends it to you as a download.

---

## 7. Services and External Integrations

### 7.1 URL Downloader (`app/services/downloader.py`)

**Role:** Downloads content from supported social media platforms

**Supported Platforms:**
- Twitter/X
- YouTube
- Facebook
- Instagram

```python
[Lines 67-110]
async def download_youtube(self, url: str) -> Dict[str, Any]:
    """Download content from YouTube"""
    ydl_opts = {
        'format': 'best[ext=mp4]/best',
        'outtmpl': '%(title)s.%(ext)s',
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
    }
    
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)
        
        return {
            'success': True,
            'file_path': permanent_temp.name,
            'platform_metadata': {
                'title': info.get('title'),
                'uploader': info.get('uploader'),
                'upload_date': info.get('upload_date'),
                'duration': info.get('duration'),
                'view_count': info.get('view_count'),
            },
            'platform': Platform.YOUTUBE
        }
```

**Technical:** Uses yt-dlp library to download videos. Creates temporary files that persist beyond the download context for later processing.

**Plain English:** Downloads YouTube videos using the same technology as youtube-dl, capturing all the video information (title, uploader, views, etc.).

### 7.2 Hash Service (`app/services/hashing.py`)

**Role:** Compute SHA-256 cryptographic hashes

```python
[Lines 13-27]
@staticmethod
def compute_file_hash(file_path: str) -> Optional[str]:
    """Compute SHA-256 hash of a file"""
    try:
        sha256_hash = hashlib.sha256()
        
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(HashService.CHUNK_SIZE), b""):
                sha256_hash.update(byte_block)
        
        return sha256_hash.hexdigest()
        
    except Exception as e:
        logger.error(f"Hash computation failed: {str(e)}")
        return None
```

**Technical:** Streams file in 8KB chunks to handle files of any size without loading entire file into memory.

**Plain English:** Creates a unique "fingerprint" for files by reading them piece by piece. Two identical files always have the same fingerprint; any change produces a completely different one.

### 7.3 PDF Generator (`app/services/pdf_generator.py`)

**Role:** Generate professional forensic PDF reports using ReportLab

```python
[Lines 21-32]
class ForensicColors:
    PRIMARY = colors.HexColor('#1a365d')    # Dark blue
    SECONDARY = colors.HexColor('#2c5282')  # Medium blue
    ACCENT = colors.HexColor('#3182ce')     # Light blue
    SUCCESS = colors.HexColor('#276749')    # Green
    WARNING = colors.HexColor('#c05621')    # Orange
    ERROR = colors.HexColor('#c53030')      # Red
    LIGHT_BG = colors.HexColor('#f7fafc')   # Light gray
    BORDER = colors.HexColor('#e2e8f0')     # Border gray
    TEXT = colors.HexColor('#2d3748')       # Dark text
    MUTED = colors.HexColor('#718096')      # Muted text
```

**Technical:** Defines a professional color palette for consistent report styling.

```python
[Lines 209-265]
@staticmethod
def generate_report(job_details: JobDetailsResponse) -> str:
    """Generate professional PDF report from job details"""
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
    temp_path = temp_file.name
    
    doc = SimpleDocTemplate(
        temp_path,
        pagesize=letter,
        rightMargin=inch,
        leftMargin=inch,
        topMargin=1.3*inch,
        bottomMargin=0.8*inch
    )
    
    story = []
    
    # Title Page
    story.append(Paragraph("FORENSIC EVIDENCE REPORT", styles['ReportTitle']))
    story.append(Paragraph("Digital Evidence Acquisition & Analysis", styles['ReportSubtitle']))
    
    # Summary table
    summary_data = [
        ["REPORT SUMMARY", ""],
        ["Job Reference:", job_details.job_id],
        ["Evidence Source:", f"{source_str} ({platform_str})"],
        ["Status:", job_details.status.upper()],
    ]
```

**Technical:** Uses ReportLab's PLATYPUS (Page Layout and Typography Using Scripts) framework to build PDF documents programmatically with tables, paragraphs, and custom styling.

**Plain English:** Creates professional-looking PDF reports that can be used in court. Includes all evidence details, hash values, chain of custody, and signature areas.

### 7.4 Metadata Extractor (`app/services/metadata.py`)

**Role:** Extract technical metadata from media files

```python
[Lines 28-49]
@staticmethod
def extract_image_metadata(file_path: str) -> Dict[str, Any]:
    """Extract EXIF metadata from images"""
    with open(file_path, 'rb') as f:
        tags = exifread.process_file(f, details=False)
    
    metadata = {}
    for tag, value in tags.items():
        if tag not in ('JPEGThumbnail', 'TIFFThumbnail', 'Filename', 'EXIF MakerNote'):
            metadata[tag] = str(value)
    
    return metadata
```

**Technical:** Uses exifread library to parse EXIF data. Excludes binary thumbnail data and proprietary MakerNote fields.

**Plain English:** Reads hidden information embedded in photos - like when it was taken, what camera was used, and GPS coordinates if available.

```python
[Lines 51-99]
@staticmethod
def extract_video_metadata(file_path: str) -> Dict[str, Any]:
    """Extract metadata from video files using ffprobe"""
    probe = ffmpeg.probe(file_path)
    
    metadata = {
        'duration': format_info.get('duration'),
        'bit_rate': format_info.get('bit_rate'),
        'video': {
            'codec': video.get('codec_name'),
            'width': video.get('width'),
            'height': video.get('height'),
            'frame_rate': video.get('r_frame_rate'),
        },
        'audio': {
            'codec': audio.get('codec_name'),
            'sample_rate': audio.get('sample_rate'),
            'channels': audio.get('channels'),
        }
    }
```

**Technical:** Uses ffmpeg-python to run ffprobe and parse video container/codec information.

**Plain English:** Analyzes videos to find out their duration, resolution, codecs, and other technical details.

---

## 8. State Management & Data Handling

### Data Flow

```
┌───────────────────┐
│   User Request    │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  Pydantic Schema  │ ← Request validation
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│  SQLAlchemy ORM   │ ← Database operations
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│ PostgreSQL/SQLite │ ← Persistent storage
└───────────────────┘
```

### Job Status States

| State | Description | Trigger |
|-------|-------------|---------|
| `pending` | Job created, waiting for worker | Job submission |
| `processing` | Worker processing evidence | Worker picks up task |
| `completed` | Successfully processed | Pipeline completes |
| `failed` | Error occurred | Exception in pipeline |

### Persistence Strategy

1. **Jobs & Users**: PostgreSQL (or SQLite for development)
2. **Evidence Files**: Local filesystem or S3
3. **Chain of Custody**: Database table + append-only log file
4. **PDF Reports**: Temporary files with path stored in chain of custody

---

## 9. Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DEBUG` | Enable debug mode | `False` |
| `SECRET_KEY` | JWT signing key | `your-secret-key...` |
| `DATABASE_URL` | PostgreSQL connection string | Auto-assembled |
| `POSTGRES_SERVER` | Database host | `localhost` |
| `POSTGRES_USER` | Database user | `postgres` |
| `POSTGRES_PASSWORD` | Database password | `password` |
| `POSTGRES_DB` | Database name | `forensic_db` |
| `REDIS_HOST` | Redis host | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `STORAGE_TYPE` | Storage backend | `local` |
| `LOCAL_STORAGE_PATH` | Local storage directory | `./evidence_storage` |
| `MAX_FILE_SIZE` | Maximum upload size (bytes) | `524288000` (500MB) |
| `DEFAULT_ADMIN_EMAIL` | Initial admin email | `admin@feas.local` |
| `DEFAULT_ADMIN_PASSWORD` | Initial admin password | `admin123` |

### Allowed Domains

```python
ALLOWED_URL_DOMAINS: List[str] = [
    "twitter.com",
    "x.com",
    "youtube.com",
    "youtu.be",
    "facebook.com",
    "fb.watch",
    "fb.com",
    "instagram.com"
]
```

---

## 10. Utilities and Helpers

### Filename Sanitization (`app/core/security.py`)

```python
[Lines 49-57]
def sanitize_filename(filename: str) -> str:
    """Sanitize filename to prevent path traversal"""
    import re
    # Remove directory traversal attempts
    filename = re.sub(r'\.\./|\.\.\\', '', filename)
    # Remove special characters except dash, underscore, and dot
    filename = re.sub(r'[^\w\-\.]', '_', filename)
    # Limit length
    return filename[:255]
```

**Why It Exists:** Prevents security vulnerabilities where malicious filenames could write files outside intended directories.

### Forensic Logger (`app/core/logger.py`)

```python
[Lines 72-122]
class ForensicLogger:
    """Custom logger for forensic operations"""
    
    @staticmethod
    def log_acquisition(job_id: str, source: str, investigator_id: str, url: str = None, filename: str = None):
        log_chain_of_custody(
            job_id,
            investigator_id,
            "EVIDENCE_ACQUISITION",
            {
                "source": source,
                "url": url,
                "filename": filename,
                "timestamp": datetime.utcnow().isoformat()
            }
        )
```

**Why It Exists:** Provides structured logging specifically for forensic events with proper chain of custody formatting.

---

## 11. Data Flow Examples

### Example: URL Evidence Submission

**Step 1: Client submits URL**
```http
POST /api/v1/jobs/url
Content-Type: application/json

{
  "url": "https://youtube.com/watch?v=abc123",
  "investigator_id": "INV-001",
  "case_number": "CASE-2024-001"
}
```

**Step 2: API creates job record**
```python
# jobs.py lines 49-58
job_id = str(uuid.uuid4())
job = Job(
    id=job_id, 
    status="pending", 
    source="url", 
    original_url=str(job_data.url),
    investigator_id=job_data.investigator_id
)
db.add(job)
db.commit()
```

**Step 3: Task dispatched to Celery**
```python
# jobs.py lines 62-68
process_url_job.delay(
    job_id=job_id, 
    url=str(job_data.url),
    investigator_id=job_data.investigator_id, 
    case_number=job_data.case_number
)
```

**Step 4: Worker downloads content**
```python
# url_pipeline.py lines 56-59
download_result = await self.downloader.download(url)
# Returns: {'success': True, 'file_path': '/tmp/video.mp4', 'platform_metadata': {...}}
```

**Step 5: Unified pipeline processes**
```python
# unified_pipeline.py lines 60-68
sha256_hash = self.hash_service.compute_file_hash(file_path)
# Returns: "a3f8c9b2d4e1f0a3b8c9d2e4f1a0b3c8d9e2f4a1b0c3d8e9f2a4b1c0d3e8f9a2"
```

**Step 6: Evidence stored**
```python
# storage.py lines 34-64
storage_result = await cls._store_local(file_path, job_id, metadata)
# Returns: {'path': './evidence_storage/uuid/file.mp4', 'location': 'local://...'}
```

**Step 7: PDF report generated**
```python
# pdf_generator.py lines 209-448
pdf_path = self.pdf_generator.generate_report(job_details_obj)
# Returns: '/tmp/forensic_report_uuid.pdf'
```

**Step 8: Job completed**
```python
# unified_pipeline.py lines 186-189
job.status = 'completed'
job.progress = 100.0
job.completed_at = datetime.utcnow()
db.commit()
```

---

## 12. Feature Walkthroughs

### Feature: Integrity Verification

**What It Does:** Verifies that evidence files haven't been tampered with by recomputing the hash and comparing to the original.

**How It Works:**

1. Client calls `POST /api/v1/jobs/{job_id}/verify`
2. System retrieves original hash from job record
3. Recomputes hash of stored file
4. Compares hashes
5. Returns verification result

```python
# unified_pipeline.py lines 208-223
def verify_integrity(self, file_path: str, original_hash: str, job_id: str, investigator_id: str):
    """Verifies if the current file hash matches the original chain of custody hash."""
    current_hash = self.hash_service.compute_file_hash(file_path)
    matches = (current_hash == original_hash)
    
    return {
        "success": True,
        "original_hash": original_hash,
        "current_hash": current_hash,
        "matches": matches,
    }
```

**Key Files:**
- `app/api/v1/endpoints/jobs.py` (lines 251-263)
- `app/pipelines/unified_pipeline.py` (lines 208-223)
- `app/services/hashing.py` (lines 29-33)

**Edge Cases:**
- File deleted: Returns 404
- File corrupted: Hash mismatch detected
- Original hash missing: Returns error

---

## 13. Third-Party Libraries

| Library | Version | Purpose | Why Chosen |
|---------|---------|---------|------------|
| `fastapi` | 0.115.0 | Web framework | Async support, automatic docs, type safety |
| `uvicorn` | 0.30.0 | ASGI server | High performance, native async |
| `sqlalchemy` | 2.0.23 | ORM | Database agnostic, mature ecosystem |
| `celery` | 5.3.6 | Task queue | Reliable, scalable background processing |
| `redis` | 5.0.1 | Message broker | Fast, reliable, simple |
| `yt-dlp` | 2023.11.16 | Video downloader | Active development, wide platform support |
| `reportlab` | 4.0.7 | PDF generation | Professional output, pure Python |
| `python-magic` | 0.4.27 | MIME detection | Accurate file type identification |
| `exifread` | 3.0.0 | EXIF extraction | Lightweight, comprehensive |
| `ffmpeg-python` | 0.2.0 | Video metadata | FFmpeg wrapper, easy API |
| `python-jose` | 3.3.0 | JWT handling | Standard implementation |
| `passlib` | 1.7.4 | Password hashing | Secure, multiple algorithm support |
| `pydantic` | 2.9.0 | Data validation | Type safety, automatic serialization |

---

## Appendix: Security Considerations

1. **Password Storage**: bcrypt hashing with automatic salt
2. **JWT Tokens**: HS256 signed, configurable expiration
3. **File Uploads**: MIME type validation, size limits, sanitized filenames
4. **URL Validation**: Domain whitelist prevents SSRF attacks
5. **SQL Injection**: ORM parameterized queries
6. **Path Traversal**: Filename sanitization

---

*This documentation was generated for FEAS v1.0.0. For questions or updates, please contact the development team.*
