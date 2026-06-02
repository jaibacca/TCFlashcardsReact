# Complete Supabase Setup Guide - Option B

## ✅ What We're Doing
Connecting React directly to Supabase (no Express backend needed)

---

## Step 1: Get Your Supabase Credentials ✓ (You're Here!)

In your Supabase Dashboard:

1. You clicked **"Connect"** 
2. Choose **"Framework"** or **"Direct"** → **"JavaScript"**
3. You'll see code like this:

```javascript
const supabaseUrl = 'https://xxxxxxxxxxxxx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

**Copy both values!** 📋

---

## Step 2: Update Your .env File

1. Open `TCFlashcardsReact/.env`

2. Replace the placeholder values with YOUR actual values:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**⚠️ IMPORTANT**: Make sure you paste YOUR actual values, not the placeholders!

---

## Step 3: Initialize Database Tables

You need to create all the database tables in Supabase.

### Option 3A: Using SQL Editor (Easiest)

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy the **ENTIRE** contents of this file:
   ```
   backend/scripts/add-multiuser-tables.sql
   ```
4. Paste it into the SQL Editor
5. Click **RUN** (or Ctrl+Enter)
6. You should see success messages

### Option 3B: Using Node.js Script

1. First, update `backend/.env` with Supabase connection string:

   In Supabase: **Settings** → **Database** → Copy **Connection String (URI)**
   
   ```env
   DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-region.pooler.supabase.com:5432/postgres
   ```

2. Run the script:
   ```bash
   cd backend
   node scripts/init-db-multiuser.js
   ```

---

## Step 4: Verify Tables Were Created

In Supabase Dashboard:

1. Go to **Table Editor** (left sidebar)
2. You should see these tables:
   - ✅ flashcards
   - ✅ users
   - ✅ user_progress
   - ✅ study_sessions
   - ✅ drill_attempts
   - ✅ user_stats
   - ✅ user_preferences
   - ✅ user_streaks
   - ✅ achievements
   - ✅ user_achievements
   - ✅ user_decks
   - ✅ user_deck_cards
   - ✅ user_card_notes
   - ✅ user_card_reviews

---

## Step 5: Import Your Flashcard Data

### Option 5A: Using Node.js Script

```bash
cd backend
node scripts/seed-db.js
```

This will import flashcards from `sample-data.csv`.

### Option 5B: Manual CSV Import

1. In Supabase **Table Editor**, select `flashcards` table
2. Click **Insert** → **Import data from CSV**
3. Upload your `sample-data.csv`
4. Map columns:
   - Hanzi → hanzi
   - Pinyin → pinyin
   - English → english
   - Book → book
   - Chapter → chapter
   - Order → order_num

---

## Step 6: Enable Row Level Security (RLS)

**Why?** This ensures users can only see their own data.

In Supabase **SQL Editor**, run this:

```sql
-- Enable RLS on all user tables
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_card_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_card_reviews ENABLE ROW LEVEL SECURITY;

-- Flashcards are public (everyone can read)
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Flashcards are viewable by everyone" 
  ON flashcards FOR SELECT 
  USING (true);

-- Users can only access their own data
CREATE POLICY "Users view own progress" 
  ON user_progress FOR SELECT 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users insert own progress" 
  ON user_progress FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users update own progress" 
  ON user_progress FOR UPDATE 
  USING (auth.uid()::text = user_id::text);

-- Study sessions
CREATE POLICY "Users view own sessions" 
  ON study_sessions FOR SELECT 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users insert own sessions" 
  ON study_sessions FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users update own sessions" 
  ON study_sessions FOR UPDATE 
  USING (auth.uid()::text = user_id::text);

-- Drill attempts
CREATE POLICY "Users view own attempts" 
  ON drill_attempts FOR SELECT 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users insert own attempts" 
  ON drill_attempts FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id::text);

-- User stats
CREATE POLICY "Users manage own stats" 
  ON user_stats FOR ALL 
  USING (auth.uid()::text = user_id::text);

-- User preferences
CREATE POLICY "Users manage own preferences" 
  ON user_preferences FOR ALL 
  USING (auth.uid()::text = user_id::text);

-- User streaks
CREATE POLICY "Users manage own streaks" 
  ON user_streaks FOR ALL 
  USING (auth.uid()::text = user_id::text);

-- Achievements are public
CREATE POLICY "Achievements viewable by all" 
  ON achievements FOR SELECT 
  USING (true);

-- User achievements
CREATE POLICY "Users view own achievements" 
  ON user_achievements FOR SELECT 
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users insert own achievements" 
  ON user_achievements FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id::text);

-- User decks
CREATE POLICY "Users manage own decks" 
  ON user_decks FOR ALL 
  USING (auth.uid()::text = user_id::text);

-- User deck cards
CREATE POLICY "Users manage own deck cards" 
  ON user_deck_cards FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM user_decks 
      WHERE user_decks.id = user_deck_cards.deck_id 
      AND user_decks.user_id::text = auth.uid()::text
    )
  );

-- User notes
CREATE POLICY "Users manage own notes" 
  ON user_card_notes FOR ALL 
  USING (auth.uid()::text = user_id::text);

-- User reviews (SRS)
CREATE POLICY "Users manage own reviews" 
  ON user_card_reviews FOR ALL 
  USING (auth.uid()::text = user_id::text);
```

---

## Step 7: Enable Supabase Authentication

1. In Supabase Dashboard → **Authentication** → **Providers**
2. **Enable** the **Email** provider (should be enabled by default)
3. (Optional) Configure email templates under **Email Templates**
4. (Optional) Enable other providers (Google, GitHub, etc.)

---

## Step 8: Install Supabase Client in Your React App

```bash
cd TCFlashcardsReact
npm install @supabase/supabase-js
```

---

## Step 9: Verify Supabase Config File

✅ Already created at: `TCFlashcardsReact/src/config/supabase.js`

This file imports your environment variables and creates the Supabase client.

---

## Step 10: Test Database Connection

Let's verify everything works!

1. In Supabase **SQL Editor**, run:

```sql
-- Count flashcards
SELECT COUNT(*) as total_flashcards FROM flashcards;

-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Show sample flashcards
SELECT * FROM flashcards LIMIT 5;
```

You should see your flashcard data!

---

## Step 11: Update Your API Service (Next Step)

Now we need to update `src/services/api.js` to use Supabase instead of Express.

**I can help you with this!** Just let me know when Steps 1-10 are complete.

---

## Checklist

- [ ] Got Supabase URL and Anon Key from dashboard
- [ ] Updated `TCFlashcardsReact/.env` with real values
- [ ] Created database tables (via SQL Editor or Node script)
- [ ] Verified tables exist in Table Editor
- [ ] Imported flashcard data
- [ ] Enabled Row Level Security policies
- [ ] Enabled Email authentication
- [ ] Installed `@supabase/supabase-js` package
- [ ] Tested database connection
- [ ] Ready to update API service

---

## Common Issues

### ❌ "Missing environment variables"
- Check that `.env` has no typos
- Make sure values don't have quotes around them
- Restart dev server after changing `.env`

### ❌ "Could not connect to database"
- Double-check your Supabase URL and key
- Make sure you copied the **anon/public** key, not the service key
- Check if Supabase project is paused (free tier auto-pauses after inactivity)

### ❌ "Permission denied for table"
- You need to enable RLS policies (Step 6)
- Make sure user is authenticated

### ❌ "Table does not exist"
- Run the initialization scripts (Step 3)
- Check Table Editor to verify

---

## Next: Update React Components

Once Steps 1-10 are done, we'll update:
1. `src/services/api.js` - Replace Express calls with Supabase
2. `src/App.jsx` - Add authentication
3. `src/components/*.jsx` - Update to use Supabase

Let me know when you're ready! 🚀
