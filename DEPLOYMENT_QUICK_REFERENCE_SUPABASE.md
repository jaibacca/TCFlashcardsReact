# Supabase + Vercel Quick Reference

Quick commands, URLs, and common tasks for your deployed app.

---

## 📝 Deployment Information

Fill this out after deploying:

```
Frontend URL:  https://_________________________.vercel.app
Supabase URL:  https://_________________________.supabase.co
Project Name:  _________________________

Deployment Date: _______________
Version: _______________
```

---

## 🌐 Important URLs

### Frontend (Vercel)
- **Live Site**: `https://your-app.vercel.app`
- **Dashboard**: https://vercel.com/dashboard
- **Project Settings**: Click project → Settings

### Backend (Supabase)
- **Dashboard**: https://app.supabase.com
- **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
- **SQL Editor**: Dashboard → SQL Editor
- **Table Editor**: Dashboard → Table Editor
- **Logs**: Dashboard → Logs

---

## ⚙️ Environment Variables

### Vercel (Frontend)
```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Where to set:**
1. Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add/Edit variables
4. Redeploy after changes

---

## 🗄️ Database Operations

### Connect to Database

**Via Supabase Dashboard:**
1. Go to https://app.supabase.com
2. Select your project
3. Click "SQL Editor" or "Table Editor"

### Common SQL Queries

```sql
-- Count all flashcards
SELECT COUNT(*) FROM flashcards;

-- View recent flashcards
SELECT * FROM flashcards 
ORDER BY created_at DESC 
LIMIT 10;

-- Get all books
SELECT DISTINCT book FROM flashcards ORDER BY book;

-- Get chapters for a book
SELECT DISTINCT chapter FROM flashcards 
WHERE book = 'Book 1' 
ORDER BY chapter;

-- Search flashcards
SELECT * FROM flashcards 
WHERE hanzi LIKE '%你%' 
   OR pinyin LIKE '%ni%'
   OR english LIKE '%you%';

-- Add a flashcard
INSERT INTO flashcards (hanzi, pinyin, english, book, chapter, order_num)
VALUES ('你好', 'nǐ hǎo', 'hello', 'Book 1', '1', 1);

-- Update a flashcard
UPDATE flashcards 
SET english = 'hello; hi' 
WHERE id = 1;

-- Delete a flashcard
DELETE FROM flashcards WHERE id = 1;
```

### Check RLS Policies

```sql
-- View all policies
SELECT * FROM pg_policies 
WHERE tablename = 'flashcards';

-- Create public read policy
CREATE POLICY "Public read access" ON flashcards
  FOR SELECT USING (true);
```

---

## 🚀 Deployment Commands

### Deploy Frontend (Vercel)

```bash
# Automatic: Just push to GitHub
git add .
git commit -m "Update app"
git push origin main

# Vercel auto-deploys in 2-5 minutes
```

### Manual Redeploy (Vercel)

```
1. Go to vercel.com/dashboard
2. Click your project
3. Go to "Deployments"
4. Click "..." on latest
5. Click "Redeploy"
```

### Rollback to Previous Version

```
1. Go to Deployments
2. Find working deployment
3. Click "..." → "Promote to Production"
```

---

## 🔍 Debugging Commands

### Check Environment Variables (Browser Console)

```javascript
// Press F12, then paste this in Console:
console.log({
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
  keyStart: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20)
});
```

### Test Supabase Connection

```javascript
// In browser console:
const { data, error } = await supabase
  .from('flashcards')
  .select('*')
  .limit(5);

console.log('Data:', data);
console.log('Error:', error);
```

### Check Network Requests

```
1. Press F12
2. Go to "Network" tab
3. Filter: "Fetch/XHR"
4. Reload page
5. Look for requests to supabase.co
6. Click request → Check response
```

---

## 📊 Monitoring

### Check Usage

**Supabase Usage:**
```
1. Dashboard → Your Project
2. Click "Usage" in sidebar
3. View:
   - Database size
   - API requests
   - Bandwidth
   - Active users
```

**Vercel Analytics:**
```
1. Dashboard → Your Project
2. Click "Analytics"
3. View:
   - Visitors
   - Page views
   - Bandwidth
   - Performance
```

### Free Tier Limits

**Supabase Free Tier:**
- 500 MB database storage
- 2 GB bandwidth/month
- 50k monthly active users
- 1 GB file storage
- No expiration! ✅

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Unlimited deployments
- Unlimited team members

---

## 🔄 Common Tasks

### Add New Flashcards

**Option 1: SQL Editor**
```sql
INSERT INTO flashcards (hanzi, pinyin, english, book, chapter, order_num)
VALUES 
  ('新', 'xīn', 'new', 'Book 2', '1', 1),
  ('舊', 'jiù', 'old', 'Book 2', '1', 2);
```

**Option 2: Table Editor**
```
1. Dashboard → Table Editor
2. Select "flashcards" table
3. Click "Insert row"
4. Fill in fields
5. Save
```

**Option 3: CSV Import**
```
1. Table Editor → flashcards
2. Click "Insert" → "Import data from CSV"
3. Upload CSV file
4. Map columns
5. Import
```

### Update Environment Variables

```
1. Vercel → Settings → Environment Variables
2. Click "Edit" on variable
3. Update value
4. Save
5. Go to Deployments → Redeploy
```

### Export Database Backup

```
1. Supabase → Database → Backups
2. Click "Create backup" (free tier: manual only)
3. Or: Settings → Database → Connection string
4. Use pg_dump locally:
   pg_dump -d "your-connection-string" > backup.sql
```

### View Logs

**Supabase API Logs:**
```
Dashboard → Logs → Filter by API
```

**Vercel Deployment Logs:**
```
Dashboard → Deployments → Click deployment → View logs
```

**Vercel Function Logs:**
```
Dashboard → Deployments → Click deployment → Functions
```

---

## 🐛 Quick Fixes

### Frontend Won't Load Data

```
1. Check: Browser console (F12) for errors
2. Verify: Environment variables in Vercel
3. Test: Supabase SQL Editor - run query manually
4. Fix: Create RLS policy if missing
```

### Changes Not Appearing

```
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Check: Vercel deployment was successful
3. Verify: Correct branch deployed
4. Wait: Sometimes takes 1-2 minutes to propagate
```

### "Invalid API Key" Error

```
1. Supabase → Settings → API
2. Copy "anon public" key (not service_role)
3. Vercel → Environment Variables
4. Update VITE_SUPABASE_ANON_KEY
5. Redeploy
```

### Empty Database

```sql
-- Check if data exists:
SELECT COUNT(*) FROM flashcards;

-- If 0, reimport:
-- Use SQL INSERT or CSV import
```

---

## 🔐 Security Reminders

- ✅ Never commit Supabase keys to GitHub
- ✅ Use anon key in frontend (not service_role)
- ✅ Keep database password secure
- ✅ Use RLS policies to protect data
- ✅ Review API usage regularly

---

## 📚 Quick Links

**Documentation:**
- [Deployment Guide](DEPLOYMENT_GUIDE_SUPABASE.md)
- [Troubleshooting](DEPLOYMENT_TROUBLESHOOTING_SUPABASE.md)
- [Supabase Docs](https://supabase.com/docs)
- [Vercel Docs](https://vercel.com/docs)

**Dashboards:**
- [Supabase Dashboard](https://app.supabase.com)
- [Vercel Dashboard](https://vercel.com/dashboard)

**Support:**
- [Supabase Discord](https://discord.supabase.com)
- [Vercel Discord](https://vercel.com/discord)
- [Supabase GitHub Discussions](https://github.com/supabase/supabase/discussions)

---

## 🎯 Health Check

Quick test your deployment:

```
✅ Visit: https://your-app.vercel.app
   → Should load homepage

✅ Click: "Load from Database"
   → Should see flashcards

✅ Select: Book 1, Chapter 1
   → Should show count

✅ Start: Any drill
   → Should load questions

✅ Check: Browser console (F12)
   → No red errors
```

---

## 🔄 Update Workflow

```bash
# 1. Make changes locally
# Edit files...

# 2. Test locally
cd TCFlashcardsReact
npm run dev
# Visit: http://localhost:5173

# 3. Commit and push
git add .
git commit -m "Add feature X"
git push origin main

# 4. Auto-deploys!
# Check Vercel dashboard for status
# Visit production URL in 2-5 minutes
```

---

## 💡 Pro Tips

1. **Bookmark Dashboards**
   - Add Supabase and Vercel to favorites

2. **Use SQL Editor**
   - Faster than Table Editor for bulk operations
   - Can save common queries

3. **Monitor Usage Weekly**
   - Check both dashboards
   - Stay within free tier limits

4. **Use Git Tags**
   ```bash
   git tag v1.0.0
   git push --tags
   # Easy to track releases
   ```

5. **Test Locally with Production Data**
   ```bash
   # In TCFlashcardsReact/.env.local
   VITE_SUPABASE_URL=<production url>
   VITE_SUPABASE_ANON_KEY=<production key>
   
   npm run dev
   # Test against real data
   ```

---

## 📞 Emergency Contacts

**Service Status:**
- Supabase: https://status.supabase.com
- Vercel: https://www.vercel-status.com

**Support:**
- Supabase: support@supabase.io
- Vercel: https://vercel.com/help

---

Save this file for quick reference! 📌
