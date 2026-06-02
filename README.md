# Traditional Chinese Flashcards - Full Stack

A complete full-stack application for learning Traditional Chinese (Mandarin) with interactive flashcards, featuring a React frontend and Express.js + PostgreSQL backend.

**✨ Now includes Visual Studio solution files for easy development in Visual Studio!**

## 🌟 Features

### Learning Features
- **4 Interactive Drill Types**:
  1. Hanzi → Pinyin + English
  2. Pinyin → English  
  3. Pinyin → Hanzi (with stroke recognition)
  4. English → Hanzi (with stroke recognition)
- **Multiple Choice Mode**: Toggle between free input and multiple choice
- **Stroke Recognition Canvas**: Draw Chinese characters
- **Flexible Data Sources**: Load from database OR upload CSV files
- **Smart Book/Chapter Selection**: Easy drill customization

### Progress Tracking
- **Comprehensive Statistics**: Overall accuracy, per-drill performance
- **Study Streaks**: Track consecutive days of study
- **Card Mastery Levels**: New, Learning, Mastered
- **Persistent Storage**: Save progress locally (localStorage)

### Technical Features
- **RESTful API**: Express.js backend with PostgreSQL
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Statistics update automatically
- **Data Management**: CRUD operations for flashcards
- **Visual Studio Integration**: Open as a solution in Visual Studio

## 📁 Project Structure

```
tcflashcards-fullstack/
├── TCFlashcards.sln           # Visual Studio Solution
├── backend/                   # Express.js API server
│   ├── backend.njsproj        # VS Node.js project file
│   ├── config/
│   │   └── db.js              # PostgreSQL connection
│   ├── routes/
│   │   ├── flashcards.js      # Flashcard endpoints
│   │   └── stats.js           # Statistics endpoints
│   ├── scripts/
│   │   ├── init-db.js         # Database initialization
│   │   └── seed-db.js         # Sample data seeding
│   ├── server.js              # Main server file
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── TCFlashcardsReact/         # React frontend
│   ├── TCFlashcardsReact.njsproj  # VS Node.js project file
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── services/
│   │   │   └── api.js         # API client
│   │   ├── utils/             # Utility functions
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   ├── public/
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
├── sample-data.csv            # Sample flashcard data
├── package.json               # Root package.json (run both)
├── BACKEND_SETUP.md           # Backend setup guide
├── FRONTEND_INTEGRATION.md    # Integration guide
├── VISUAL_STUDIO_GUIDE.md     # Visual Studio setup
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** v14+ 
- **PostgreSQL** v12+
- **npm** or **yarn**
- **Visual Studio 2019/2022** (optional - for VS users)

### Option 1: Visual Studio (Recommended for Windows)

1. **Open Solution**:
   - Double-click `TCFlashcardsReact.slnx`
   - OR Open Visual Studio → File → Open → Project/Solution → Select `TCFlashcardsReact.slnx`

2. **First-Time Setup**:
   - Install dependencies (see VISUAL_STUDIO_GUIDE.md)
   - Configure `backend/.env`
   - Initialize database

3. **Run Both Projects**:
   - Right-click Solution → Configure Startup Projects
   - Set both projects to **Start**
   - Press **F5**

4. **See VISUAL_STUDIO_GUIDE.md for complete instructions**

### Option 2: Command Line (Cross-Platform)

```bash
# 1. Install all dependencies
npm run install:all

# 2. Set up database (see detailed instructions below)
# Create database first, then:
cp backend/.env.example backend/.env
# Edit backend/.env with your PostgreSQL credentials

# 3. Initialize and seed database
npm run setup:db

# 4. Start both servers
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

### Option 3: Step-by-Step Setup

#### Step 1: PostgreSQL Setup

1. **Install PostgreSQL** (if not installed)
2. **Create database**:
   ```sql
   CREATE DATABASE chinese_flashcards;
   ```
3. **Verify connection**:
   ```bash
   psql -U postgres -d chinese_flashcards
   ```

#### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials:
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_NAME=chinese_flashcards
# DB_HOST=localhost
# DB_PORT=5432
# PORT=3001

# Initialize database tables
npm run init-db

# Load sample data
npm run seed-db

# Start backend server
npm run dev
```

Backend will run on http://localhost:3001

#### Step 3: Frontend Setup

```bash
cd TCFlashcardsReact

# Install dependencies
npm install

# Configure environment (already set up)
# .env contains: VITE_API_URL=http://localhost:3001/api

# Start frontend
npm run dev
```

Frontend will run on http://localhost:5173

## 📖 Documentation

### Setup Guides
- **[BACKEND_SETUP.md](BACKEND_SETUP.md)** - Detailed backend setup and troubleshooting
- **[FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md)** - Frontend-backend integration guide
- **[VISUAL_STUDIO_GUIDE.md](VISUAL_STUDIO_GUIDE.md)** - Visual Studio setup

### Feature Documentation
- **[backend/README.md](backend/README.md)** - API documentation
- **[TCFlashcardsReact/README.md](TCFlashcardsReact/README.md)** - Frontend features
- **[TCFlashcardsReact/QUICKSTART.md](TCFlashcardsReact/QUICKSTART.md)** - Quick start guide
- **[TCFlashcardsReact/STATISTICS_GUIDE.md](TCFlashcardsReact/STATISTICS_GUIDE.md)** - Statistics feature guide

### 🚀 Deployment Guides (NEW!)
- **[DEPLOYMENT_README.md](DEPLOYMENT_README.md)** - 📌 START HERE for deployment
- **[DEPLOYMENT_GUIDE_BEGINNERS.md](DEPLOYMENT_GUIDE_BEGINNERS.md)** - Step-by-step deployment guide
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Deployment checklist
- **[DEPLOYMENT_TROUBLESHOOTING.md](DEPLOYMENT_TROUBLESHOOTING.md)** - Fix deployment issues
- **[DEPLOYMENT_QUICK_REFERENCE.md](DEPLOYMENT_QUICK_REFERENCE.md)** - Quick reference for deployed apps

## 🎯 Usage

### Loading Data

**Option A: From Database**
1. Click "💾 Database" button
2. Click "Load from Database"
3. Sample data (20 flashcards) will load

**Option B: From CSV**
1. Click "📁 CSV File" button
2. Upload a CSV file with columns: `Hanzi, Pinyin, English, Book, Chapter, Order`

### Selecting Content

1. Expand books to see chapters
2. Select specific chapters or entire books
3. See selected card count update in real-time

### Practicing

1. Toggle "Multiple Choice Mode" if desired
2. Choose one of the 4 drill types
3. Answer questions
4. Track your progress with statistics

## 🔧 API Endpoints

### Flashcards

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/flashcards` | Get all flashcards |
| GET | `/api/flashcards/books` | Get all book names |
| GET | `/api/flashcards/books/:book/chapters` | Get chapters for a book |
| GET | `/api/flashcards/book/:book` | Get flashcards by book |
| GET | `/api/flashcards/grouped` | Get flashcards grouped by book/chapter |
| POST | `/api/flashcards` | Add a flashcard |
| POST | `/api/flashcards/bulk` | Bulk insert flashcards |
| PUT | `/api/flashcards/:id` | Update a flashcard |
| DELETE | `/api/flashcards/:id` | Delete a flashcard |

See [backend/README.md](backend/README.md) for full API documentation.

## 🗄️ Database Schema

### flashcards
```sql
CREATE TABLE flashcards (
  id SERIAL PRIMARY KEY,
  hanzi VARCHAR(50) NOT NULL,
  pinyin VARCHAR(100) NOT NULL,
  english VARCHAR(200) NOT NULL,
  book VARCHAR(100),
  chapter VARCHAR(50),
  order_num INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🧪 Testing

### Test Backend
```bash
# Health check
curl http://localhost:3001/api/health

# Get flashcards
curl http://localhost:3001/api/flashcards

# Get books
curl http://localhost:3001/api/flashcards/books
```

### Test Frontend
1. Open http://localhost:5173
2. Load data from database
3. Try each drill type
4. Check statistics panel

## 🚢 Deployment

**Want to deploy your app to the internet for free?**

### 🌟 Recommended: Supabase + Vercel (Easiest!)

👉 **[Start here: DEPLOYMENT_README.md](DEPLOYMENT_README.md)** 👈

**Why Supabase?**
- ✅ **20-30 minutes** total setup (vs 60 min with Render)
- ✅ **No database expiration** (free forever!)
- ✅ **No cold starts** (always instant)
- ✅ **No backend server** to maintain
- ✅ **2 services instead of 3** (simpler!)

### 📚 Supabase Deployment Guides
- **[Beginner's Guide](DEPLOYMENT_GUIDE_SUPABASE.md)** - Complete walkthrough
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST_SUPABASE.md)** - Step-by-step
- **[Troubleshooting](DEPLOYMENT_TROUBLESHOOTING_SUPABASE.md)** - Fix issues
- **[Quick Reference](DEPLOYMENT_QUICK_REFERENCE_SUPABASE.md)** - Commands & URLs

### 🎯 What You'll Deploy To
- **Frontend**: Vercel (Free, always on, fast CDN)
- **Backend + Database**: Supabase (Free forever, 500 MB database)

**Total cost: $0** 💸 | **Setup time: 20-30 minutes** ⏱️

### 🔀 Alternative: Traditional Stack (Render)

If you prefer Express.js backend:
- **[Render Deployment Guide](DEPLOYMENT_README_RENDER.md)** - Traditional 3-tier setup
- **[Migration Guide](MIGRATION_EXPRESS_TO_SUPABASE.md)** - Switch from Render to Supabase

**We recommend Supabase** for easier deployment and no maintenance! 🚀

## 🛠️ Development

### Adding New Flashcards

**Via API**:
```bash
curl -X POST http://localhost:3001/api/flashcards \
  -H "Content-Type: application/json" \
  -d '{
    "Hanzi": "你好",
    "Pinyin": "nǐ hǎo",
    "English": "hello",
    "Book": "Book 1",
    "Chapter": "1",
    "Order": 1
  }'
```

**Via CSV Upload**:
1. Create CSV with proper format
2. Upload through frontend
3. (Future) Upload to database feature

### Database Management

```bash
# Backup
pg_dump -U postgres chinese_flashcards > backup.sql

# Restore
psql -U postgres chinese_flashcards < backup.sql

# Reset
psql -U postgres -c "DROP DATABASE chinese_flashcards;"
psql -U postgres -c "CREATE DATABASE chinese_flashcards;"
cd backend && npm run init-db && npm run seed-db
```

## 🐛 Troubleshooting

### Backend Issues

**Problem**: "ECONNREFUSED" or connection refused
- **Solution**: Check if PostgreSQL is running: `psql -U postgres -l`

**Problem**: "password authentication failed"
- **Solution**: Check `.env` credentials match PostgreSQL password

**Problem**: "Port 3001 already in use"
- **Solution**: Change `PORT` in backend `.env` or kill existing process

### Frontend Issues

**Problem**: "Failed to fetch"
- **Solution**: Ensure backend is running on port 3001
- **Solution**: Check `VITE_API_URL` in frontend `.env`

**Problem**: CORS errors
- **Solution**: Verify CORS settings in `backend/server.js`

See [BACKEND_SETUP.md](BACKEND_SETUP.md) for more troubleshooting.

## 📝 CSV Format

Your CSV should have these columns:
```
Hanzi,Pinyin,English,Book,Chapter,Order
```

Example:
```csv
Hanzi,Pinyin,English,Book,Chapter,Order
你好,nǐ hǎo,hello,Book 1,1,1
謝謝,xiè xie,thank you,Book 1,1,2
再見,zài jiàn,goodbye,Book 1,1,3
```

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - feel free to use and modify!

## 🆘 Getting Help

- Check the documentation in `/docs` folder
- Review troubleshooting sections
- Check console logs (browser F12 and terminal)
- Verify all services are running

## 🎉 Acknowledgments

Built with:
- React 19 + Vite
- Express.js
- PostgreSQL
- Node.js

---

**Ready to start learning Traditional Chinese? 加油！(jiā yóu!)**
