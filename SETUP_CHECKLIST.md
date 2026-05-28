# Setup Checklist

Use this checklist to set up your Traditional Chinese Flashcards backend.

## Prerequisites ✓

- [ ] Node.js installed (v14+)
  ```bash
  node --version
  ```
- [ ] npm installed (v6+)
  ```bash
  npm --version
  ```
- [ ] PostgreSQL installed (v12+)
  ```bash
  psql --version
  ```

## Database Setup ✓

- [ ] PostgreSQL service is running
  ```bash
  # Windows: Check Services
  # macOS: brew services list
  # Linux: systemctl status postgresql
  ```
- [ ] Created `chinese_flashcards` database
  ```sql
  CREATE DATABASE chinese_flashcards;
  ```
- [ ] Can connect to database
  ```bash
  psql -U postgres -d chinese_flashcards
  ```

## Backend Installation ✓

- [ ] Navigated to backend directory
  ```bash
  cd backend
  ```
- [ ] Installed dependencies
  ```bash
  npm install
  ```
- [ ] Copied environment file
  ```bash
  cp .env.example .env
  ```
- [ ] Configured `.env` with correct credentials
  ```
  DB_USER=postgres
  DB_HOST=localhost
  DB_NAME=chinese_flashcards
  DB_PASSWORD=your_actual_password
  DB_PORT=5432
  PORT=3001
  ```
- [ ] Initialized database tables
  ```bash
  npm run init-db
  ```
- [ ] Seeded sample data
  ```bash
  npm run seed-db
  ```
- [ ] Started backend server
  ```bash
  npm run dev
  ```
- [ ] Verified backend is running
  ```bash
  curl http://localhost:3001/api/health
  ```

## Frontend Setup ✓

- [ ] Navigated to frontend directory
  ```bash
  cd TCFlashcardsReact
  ```
- [ ] Verified `.env` file exists with:
  ```
  VITE_API_URL=http://localhost:3001/api
  ```
- [ ] Installed/verified dependencies
  ```bash
  npm install
  ```
- [ ] Started frontend server
  ```bash
  npm run dev
  ```
- [ ] Opened browser to http://localhost:5173

## Integration Testing ✓

- [ ] Backend health check passes
  - Open: http://localhost:3001/api/health
  - Should see: `{"status":"ok",...}`

- [ ] Database has data
  ```bash
  psql -U postgres -d chinese_flashcards -c "SELECT COUNT(*) FROM flashcards;"
  ```
  - Should show: `20` (or number of flashcards)

- [ ] Frontend loads
  - Open: http://localhost:5173
  - Should see app interface

- [ ] Can fetch flashcards via API
  ```bash
  curl http://localhost:3001/api/flashcards
  ```
  - Should return JSON array of flashcards

## Optional: Frontend Database Integration ✓

- [ ] Read `FRONTEND_INTEGRATION.md`
- [ ] Updated `App.jsx` with database loading code
- [ ] Added CSS styles for database toggle
- [ ] Tested loading from database in UI
- [ ] Verified data appears correctly

## Verification Tests ✓

### Test 1: Backend API
- [ ] Health endpoint works
- [ ] Flashcards endpoint returns data
- [ ] Books endpoint returns list
- [ ] Can add a flashcard (POST)

### Test 2: Database
- [ ] Can query flashcards table
- [ ] Sample data exists
- [ ] Tables are properly created

### Test 3: Frontend
- [ ] App loads without errors
- [ ] Can upload CSV (existing feature)
- [ ] Statistics panel shows
- [ ] Book/chapter selection works
- [ ] All 4 drills work

### Test 4: Integration (if implemented)
- [ ] Can toggle between CSV and Database
- [ ] Database button appears
- [ ] Can load from database
- [ ] Loaded data appears in app
- [ ] Can practice with database data

## Production Readiness ✓

- [ ] Backend has error handling
- [ ] Environment variables are configured
- [ ] CORS is set up correctly
- [ ] Database credentials are secure (not in git)
- [ ] `.env` files are in `.gitignore`
- [ ] Documentation is complete

## Deployment Preparation ✓

- [ ] Read `DEPLOYMENT.md`
- [ ] Chose hosting platform for backend
- [ ] Chose hosting platform for frontend
- [ ] Understand environment variable setup
- [ ] Understand database hosting options

## Troubleshooting Checklist ✓

If something doesn't work:

- [ ] Check both terminal outputs (backend & frontend)
- [ ] Check browser console (F12)
- [ ] Verify PostgreSQL is running
- [ ] Verify backend is running on port 3001
- [ ] Verify frontend is running on port 5173
- [ ] Check `.env` files are configured correctly
- [ ] Try restarting servers
- [ ] Check `BACKEND_SETUP.md` troubleshooting section

## Common Commands Reference ✓

```bash
# From project root
npm run dev              # Run both servers
npm run install:all      # Install all dependencies
npm run setup:db         # Initialize + seed database

# Backend specific
cd backend
npm run dev              # Start with auto-reload
npm run init-db          # Create tables
npm run seed-db          # Load sample data

# Frontend specific
cd TCFlashcardsReact
npm run dev              # Start dev server
npm run build            # Build for production

# Database
psql -U postgres -d chinese_flashcards
\dt                      # List tables
SELECT * FROM flashcards LIMIT 5;
\q                       # Quit
```

## Success Criteria ✓

You're done when:

- [x] Backend server starts without errors
- [x] Frontend loads in browser
- [x] Database contains sample data
- [x] API endpoints return correct data
- [x] All drill types work
- [x] Statistics track correctly
- [x] No errors in browser console
- [x] No errors in terminal

## Next Actions

After setup is complete:

1. **Start Developing**
   - Add more flashcards
   - Customize drill types
   - Enhance UI/UX

2. **Optional Integrations**
   - Connect frontend to database
   - Add CSV upload to database
   - Implement user authentication

3. **Prepare for Deployment**
   - Choose hosting platforms
   - Set up production databases
   - Configure environment variables

---

**Need Help?**
- Check `QUICK_REFERENCE.md` for commands
- Read `BACKEND_SETUP.md` for detailed instructions
- See `TROUBLESHOOTING` sections in documentation
- Review `ARCHITECTURE.md` to understand the system

**Ready to start?**
```bash
npm run dev
```

加油！(jiā yóu - Let's go!) 🚀
