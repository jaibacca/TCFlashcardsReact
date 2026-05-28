# System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                     (http://localhost:5173)                  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ HTTP Requests
                        │ (REST API)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Components:                                          │  │
│  │  • App.jsx (Main)                                     │  │
│  │  • DataSelector                                       │  │
│  │  • Statistics                                         │  │
│  │  • HanziToPinyinDrill                                │  │
│  │  • PinyinToEnglishDrill                              │  │
│  │  • PinyinToHanziDrill (+ StrokeInput)               │  │
│  │  • EnglishToHanziDrill (+ StrokeInput)              │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services:                                            │  │
│  │  • api.js (API Client)                               │  │
│  │    - flashcardsApi                                    │  │
│  │    - statsApi                                         │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Utils:                                               │  │
│  │  • csvParser.js                                       │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ API Calls
                        │ (fetch/axios)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              Express.js Backend API Server                   │
│                  (http://localhost:3001)                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes:                                              │  │
│  │  • /api/flashcards (GET, POST, PUT, DELETE)         │  │
│  │  • /api/flashcards/books                             │  │
│  │  • /api/flashcards/grouped                           │  │
│  │  • /api/stats (Future)                               │  │
│  │  • /api/health                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Middleware:                                          │  │
│  │  • CORS                                               │  │
│  │  • JSON Parser                                        │  │
│  │  • Error Handler                                      │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ SQL Queries
                        │ (pg driver)
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                        │
│                  (localhost:5432/chinese_flashcards)         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Tables:                                              │  │
│  │  • flashcards                                         │  │
│  │    - id, hanzi, pinyin, english                      │  │
│  │    - book, chapter, order_num                        │  │
│  │  • users (future)                                     │  │
│  │  • user_progress (future)                            │  │
│  │  • user_stats (future)                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Loading Flashcards from Database

```
User clicks "Load from Database"
    ↓
Frontend: loadDataFromDatabase()
    ↓
API Call: flashcardsApi.getAll()
    ↓
HTTP GET → /api/flashcards
    ↓
Backend Route: flashcards.js GET /
    ↓
SQL Query: SELECT * FROM flashcards ORDER BY book, chapter, order_num
    ↓
PostgreSQL returns data
    ↓
Backend formats as JSON with proper field names (Hanzi, Pinyin, etc.)
    ↓
HTTP Response → Frontend
    ↓
Frontend: setAllData(data), setFilteredData(data)
    ↓
React re-renders with loaded flashcards
    ↓
User can select books/chapters and start drills
```

### Practicing a Drill

```
User selects drill type and starts
    ↓
Current flashcard displayed
    ↓
User submits answer
    ↓
Frontend validates answer
    ↓
Statistics.updateStatistics() called
    ↓
localStorage updated with new stats
    ↓
Score updated in UI
    ↓
Next flashcard loaded
```

## Component Hierarchy

```
App.jsx
├── Statistics
├── DataSelector
│   └── Book/Chapter checkboxes
├── Multiple Choice Toggle
└── Drills Section
    ├── HanziToPinyinDrill
    ├── PinyinToEnglishDrill
    ├── PinyinToHanziDrill
    │   └── StrokeInput (canvas)
    └── EnglishToHanziDrill
        └── StrokeInput (canvas)
```

## API Architecture

### RESTful Endpoints

```
GET    /api/health                              → Health check
GET    /api/flashcards                          → All flashcards
GET    /api/flashcards/books                    → List of books
GET    /api/flashcards/books/:book/chapters     → Chapters for book
GET    /api/flashcards/book/:book               → Flashcards by book
GET    /api/flashcards/book/:book/chapter/:ch   → By book & chapter
GET    /api/flashcards/grouped                  → Grouped by book/ch
POST   /api/flashcards                          → Add flashcard
POST   /api/flashcards/bulk                     → Bulk insert
PUT    /api/flashcards/:id                      → Update flashcard
DELETE /api/flashcards/:id                      → Delete flashcard
DELETE /api/flashcards                          → Delete all
```

## State Management

### Frontend State (React useState)

```javascript
// App.jsx
allData           → All loaded flashcards
filteredData      → Filtered by book/chapter selection
selectedBooks     → Array of selected book names
selectedChapters  → Array of "Book-Chapter" keys
currentDrill      → Active drill { type, data }
isMultipleChoice  → Boolean toggle
dataSource        → 'csv' | 'database'
isLoadingFromDB   → Boolean loading state
dbError           → Error message string

// Each Drill Component
currentIndex      → Index in flashcard array
inputs/selections → User's current answers
showAnswer        → Boolean (show/hide answer)
score             → { correct, total }
```

### Backend State

```
Stateless REST API - no session state
Database connection pool managed by pg library
All state persisted in PostgreSQL
```

## Database Schema Detail

```sql
-- Main flashcards table
flashcards
├── id (SERIAL PRIMARY KEY)           → Auto-increment ID
├── hanzi (VARCHAR(50))                → Chinese characters
├── pinyin (VARCHAR(100))              → Romanization
├── english (VARCHAR(200))             → Definition
├── book (VARCHAR(100))                → Book name
├── chapter (VARCHAR(50))              → Chapter number
├── order_num (INTEGER)                → Display order
├── created_at (TIMESTAMP)             → Creation time
└── updated_at (TIMESTAMP)             → Last update

-- Index for performance
INDEX idx_book_chapter ON (book, chapter)

-- Future: User tables
users
├── id (SERIAL PRIMARY KEY)
├── username (VARCHAR(50) UNIQUE)
├── email (VARCHAR(100) UNIQUE)
├── password_hash (VARCHAR(255))
└── created_at (TIMESTAMP)

user_progress
├── id (SERIAL PRIMARY KEY)
├── user_id (FK → users.id)
├── flashcard_id (FK → flashcards.id)
├── correct_count (INTEGER)
├── total_attempts (INTEGER)
├── last_attempt (TIMESTAMP)
└── mastery_level (VARCHAR(20))
```

## Technology Stack

```
┌─────────────────────────────────────┐
│         Frontend Layer              │
├─────────────────────────────────────┤
│ React 19                            │
│ Vite (Build Tool)                   │
│ JavaScript (ES6+)                   │
│ CSS3 (Flexbox/Grid)                 │
│ HTML5 Canvas (Stroke Input)         │
└─────────────────────────────────────┘
                ↕
┌─────────────────────────────────────┐
│      Communication Layer            │
├─────────────────────────────────────┤
│ REST API (JSON)                     │
│ Fetch API                           │
│ CORS                                │
└─────────────────────────────────────┘
                ↕
┌─────────────────────────────────────┐
│         Backend Layer               │
├─────────────────────────────────────┤
│ Node.js v14+                        │
│ Express.js 4.x                      │
│ pg (PostgreSQL driver)              │
│ dotenv (Environment vars)           │
│ cors (CORS middleware)              │
└─────────────────────────────────────┘
                ↕
┌─────────────────────────────────────┐
│        Database Layer               │
├─────────────────────────────────────┤
│ PostgreSQL 12+                      │
│ Connection Pool                     │
│ SQL Queries                         │
└─────────────────────────────────────┘
```

## Security Considerations

### Current Implementation
- ✅ CORS configured for localhost
- ✅ SQL parameterized queries (prevents SQL injection)
- ✅ Environment variables for sensitive data
- ✅ Input validation on API endpoints

### Future Enhancements (Production)
- 🔄 Add authentication (JWT)
- 🔄 Add authorization (role-based)
- 🔄 Add rate limiting
- 🔄 Add HTTPS/TLS
- 🔄 Add input sanitization
- 🔄 Add API key authentication
- 🔄 Hash user passwords (bcrypt)

## Scalability Considerations

### Current Architecture
- Single backend server
- Direct PostgreSQL connection
- Client-side statistics storage

### Future Scalability
- Load balancing (multiple backend instances)
- Redis caching layer
- CDN for static assets
- Database replication (read replicas)
- Microservices architecture
- Containerization (Docker)

## Development Workflow

```
Developer
    ↓
Git Repository
    ↓
Local Development
    ├→ Frontend Dev Server (Vite HMR)
    └→ Backend Dev Server (Nodemon)
    ↓
Testing
    ├→ Manual testing
    ├→ API testing (curl/Postman)
    └→ Browser DevTools
    ↓
Build
    ├→ Frontend: npm run build
    └→ Backend: Copy to server
    ↓
Deployment
    ├→ Frontend: Vercel/Netlify
    └→ Backend: Railway/Heroku
    ↓
Production
```

## Monitoring & Logging

### Current Logging
```javascript
// Backend
console.log('✅ Connected to database')
console.log(`${timestamp} - ${method} ${path}`)
console.error('❌ Database error:', err)

// Frontend
console.log('✅ Loaded N flashcards')
console.error('Database error:', error)
```

### Future Monitoring
- Error tracking (Sentry)
- Performance monitoring (New Relic)
- Logging service (LogRocket)
- Analytics (Google Analytics)
- Uptime monitoring (UptimeRobot)

---

This architecture supports:
- ✅ CRUD operations on flashcards
- ✅ Flexible data loading (CSV or Database)
- ✅ Real-time statistics tracking
- ✅ Multiple drill types with various input methods
- ✅ Responsive design
- ✅ Easy deployment and scaling
