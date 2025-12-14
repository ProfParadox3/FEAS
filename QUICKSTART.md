# Quick Start Guide - FEAS Backend

This guide will help you get the FEAS backend up and running quickly.

## Prerequisites

- Python 3.10 or higher
- pip package manager
- (Optional) PostgreSQL 15+ for production use

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Dynamo2k/FEAS.git
cd FEAS/backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

**For Quick Testing (SQLite):**
```env
USE_SQLITE=true
DEFAULT_ADMIN_EMAIL=admin@feas.local
DEFAULT_ADMIN_PASSWORD=admin123
SECRET_KEY=your-secret-key-change-in-production
```

**For Production (PostgreSQL):**
```env
USE_SQLITE=false
POSTGRES_SERVER=localhost
POSTGRES_USER=forensic
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=forensic_db
POSTGRES_PORT=5432
DATABASE_URL=postgresql://forensic:your_secure_password@localhost:5432/forensic_db

DEFAULT_ADMIN_EMAIL=admin@yourdomain.com
DEFAULT_ADMIN_PASSWORD=change-this-immediately
SECRET_KEY=generate-a-strong-random-secret-key
```

### 5. Set Up Database

**Option A: SQLite (Development/Testing)**

No additional setup needed! The database file will be created automatically on first run.

**Option B: PostgreSQL (Production)**

See [POSTGRESQL_SETUP.md](../POSTGRESQL_SETUP.md) for detailed instructions.

Quick PostgreSQL setup:
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE forensic_db;
CREATE USER forensic WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE forensic_db TO forensic;
\q
```

### 6. Start the Backend Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

On first run, the application will:
- Create all database tables automatically
- Create the default admin user from your `.env` configuration

### 7. Verify Installation

Open your browser and visit:
- API Documentation: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### 8. Login with Default Admin

**Default Credentials:**
- Email: `admin@feas.local` (or your `DEFAULT_ADMIN_EMAIL`)
- Password: `admin123` (or your `DEFAULT_ADMIN_PASSWORD`)

**⚠️ Important:** Change the admin password immediately after first login!

## Testing the API

### Register a New User

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "testpass123",
    "role": "Analyst"
  }'
```

### Login

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@feas.local&password=admin123"
```

Save the `access_token` from the response for authenticated requests.

### Get User Profile

```bash
curl -X GET "http://localhost:8000/api/v1/profile/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

## Common Issues

### Port 8000 Already in Use

```bash
# Find and kill the process using port 8000
lsof -ti:8000 | xargs kill -9
```

### Database Connection Error

**For SQLite:**
- Ensure `USE_SQLITE=true` in `.env`
- Check file permissions in the `backend` directory

**For PostgreSQL:**
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check credentials in `.env` match your PostgreSQL user
- Ensure the database exists: `psql -l | grep forensic_db`

### Module Not Found Errors

```bash
# Reinstall dependencies
pip install -r requirements.txt
```

### Permission Denied for Storage

```bash
# Create storage directories
mkdir -p evidence_storage
chmod 755 evidence_storage
```

## Next Steps

1. **Change Default Admin Password**: Login and update via profile endpoint
2. **Configure Storage**: Set up evidence storage location in `.env`
3. **Set Up Celery** (Optional): For background job processing
4. **Configure Redis** (Optional): For task queue
5. **Set Up Frontend**: See `frontend/README.md` for React app setup

## Production Deployment

For production deployment:

1. Use PostgreSQL instead of SQLite
2. Generate a strong `SECRET_KEY`:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```
3. Use environment variables or secrets management (never commit `.env`)
4. Set up reverse proxy (nginx/Apache)
5. Use HTTPS/SSL certificates
6. Configure proper logging and monitoring
7. Set up database backups
8. Use Docker Compose for easy deployment (see `docker-compose.yml`)

## Docker Deployment (Recommended)

```bash
cd backend
docker-compose up -d
```

This starts:
- PostgreSQL database
- Redis cache
- Backend API
- Celery worker
- Celery beat scheduler

## Documentation

- [Authentication Guide](../AUTHENTICATION_GUIDE.md)
- [PostgreSQL Setup](../POSTGRESQL_SETUP.md)
- [Full README](../README.md)
- [API Documentation](http://localhost:8000/docs) (when server is running)

## Support

For issues or questions:
- Check the [README](../README.md) for troubleshooting
- Review the API docs at `/docs` endpoint
- Check application logs for errors

---

**Security Reminder**: Always change default credentials before deploying to production!
