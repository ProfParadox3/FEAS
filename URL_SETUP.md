# 🌐 URL Acquisition Setup Guide

This comprehensive guide explains how to configure FEAS for URL-based evidence acquisition from social media platforms, including detailed `.env` configuration, workflow explanation, and troubleshooting.

## Table of Contents

- [Supported Platforms](#supported-platforms)
- [Complete Environment Configuration](#complete-environment-configuration)
- [How URL Acquisition Works](#how-url-acquisition-works)
- [Step-by-Step Setup](#step-by-step-setup)
- [Example URLs](#example-urls)
- [API Usage](#api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Security Considerations](#security-considerations)

## Supported Platforms

FEAS supports acquiring evidence from the following platforms:

| Platform | Supported URLs | Content Types | Status |
|----------|---------------|---------------|--------|
| **Twitter/X** | `twitter.com`, `x.com` | Videos, Images, Text | ✅ Full Support |
| **YouTube** | `youtube.com`, `youtu.be` | Videos, Metadata | ✅ Full Support |
| **Facebook** | `facebook.com`, `fb.watch`, `fb.com` | Videos, Images | ✅ Full Support |
| **Instagram** | `instagram.com` | Reels, Posts, Stories | ✅ Full Support |

## Complete Environment Configuration

### Required `.env` Settings

Create or edit the `.env` file in the `backend/` directory with ALL required settings:

```env
# ===========================================
# DATABASE CONFIGURATION
# ===========================================
# For development/quick testing, use SQLite
USE_SQLITE=false  # Set to 'true' for SQLite (no PostgreSQL needed)

# PostgreSQL settings (required if USE_SQLITE=false)
POSTGRES_SERVER=localhost
POSTGRES_USER=forensic
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=forensic_db
POSTGRES_PORT=5432
DATABASE_URL=postgresql://forensic:your_secure_password@localhost:5432/forensic_db

# ===========================================
# REDIS CONFIGURATION
# ===========================================
# Required for Celery mode (USE_CELERY=true)
REDIS_HOST=localhost
REDIS_PORT=6379

# ===========================================
# PROCESSING MODE CONFIGURATION
# ===========================================
# USE_CELERY=true  -> Uses Celery workers (requires Redis)
# USE_CELERY=false -> Uses FastAPI BackgroundTasks (simpler, no Redis needed)
USE_CELERY=true

# ===========================================
# SECURITY CONFIGURATION
# ===========================================
# IMPORTANT: Generate a strong secret key for production!
# Command: python -c "import secrets; print(secrets.token_urlsafe(32))"
SECRET_KEY=your-secret-key-change-in-production

# Token expiration in minutes (default: 8 days = 11520 minutes)
ACCESS_TOKEN_EXPIRE_MINUTES=11520

# ===========================================
# DEFAULT ADMIN CREDENTIALS
# ===========================================
# WARNING: Change these immediately after first deployment!
DEFAULT_ADMIN_EMAIL=admin@feas.local
DEFAULT_ADMIN_PASSWORD=admin123

# ===========================================
# STORAGE CONFIGURATION
# ===========================================
STORAGE_TYPE=local  # Options: 'local' or 's3'
LOCAL_STORAGE_PATH=./evidence_storage
MAX_FILE_SIZE=524288000  # 500MB in bytes

# ===========================================
# S3 STORAGE (Optional - only if STORAGE_TYPE=s3)
# ===========================================
S3_ENDPOINT=https://s3.amazonaws.com
S3_ACCESS_KEY=your_access_key
S3_SECRET_KEY=your_secret_key
S3_BUCKET_NAME=forensic-evidence
S3_REGION=us-east-1

# ===========================================
# LOGGING CONFIGURATION
# ===========================================
LOG_LEVEL=INFO  # Options: DEBUG, INFO, WARNING, ERROR
CHAIN_OF_CUSTODY_LOG_PATH=./chain_of_custody.log

# ===========================================
# RATE LIMITING
# ===========================================
RATE_LIMIT_PER_MINUTE=60

# ===========================================
# URL ACQUISITION - ALLOWED DOMAINS
# ===========================================
# List of domains FEAS will accept for URL evidence acquisition
# Format: JSON array of domain strings
ALLOWED_URL_DOMAINS=["twitter.com","x.com","youtube.com","youtu.be","facebook.com","fb.watch","fb.com","instagram.com"]

# ===========================================
# SOCIAL MEDIA API KEYS (Optional)
# ===========================================
# For enhanced metadata extraction from platforms
# Leave empty if not using authenticated access
TWITTER_CONSUMER_KEY=
TWITTER_CONSUMER_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
```

### Processing Mode Configuration

FEAS supports two processing modes for background jobs:

#### Option 1: Celery + Redis (Recommended for Production)

```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Enable Celery for background processing
USE_CELERY=true
```

**Requirements:**
- Redis server running on the configured host/port
- Celery worker running: `celery -A app.workers.celery_app.celery worker --loglevel=info`
- Celery beat for scheduled tasks: `celery -A app.workers.celery_app.celery beat --loglevel=info`

**How to start Redis:**
```bash
# Using Docker
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Or using system package (Ubuntu/Debian)
sudo apt install redis-server
sudo systemctl start redis
```

#### Option 2: FastAPI BackgroundTasks (Simple Development Setup)

```env
# Disable Celery for simple development
USE_CELERY=false
```

**Benefits:**
- No Redis required
- No Celery worker required
- Jobs processed directly by FastAPI
- Simpler setup for local development

**Note:** This mode processes jobs synchronously in background threads, which may affect performance under heavy load. Use Celery mode for production.

## Step-by-Step Setup

### Quick Setup for Development

1. **Copy the example environment file:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit for simple development (SQLite + BackgroundTasks):**
   ```bash
   # In .env, set:
   USE_SQLITE=true
   USE_CELERY=false
   ```

3. **Start the backend:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Access the API:**
   - Swagger UI: http://localhost:8000/docs
   - Health Check: http://localhost:8000/health

### Production Setup (Docker)

1. **Configure environment:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with production values
   ```

2. **Launch all services:**
   ```bash
   docker-compose up --build -d
   ```

3. **Verify services:**
   ```bash
   docker-compose ps
   curl http://localhost:8000/health
   ```

## How URL Acquisition Works

The URL acquisition pipeline processes social media URLs through multiple stages:

### Workflow Stages

```
┌─────────────────┐
│  1. Submit URL  │ → User submits URL via API or frontend
└────────┬────────┘
         ▼
┌─────────────────┐
│  2. Validation  │ → URL validated against whitelist (ALLOWED_URL_DOMAINS)
└────────┬────────┘
         ▼
┌─────────────────┐
│  3. Download    │ → Content downloaded using yt-dlp library
└────────┬────────┘
         ▼
┌─────────────────┐
│  4. Hashing     │ → SHA-256 hash computed for integrity verification
└────────┬────────┘
         ▼
┌─────────────────┐
│  5. Metadata    │ → EXIF, video codecs, bitrates extracted
└────────┬────────┘
         ▼
┌─────────────────┐
│  6. Storage     │ → Evidence stored (local filesystem or S3)
└────────┬────────┘
         ▼
┌─────────────────┐
│  7. PDF Report  │ → Professional forensic report generated
└────────┬────────┘
         ▼
┌─────────────────┐
│  8. Complete    │ → Chain of custody updated, job marked complete
└─────────────────┘
```

### Progress Tracking

Jobs progress through these stages with percentage updates:

| Stage | Progress | Description |
|-------|----------|-------------|
| Initialization | 0% | Job created, queued for processing |
| URL Validation | 5% | Validating URL against whitelist |
| Downloading | 15% | Downloading content from platform |
| Hashing | 30% | Computing SHA-256 hash |
| Metadata Extraction | 50% | Extracting EXIF and media metadata |
| Evidence Storage | 70% | Storing evidence file |
| Report Generation | 90% | Generating PDF forensic report |
| Complete | 100% | All processing complete |

### Chain of Custody Events

Every action is logged to the chain of custody:

1. **ACQUISITION** - URL submitted for evidence collection
2. **HASH_CALCULATED** - SHA-256 hash computed
3. **METADATA_EXTRACTED** - File metadata extracted
4. **EVIDENCE_STORED** - Evidence saved to storage
5. **REPORT_GENERATED** - PDF report created

## Example URLs

### Twitter/X
```
https://twitter.com/user/status/1234567890123456789
https://x.com/user/status/1234567890123456789
```

### YouTube
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
```

### Facebook
```
https://www.facebook.com/watch/?v=123456789
https://fb.watch/abcdefgh/
```

### Instagram
```
https://www.instagram.com/p/ABC123xyz/
https://www.instagram.com/reel/ABC123xyz/
```

## Troubleshooting

### Jobs Stuck at 0% / Pending

**Cause**: Background processing is not running properly.

**Solutions:**

1. **If using Celery mode (`USE_CELERY=true`)**:
   - Ensure Redis is running: `redis-cli ping` should return `PONG`
   - Ensure Celery worker is running: Check logs for errors
   - Restart Celery: `docker-compose restart celery-worker`

2. **Switch to BackgroundTasks mode**:
   - Set `USE_CELERY=false` in your `.env` file
   - Restart the backend server

### URL Not Accepted

**Cause**: URL domain is not in the allowed list.

**Solution**: Add the domain to `ALLOWED_URL_DOMAINS` in your `.env` file.

### Download Fails

**Cause**: `yt-dlp` cannot access the content.

**Solutions:**
- Update yt-dlp: `pip install --upgrade yt-dlp`
- Check if the content is publicly accessible
- Check internet connectivity
- Some content may require authentication (not currently supported)

## Security Considerations

1. **URL Validation**: All URLs are validated against a whitelist before processing
2. **Domain Matching**: Secure domain matching prevents bypass via subdomains
3. **Content Isolation**: Downloaded content is stored in isolated directories
4. **Chain of Custody**: All actions are logged with timestamps and investigator IDs

## API Endpoints

### Submit URL Job

```bash
POST /api/v1/jobs/url
Content-Type: application/json
Authorization: Bearer <access_token>

{
    "url": "https://twitter.com/user/status/1234567890",
    "investigator_id": "INV-001",
    "case_number": "CASE-2024-001",
    "notes": "Evidence for investigation"
}
```

**Response:**
```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "pending",
    "source": "url",
    "original_url": "https://twitter.com/user/status/1234567890",
    "investigator_id": "INV-001",
    "case_number": "CASE-2024-001",
    "stage": "Initialization",
    "progress": 0,
    "created_at": "2024-01-15T10:30:00Z"
}
```

### Check Job Status

```bash
GET /api/v1/jobs/{job_id}/status
Authorization: Bearer <access_token>
```

**Response:**
```json
{
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "status": "processing",
    "stage": "Downloading",
    "progress": 25.0,
    "created_at": "2024-01-15T10:30:00Z"
}
```

### Get Job Details

```bash
GET /api/v1/jobs/{job_id}/details
Authorization: Bearer <access_token>
```

**Response includes:**
- Full job metadata
- File information (size, MIME type, hash)
- Complete chain of custody log
- Storage location

### Download Forensic Report

```bash
GET /api/v1/jobs/{job_id}/report
Authorization: Bearer <access_token>
```

**Response:** PDF file download

### Verify Evidence Integrity

```bash
POST /api/v1/jobs/{job_id}/verify
Authorization: Bearer <access_token>
```

**Response:**
```json
{
    "job_id": "550e8400-e29b-41d4-a716-446655440000",
    "verification_timestamp": "2024-01-15T12:00:00Z",
    "original_hash": "a1b2c3d4...",
    "current_hash": "a1b2c3d4...",
    "matches": true,
    "verification_details": {
        "verified_by": "INV-001",
        "timestamp": "2024-01-15T12:00:00Z"
    }
}
```

## Further Reading

- [QUICKSTART.md](QUICKSTART.md) - Quick setup guide
- [README.md](README.md) - Full documentation
- [AUTHENTICATION_GUIDE.md](AUTHENTICATION_GUIDE.md) - Authentication setup
