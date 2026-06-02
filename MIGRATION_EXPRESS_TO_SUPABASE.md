# Migration Guide: Express Backend → Supabase

This guide helps you migrate from the Express.js backend (Render) to Supabase.

## 🎯 Why Migrate to Supabase?

| Feature | Express + Render | Supabase |
|---------|------------------|----------|
| **Components** | 3 (DB, API, Frontend) | 2 (Supabase, Frontend) |
| **Database Expiration** | 90 days | Never ✅ |
| **Cold Starts** | Yes (30-60s) | No ✅ |
| **Backend Maintenance** | Required | Not needed ✅ |
| **CORS Config** | Manual | Automatic ✅ |
| **Setup Time** | 60 minutes | 20 minutes ✅ |
| **API Management** | Write routes | Generated ✅ |

**Result: Simpler, faster, no maintenance!**

---

## 📋 Migration Checklist

- [ ] Supabase account created
- [ ] Supabase project set up
- [ ] Database tables created in Supabase
- [ ] Data migrated to Supabase
- [ ] Frontend updated to use Supabase client
- [ ] Tested locally
- [ ] Deployed to Vercel
- [ ] Old Render services cleaned up

---

## Part 1: Set Up Supabase (10 minutes)

### Step 1.1: Create Supabase Project

1. Go to https://supabase.com
2. Sign up (free, no credit card)
3. Create new project:
   - Name: `tcflashcards`
   - Password: (strong password)
   - Region: Choose closest to you

4. Wait 2-3 minutes for setup

### Step 1.2: Get Credentials

1. Settings → API
2. Copy:
   - Project URL: `https://xxxxxxxxxxxxx.supabase.co`
   - anon public key: `eyJhbG...`

---

## Part 2: Migrate Database (15 minutes)

### Step 2.1: Export from Render

**Option A: Using pg_dump**

```bash
# Get your Render External Database URL
# From Render dashboard → Database → Connection String

# Export data
pg_dump "postgresql://user:pass@host/db" > backup.sql
```

**Option B: Export via SQL**

```sql
-- In Render database shell or your SQL client
-- Connect to Render database

-- Export flashcards
COPY flashcards TO '/tmp/flashcards.csv' DELIMITER ',' CSV HEADER;

-- Export users (if you have user data)
COPY users TO '/tmp/users.csv' DELIMITER ',' CSV HEADER;
```

### Step 2.2: Create Tables in Supabase

1. Go to Supabase → SQL Editor
2. Create new query
3. Paste the table creation SQL:

```sql
-- Create flashcards table
CREATE TABLE IF NOT EXISTS flashcards (
  id BIGSERIAL PRIMARY KEY,
  hanzi VARCHAR(100) NOT NULL,
  pinyin VARCHAR(255) NOT NULL,
  english TEXT NOT NULL,
  book VARCHAR(100),
  chapter VARCHAR(100),
  order_num INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_flashcards_book ON flashcards(book);
CREATE INDEX IF NOT EXISTS idx_flashcards_chapter ON flashcards(chapter);
CREATE INDEX IF NOT EXISTS idx_flashcards_book_chapter ON flashcards(book, chapter);

-- Enable RLS
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- Create public access policy
CREATE POLICY "Allow public read access" ON flashcards
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON flashcards
  FOR INSERT WITH CHECK (true);
```

4. Click Run

### Step 2.3: Import Data

**Option A: SQL INSERT**

```sql
-- In Supabase SQL Editor
INSERT INTO flashcards (hanzi, pinyin, english, book, chapter, order_num)
VALUES 
  ('你好', 'nǐ hǎo', 'hello', 'Book 1', '1', 1),
  ('再見', 'zài jiàn', 'goodbye', 'Book 1', '1', 2);
  -- ... add all your data
```

**Option B: CSV Import**

1. Supabase → Table Editor
2. Select "flashcards" table
3. Insert → Import data from CSV
4. Upload your exported CSV
5. Map columns
6. Import

### Step 2.4: Verify Data

```sql
-- Check count
SELECT COUNT(*) FROM flashcards;

-- View sample
SELECT * FROM flashcards LIMIT 10;
```

---

## Part 3: Update Frontend Code (20 minutes)

### Step 3.1: Install Supabase Client

```bash
cd TCFlashcardsReact
npm install @supabase/supabase-js
```

### Step 3.2: Create Supabase Config

File: `TCFlashcardsReact/src/config/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Step 3.3: Update Environment Variables

File: `TCFlashcardsReact/.env`

```env
# Remove old Express API URL
# VITE_API_URL=http://localhost:3001/api

# Add Supabase credentials
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3.4: Update API Service

File: `TCFlashcardsReact/src/services/api.js`

**Before (Express API):**
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const flashcardsApi = {
  getAll: () => fetch(`${API_BASE_URL}/flashcards`).then(r => r.json()),
  // ... more methods
};
```

**After (Supabase):**
```javascript
import { supabase } from '../config/supabase';

export const flashcardsApi = {
  // Get all flashcards
  getAll: async () => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .order('book', { ascending: true })
      .order('chapter', { ascending: true })
      .order('order_num', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // Get all unique books
  getBooks: async () => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('book')
      .order('book');
    
    if (error) throw error;
    return [...new Set(data.map(d => d.book))];
  },

  // Get chapters for a specific book
  getChaptersByBook: async (book) => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('chapter')
      .eq('book', book)
      .order('chapter');
    
    if (error) throw error;
    return [...new Set(data.map(d => d.chapter))];
  },

  // Get flashcards by book
  getByBook: async (book) => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('book', book)
      .order('chapter')
      .order('order_num');
    
    if (error) throw error;
    return data;
  },

  // Get flashcards by book and chapter
  getByBookAndChapter: async (book, chapter) => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('book', book)
      .eq('chapter', chapter)
      .order('order_num');
    
    if (error) throw error;
    return data;
  },

  // Add a new flashcard
  create: async (flashcard) => {
    const { data, error } = await supabase
      .from('flashcards')
      .insert([flashcard])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update a flashcard
  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('flashcards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete a flashcard
  delete: async (id) => {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Bulk insert flashcards
  bulkCreate: async (flashcards) => {
    const { data, error } = await supabase
      .from('flashcards')
      .insert(flashcards)
      .select();
    
    if (error) throw error;
    return data;
  },

  // Get flashcards grouped by book and chapter
  getGrouped: async () => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .order('book')
      .order('chapter')
      .order('order_num');
    
    if (error) throw error;

    // Group by book and chapter
    const grouped = {};
    data.forEach(card => {
      if (!grouped[card.book]) grouped[card.book] = {};
      if (!grouped[card.book][card.chapter]) grouped[card.book][card.chapter] = [];
      grouped[card.book][card.chapter].push(card);
    });

    return grouped;
  }
};
```

---

## Part 4: Test Locally (10 minutes)

### Step 4.1: Test with Local Dev Server

```bash
cd TCFlashcardsReact
npm run dev
```

Visit: http://localhost:5173

### Step 4.2: Test All Features

- [ ] Load data from database
- [ ] Select book and chapter
- [ ] Start each drill type
- [ ] Check statistics update
- [ ] No console errors

### Step 4.3: Fix Any Issues

Common issues:
- Missing Supabase client: `npm install @supabase/supabase-js`
- RLS blocking queries: Add policies in Supabase
- Wrong credentials: Check .env file

---

## Part 5: Deploy to Vercel (10 minutes)

### Step 5.1: Update Vercel Environment Variables

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Remove (if exists):
   - `VITE_API_URL`
3. Add:
   - `VITE_SUPABASE_URL` = `https://xxxxxxxxxxxxx.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### Step 5.2: Deploy

```bash
git add .
git commit -m "Migrate to Supabase"
git push origin main
```

Vercel will auto-deploy (2-5 minutes)

### Step 5.3: Test Production

Visit your Vercel URL and test all features.

---

## Part 6: Clean Up Old Services (5 minutes)

### Step 6.1: Delete Render Services

Once everything works on Supabase:

1. Go to Render Dashboard
2. **Backend Service**:
   - Click service
   - Settings → Delete Service
3. **Database**:
   - Click database
   - Settings → Delete Database

⚠️ **Make sure Supabase version works first!**

### Step 6.2: Remove Old Backend Code (Optional)

```bash
# Optional: Remove backend directory
# (Keep it for reference first!)
mv backend backend-old-express
```

---

## 📊 Comparison: Before & After

### Before (Express + Render)

```
User → Vercel → Render Backend → Render Database
           ↓         ↓               ↓
      React App   Express.js    PostgreSQL
      
Issues:
- 3 services to manage
- CORS configuration needed
- 90-day database expiration
- Cold starts (30-60s)
- Backend code to maintain
```

### After (Supabase)

```
User → Vercel → Supabase
           ↓         ↓
      React App  Auto API + PostgreSQL
      
Benefits:
✅ 2 services only
✅ No CORS issues
✅ No database expiration
✅ No cold starts
✅ No backend code to maintain
```

---

## 🆘 Troubleshooting Migration

### Issue: "Cannot find module '@supabase/supabase-js'"

```bash
cd TCFlashcardsReact
npm install @supabase/supabase-js
git add package.json package-lock.json
git commit -m "Add Supabase client"
git push
```

### Issue: Queries return empty array

```sql
-- Check RLS policies in Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'flashcards';

-- If missing, create:
CREATE POLICY "Public read access" ON flashcards
  FOR SELECT USING (true);
```

### Issue: Data not imported

```sql
-- Check if data exists
SELECT COUNT(*) FROM flashcards;

-- If 0, reimport with SQL or CSV
```

---

## ✅ Migration Checklist

- [ ] Supabase project created
- [ ] Database schema created in Supabase
- [ ] Data migrated to Supabase
- [ ] Supabase client installed
- [ ] `supabase.js` config created
- [ ] `api.js` updated with Supabase queries
- [ ] `.env` updated with Supabase credentials
- [ ] Tested locally - all features work
- [ ] Vercel environment variables updated
- [ ] Deployed to Vercel
- [ ] Tested production - all features work
- [ ] Old Render services deleted
- [ ] Documentation updated

---

## 🎉 Migration Complete!

You now have:

✅ Simpler architecture (2 services instead of 3)  
✅ No database expiration worries  
✅ No cold start delays  
✅ No backend server to maintain  
✅ Faster development  
✅ Better free tier  

**Welcome to the modern serverless world!** 🚀

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [DEPLOYMENT_GUIDE_SUPABASE.md](DEPLOYMENT_GUIDE_SUPABASE.md)
- [DEPLOYMENT_TROUBLESHOOTING_SUPABASE.md](DEPLOYMENT_TROUBLESHOOTING_SUPABASE.md)
