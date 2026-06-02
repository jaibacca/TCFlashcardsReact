# 🚀 Deploy with Supabase - Ultra Quick Guide

**Easiest deployment ever - 20 minutes!**

---

## ✨ What You're Deploying

```
Frontend (React)     →  Vercel    →  Free Forever
Backend + Database   →  Supabase  →  Free Forever (No Expiration!)
```

**Total: 2 services | Time: 20-30 minutes | Cost: $0**

---

## 🎯 Three Simple Steps

### 1️⃣ Supabase (10 min)
```
1. Sign up: supabase.com (no card needed)
2. Create project: "TCFlashcards"
3. Copy credentials:
   - Project URL
   - anon key
4. SQL Editor → Run table creation SQL
5. Import sample data
```

### 2️⃣ Vercel (8 min)
```
1. Sign up: vercel.com  
2. Import from GitHub
3. Root: TCFlashcardsReact
4. Add environment variables:
   VITE_SUPABASE_URL=<your url>
   VITE_SUPABASE_ANON_KEY=<your key>
5. Deploy!
```

### 3️⃣ Test (2 min)
```
Visit your Vercel URL →
Load Database → 
Start Drill →
✅ Done!
```

---

## 📋 Pre-Flight Check

- [ ] Code on GitHub
- [ ] GitHub account
- [ ] 20 minutes free

---

## 🗄️ Quick SQL (Copy & Run in Supabase)

```sql
-- Create tables
CREATE TABLE flashcards (
  id BIGSERIAL PRIMARY KEY,
  hanzi VARCHAR(100) NOT NULL,
  pinyin VARCHAR(255) NOT NULL,
  english TEXT NOT NULL,
  book VARCHAR(100),
  chapter VARCHAR(100),
  order_num INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes
CREATE INDEX idx_flashcards_book ON flashcards(book);
CREATE INDEX idx_flashcards_chapter ON flashcards(chapter);

-- Enable RLS & create policy
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public access" ON flashcards FOR SELECT USING (true);
CREATE POLICY "Public insert" ON flashcards FOR INSERT WITH CHECK (true);

-- Add sample data
INSERT INTO flashcards (hanzi, pinyin, english, book, chapter, order_num) VALUES
  ('你好', 'nǐ hǎo', 'hello', 'Book 1', '1', 1),
  ('再見', 'zài jiàn', 'goodbye', 'Book 1', '1', 2),
  ('謝謝', 'xiè xie', 'thank you', 'Book 1', '1', 3);
```

---

## ⚙️ Environment Variables

### Vercel Settings
```
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ✅ Success Check

After deployment:

- [ ] Visit Vercel URL - homepage loads
- [ ] Click "Load Database" - cards appear
- [ ] Select chapter - count updates
- [ ] Start drill - works!
- [ ] F12 console - no errors

---

## 🆘 Quick Fixes

### "Cannot read properties of undefined"
```
Fix: Check Vercel environment variables
     Must be: VITE_SUPABASE_URL (exact spelling!)
```

### "Failed to fetch" or Empty Data
```
Fix: Create RLS policy in Supabase SQL Editor:
CREATE POLICY "Public access" ON flashcards 
  FOR SELECT USING (true);
```

### Build Fails
```
Fix: Install Supabase client:
cd TCFlashcardsReact
npm install @supabase/supabase-js
git add . && git commit -m "Add Supabase" && git push
```

---

## 🎁 Why Supabase is Better

**vs Traditional Stack (Render):**

| Feature | Render | Supabase |
|---------|--------|----------|
| Setup Time | 60 min | 20 min ✅ |
| Services | 3 | 2 ✅ |
| DB Expires | 90 days | Never ✅ |
| Cold Starts | Yes (30-60s) | No ✅ |
| Backend Code | Maintain | None needed ✅ |
| CORS Config | Manual | Auto ✅ |

**Winner: Supabase!** 🏆

---

## 📊 Free Forever Limits

**Supabase:**
- 500 MB database (plenty!)
- 50k monthly users
- No expiration ✅

**Vercel:**
- 100 GB bandwidth/month
- Unlimited deploys

**No credit card needed!**

---

## 🔄 Update Your App

```bash
# Make changes
git add .
git commit -m "New feature"
git push

# Auto-deploys in 2-5 minutes!
```

---

## 📚 Full Guides

Need more details?

- 📘 [DEPLOYMENT_GUIDE_SUPABASE.md](DEPLOYMENT_GUIDE_SUPABASE.md) - Complete guide
- 📗 [DEPLOYMENT_CHECKLIST_SUPABASE.md](DEPLOYMENT_CHECKLIST_SUPABASE.md) - Checklist
- 📙 [DEPLOYMENT_TROUBLESHOOTING_SUPABASE.md](DEPLOYMENT_TROUBLESHOOTING_SUPABASE.md) - Fixes

---

## 💾 Save Your Info

After deployment:

```
Frontend:  https://______________________.vercel.app
Supabase:  https://______________________.supabase.co
Deployed:  _________________ (date)
```

---

## 🎉 You Did It!

Your app is now:
- ✅ Live on the internet
- ✅ Free forever
- ✅ Always fast (no cold starts)
- ✅ Auto-deploys from GitHub
- ✅ No maintenance needed

**Share your app with the world!** 🌍

---

## 📞 Need Help?

1. Check [DEPLOYMENT_TROUBLESHOOTING_SUPABASE.md](DEPLOYMENT_TROUBLESHOOTING_SUPABASE.md)
2. F12 → Console for errors
3. Supabase Discord: https://discord.supabase.com

---

**Good luck! You got this!** 🚀

---

*Deployment made simple with Supabase + Vercel*  
*No backend, no worries!*
