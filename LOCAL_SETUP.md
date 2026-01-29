# Habit Tracker - Local PostgreSQL Version

This is a local PostgreSQL-based version of the Habit Tracker app, replacing the cloud-based Supabase backend.

## Architecture

- **Frontend**: React + TypeScript (Vite)
- **Backend**: Flask with SQLAlchemy ORM
- **Database**: PostgreSQL (local via Docker)
- **API**: RESTful JSON API

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for frontend development)
- Python 3.11+ (optional, for local Flask development)

### Running with Docker Compose

```bash
# Start all services (frontend, backend, database)
docker-compose up --build

# In another terminal, install frontend dependencies
npm install

# Run frontend development server
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173 (Vite dev server)
- **Backend API**: http://localhost:5000/api
- **Database**: localhost:5432

### Local Development (without Docker)

1. **Set up PostgreSQL locally:**
   ```bash
   # Make sure PostgreSQL is running on localhost:5432
   # Create database
   createdb -U postgres habit_tracker
   ```

2. **Install backend dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set environment variables:**
   - Copy `.env.local` to your environment or set manually:
   ```bash
   export DB_USER=postgres
   export DB_PASSWORD=your_password
   export DB_HOST=localhost
   export DB_PORT=5432
   export DB_NAME=habit_tracker
   ```

4. **Run Flask backend:**
   ```bash
   cd flask_backend
   python app.py
   ```

5. **In another terminal, run frontend:**
   ```bash
   npm install
   npm run dev
   ```

## API Endpoints

### Habits
- `GET /api/habits?month=1&year=2026` - Get habits for a month
- `POST /api/habits` - Create a new habit
  ```json
  {
    "name": "Exercise",
    "month": 1,
    "year": 2026
  }
  ```
- `DELETE /api/habits/:habitId` - Delete a habit

### Completions
- `GET /api/completions?habit_id=xxx&habit_id=yyy` - Get completions for habits
- `POST /api/completions` - Create a completion record
  ```json
  {
    "habit_id": "xxx",
    "day_number": 15,
    "completed": true
  }
  ```
- `PUT /api/completions` - Update a completion (by habit_id and day_number)
  ```json
  {
    "habit_id": "xxx",
    "day_number": 15,
    "completed": false
  }
  ```

## Environment Variables

### Frontend (.env.local)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (flask_backend/.env or docker-compose.yml)
```
DB_USER=user
DB_PASSWORD=password
DB_HOST=db
DB_PORT=5432
DB_NAME=habit_tracker
FLASK_ENV=development
FLASK_APP=app.py
```

## Database Schema

### habits table
- `id` (UUID primary key)
- `name` (varchar)
- `month` (integer)
- `year` (integer)
- `created_at` (timestamp)

### habit_completions table
- `id` (UUID primary key)
- `habit_id` (foreign key to habits)
- `day_number` (integer)
- `completed` (boolean)
- `created_at` (timestamp)

## Differences from Supabase Version

1. **No authentication** - This version is multi-user ready but doesn't have auth yet
2. **Direct REST API** - Uses Flask endpoints instead of Supabase SDK
3. **Local database** - PostgreSQL runs locally in Docker
4. **Environment configuration** - Use `.env` files instead of Supabase environment variables

## Next Steps

To add user authentication:
1. Add a `users` table to the database
2. Implement login/signup endpoints in Flask
3. Add JWT token support for authenticated requests
4. Update frontend to handle user sessions

## Troubleshooting

**Port already in use?**
```bash
# Change ports in docker-compose.yml and .env.local
```

**Database connection error?**
```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs db
```

**CORS errors?**
```bash
# CORS is already enabled in Flask app, 
# but check that API_URL in frontend matches backend port
```
