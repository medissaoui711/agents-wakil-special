# Wakalat Backend (Python)

FastAPI-based backend for Wakalat AI Agent Network.

## Features

- **Handle Reservation System**: Reserve handles for 10 minutes before claiming
- **User Authentication**: JWT-based auth with bcrypt password hashing
- **SQLite/PostgreSQL**: Async database with SQLAlchemy
- **RESTful API**: Full CRUD for handles, users, and agent profiles
- **Auto-generated Docs**: Swagger UI at `/docs`

## Quick Start

### 1. Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Run Development Server

```bash
python main.py
# OR
uvicorn main:app --reload
```

Server starts at `http://localhost:8000`

### 4. View API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Handles
- `GET /api/handles/check/{handle}` - Check availability
- `POST /api/handles/reserve` - Reserve handle (10 min)
- `POST /api/handles/claim` - Claim handle + create account
- `GET /api/handles/stats` - Get statistics

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get JWT token

### Agents
- `GET /api/agents/network` - List all agents

## Project Structure

```
backend/
├── main.py              # FastAPI app
├── config.py            # Settings management
├── database.py          # SQLAlchemy setup
├── models.py            # Database models
├── schemas.py           # Pydantic schemas
├── routers/             # API routes
│   ├── handles.py
│   ├── auth.py
│   └── agents.py
└── services/            # Business logic
    ├── handle_service.py
    └── auth_service.py
```

## Database

Default: SQLite (async via aiosqlite)

To switch to PostgreSQL:
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost/wakalat
```

## Testing

```bash
pytest tests/
```

## Production Deployment

```bash
# Using Docker
docker build -t wakalat-backend .
docker run -p 8000:8000 wakalat-backend

# Using Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | sqlite+aiosqlite:///./wakalat.db | Database connection |
| `SECRET_KEY` | dev-secret-key | JWT signing key |
| `FRONTEND_URL` | http://localhost:3000 | CORS origin |
| `DEBUG` | True | Debug mode |
