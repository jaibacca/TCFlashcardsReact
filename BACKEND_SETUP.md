# Backend Setup Guide

Complete guide to setting up the PostgreSQL backend for Traditional Chinese Flashcards.

## Prerequisites Installation

### 1. Install PostgreSQL

**Windows**:
1. Download from https://www.postgresql.org/download/windows/
2. Run the installer
3. Remember your superuser password!
4. Default port: 5432

**macOS** (using Homebrew):
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Linux** (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Verify PostgreSQL is Running

```bash
# Check if PostgreSQL is running
psql --version

# Connect to PostgreSQL (Windows/Linux)
psql -U postgres

# macOS
psql postgres
```

## Database Setup

### Step 1: Create Database

Open PostgreSQL command line:

```bash
psql -U postgres
```

Then run:

```sql
-- Create the database
CREATE DATABASE chinese_flashcards;

-- Verify it was created
\l

-- Exit
\q
```

### Step 2: Backend Installation

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install
```

### Step 3: Configure Environment

1. Copy the example env file:
```bash
cp .env.example .env
```

2. Edit `.env` with your PostgreSQL credentials:
```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=chinese_flashcards
DB_PASSWORD=your_password_here
DB_PORT=5432
PORT=3001
NODE_ENV=development
```

**Important**: Replace `your_password_here` with your actual PostgreSQL password!

### Step 4: Initialize Database Tables

```bash
npm run init-db
```

You should see:
```
🔧 Initializing database...
✅ Flashcards table created
✅ Indexes created
✅ Users table created
✅ User progress table created
✅ User stats table created
✨ Database initialization complete!
👍 All done!
```

### Step 5: Seed Sample Data (Optional)

```bash
npm run seed-db
```

This will load the sample flashcards from `sample-data.csv`.

### Step 6: Start the Backend Server

```bash
# Development mode (auto-restart on changes)
npm run dev

# OR Production mode
npm start
```

You should see:
```
╔═══════════════════════════════════════════════════════╗
║  🚀 TC Flashcards API Server                          ║
║  📡 Port: 3001                                        ║
║  🌍 Environment: development                          ║
║  ✅ Server is running!                                ║
╚═══════════════════════════════════════════════════════╝
```

## Testing the Backend

### Test with curl

```bash
# Health check
curl http://localhost:3001/api/health

# Get all flashcards
curl http://localhost:3001/api/flashcards

# Get all books
curl http://localhost:3001/api/flashcards/books
```

### Test with a browser

Open these URLs:
- http://localhost:3001/ (API info)
- http://localhost:3001/api/health (health check)
- http://localhost:3001/api/flashcards (all flashcards)

## Frontend Setup

### Step 1: Configure Frontend

The frontend `.env` file is already created. Verify it contains:

```
VITE_API_URL=http://localhost:3001/api
```

### Step 2: Update Frontend to Use Database

The frontend is currently using CSV. You have two options:

#### Option A: Keep Both (Recommended for now)
Keep the existing CSV upload feature AND add database support.

#### Option B: Switch to Database Only
Replace CSV functionality with database calls.

I'll show you Option A (hybrid approach) next.

## Running Both Servers

You need to run both frontend and backend simultaneously:

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd TCFlashcardsReact
npm run dev
```

Or use a single command (see below).

## Single Command to Run Both

### Option 1: Using npm-run-all

```bash
# In project root
npm install --save-dev npm-run-all

# Add to root package.json:
{
  "scripts": {
    "dev": "npm-run-all --parallel dev:*",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd TCFlashcardsReact && npm run dev"
  }
}

# Then run:
npm run dev
```

### Option 2: Using concurrently

```bash
# In project root
npm install --save-dev concurrently

# Add to root package.json:
{
  "scripts": {
    "dev": "concurrently \"npm run dev --prefix backend\" \"npm run dev --prefix TCFlashcardsReact\""
  }
}

# Then run:
npm run dev
```

## Troubleshooting

### PostgreSQL Connection Issues

**Error**: "password authentication failed"
- Check your `.env` DB_PASSWORD matches your PostgreSQL password
- Try connecting with: `psql -U postgres -d chinese_flashcards`

**Error**: "ECONNREFUSED"
- PostgreSQL is not running
- Start it: `brew services start postgresql@14` (macOS) or check Windows services

**Error**: "database does not exist"
- Run: `createdb chinese_flashcards`
- Or use `psql -U postgres` and run `CREATE DATABASE chinese_flashcards;`

### Backend Server Issues

**Error**: "Port 3001 already in use"
- Change PORT in `.env` to another port (e.g., 3002)
- Or find and kill the process using port 3001

**Error**: "Cannot find module"
- Run `npm install` in the backend directory
- Delete `node_modules` and run `npm install` again

### Frontend Connection Issues

**Error**: "Failed to fetch"
- Make sure backend is running on port 3001
- Check CORS settings in `backend/server.js`
- Verify `VITE_API_URL` in frontend `.env`

## Verifying Everything Works

1. **Backend health check**:
   ```bash
   curl http://localhost:3001/api/health
   ```
   Should return: `{"status":"ok",...}`

2. **Database connection**:
   ```bash
   psql -U postgres -d chinese_flashcards -c "SELECT COUNT(*) FROM flashcards;"
   ```
   Should show the count of flashcards

3. **Frontend to backend**:
   - Open frontend (http://localhost:5173)
   - Open browser console (F12)
   - Try loading data from database
   - Check for any errors in console

## Next Steps

1. ✅ Backend is running
2. ✅ Database is set up
3. ✅ Sample data is loaded
4. 🔄 Update frontend to fetch from database (see FRONTEND_INTEGRATION.md)

## Useful Commands

```bash
# Backend
cd backend
npm run dev           # Start development server
npm run init-db       # Initialize database tables
npm run seed-db       # Load sample data

# Database
psql -U postgres -d chinese_flashcards    # Connect to database
\dt                                        # List tables
SELECT * FROM flashcards LIMIT 5;         # View flashcards
\q                                         # Quit psql

# Frontend
cd TCFlashcardsReact
npm run dev           # Start frontend

# Both
npm run dev          # If you set up concurrent running
```

## Database Maintenance

### Backup database
```bash
pg_dump -U postgres chinese_flashcards > backup.sql
```

### Restore database
```bash
psql -U postgres chinese_flashcards < backup.sql
```

### Reset database
```bash
# Drop and recreate
psql -U postgres -c "DROP DATABASE chinese_flashcards;"
psql -U postgres -c "CREATE DATABASE chinese_flashcards;"
cd backend
npm run init-db
npm run seed-db
```

## Security Notes

- Never commit `.env` files with real passwords
- Use strong passwords for production
- Keep PostgreSQL updated
- Use environment-specific configs for deployment

Ready to integrate the frontend? See `FRONTEND_INTEGRATION.md`!
