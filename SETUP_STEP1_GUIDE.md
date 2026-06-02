# 🎯 STEP-BY-STEP VISUAL GUIDE

## Right Now: What You Need to Do

### 📍 STEP 1: Create Database Table (You're Here!)

I've opened Supabase in your browser. Follow these steps:

#### 1️⃣ Find the SQL Editor
Look for **"SQL Editor"** in the left sidebar (it has a `</>` icon)

```
Supabase Dashboard
├── Home
├── Table Editor
├── SQL Editor     ← CLICK HERE
├── Database
└── ...
```

#### 2️⃣ Click "New Query"
You'll see a button at the top that says **"+ New Query"** - click it.

#### 3️⃣ Copy the SQL Script
Copy **ALL** of this text (it's in `backend/scripts/create-user-progress-table.sql`):

```sql
-- User Progress table for syncing statistics across devices
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stats_data JSONB NOT NULL,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own progress
CREATE POLICY "Users can view their own progress"
  ON user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress
CREATE POLICY "Users can insert their own progress"
  ON user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress
CREATE POLICY "Users can update their own progress"
  ON user_progress
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own progress
CREATE POLICY "Users can delete their own progress"
  ON user_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on every update
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant usage on the table to authenticated users
GRANT ALL ON user_progress TO authenticated;
```

#### 4️⃣ Paste and Run
- Paste the SQL into the editor
- Click **"Run"** button (or press Ctrl+Enter)
- You should see: **"Success. No rows returned"** ✅

#### 5️⃣ Verify It Worked
- Click **"Table Editor"** in the left sidebar
- Look for **`user_progress`** in the table list
- Click it to see the empty table (that's normal!)
- You should see columns: `id`, `user_id`, `stats_data`, etc.

---

## ✅ Once STEP 1 is Complete

Let me know by typing: **"Database table created!"**

Then we'll move to STEP 2: Configuring Authentication Settings.

---

## 🆘 Having Trouble?

### Can't find SQL Editor?
- Look for the `</>` icon in the sidebar
- It might be under "Database" section
- Try refreshing the page

### Getting errors when running SQL?
Common errors and fixes:

**Error: "policy already exists"**
→ That's OK! It means the table exists, just continue

**Error: "permission denied"**
→ Make sure you're the owner of the Supabase project
→ Try selecting your project from the dropdown at the top

**Error: "auth schema does not exist"**
→ Make sure you're on a Supabase project, not local database
→ Refresh and try again

### Can't see the table after running?
- Wait 5 seconds and refresh the Table Editor
- Make sure you're looking at the public schema
- Try clicking "Refresh" in Table Editor

---

## 📋 What Comes Next (Preview)

After creating the table, you'll:
1. ✅ Configure authentication redirect URLs (1 minute)
2. ✅ Test locally with magic link sign-in (5 minutes)
3. ✅ Push code to GitHub (1 minute)
4. ✅ Deploy to Vercel (automatic, 2 minutes)
5. ✅ Test in production (5 minutes)
6. 🎉 **Done! Cross-device sync working!**

---

**Take your time with Step 1. When you're ready, let me know it's complete!** 👍
