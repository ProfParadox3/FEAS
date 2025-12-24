# Authentication Setup Guide

## Overview

FEAS now includes a robust authentication system with:
- Secure password hashing using bcrypt
- JWT token-based authentication
- Default admin user creation on first run
- PostgreSQL or SQLite database support

## Database Initialization

On first startup, the application will automatically:
1. Create all required database tables
2. Create a default admin user from environment variables

## Default Admin Credentials

**Important**: The default admin user is created from `.env` configuration:

```env
DEFAULT_ADMIN_EMAIL=admin@feas.local
DEFAULT_ADMIN_PASSWORD=admin123
```

**⚠️ Security Warning**: 
- Change these credentials in production!
- Update the `.env` file before first run
- After deployment, login and change the password immediately

## User Registration

Users can register through the API:

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Investigator Name",
    "email": "investigator@example.com",
    "password": "securepassword123",
    "role": "Analyst"
  }'
```

Response includes:
- JWT access token
- User information
- Token expiry (8 days by default)

## User Login

Login with email and password:

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@feas.local&password=admin123"
```

Response:
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "name": "System Administrator",
    "email": "admin@feas.local",
    "role": "Admin",
    "bio": "Default system administrator account",
    "is_admin": true
  }
}
```

## Using Authentication Tokens

Include the token in the `Authorization` header for protected endpoints:

```bash
curl -X GET "http://localhost:8000/api/v1/profile/" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Protected Endpoints

The following endpoints require authentication:
- `/api/v1/profile/` - Get/update user profile
- `/api/v1/auth/me` - Get current user information

## Database Models

### User Table
- `id` - Primary key
- `email` - Unique, indexed
- `password_hash` - Bcrypt hashed password
- `is_active` - Account status
- `is_admin` - Admin privileges flag
- `created_at` - Timestamp
- `updated_at` - Timestamp

### UserProfile Table
- `id` - Primary key
- `user_id` - Foreign key to User
- `name` - Display name
- `role` - User role (Admin, Analyst, etc.)
- `bio` - Biography/description
- `updated_at` - Timestamp

## Password Security

- Passwords are hashed using bcrypt with automatic salt generation
- Passwords are never stored in plain text
- Password verification is done securely without exposing the hash
- JWT tokens expire after 8 days (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`)

## Token Configuration

Customize token expiration in `.env`:

```env
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=11520  # 8 days
```

**⚠️ Production Security**:
- Use a strong, randomly generated `SECRET_KEY`
- Never commit the `.env` file to version control
- Use environment variables or secrets management in production
- Consider shorter token expiration times for sensitive operations

## Troubleshooting

### "Could not validate credentials" error
- Token may have expired (8 day default)
- Invalid or malformed token
- Secret key changed (invalidates all existing tokens)
- Solution: Login again to get a new token

### "Email already registered" error
- User with that email already exists
- Solution: Use login instead, or use a different email

### Database connection errors
- Ensure PostgreSQL is running (or USE_SQLITE=true for testing)
- Check database credentials in `.env`
- Verify database exists and user has permissions

### "No such table: users" error
- Database tables not created
- Solution: Restart the application to trigger automatic table creation
- Or run: `python -c "from app.db.init_db import init_db; init_db()"`

## API Documentation

For interactive API documentation, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
