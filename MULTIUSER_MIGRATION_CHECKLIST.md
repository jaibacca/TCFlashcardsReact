# Multi-User Migration Checklist

## Current Status: Single-User App ✓
## Goal: Multi-User App with Supabase 🎯

---

## Phase 1: Database Setup ✓ READY

Your database schema is complete! You have:

### ✅ Created Tables:
- [x] `users` - User accounts
- [x] `user_sessions` - Auth sessions
- [x] `user_progress` - Card mastery per user
- [x] `study_sessions` - Study session tracking
- [x] `drill_attempts` - Detailed attempt records
- [x] `user_stats` - Aggregate statistics
- [x] `user_preferences` - User settings
- [x] `user_streaks` - Streak tracking
- [x] `achievements` - Badge definitions
- [x] `user_achievements` - Unlocked badges
- [x] `user_decks` - Custom study decks
- [x] `user_deck_cards` - Cards in custom decks
- [x] `user_card_notes` - Personal notes
- [x] `user_card_reviews` - SRS algorithm data

### 📝 Documentation Created:
- [x] `backend/DATABASE_SCHEMA.md` - Complete schema reference
- [x] `backend/scripts/init-db-multiuser.js` - Database initialization
- [x] `backend/scripts/add-multiuser-tables.sql` - SQL version
- [x] `SUPABASE_DEPLOYMENT.md` - Deployment guide

---

## Phase 2: Deploy Database to Supabase

### Step 1: Run Database Scripts

```bash
# Option A: Using Node.js (after updating DATABASE_URL)
cd backend
node scripts/init-db-multiuser.js
node scripts/seed-db.js

# Option B: Using Supabase SQL Editor
# Copy SQL from backend/scripts/add-multiuser-tables.sql
# Paste into Supabase SQL Editor and run
```

- [ ] Database tables created in Supabase
- [ ] Flashcards seeded
- [ ] Sample achievements added
- [ ] Indexes created

### Step 2: Enable Row Level Security

Run in Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_attempts ENABLE ROW LEVEL SECURITY;
-- ... (see SUPABASE_DEPLOYMENT.md for complete list)

-- Create policies
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);
-- ... (see SUPABASE_DEPLOYMENT.md for complete policies)
```

- [ ] RLS enabled on all user tables
- [ ] Policies created for SELECT
- [ ] Policies created for INSERT
- [ ] Policies created for UPDATE
- [ ] Flashcards are public (SELECT only)

---

## Phase 3: Choose Architecture

### Option A: Supabase Direct (RECOMMENDED) ⭐

**No backend server needed!**

Pros:
- Simpler deployment
- Free tier on Supabase
- Built-in authentication
- Real-time updates
- Less code to maintain

Cons:
- Need to rewrite Express routes to Supabase client calls
- Less control over business logic

**Choose this if:** You want fast deployment, low cost, and simpler architecture.

### Option B: Keep Express Backend

**Deploy Express to Railway/Render/Vercel**

Pros:
- Keep existing backend code
- More control
- Can add complex server logic

Cons:
- More expensive
- More to deploy and maintain
- Need to manage authentication yourself

**Choose this if:** You have complex backend logic or prefer traditional APIs.

---

## Phase 4A: Frontend Changes (Supabase Direct)

### Step 1: Install Dependencies

```bash
cd TCFlashcardsReact
npm install @supabase/supabase-js
```

- [ ] Supabase client installed

### Step 2: Create Supabase Config

Create `TCFlashcardsReact/src/config/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

- [ ] Supabase config file created
- [ ] Environment variables added to `.env`

### Step 3: Update API Service

Rewrite `src/services/api.js` to use Supabase client:

**Before (Express):**
```javascript
export const getFlashcards = async () => {
  const response = await fetch('http://localhost:3000/api/flashcards');
  return response.json();
};
```

**After (Supabase):**
```javascript
import { supabase } from '../config/supabase';

export const getFlashcards = async (book, chapter) => {
  let query = supabase.from('flashcards').select('*');
  if (book) query = query.eq('book', book);
  if (chapter) query = query.eq('chapter', chapter);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};
```

Functions to rewrite:
- [ ] `getFlashcards()`
- [ ] `getFlashcardsByBookAndChapter()`
- [ ] `saveProgress()` / `recordAttempt()`
- [ ] `getStats()`
- [ ] `updateStats()`

### Step 4: Add Authentication

Create `src/components/Auth.jsx` (see SUPABASE_DEPLOYMENT.md)

- [ ] Auth component created
- [ ] Sign up form
- [ ] Sign in form
- [ ] Password reset (optional)

Update `src/App.jsx`:
- [ ] Check authentication on load
- [ ] Show Auth component if not logged in
- [ ] Show app if logged in
- [ ] Add sign out button

### Step 5: Update Components

**DataSelector.jsx:**
- [ ] Fetch flashcards from Supabase
- [ ] Handle loading states
- [ ] Handle errors

**Drill Components (HanziToPinyinDrill, etc.):**
- [ ] Record attempts to Supabase
- [ ] Update user_progress on each attempt
- [ ] Update study_sessions

**Statistics.jsx:**
- [ ] Fetch stats from user_stats table
- [ ] Show user-specific data
- [ ] Real-time updates (optional)

### Step 6: Test Locally

```bash
cd TCFlashcardsReact
npm run dev
```

Test:
- [ ] Sign up works
- [ ] Sign in works
- [ ] Flashcards load
- [ ] Drills save attempts
- [ ] Stats update
- [ ] Sign out works
- [ ] Multiple users see different data

---

## Phase 4B: Backend Changes (Keep Express)

If you chose to keep the Express backend:

### Step 1: Update Database Connection

```bash
# backend/.env
DATABASE_URL=your_supabase_connection_string
```

- [ ] `.env` updated with Supabase URL

### Step 2: Add Authentication Middleware

Create `backend/middleware/auth.js`:

```javascript
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

- [ ] Auth middleware created
- [ ] Applied to protected routes

### Step 3: Update Routes

Add `userId` to all queries:

**Before:**
```javascript
router.get('/flashcards', async (req, res) => {
  const result = await pool.query('SELECT * FROM flashcards');
  res.json(result.rows);
});
```

**After:**
```javascript
const auth = require('../middleware/auth');

router.get('/flashcards', auth, async (req, res) => {
  // flashcards are public, but could filter by user's selected books
  const result = await pool.query('SELECT * FROM flashcards');
  res.json(result.rows);
});

router.post('/attempts', auth, async (req, res) => {
  const { flashcard_id, drill_type, is_correct } = req.body;
  await pool.query(`
    INSERT INTO drill_attempts (user_id, flashcard_id, drill_type, is_correct)
    VALUES ($1, $2, $3, $4)
  `, [req.userId, flashcard_id, drill_type, is_correct]);
  res.json({ success: true });
});
```

Routes to update:
- [ ] `/api/stats/*` - add userId
- [ ] `/api/progress/*` - add userId  
- [ ] `/api/sessions/*` - add userId
- [ ] Add `/api/auth/register`
- [ ] Add `/api/auth/login`
- [ ] Add `/api/auth/logout`

### Step 4: Deploy Backend

**To Railway:**
1. Go to railway.app
2. Connect GitHub repo
3. Set root directory: `backend`
4. Add env vars
5. Deploy

**To Render:**
1. Go to render.com
2. New Web Service
3. Connect repo
4. Root directory: `backend`
5. Start command: `npm start`
6. Add env vars
7. Deploy

- [ ] Backend deployed
- [ ] Environment variables set
- [ ] Backend URL obtained

### Step 5: Update Frontend API URL

```bash
# TCFlashcardsReact/.env
VITE_API_URL=https://your-backend.railway.app
```

- [ ] Frontend points to deployed backend
- [ ] CORS configured on backend

---

## Phase 5: Deploy Frontend

### To Vercel (Recommended):

1. Push code to GitHub (already done ✓)
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. Configure:
   - Root Directory: `TCFlashcardsReact` (or leave blank if mono-repo)
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` (if using Express backend)
6. Deploy!

- [ ] Frontend deployed to Vercel
- [ ] Environment variables set
- [ ] Site is live!

### Alternative: Netlify

1. Go to [netlify.com](https://netlify.com)
2. New site from Git
3. Build command: `npm run build`
4. Publish directory: `TCFlashcardsReact/dist`
5. Add environment variables
6. Deploy!

- [ ] Frontend deployed to Netlify

---

## Phase 6: Post-Deployment Testing

### Test Authentication:
- [ ] Can create account
- [ ] Can sign in
- [ ] Can sign out
- [ ] Invalid credentials rejected
- [ ] Session persists on refresh

### Test Flashcards:
- [ ] Flashcards load
- [ ] Can filter by book/chapter
- [ ] All CSV data visible

### Test Drills:
- [ ] Can start each drill type
- [ ] Attempts are recorded
- [ ] Progress updates
- [ ] Correct/incorrect tracked

### Test Statistics:
- [ ] Stats display correctly
- [ ] Stats update after drills
- [ ] Each user sees only their stats

### Test Multi-User:
- [ ] Create 2 accounts
- [ ] Each user's data is separate
- [ ] User A can't see User B's progress

---

## Phase 7: Optional Enhancements

### Gamification:
- [ ] Implement streak tracking
- [ ] Award achievements
- [ ] Show badges on profile
- [ ] Leaderboard (optional)

### Custom Decks:
- [ ] Create custom deck UI
- [ ] Add cards to decks
- [ ] Study from custom decks

### Spaced Repetition:
- [ ] Implement SRS algorithm
- [ ] Show "cards due today"
- [ ] Optimize review timing

### Social Features:
- [ ] Share decks
- [ ] Study with friends
- [ ] Compare stats

### Mobile:
- [ ] Responsive design
- [ ] PWA (installable)
- [ ] Mobile-friendly drills

---

## Quick Start Commands

### Initialize Database:
```bash
cd backend
node scripts/init-db-multiuser.js
node scripts/seed-db.js
```

### Install Supabase Client:
```bash
cd TCFlashcardsReact
npm install @supabase/supabase-js
```

### Deploy Frontend:
```bash
# Push to GitHub
git add .
git commit -m "Add multi-user support"
git push origin master

# Then deploy on Vercel web interface
```

---

## Summary

### What You Have Now:
✅ Complete database schema with 15 tables
✅ Database initialization scripts
✅ Comprehensive documentation
✅ GitHub repository set up
✅ Supabase account ready

### What You Need to Do:
1. ⏳ Run database scripts in Supabase
2. ⏳ Choose architecture (A or B)
3. ⏳ Update frontend code
4. ⏳ Deploy to Vercel
5. ⏳ Test with multiple users
6. ✨ Go live!

### Estimated Time:
- **Architecture A (Supabase Direct):** 3-4 hours
- **Architecture B (Keep Express):** 5-6 hours

---

## Resources

- **Database Schema:** `backend/DATABASE_SCHEMA.md`
- **Deployment Guide:** `SUPABASE_DEPLOYMENT.md`
- **Supabase Docs:** https://supabase.com/docs
- **Vercel Docs:** https://vercel.com/docs

---

## Need Help?

Stuck on a step? Ask me:
- "How do I implement X in Supabase?"
- "Show me the code for Y"
- "I'm getting error Z, what's wrong?"

You've got this! 🚀
