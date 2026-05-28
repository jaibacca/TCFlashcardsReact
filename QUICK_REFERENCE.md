# Quick Reference Card

## 🚀 Start Development

```bash
# From project root
npm run dev
```
This starts both backend (port 3001) and frontend (port 5173).

## 📝 Essential Commands

### Root Commands (run from project root)
```bash
npm run install:all      # Install all dependencies
npm run dev             # Run both servers
npm run setup:db        # Initialize + seed database
npm run dev:backend     # Run backend only
npm run dev:frontend    # Run frontend only
```

### Backend Commands (run from `backend/`)
```bash
npm install            # Install dependencies
npm run dev            # Start with auto-reload
npm start              # Start production
npm run init-db        # Create tables
npm run seed-db        # Load sample data
```

### Frontend Commands (run from `TCFlashcardsReact/`)
```bash
npm install            # Install dependencies
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
```

## 🔗 Important URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/api/health
- **API Root**: http://localhost:3001/api/flashcards

## 🗄️ Database Quick Commands

```bash
# Connect to database
psql -U postgres -d chinese_flashcards

# Useful SQL commands (once connected)
\dt                              # List tables
SELECT COUNT(*) FROM flashcards; # Count flashcards
SELECT * FROM flashcards LIMIT 5; # View first 5
\q                               # Quit

# Backup/Restore
pg_dump -U postgres chinese_flashcards > backup.sql
psql -U postgres chinese_flashcards < backup.sql
```

## 📁 File Locations

### Configuration Files
- Backend env: `backend/.env`
- Frontend env: `TCFlashcardsReact/.env`
- Backend config: `backend/config/db.js`
- API routes: `backend/routes/`

### Frontend Key Files
- Main app: `TCFlashcardsReact/src/App.jsx`
- API client: `TCFlashcardsReact/src/services/api.js`
- Drill components: `TCFlashcardsReact/src/components/`
- CSV parser: `TCFlashcardsReact/src/utils/csvParser.js`

### Data Files
- Sample CSV: `sample-data.csv`
- Database scripts: `backend/scripts/`

## 🔧 Environment Variables

### Backend (`.env`)
```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=chinese_flashcards
DB_PASSWORD=your_password
DB_PORT=5432
PORT=3001
```

### Frontend (`.env`)
```
VITE_API_URL=http://localhost:3001/api
```

## 🐛 Quick Troubleshooting

### Backend Won't Start
```bash
# Check PostgreSQL is running
psql -U postgres -l

# Check port 3001 is free
netstat -ano | findstr :3001

# Reinstall dependencies
cd backend
rm -rf node_modules
npm install
```

### Frontend Won't Connect to Backend
```bash
# 1. Verify backend is running
curl http://localhost:3001/api/health

# 2. Check frontend .env
cat TCFlashcardsReact/.env

# 3. Check browser console (F12)
# Look for CORS or connection errors
```

### Database Issues
```bash
# Reset database
psql -U postgres -c "DROP DATABASE IF EXISTS chinese_flashcards;"
psql -U postgres -c "CREATE DATABASE chinese_flashcards;"
cd backend
npm run init-db
npm run seed-db
```

### Port Conflicts
```bash
# Change backend port in backend/.env
PORT=3002

# Change frontend port by editing vite.config.js
# or use: npm run dev -- --port 5174
```

## 📊 API Examples

```bash
# Get all flashcards
curl http://localhost:3001/api/flashcards

# Get books
curl http://localhost:3001/api/flashcards/books

# Add flashcard
curl -X POST http://localhost:3001/api/flashcards \
  -H "Content-Type: application/json" \
  -d '{"Hanzi":"你好","Pinyin":"nǐ hǎo","English":"hello","Book":"Book 1","Chapter":"1","Order":1}'

# Delete flashcard
curl -X DELETE http://localhost:3001/api/flashcards/1
```

## 🎯 Testing Checklist

- [ ] Backend health check responds: `curl http://localhost:3001/api/health`
- [ ] Database has data: `psql -U postgres -d chinese_flashcards -c "SELECT COUNT(*) FROM flashcards;"`
- [ ] Frontend loads: Open http://localhost:5173
- [ ] Can load from database: Click "Database" → "Load from Database"
- [ ] Can select books/chapters
- [ ] Drills work: Try each drill type
- [ ] Statistics update: Complete some drills, check stats

## 📚 Documentation Files

- `README.md` - Main project overview
- `BACKEND_SETUP.md` - Detailed backend setup
- `FRONTEND_INTEGRATION.md` - Frontend-backend integration
- `backend/README.md` - API documentation
- `TCFlashcardsReact/README.md` - Frontend features
- `TCFlashcardsReact/QUICKSTART.md` - User guide
- `TCFlashcardsReact/STATISTICS_GUIDE.md` - Statistics help

## 🎨 Data Format

### CSV Format
```csv
Hanzi,Pinyin,English,Book,Chapter,Order
你好,nǐ hǎo,hello,Book 1,1,1
```

### JSON Format (API)
```json
{
  "id": 1,
  "Hanzi": "你好",
  "Pinyin": "nǐ hǎo",
  "English": "hello",
  "Book": "Book 1",
  "Chapter": "1",
  "Order": 1
}
```

## 🆘 Help Resources

**PostgreSQL Help**:
```bash
psql --help                    # PostgreSQL help
psql -U postgres -c "\?"       # SQL commands help
```

**npm Help**:
```bash
npm help                       # npm commands
npm run                        # List available scripts
```

**Node.js Version**:
```bash
node --version                 # Should be v14+
npm --version                  # Should be v6+
```

## 💡 Pro Tips

1. **Use tmux/screen** for running multiple terminals
2. **Keep logs visible** to catch errors quickly
3. **Commit .env.example** but never commit `.env`
4. **Backup database** before major changes
5. **Use browser DevTools** (F12) to debug frontend
6. **Check both backend AND frontend logs** when debugging

---

**Need more help?** Check the full documentation files listed above!
