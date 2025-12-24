# PostgreSQL Setup Guide for FEAS

This guide will help you set up PostgreSQL for the Forensic Evidence Acquisition System (FEAS).

## Option 1: Using Docker (Recommended)

The easiest way to use PostgreSQL is with the provided Docker Compose configuration.

1. Make sure Docker and Docker Compose are installed
2. From the `backend` directory, run:
   ```bash
   docker-compose up -d
   ```

This will start:
- PostgreSQL database on port 5432
- Redis on port 6379
- Backend API on port 8000

## Option 2: Manual PostgreSQL Installation

### On Ubuntu/Debian:

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

In the PostgreSQL prompt:
```sql
CREATE DATABASE forensic_db;
CREATE USER forensic WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE forensic_db TO forensic;
\q
```

### On macOS:

```bash
# Using Homebrew
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Create database
createdb forensic_db
```

### On Windows:

1. Download PostgreSQL installer from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Use pgAdmin (included) to create database `forensic_db`

## Configuration

1. Create a `.env` file in the `backend` directory (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your PostgreSQL credentials:
   ```env
   POSTGRES_SERVER=localhost
   POSTGRES_USER=forensic
   POSTGRES_PASSWORD=password
   POSTGRES_DB=forensic_db
   POSTGRES_PORT=5432
   DATABASE_URL=postgresql://forensic:password@localhost:5432/forensic_db
   
   # Admin credentials (will be created on first run)
   DEFAULT_ADMIN_EMAIL=admin@feas.local
   DEFAULT_ADMIN_PASSWORD=admin123
   ```

3. **Important**: Change the default admin password in production!

## Running the Application

### With PostgreSQL:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

On first run, the application will:
1. Create all database tables automatically
2. Create a default admin user with credentials from `.env`

### With SQLite (for testing):

If you want to use SQLite instead of PostgreSQL for testing:

```bash
export USE_SQLITE=true
uvicorn app.main:app --reload
```

Or on Windows:
```cmd
set USE_SQLITE=true
uvicorn app.main:app --reload
```

## Default Admin Login

After first run, you can login with:
- **Email**: `admin@feas.local` (or value from `DEFAULT_ADMIN_EMAIL`)
- **Password**: `admin123` (or value from `DEFAULT_ADMIN_PASSWORD`)

**⚠️ Security Warning**: Change the default admin password immediately in production!

## Verifying the Setup

1. Start the backend server
2. Visit http://localhost:8000/docs for the API documentation
3. Test the `/api/v1/auth/login` endpoint with admin credentials
4. Check database tables:
   ```bash
   psql -U forensic -d forensic_db -c "\dt"
   ```

You should see these tables:
- `users` - User authentication
- `user_profiles` - User profile information
- `jobs` - Forensic jobs
- `chain_of_custody` - Audit logs
- `social_links` - Social media links

## Troubleshooting

### Connection refused error:
- Ensure PostgreSQL is running: `sudo systemctl status postgresql`
- Check if port 5432 is available: `sudo netstat -tulpn | grep 5432`

### Authentication failed:
- Verify credentials in `.env` match the database user
- Check PostgreSQL `pg_hba.conf` for authentication method

### Tables not created:
- Check application logs for errors
- Ensure the database user has CREATE privileges
- Try manually running: `python -c "from app.db.init_db import init_db; init_db()"`

## Database Migrations

Currently, the application uses automatic table creation via SQLAlchemy.

For production, consider using Alembic for database migrations:
```bash
pip install alembic
alembic init alembic
# Configure alembic.ini with your DATABASE_URL
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```
