# Deployment Architecture

Visual guide to understand how your deployed app works.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
│                    (Anywhere in World)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTPS
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    VERCEL (Frontend)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React App (Built from TCFlashcardsReact/)           │   │
│  │  - Static HTML/CSS/JS files                          │   │
│  │  - Served via global CDN                             │   │
│  │  - Always on, no spin-down                           │   │
│  │  - URL: https://your-app.vercel.app                  │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ API Calls
                     │ (CORS Protected)
                     │
┌────────────────────▼────────────────────────────────────────┐
│                 RENDER (Backend API)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Express.js Server (backend/)                        │   │
│  │  - RESTful API                                       │   │
│  │  - Routes: /api/flashcards, /api/stats              │   │
│  │  - Spins down after 15 min (free tier)              │   │
│  │  - URL: https://your-backend.onrender.com           │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ SQL Queries
                     │ (DATABASE_URL)
                     │
┌────────────────────▼────────────────────────────────────────┐
│               RENDER (PostgreSQL Database)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL Database                                 │   │
│  │  - Tables: flashcards, users, user_progress, etc.   │   │
│  │  - 1 GB storage (free tier)                          │   │
│  │  - 90-day expiration (free tier)                     │   │
│  │  - Name: chinese_flashcards                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow

### User Loads Homepage

```
1. User visits: https://your-app.vercel.app
                     ↓
2. Vercel serves index.html + React bundle
                     ↓
3. Browser loads React app
                     ↓
4. User sees homepage (Data Selector)
```

**Time: < 1 second** (Vercel CDN is fast!)

---

### User Loads Flashcards from Database

```
1. User clicks "Load from Database"
                     ↓
2. React calls: fetch('https://your-backend.onrender.com/api/flashcards')
                     ↓
3. Request goes through CORS check (backend verifies origin)
                     ↓
4. Backend queries: SELECT * FROM flashcards
                     ↓
5. PostgreSQL returns rows
                     ↓
6. Backend sends JSON response to frontend
                     ↓
7. React displays flashcards in UI
```

**Time:** 
- First request: 30-60 seconds (backend waking up from spin-down)
- Subsequent requests: < 1 second

---

### User Selects Book/Chapter and Starts Drill

```
1. User selects chapters in DataSelector
   - Stored in React state (frontend only)
   - No backend call needed

2. User clicks drill type (e.g., "Hanzi → Pinyin")
   - Filtered cards passed to drill component
   - All processing happens in browser
   - No backend call needed

3. User answers questions
   - Progress tracked in browser memory
   - No backend call (unless saving to DB)

4. User views statistics
   - Calculated from localStorage
   - No backend call needed
```

**Time: Instant** (all client-side)

---

## 🔐 Security & Configuration

### Environment Variables

#### Frontend (Vercel)
```
VITE_API_URL → Tells React where backend is
Example: https://your-backend.onrender.com/api
```

#### Backend (Render)
```
DATABASE_URL   → How to connect to database
FRONTEND_URL   → Allowed origin for CORS
NODE_ENV       → production
PORT           → 3001
```

### CORS Protection

```
Frontend (https://your-app.vercel.app)
    ↓ Makes request
Backend checks: "Is origin allowed?"
    ↓ Yes (matches FRONTEND_URL)
Backend responds with data
    ↓ No (doesn't match)
Backend returns 403 Forbidden
```

**Why?** Prevents other websites from using your API.

---

## 🌍 Geographic Distribution

### Vercel Frontend
```
┌─────────────────────────────────────┐
│     Vercel Global Edge Network      │
│  (Copies of your app worldwide)     │
├─────────────────────────────────────┤
│  🌎 Americas                        │
│  🌍 Europe                          │
│  🌏 Asia                            │
│  🌏 Australia                       │
└─────────────────────────────────────┘
```
**Result:** Fast loading anywhere in the world!

### Render Backend
```
┌─────────────────────────────────────┐
│      Render Server (One Region)     │
│  You chose: e.g., Oregon, USA       │
└─────────────────────────────────────┘
```
**Result:** All API requests go to this one server.

---

## 💾 Data Storage

### Where is data stored?

```
┌──────────────────────────────────────────────────┐
│  Render PostgreSQL Database                      │
│  ────────────────────────────────────────────   │
│  • Flashcard content (hanzi, pinyin, english)    │
│  • User accounts (if using multi-user)           │
│  • Study progress (if saving to DB)              │
│                                                   │
│  Persistent: YES (survives deploys)              │
│  Backed up: Manually (or upgrade for auto)       │
│  Expiration: 90 days on free tier                │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  User's Browser (localStorage)                   │
│  ────────────────────────────────────────────   │
│  • Statistics                                    │
│  • Study streaks                                 │
│  • Session data                                  │
│                                                   │
│  Persistent: Until user clears browser data      │
│  Backed up: NO                                   │
└──────────────────────────────────────────────────┘
```

---

## 🔄 Deployment Process

### When You Push Code to GitHub

```
┌─────────────────────────────────────┐
│  1. You: git push origin main       │
└──────────────┬──────────────────────┘
               │
               ├─────────────────────────────────┐
               │                                 │
               ▼                                 ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│  Vercel Detects Change   │      │  Render Detects Change   │
└──────────┬───────────────┘      └──────────┬───────────────┘
           │                                 │
           ▼                                 ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│  2. Build Frontend       │      │  2. Build Backend        │
│     npm run build        │      │     npm install          │
└──────────┬───────────────┘      └──────────┬───────────────┘
           │                                 │
           ▼                                 ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│  3. Deploy to CDN        │      │  3. Restart Server       │
│     (2-5 minutes)        │      │     npm start            │
│                          │      │     (5-10 minutes)       │
└──────────┬───────────────┘      └──────────┬───────────────┘
           │                                 │
           ▼                                 ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│  ✅ Frontend Updated     │      │  ✅ Backend Updated      │
└──────────────────────────┘      └──────────────────────────┘
```

**Total Time: 5-15 minutes**

---

## 📊 Free Tier Limitations

### Render Free Tier

**Backend:**
- ✅ 750 hours/month (enough for 24/7 for 31 days)
- ⚠️ Spins down after 15 minutes inactivity
- 🐌 Cold start: 30-60 seconds
- 💾 512 MB RAM

**Database:**
- ✅ 1 GB storage
- ⚠️ Expires after 90 days
- 💾 Need to recreate and migrate data

### Vercel Free Tier

**Frontend:**
- ✅ 100 GB bandwidth/month
- ✅ Always on (no spin-down)
- ✅ Unlimited deployments
- ⚡ Global CDN (fast everywhere)

---

## 🔧 How Components Communicate

### Frontend → Backend

```javascript
// In React component:
const response = await fetch(
  `${import.meta.env.VITE_API_URL}/flashcards`
);

// Resolves to:
// https://your-backend.onrender.com/api/flashcards
```

### Backend → Database

```javascript
// In Express route:
const result = await pool.query(
  'SELECT * FROM flashcards'
);

// pool uses DATABASE_URL from environment
// Connects to: postgresql://user:pass@host/db
```

---

## 🚨 What Can Go Wrong?

### Issue: Frontend Can't Reach Backend

```
Frontend (Vercel)
    ↓ Tries to call API
    ✗ Network Error
    
Possible causes:
1. Wrong VITE_API_URL in Vercel
2. Backend is down (check Render dashboard)
3. CORS error (wrong FRONTEND_URL in backend)
```

**Fix:** Check environment variables!

### Issue: Backend Can't Reach Database

```
Backend (Render)
    ↓ Tries to query
    ✗ Connection Error
    
Possible causes:
1. Wrong DATABASE_URL
2. Database suspended (90-day expiration)
3. Database not initialized (missing tables)
```

**Fix:** Check DATABASE_URL and database status!

---

## 🎯 Success Indicators

Your deployment is working when:

```
✅ Visit https://your-app.vercel.app → Homepage loads
✅ Visit https://your-backend.onrender.com/api/health → Returns {"status":"ok"}
✅ Load flashcards from database → Cards appear
✅ Complete a drill → Works without errors
✅ Browser console (F12) → No red errors
✅ Network tab → All requests return 200 OK
```

---

## 📞 Monitoring Your Deployment

### Check Frontend Health
```bash
curl https://your-app.vercel.app
# Should return HTML
```

### Check Backend Health
```bash
curl https://your-backend.onrender.com/api/health
# Should return {"status":"ok",...}
```

### Check Database Connection
```bash
# In Render backend logs, you should see:
✅ Connected to PostgreSQL database
```

---

## 🔄 How Updates Work

### Frontend Update
```
You change: App.jsx
    ↓ git push
Vercel: Rebuilds and redeploys
    ↓ 2-5 minutes
Users: See new version automatically
```

### Backend Update
```
You change: server.js
    ↓ git push
Render: Rebuilds and restarts
    ↓ 5-10 minutes
Users: API changes take effect
```

### Database Update
```
You change: Schema (add table/column)
    ↓ Manual step required
You: Run migration script
    ↓ Connects to production DB
Database: Updated with new schema
```

---

## 💡 Pro Tips

1. **Bookmark Dashboards**
   - Vercel: vercel.com/dashboard
   - Render: dashboard.render.com

2. **Check Logs First**
   - Most issues show up in logs
   - Render: Service → Logs tab
   - Browser: F12 → Console

3. **Test Locally First**
   - Always test changes locally before pushing
   - Saves time and avoids broken deployments

4. **Use Git Tags**
   - Tag releases: `git tag v1.0.0`
   - Easy to rollback if needed

5. **Monitor Free Tier Usage**
   - Check monthly to avoid surprises
   - Set calendar reminder for database expiration

---

For detailed deployment instructions, see [DEPLOYMENT_README.md](DEPLOYMENT_README.md)!
