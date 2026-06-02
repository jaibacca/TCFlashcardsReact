# Complete Deployment Guide - Supabase + Vercel (Beginners)

Deploy your Traditional Chinese Flashcards app in 20-30 minutes with **no backend management** needed!

## 🎯 What We're Deploying

- **Frontend (React)**: Vercel (Free tier)
- **Backend + Database**: Supabase (Free tier, no expiration!)

**Why This is Easier:**
- ✅ Only 2 services instead of 3
- ✅ No backend server code to maintain
- ✅ No CORS configuration needed
- ✅ No database expiration (90 days on Render)
- ✅ No cold start delays
- ✅ Total time: 20-30 minutes vs 60 minutes

---

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] GitHub account (create at https://github.com)
- [ ] Your code pushed to GitHub
- [ ] Email address for signing up
- [ ] 20-30 minutes free time

---

## Part 1: Set Up Supabase (10 minutes)

### Step 1.1: Create Supabase Account

1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub (recommended) or email
4. **No credit card needed!**

### Step 1.2: Create New Project

1. From Dashboard, click "New project"
2. Fill in the form:
   - **Organization**: Choose or create (e.g., "My Apps")
   - **Name**: `tcflashcards` or any name you like
   - **Database Password**: Choose a **strong password** (save it!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: **Free** (selected by default)

3. Click "Create new project"
4. **Wait 2-3 minutes** for project to initialize (grab a coffee ☕)

### Step 1.3: Get Your Credentials

Once project is ready:

1. Click on **"Settings"** (gear icon in sidebar)
2. Click **"API"** in the Settings menu
3. You'll see two important values:

**Copy these now:**

```
Project URL: https://xxxxxxxxxxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANT**: Keep these safe! You'll need them in a minute.

---

## Part 2: Initialize Database (10 minutes)

### Step 2.1: Create Tables

1. In Supabase Dashboard, click **"SQL Editor"** in sidebar
2. Click **"New query"**
3. Copy and paste this SQL:

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

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  flashcard_id BIGINT REFERENCES flashcards(id) ON DELETE CASCADE,
  familiarity_level INTEGER DEFAULT 0,
  last_reviewed TIMESTAMP WITH TIME ZONE,
  times_correct INTEGER DEFAULT 0,
  times_incorrect INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id, flashcard_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_flashcards_book ON flashcards(book);
CREATE INDEX IF NOT EXISTS idx_flashcards_chapter ON flashcards(chapter);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_card ON user_progress(flashcard_id);

-- Enable Row Level Security (RLS)
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (for now)
CREATE POLICY "Allow public read access on flashcards" ON flashcards
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on flashcards" ON flashcards
  FOR INSERT WITH CHECK (true);
```

4. Click **"Run"** (or press Ctrl+Enter)
5. You should see: "Success. No rows returned"

✅ **Tables created!**

### Step 2.2: Import Sample Flashcard Data

**Option A: Use SQL (Easier)**

1. In SQL Editor, create new query
2. Paste this sample data:

```sql
INSERT INTO flashcards (hanzi, pinyin, english, book, chapter, order_num) VALUES
  ('你好', 'nǐ hǎo', 'hello', 'Book 1', '1', 1),
  ('再見', 'zài jiàn', 'goodbye', 'Book 1', '1', 2),
  ('謝謝', 'xiè xie', 'thank you', 'Book 1', '1', 3),
  ('對不起', 'duì bù qǐ', 'sorry', 'Book 1', '1', 4),
  ('是', 'shì', 'to be / yes', 'Book 1', '1', 5),
  ('不是', 'bú shì', 'to not be / no', 'Book 1', '1', 6),
  ('我', 'wǒ', 'I / me', 'Book 1', '1', 7),
  ('你', 'nǐ', 'you', 'Book 1', '1', 8),
  ('他', 'tā', 'he / him', 'Book 1', '1', 9),
  ('她', 'tā', 'she / her', 'Book 1', '1', 10),
  ('我們', 'wǒ men', 'we / us', 'Book 1', '1', 11),
  ('你們', 'nǐ men', 'you (plural)', 'Book 1', '1', 12),
  ('他們', 'tā men', 'they / them', 'Book 1', '1', 13),
  ('這', 'zhè', 'this', 'Book 1', '1', 14),
  ('那', 'nà', 'that', 'Book 1', '1', 15),
  ('什麼', 'shén me', 'what', 'Book 1', '2', 1),
  ('誰', 'shuí', 'who', 'Book 1', '2', 2),
  ('哪裡', 'nǎ lǐ', 'where', 'Book 1', '2', 3),
  ('為什麼', 'wèi shén me', 'why', 'Book 1', '2', 4),
  ('怎麼', 'zěn me', 'how', 'Book 1', '2', 5);
```

3. Click **"Run"**
4. Should see: "Success. 20 rows affected"

**Option B: Import CSV (Alternative)**

1. Click **"Table Editor"** in sidebar
2. Select **"flashcards"** table
3. Click **"Insert"** → "Import data from CSV"
4. Upload your `sample-data.csv` file
5. Map columns and import

✅ **Data loaded!**

### Step 2.3: Verify Data

1. In Table Editor, click **"flashcards"** table
2. You should see 20 rows of Chinese flashcard data
3. If you see the data, you're good! ✅

---

## Part 3: Deploy Frontend to Vercel (10 minutes)

### Step 3.1: Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. **Sign up with GitHub** (recommended)
4. Authorize Vercel to access GitHub

### Step 3.2: Prepare Environment Variables

Before importing, prepare your Supabase credentials:

```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

(Use the values you copied in Step 1.3)

### Step 3.3: Import Project from GitHub

1. From Vercel Dashboard, click **"Add New..."** → "Project"
2. Find your **TCFlashcardsReact** repository
3. Click **"Import"**

### Step 3.4: Configure Build Settings

Vercel will auto-detect Vite. Configure:

- **Framework Preset**: Vite (auto-detected)
- **Root Directory**: `TCFlashcardsReact` ⚠️ **Important!**
- **Build Command**: `npm run build` (default)
- **Output Directory**: `dist` (default)
- **Install Command**: `npm install` (default)

### Step 3.5: Add Environment Variables

**This is the most important step!**

1. Click **"Environment Variables"**
2. Add these two variables:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://xxxxxxxxxxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

⚠️ Use YOUR actual values from Step 1.3!

3. Click **"Add"** for each variable

### Step 3.6: Deploy!

1. Click **"Deploy"**
2. Vercel will:
   - Clone your repo
   - Install dependencies
   - Build your app
   - Deploy to CDN
3. **Wait 2-5 minutes** (watch the build logs)
4. You should see: "🎉 Deployment Complete!"

### Step 3.7: Get Your Live URL

Once deployed:

- **URL**: `https://your-app-name.vercel.app`
- Click **"Visit"** to see your live app!

⚠️ **Save this URL** for later!

---

## Part 4: Testing Your Deployment (5 minutes)

### Test 1: Frontend Loads

1. Visit: `https://your-app-name.vercel.app`
2. Should see your flashcard app homepage ✅
3. No errors in browser (press F12 to check console)
 
### Test 2: Load Data from Supabase

**The flashcards load automatically!**

1. Wait for the page to finish loading
2. You should see: "✓ Loaded 20 flashcards from database" ✅
3. Flashcards appear in the data selector below
4. No need to click any "Load" button - it's automatic!

### Test 3: Select and Drill

1. Expand **"Book 1"**
2. Check **"Chapter 1"** (15 cards selected)
3. Toggle **"Multiple Choice Mode"** ON
4. Click any drill type (e.g., "Hanzi → Pinyin + English")
5. Should start the drill ✅
6. Answer a few questions

### Test 4: Check Statistics

1. Complete a drill or answer a few questions
2. Check the **Statistics panel** on the right
3. Should show:
   - Overall accuracy
   - Cards studied today
   - Current streak

✅ **If all tests pass, you're done!** 🎉

---

## 🎊 Success! Your App is Live!

Your flashcard app is now:

✅ **Live on the internet** at your Vercel URL  
✅ **Free hosting** (no credit card needed)  
✅ **Always fast** (no cold starts)  
✅ **No expiration** (Supabase free tier is forever)  
✅ **Automatic deployments** (push to GitHub = auto-deploy)  
✅ **Global CDN** (fast loading worldwide)  
✅ **HTTPS/SSL** (automatic)  

---

## 🔄 Making Updates

After deployment, making changes is easy:

```bash
# 1. Make code changes locally
# Edit files in your project

# 2. Test locally
cd TCFlashcardsReact
npm run dev

# 3. Commit and push
git add .
git commit -m "Add new feature"
git push origin main

# 4. Vercel auto-deploys!
# Wait 2-5 minutes, changes are live
```

**No manual deployment needed!** Just push to GitHub.

---

## 🆘 Troubleshooting

### Issue: "Cannot read properties of undefined"

**Cause**: Supabase credentials not set

**Fix**:
1. Go to Vercel project → Settings → Environment Variables
2. Verify both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set
3. No typos in variable names (must be exact!)
4. Redeploy: Deployments → Three dots → Redeploy

### Issue: "Failed to fetch" or No Data Loads

**Cause**: Row Level Security blocking queries

**Fix**:
1. Go to Supabase → SQL Editor
2. Run this:
```sql
-- Check if policies exist
SELECT * FROM pg_policies WHERE tablename = 'flashcards';

-- If none exist, create them:
CREATE POLICY "Allow public read access on flashcards" ON flashcards
  FOR SELECT USING (true);
```

### Issue: "Error establishing connection to database"

**Cause**: Wrong Supabase URL or key

**Fix**:
1. Go to Supabase → Settings → API
2. Copy the values again
3. Go to Vercel → Environment Variables
4. Update with correct values
5. Redeploy

### Issue: Build fails on Vercel

**Cause**: Missing dependencies

**Fix**:
1. Check build logs for specific error
2. Common issue: Missing `@supabase/supabase-js`
3. Run locally: `cd TCFlashcardsReact && npm install @supabase/supabase-js`
4. Commit: `git add package.json package-lock.json && git commit -m "Add Supabase"`
5. Push: `git push`

### Issue: Slow loading or timeout

**Cause**: Supabase cold start (rare on free tier)

**Solution**: Just wait 10-20 seconds and refresh. Much faster than Render!

---

## 📊 Free Tier Limits

### Supabase Free Tier
- ✅ **500 MB database** storage
- ✅ **50k monthly active users**
- ✅ **1 GB file storage**
- ✅ **2 GB bandwidth**
- ✅ **50k Edge Function invocations**
- ✅ **No expiration!**
- ✅ **Automatic daily backups** (7 days retention)

### Vercel Free Tier
- ✅ **100 GB bandwidth/month**
- ✅ **Unlimited deployments**
- ✅ **Always on** (no spin-down)

### Monitoring Usage

**Supabase:**
1. Dashboard → Usage
2. See database size, API requests, bandwidth

**Vercel:**
1. Project → Analytics
2. See visitors, bandwidth used

---

## 🎯 What's Next?

### Optional Enhancements:

1. **Custom Domain** (~$12/year)
   - Buy domain (Namecheap, Google Domains)
   - Add to Vercel → Domains
   - Automatic SSL

2. **Add Authentication**
   - Supabase → Authentication
   - Enable email/password
   - Or use Google, GitHub login
   - Built-in, no extra code needed!

3. **Enable Real-time Updates**
   - Changes sync across devices
   - Already available in Supabase
   - Just add listeners in React

4. **Add More Tables**
   - Study sessions
   - Progress tracking
   - User statistics
   - Run SQL in SQL Editor

5. **Set Up Backups**
   - Supabase has automatic backups (7 days)
   - For manual backup:
     - Database → Settings → Backup

---

## 💡 Pro Tips

1. **Bookmark Your Dashboards**
   - Supabase: https://app.supabase.com
   - Vercel: https://vercel.com/dashboard

2. **Save Your Credentials Securely**
   - Use a password manager
   - Never commit to GitHub
   - Store in Vercel environment variables only

3. **Monitor Your App**
   - Check dashboards weekly
   - Watch for errors in Vercel logs
   - Monitor database size in Supabase

4. **Use Git Tags for Releases**
   ```bash
   git tag v1.0.0
   git push --tags
   ```
   Easy to rollback if needed!

5. **Test Locally First**
   - Always test changes locally before pushing
   - Saves time debugging production issues

---

## 📚 Additional Resources

### Documentation
- Supabase Docs: https://supabase.com/docs
- Vercel Docs: https://vercel.com/docs
- React: https://react.dev

### Video Tutorials
- "Supabase in 100 Seconds": https://youtu.be/zBZgdTb-dns
- "Deploy React to Vercel": Search YouTube
- "Supabase Crash Course": Search YouTube

### Community Support
- Supabase Discord: https://discord.supabase.com
- Vercel Discord: https://vercel.com/discord
- Stack Overflow: Tag [supabase] [vercel]

---

## ✅ Final Checklist

Verify everything is working:

- [ ] Supabase project created
- [ ] Database tables created
- [ ] Sample data loaded (20 flashcards)
- [ ] Vercel account created
- [ ] Frontend deployed successfully
- [ ] Environment variables set correctly
- [ ] Frontend loads at Vercel URL
- [ ] Can load flashcards from database
- [ ] Can select chapters
- [ ] Can start and complete a drill
- [ ] Statistics update correctly
- [ ] No errors in browser console (F12)
- [ ] Saved Vercel URL and Supabase credentials

---

## 🎉 Congratulations!

You've successfully deployed your app with:

- ✅ Modern serverless architecture
- ✅ No backend server to maintain
- ✅ No database expiration worries
- ✅ Always fast and responsive
- ✅ Free forever (within generous limits)
- ✅ Automatic deployments
- ✅ Professional setup

**Share your app with friends and start learning Chinese!** 🇹🇼

---

**Questions? Need help?**

Check:
- [DEPLOYMENT_TROUBLESHOOTING_SUPABASE.md](DEPLOYMENT_TROUBLESHOOTING_SUPABASE.md)
- [DEPLOYMENT_QUICK_REFERENCE_SUPABASE.md](DEPLOYMENT_QUICK_REFERENCE_SUPABASE.md)
- Supabase Discord: https://discord.supabase.com

**Good luck!** 🚀
