# Supabase + Vercel Deployment Troubleshooting

Common issues and solutions when deploying with Supabase and Vercel.

---

## 🔍 Quick Diagnosis

### Where to Check Logs

**Vercel Logs:**
1. Go to vercel.com/dashboard
2. Click your project
3. Click "Deployments"
4. Click latest deployment
5. Scroll to "Build Logs" or "Function Logs"

**Supabase Logs:**
1. Go to app.supabase.com
2. Select your project
3. Click "Logs" in sidebar
4. See API requests, database queries

**Browser Console:**
1. Press F12 (or Cmd+Option+I on Mac)
2. Go to "Console" tab
3. Look for red error messages

**Browser Network Tab:**
1. Press F12
2. Go to "Network" tab
3. Reload page
4. Look for failed requests (red)

---

## 🚨 Common Issues & Solutions

### Issue 1: "Cannot read properties of undefined"

**Symptoms:**
- App loads but crashes immediately
- Console shows: `Cannot read properties of undefined (reading 'from')`
- Supabase client not initialized

**Cause:**
- Missing Supabase environment variables
- Typo in environment variable names

**Solutions:**

**Step 1: Verify Environment Variables**
1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "Environment Variables"
3. Check both variables exist:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Variable names must match EXACTLY (case-sensitive)

**Step 2: Check Values**
1. URL should be: `https://xxxxxxxxxxxxx.supabase.co`
2. Key should start with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. No quotes around values
4. No trailing spaces

**Step 3: Redeploy**
1. Go to "Deployments"
2. Click "..." on latest deployment
3. Click "Redeploy"
4. Wait 2-5 minutes

---

### Issue 2: "Failed to fetch" or Data Won't Load

**Symptoms:**
- Click "Load from Database" - nothing happens
- Console shows: `Failed to fetch` or network error
- Supabase API calls failing

**Cause:**
- Row Level Security (RLS) blocking queries
- Missing RLS policies
- Wrong Supabase credentials

**Solutions:**

**Step 1: Check RLS Policies**
1. Go to Supabase → SQL Editor
2. Run this query:
```sql
SELECT * FROM pg_policies WHERE tablename = 'flashcards';
```
3. Should see at least one policy
4. If empty, create policy:
```sql
CREATE POLICY "Allow public read access on flashcards" ON flashcards
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert on flashcards" ON flashcards
  FOR INSERT WITH CHECK (true);
```

**Step 2: Verify Table Exists**
1. Go to Supabase → Table Editor
2. Check "flashcards" table exists
3. Check it has data
4. If missing, run initialization SQL again

**Step 3: Test in Supabase Directly**
1. Go to SQL Editor
2. Run: `SELECT * FROM flashcards LIMIT 10;`
3. Should return rows
4. If error, check table creation

---

### Issue 3: Vercel Build Fails

**Symptoms:**
- Deployment fails at build step
- Build logs show error
- Site not deployed

**Common Errors:**

**Error: "Cannot find module '@supabase/supabase-js'"**

```
Solution:
1. In your local project:
   cd TCFlashcardsReact
   npm install @supabase/supabase-js
   
2. Commit and push:
   git add package.json package-lock.json
   git commit -m "Add Supabase dependency"
   git push origin main
   
3. Vercel will auto-redeploy
```

**Error: "VITE_SUPABASE_URL is not defined"**

```
Solution:
1. Go to Vercel → Settings → Environment Variables
2. Add missing variables
3. Redeploy manually:
   Deployments → ... → Redeploy
```

**Error: "npm ERR! code ERESOLVE"**

```
Solution:
1. Clear package-lock.json:
   rm TCFlashcardsReact/package-lock.json
   
2. Reinstall:
   cd TCFlashcardsReact
   npm install
   
3. Commit and push
```

---

### Issue 4: Database Empty After Import

**Symptoms:**
- Tables exist but no data
- Query returns 0 rows
- CSV import seemed to work

**Cause:**
- CSV format incorrect
- Import mapping wrong
- Data rejected by constraints

**Solutions:**

**Step 1: Verify Data Exists**
```sql
-- In Supabase SQL Editor
SELECT COUNT(*) FROM flashcards;
-- Should return number > 0
```

**Step 2: Check Recent Inserts**
```sql
SELECT * FROM flashcards 
ORDER BY created_at DESC 
LIMIT 10;
-- Should see your recent data
```

**Step 3: Re-import with SQL**
Instead of CSV, use SQL INSERT:
```sql
INSERT INTO flashcards (hanzi, pinyin, english, book, chapter, order_num) VALUES
  ('你好', 'nǐ hǎo', 'hello', 'Book 1', '1', 1),
  ('再見', 'zài jiàn', 'goodbye', 'Book 1', '1', 2);
-- Add more rows...
```

---

### Issue 5: "Network Error" in Browser

**Symptoms:**
- Browser console: `TypeError: NetworkError`
- API calls fail immediately
- Works locally but not in production

**Cause:**
- Browser blocking request
- CORS issue (shouldn't happen with Supabase)
- Wrong Supabase URL

**Solutions:**

**Step 1: Check Supabase URL**
1. Browser console: Run this
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
```
2. Should show your project URL
3. If `undefined`, environment variables not set

**Step 2: Hard Refresh**
- Windows: Ctrl + Shift + R
- Mac: Cmd + Shift + R
- Clears cache and reloads

**Step 3: Check Network Tab**
1. F12 → Network tab
2. Try loading data again
3. Click failed request
4. Check "Response" tab for error details

---

### Issue 6: Changes Not Appearing After Push

**Symptoms:**
- Pushed code to GitHub
- Vercel shows "Deploy successful"
- Changes not visible on live site

**Cause:**
- Browser cache
- Old deployment active
- Wrong branch deployed

**Solutions:**

**Step 1: Hard Refresh Browser**
- Clear cache and reload (Ctrl+Shift+R / Cmd+Shift+R)

**Step 2: Check Deployment**
1. Go to Vercel → Deployments
2. Click latest deployment
3. Click "Visit" to see that specific deployment
4. Check if it's set as "Production"

**Step 3: Verify Branch**
1. Settings → Git
2. Check "Production Branch" is correct (main or master)
3. Check your git branch: `git branch`
4. Make sure you pushed to correct branch

---

### Issue 7: Environment Variables Not Working

**Symptoms:**
- Variables undefined in code
- `import.meta.env.VITE_SUPABASE_URL` returns `undefined`
- Works locally but not on Vercel

**Cause:**
- Variables not prefixed with `VITE_`
- Not redeployed after adding variables
- Typo in variable name

**Solutions:**

**Step 1: Check Variable Names**
```
✅ Correct: VITE_SUPABASE_URL
❌ Wrong: SUPABASE_URL
❌ Wrong: REACT_APP_SUPABASE_URL
```

**Step 2: Verify in Code**
```javascript
// In your code, should be:
import.meta.env.VITE_SUPABASE_URL  // ✅ Correct

// NOT:
process.env.VITE_SUPABASE_URL      // ❌ Wrong (that's Node.js)
```

**Step 3: Redeploy After Adding**
Adding environment variables requires redeployment:
1. Go to Deployments
2. Click "..." → "Redeploy"
3. Wait for completion

---

### Issue 8: RLS Policies Blocking Queries

**Symptoms:**
- Table exists, data exists
- Queries return empty array
- SQL Editor works, but app doesn't
- Console shows: "new row violates row-level security policy"

**Cause:**
- Row Level Security enabled without policies
- Policies too restrictive

**Solutions:**

**Step 1: Check RLS Status**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'flashcards';
-- If rowsecurity = true, RLS is enabled
```

**Step 2: Check Existing Policies**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'flashcards';
```

**Step 3: Create Permissive Policies**
For now (public access):
```sql
-- Allow anyone to read
CREATE POLICY "Public read access" ON flashcards
  FOR SELECT USING (true);

-- Allow anyone to insert (for testing)
CREATE POLICY "Public insert access" ON flashcards
  FOR INSERT WITH CHECK (true);
```

For production (authenticated only):
```sql
-- Allow authenticated users to read
CREATE POLICY "Authenticated read access" ON flashcards
  FOR SELECT USING (auth.role() = 'authenticated' OR true);
```

---

### Issue 9: Slow Performance

**Symptoms:**
- App loads slowly
- Queries take several seconds
- Laggy interactions

**Cause:**
- Missing indexes
- Inefficient queries
- Too much data loaded at once

**Solutions:**

**Step 1: Add Indexes**
```sql
-- In Supabase SQL Editor
CREATE INDEX IF NOT EXISTS idx_flashcards_book ON flashcards(book);
CREATE INDEX IF NOT EXISTS idx_flashcards_chapter ON flashcards(chapter);
CREATE INDEX IF NOT EXISTS idx_flashcards_book_chapter ON flashcards(book, chapter);
```

**Step 2: Optimize Queries**
Instead of loading all flashcards:
```javascript
// Load only needed columns
const { data } = await supabase
  .from('flashcards')
  .select('id, hanzi, pinyin, english')
  .limit(100);
```

**Step 3: Use Pagination**
```javascript
const { data } = await supabase
  .from('flashcards')
  .select('*')
  .range(0, 49); // First 50 items
```

---

### Issue 10: "Invalid API key"

**Symptoms:**
- All API calls fail
- Console: "Invalid API key"
- Can't connect to Supabase

**Cause:**
- Wrong anon key copied
- Using service_role key instead of anon key
- Expired or regenerated key

**Solutions:**

**Step 1: Get Correct Key**
1. Supabase → Settings → API
2. Look for "anon public" key (NOT service_role)
3. Copy entire key (very long string)

**Step 2: Update Vercel**
1. Vercel → Settings → Environment Variables
2. Edit `VITE_SUPABASE_ANON_KEY`
3. Paste new key
4. Save
5. Redeploy

**Step 3: Never Use service_role Key**
- service_role bypasses RLS (security risk!)
- Only use in backend code, never in frontend
- Frontend should use anon key only

---

## 🛠️ Debugging Checklist

When something doesn't work, check in order:

1. **Browser Console (F12)**
   - [ ] Any red errors?
   - [ ] What's the exact error message?

2. **Network Tab**
   - [ ] Which requests are failing?
   - [ ] What's the response status? (404, 403, 500?)
   - [ ] What's the response body?

3. **Vercel Environment Variables**
   - [ ] Both VITE_ variables set?
   - [ ] No typos in names?
   - [ ] Values correct?

4. **Supabase Dashboard**
   - [ ] Project active and running?
   - [ ] Tables exist?
   - [ ] Data exists in tables?
   - [ ] RLS policies correct?

5. **Local Testing**
   - [ ] Does it work locally with same credentials?
   - [ ] Create .env with production values
   - [ ] Test: `npm run dev`

---

## 🔧 Useful Commands

### Test Supabase Connection Locally

```javascript
// In browser console on your site:
import { supabase } from './src/config/supabase'

// Test query
const { data, error } = await supabase
  .from('flashcards')
  .select('*')
  .limit(5);

console.log('Data:', data);
console.log('Error:', error);
```

### Check Environment Variables

```javascript
// In browser console:
console.log({
  url: import.meta.env.VITE_SUPABASE_URL,
  key: import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...'
});
```

### Query Supabase Directly (SQL Editor)

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'flashcards'
);

-- Count rows
SELECT COUNT(*) FROM flashcards;

-- View recent data
SELECT * FROM flashcards 
ORDER BY created_at DESC 
LIMIT 10;

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'flashcards';
```

---

## 📞 Still Stuck?

1. **Check Supabase Status**: https://status.supabase.com
2. **Check Vercel Status**: https://www.vercel-status.com
3. **Search Supabase Discussions**: https://github.com/supabase/supabase/discussions
4. **Supabase Discord**: https://discord.supabase.com
5. **Vercel Discord**: https://vercel.com/discord

---

## 💡 Prevention Tips

1. **Test Locally First**
   - Use production credentials in local .env
   - Test before deploying

2. **Use Version Control**
   - Commit before major changes
   - Easy to rollback: `git revert`

3. **Document Your Setup**
   - Save credentials securely
   - Note any custom configurations

4. **Monitor Usage**
   - Check dashboards weekly
   - Watch for unexpected API calls

5. **Keep Dependencies Updated**
   ```bash
   npm update @supabase/supabase-js
   ```

---

Remember: Most issues are due to:
- ❌ Missing/wrong environment variables
- ❌ RLS policies blocking queries
- ❌ Typos in variable names

Double-check these first! 😊
