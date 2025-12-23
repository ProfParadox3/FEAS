# 🕵️‍♂️ Forensic Evidence Acquisition System (FEAS)

![License](https://img.shields.io/badge/License-MIT-blue.svg) ![Python](https://img.shields.io/badge/Python-3.11-blue) ![React](https://img.shields.io/badge/React-18.2-61DAFB) ![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688)

> **Investigator-grade digital forensics platform for acquiring, preserving, and analyzing web and local evidence with an immutable chain of custody.**

---

## 📖 Overview

The **Forensic Evidence Acquisition System (FEAS)** is a secure, full-stack solution designed for law enforcement and digital forensic investigators. It automates the acquisition of evidence from social media URLs and local files, ensuring strict integrity through SHA-256 hashing and automated PDF reporting.

Unlike standard downloaders, FEAS maintains a legally admissible **Chain of Custody** log for every action taken on a piece of evidence, from the moment of acquisition to final storage.

## ✨ Key Features

* **🔐 Secure User Authentication**
    * **NEW:** Automatic database initialization on first run
    * **NEW:** Default admin user created from environment variables
    * **NEW:** Bcrypt password hashing for maximum security
    * JWT token-based authentication with configurable expiration
    * User registration and login system
    * User profile management with editable information
    * Role-based access control (Admin vs Analyst roles)
    * **📚 See [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) for details**
* **🌐 Universal Acquisition**
    * Capture videos and metadata from **Twitter (X)**, **YouTube**, and direct URLs.
    * Secure **Local File Upload** for existing evidence.
* **🔒 Evidence Integrity**
    * Automated **SHA-256 Hashing** upon acquisition.
    * **Verify Integrity** tools to detect file tampering.
* **⛓️ Chain of Custody**
    * Immutable, append-only logs for every event (Acquisition, Hashing, Storage, Access, Verification).
    * Full audit trail exportable in reports.
    * Stored in both database (PostgreSQL) and file-based log.
* **📊 Deep Metadata Extraction**
    * Extracts EXIF data, video codecs, bitrates, duration, resolution, and platform-specific metadata.
    * Uses `ffmpeg` for video analysis and `exifread` for image metadata.
    * MIME type detection via `python-magic`.
* **📊 Real-time Analytics Dashboard**
    * Live statistics and metrics for all forensic operations.
    * Period-based analytics (24h, 7d, 30d, 90d).
    * Success/failure rate tracking and performance metrics.
* **📄 Automated Reporting**
    * Generates professional **PDF Forensic Reports** containing all case details, hashes, and custody logs.
* **⚡ Real-time Monitoring**
    * Live job tracking with React Query polling.
    * Background processing with **Celery Worker** and **Celery Beat** scheduler.
    * Progress tracking through multiple stages (pending, downloading, processing, hashing, extracting metadata, generating report, completed).

---

## 🎯 Supported Platforms & File Types

### URL Acquisition (Social Media)
* **Twitter (X)** - `twitter.com`, `x.com`
* **YouTube** - `youtube.com`, `youtu.be`

### Local File Upload
Supported file types:
* **Images**: JPEG (`.jpg`, `.jpeg`), PNG (`.png`), HEIC/HEIF (`.heic`, `.heif`)
* **Videos**: MP4 (`.mp4`), QuickTime (`.mov`), AVI (`.avi`)
* **Audio**: MP3 (`.mp3`), WAV (`.wav`)
* **Documents**: PDF, text files, and archives (ZIP)

**Maximum file size**: 500 MB (configurable via `MAX_FILE_SIZE`)

---

## 🛠️ Tech Stack

### **Backend**
* 🐍 **Python 3.11** & **FastAPI 0.115** - High-performance async API framework.
* 🗄️ **PostgreSQL 15** & **SQLAlchemy 2.0** - Robust relational database with ORM.
* ⚡ **Celery 5.3** & **Redis 7** - Distributed task queue with Celery Beat scheduler.
* 🕵️ **Forensic Tools**: 
  - `yt-dlp` - Video download from social platforms
  - `ffmpeg` - Media processing and metadata extraction
  - `exifread` - EXIF data extraction
  - `python-magic` - File type detection
* 📄 **ReportLab** - Dynamic PDF forensic report generation.
* 🎭 **Playwright** - Web scraping and browser automation.
* 🔐 **Pydantic 2.9** - Data validation and settings management.
* 🔑 **python-jose & passlib** - JWT tokens and password hashing.

### **Frontend**
* ⚛️ **React 18.2** - Modern UI library with hooks.
* 💅 **Styled Components 6.1** - Component-based theming (Cyber/Dark/Light themes).
* 📡 **React Query 3.39** & **Axios 1.6** - Efficient data fetching and caching.
* 🎨 **React Icons 4.12** - Visual indicators for file types and status.
* 🎭 **Framer Motion 10.16** - Smooth animations.
* 📤 **React Dropzone 14.2** - Drag-and-drop file uploads.
* 🔔 **React Toastify 10.0** - User notifications.
* 🎯 **Zustand 4.4** - Lightweight state management.

### **DevOps**
* 🐳 **Docker** & **Docker Compose** - Multi-container orchestration.
* 📦 **PostgreSQL, Redis, Backend, Frontend, Celery Worker, Celery Beat** - 6 containerized services.

---

## 🚀 Getting Started

### Prerequisites
* **Docker & Docker Compose** (Recommended)
* **OR** Python 3.11+ and Node.js 18+ (for manual setup)

### Quick Start Guide

**📚 For detailed setup instructions, see [QUICKSTART.md](QUICKSTART.md)**

### Option 1: Quick Start (Docker) 🐳

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Dynamo2k/FEAS.git
    cd FEAS
    ```

2.  **Configure Environment**
    ```bash
    cd backend
    cp .env.example .env
    # Edit .env and change default admin credentials!
    # DEFAULT_ADMIN_EMAIL=admin@feas.local
    # DEFAULT_ADMIN_PASSWORD=change-this-password
    ```

3.  **Launch All Services**
    ```bash
    # From the backend directory
    docker-compose up --build -d
    ```
    This starts 6 services:
    - **PostgreSQL** (port 5432) - Database
    - **Redis** (port 6379) - Message broker
    - **Backend API** (port 8000) - FastAPI server
    - **Frontend** (port 3000) - React application
    - **Celery Worker** - Background task processor
    - **Celery Beat** - Scheduled task scheduler

4.  **Access the Application**
    - Frontend Dashboard: `http://localhost:3000`
    - API Documentation: `http://localhost:8000/docs`
    - API Health Check: `http://localhost:8000/health`
    
5.  **Login with Default Admin**
    - Email: `admin@feas.local` (or your configured email)
    - Password: `admin123` (or your configured password)
    - **⚠️ Change the password immediately after first login!**

### Option 2: Manual Installation 🛠️

#### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# For quick testing with SQLite:
export USE_SQLITE=true  # or set USE_SQLITE=true in .env

# Install system dependencies (Linux/Mac)
# ffmpeg, libmagic1 are required
sudo apt-get install ffmpeg libmagic1  # Ubuntu/Debian
# brew install ffmpeg libmagic  # macOS

# Start the backend (database tables created automatically on first run)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# In separate terminals, start Celery:
celery -A app.workers.celery_app.celery worker --loglevel=info
celery -A app.workers.celery_app.celery beat --loglevel=info
```

**📚 For PostgreSQL setup, see [POSTGRESQL_SETUP.md](POSTGRESQL_SETUP.md)**

#### Frontend Setup

```bash
cd frontend
npm install
npm start
```
The React app will open at `http://localhost:3000`.

---

## 📁 Project Structure

```
FEAS/
├── backend/                    # FastAPI Backend
│   ├── app/
│   │   ├── api/v1/endpoints/  # REST API routes
│   │   │   ├── jobs.py        # Job submission & monitoring
│   │   │   ├── auth.py        # Authentication (login/register)
│   │   │   ├── dashboard.py   # Analytics & statistics
│   │   │   ├── profile.py     # User profile management
│   │   │   ├── social.py      # Social media links
│   │   │   ├── links.py       # Link management
│   │   │   └── health.py      # Health check endpoint
│   │   ├── core/              # Core utilities
│   │   │   ├── config.py      # Pydantic settings
│   │   │   ├── logger.py      # Forensic logging
│   │   │   └── security.py    # Authentication & authorization
│   │   ├── db/                # Database
│   │   │   ├── base.py        # SQLAlchemy base
│   │   │   └── session.py     # DB session management
│   │   ├── models/            # Data models
│   │   │   ├── schemas.py     # Pydantic schemas (API)
│   │   │   ├── sql_models.py  # SQLAlchemy models (DB)
│   │   │   └── enums.py       # Enumerations
│   │   ├── pipelines/         # Processing pipelines
│   │   │   ├── url_pipeline.py      # URL acquisition
│   │   │   ├── upload_pipeline.py   # File upload processing
│   │   │   └── unified_pipeline.py  # Unified forensic flow
│   │   ├── services/          # Business logic
│   │   │   ├── downloader.py       # yt-dlp wrapper
│   │   │   ├── metadata.py         # EXIF/ffmpeg extraction
│   │   │   ├── hashing.py          # SHA-256 hashing
│   │   │   ├── chain_of_custody.py # Audit logging
│   │   │   ├── pdf_generator.py    # ReportLab PDF creation
│   │   │   ├── pdf_service.py      # Playwright PDF service
│   │   │   ├── validator.py        # File validation
│   │   │   └── storage.py          # Storage abstraction
│   │   ├── storage/           # Storage backends
│   │   │   ├── local_storage.py    # Local filesystem
│   │   │   └── s3_storage.py       # AWS S3 (optional)
│   │   ├── workers/           # Celery tasks
│   │   │   ├── celery_app.py       # Celery configuration
│   │   │   └── tasks.py            # Async job tasks
│   │   └── main.py            # FastAPI application entry
│   ├── Dockerfile             # Backend container
│   ├── docker-compose.yml     # Multi-service orchestration
│   └── requirements.txt       # Python dependencies
│
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/        # Reusable components
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   ├── ThemeSwitcher.jsx
│   │   │   │   └── ErrorBoundary.jsx
│   │   │   ├── evidence/      # Evidence display
│   │   │   │   ├── MediaPreview.jsx
│   │   │   │   ├── MetadataTable.jsx
│   │   │   │   ├── SHA256Display.jsx
│   │   │   │   └── VerifyIntegrityButton.jsx
│   │   │   ├── layout/        # Layout components
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── Layout.jsx
│   │   │   ├── monitoring/    # Job monitoring
│   │   │   │   └── JobMonitorTable.jsx
│   │   │   └── submission/    # Evidence submission
│   │   │       ├── URLInput.jsx
│   │   │       ├── FileUpload.jsx
│   │   │       └── SubmissionTabs.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── SubmissionPage.jsx
│   │   │   ├── JobMonitorPage.jsx
│   │   │   ├── EvidenceDetailPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   └── PlaceholderPage.jsx
│   │   ├── services/          # API & utilities
│   │   │   ├── api.js         # Axios instance
│   │   │   ├── validation.js  # Form validation
│   │   │   └── theme.js       # Theme helpers
│   │   ├── store/             # State management
│   │   │   ├── jobStore.js    # Zustand job state
│   │   │   ├── themeStore.js  # Zustand theme state
│   │   │   └── authStore.js   # Zustand auth state
│   │   ├── styles/            # Global styles
│   │   │   ├── GlobalStyles.js
│   │   │   ├── theme.js       # Theme definitions
│   │   │   └── components.css
│   │   ├── App.jsx            # Main app component
│   │   └── index.js           # React entry point
│   ├── package.json           # Node dependencies
│   └── public/                # Static assets
│
└── README.md                  # This file
```

---

## 🏗️ Architecture Overview

### System Flow

```
┌─────────────┐
│   Client    │ (React Frontend)
│  Browser    │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────────────────────────────────┐
│          FastAPI Backend (Port 8000)    │
│  ┌─────────────────────────────────┐   │
│  │  API Endpoints (v1)             │   │
│  │  /jobs/url, /jobs/upload        │   │
│  │  /jobs/{id}, /dashboard          │   │
│  └──────────┬──────────────────────┘   │
│             │                            │
│  ┌──────────▼──────────────────────┐   │
│  │     Pipelines Layer             │   │
│  │  • URL Pipeline (yt-dlp)        │   │
│  │  • Upload Pipeline              │   │
│  │  • Unified Forensic Pipeline    │   │
│  └──────────┬──────────────────────┘   │
│             │                            │
│  ┌──────────▼──────────────────────┐   │
│  │     Services Layer              │   │
│  │  • Downloader (yt-dlp)          │   │
│  │  • Metadata (ffmpeg, exifread)  │   │
│  │  • Hashing (SHA-256)            │   │
│  │  • Chain of Custody Logger      │   │
│  │  • PDF Generator (ReportLab)    │   │
│  │  • Storage (Local/S3)           │   │
│  └──────────┬──────────────────────┘   │
└─────────────┼──────────────────────────┘
              │
         ┌────┴────┐
         ▼         ▼
    ┌─────────┐ ┌──────────────┐
    │  Redis  │ │  PostgreSQL  │
    │ (Cache) │ │  (Database)  │
    └────┬────┘ └──────────────┘
         │
    ┌────▼────────────────────┐
    │   Celery Workers        │
    │  • process_url_job      │
    │  • process_upload_job   │
    └─────────────────────────┘
    ┌─────────────────────────┐
    │   Celery Beat           │
    │  (Scheduled Tasks)      │
    └─────────────────────────┘
```

### Key Components

1. **FastAPI Backend**: RESTful API server handling all forensic operations
2. **React Frontend**: Modern SPA with three theme options (Cyber/Dark/Light)
3. **PostgreSQL**: Stores job metadata, chain of custody, and user profiles
4. **Redis**: Message broker for Celery and caching
5. **Celery Worker**: Processes heavy tasks asynchronously (downloads, metadata extraction, PDF generation)
6. **Celery Beat**: Scheduler for periodic tasks (cleanup, monitoring)

---

## 🔌 API Endpoints

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/jobs/url` | Submit URL for evidence acquisition (Twitter/X, YouTube) |
| `POST` | `/api/v1/jobs/upload` | Upload local file as evidence |
| `GET` | `/api/v1/jobs` | List all jobs |
| `GET` | `/api/v1/jobs/{job_id}/status` | Get detailed job status |
| `GET` | `/api/v1/jobs/{job_id}/details` | Get detailed job metadata and chain of custody |
| `POST` | `/api/v1/jobs/{job_id}/verify` | Verify file integrity (SHA-256) |
| `GET` | `/api/v1/jobs/{job_id}/report` | Generate and download PDF forensic report |
| `GET` | `/api/v1/analytics` | Get analytics data (total jobs, completed, failed, etc.) |

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/register` | Register new user account |
| `POST` | `/api/v1/auth/login` | Login and receive JWT token |
| `GET` | `/api/v1/auth/me` | Get current authenticated user |
| `POST` | `/api/v1/auth/logout` | Logout (client-side token removal) |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/dashboard/cards` | Get dashboard statistics cards |
| `GET` | `/api/v1/dashboard/activity` | Get recent chain of custody events |

### Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/profile/` | Get user profile information |
| `PATCH` | `/api/v1/profile/` | Update profile information |

### Social Links

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/social` | Get social media links |
| `POST` | `/social` | Add new social link |
| `DELETE` | `/social/{id}` | Delete social link |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | API health check |
| `GET` | `/` | API version info |

---

## 📸 Screenshots

| Dashboard | Evidence Details |
|:---:|:---:|
| *Real-time monitoring of all forensic jobs* | *Deep dive into metadata and custody logs* |
|  |  |

-----

## 🔧 Configuration

### Environment Variables (Backend)

Create a `.env` file in the `backend/` directory:

```env
# Database
POSTGRES_SERVER=localhost
POSTGRES_USER=forensic
POSTGRES_PASSWORD=password
POSTGRES_DB=forensic_db
POSTGRES_PORT=5432
DATABASE_URL=postgresql://forensic:password@localhost:5432/forensic_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Storage
STORAGE_TYPE=local  # or 's3'
LOCAL_STORAGE_PATH=./evidence_storage
MAX_FILE_SIZE=524288000  # 500MB in bytes

# S3 (Optional)
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET_NAME=forensic-evidence
S3_REGION=us-east-1

# Security
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=11520  # 8 days

# Logging
LOG_LEVEL=INFO
CHAIN_OF_CUSTODY_LOG_PATH=./chain_of_custody.log

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# Allowed Domains for URL Acquisition
ALLOWED_URL_DOMAINS=["twitter.com","x.com","youtube.com","youtu.be"]
```

### Frontend Configuration

The frontend uses environment variables prefixed with `REACT_APP_`:

```env
REACT_APP_API_URL=http://localhost:8000
```

---

## 🧪 Testing

Currently, the project does not include automated tests. Manual testing is performed through:

1. **API Testing**: Use FastAPI's built-in Swagger UI at `http://localhost:8000/docs`
2. **Frontend Testing**: Manual UI testing in the React app
3. **Integration Testing**: End-to-end workflow testing with real URL submissions and file uploads

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Docker Compose Not Found
**Error**: `docker-compose: command not found`

**Solution**: 
- Install Docker Compose: `sudo apt-get install docker-compose` (Linux)
- Or use Docker Compose V2: `docker compose up` (instead of `docker-compose up`)

#### 2. Port Already in Use
**Error**: `Bind for 0.0.0.0:8000 failed: port is already allocated`

**Solution**:
```bash
# Find and kill process using the port
sudo lsof -i :8000
sudo kill -9 <PID>
```

#### 3. Database Connection Failed
**Error**: `sqlalchemy.exc.OperationalError: could not connect to server`

**Solution**:
- Ensure PostgreSQL is running: `docker-compose ps`
- Check database credentials in `.env`
- Wait a few seconds for PostgreSQL to fully initialize

#### 4. Celery Worker Not Processing Jobs
**Error**: Jobs stuck in "pending" status

**Solution**:
```bash
# Check Celery worker logs
docker-compose logs celery-worker

# Restart Celery services
docker-compose restart celery-worker celery-beat
```

#### 5. Frontend Can't Connect to Backend
**Error**: `Network Error` or CORS errors in browser console

**Solution**:
- Verify backend is running: `curl http://localhost:8000/health`
- Check `REACT_APP_API_URL` in frontend environment
- Ensure CORS is properly configured in `backend/app/main.py`

#### 6. Video Download Fails
**Error**: `yt-dlp error` or download timeout

**Solution**:
- Update yt-dlp: `pip install --upgrade yt-dlp`
- Check if URL is from supported platform (Twitter/X, YouTube)
- Verify internet connectivity from Docker container

#### 7. PDF Generation Fails
**Error**: Playwright or ReportLab errors

**Solution**:
```bash
# Install Playwright browsers (if manual setup)
playwright install chromium

# For Docker, rebuild the container
docker-compose build backend
```

#### 8. Permission Denied for Storage
**Error**: `Permission denied: './evidence_storage'`

**Solution**:
```bash
# Create storage directory with proper permissions
mkdir -p backend/evidence_storage
chmod 777 backend/evidence_storage

# Or use Docker volumes (already configured in docker-compose.yml)
```

---

## 🚧 Roadmap & Future Enhancements

- [ ] WebSocket support for real-time job updates
- [ ] Instagram and Facebook evidence acquisition
- [ ] Multi-user authentication and role-based access control
- [ ] Advanced search and filtering in evidence database
- [ ] Export chain of custody as blockchain records
- [ ] Mobile app for field evidence collection
- [ ] Automated testing suite (unit, integration, E2E)
- [ ] Cloud deployment guides (AWS, Azure, GCP)
- [ ] Evidence comparison and deduplication
- [ ] Machine learning for content classification

---

## 👥 Contributors

A huge thanks to the team that made this project possible:

  * 👨‍💻 **Rana Uzair Ahmad** - [Dynamo2k](https://github.com/Dynamo2k)
  * 👨‍💻 **Muhammad Usman** - [Prof.Paradox](https://github.com/ProfParadox3)
  * 👩‍💻 **Hoor ul Ain** - [hurrainjhl](https://github.com/hurrainjhl)
  * 👩‍💻 **Umae Habiba** - [ZUNATIC](https://github.com/ZUNATIC)

-----

## 📄 License

This project is licensed under the MIT License.

-----

> **Disclaimer:** This software is intended for authorized forensic investigations only. Ensure compliance with all local laws regarding data privacy and evidence handling. The developers are not responsible for any misuse of this software.
