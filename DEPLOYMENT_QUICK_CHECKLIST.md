# ✅ DEPLOYMENT QUICK CHECKLIST

Print this or keep it open in another window!

---

## STEP 1: Database Table ⏳
- [ ] Open Supabase dashboard: https://supabase.com/dashboard
- [ ] Click "SQL Editor" in sidebar
- [ ] Click "New Query"
- [ ] Copy SQL from: `backend/scripts/create-user-progress-table.sql`
- [ ] Paste and click "Run"
- [ ] See "Success. No rows returned" ✅
- [ ] Check Table Editor → See `user_progress` table

**Status: ⏳ IN PROGRESS**

---

## STEP 2: Auth Configuration ⏳
- [ ] In Supabase, click "Authentication" → "URL Configuration"
- [ ] Set Site URL: `http://localhost:5173`
- [ ] Add Redirect URLs:
  ```
  http://localhost:5173
  http://localhost:5173/**
  https://*.vercel.app
  https://*.vercel.app/**
  ```
- [ ] Click "Save"
- [ ] Check "Providers" tab → Email is enabled

**Status: NOT STARTED**

---

## STEP 3: Local Testing ⏳
- [ ] Run: `npm run dev`
- [ ] Open: http://localhost:5173
- [ ] See the app loads
- [ ] Click "Sign In to Sync Progress"
- [ ] Enter email and send magic link
- [ ] Check email inbox
- [ ] Click magic link in email
- [ ] See your email displayed in app
- [ ] Do 5 drills
- [ ] Open console (F12) → See "✅ Progress synced" messages
- [ ] Sign out, sign back in → Progress still there

**Status: NOT STARTED**

---

## STEP 4: Commit Code ⏳
```powershell
git add .
git commit -m "Add email authentication with cross-device sync"
git push origin master
```
- [ ] Commands run successfully
- [ ] Check GitHub → See new commit

**Status: NOT STARTED**

---

## STEP 5: Vercel Deploy ⏳
- [ ] Open: https://vercel.com/dashboard
- [ ] Find your project
- [ ] Wait for auto-deploy (or click "Redeploy")
- [ ] See "✅ Build completed"
- [ ] Copy production URL

**Status: NOT STARTED**

---

## STEP 6: Update Supabase URLs ⏳
- [ ] Back to Supabase → Authentication → URL Configuration
- [ ] Update Site URL to your Vercel URL
- [ ] Add Vercel URL to Redirect URLs
- [ ] Save

**Status: NOT STARTED**

---

## STEP 7: Production Test ⏳
- [ ] Open Vercel URL in browser
- [ ] Sign in with email
- [ ] Magic link works
- [ ] Do some drills
- [ ] Open on another device
- [ ] Sign in with same email
- [ ] Progress synced across devices! 🎉

**Status: NOT STARTED**

---

## 🎯 CURRENT STEP:

**YOU ARE HERE → STEP 1: Create Database Table**

Open Supabase dashboard and run the SQL script!

---

## 📞 Quick Help

**Issue:** Can't find SQL Editor
**Fix:** Look for `</>` icon in sidebar, or under "Database"

**Issue:** SQL errors
**Fix:** Make sure you selected the correct project at top

**Issue:** No email received
**Fix:** Check spam folder, wait 2-3 minutes

**Issue:** Build fails
**Fix:** Check Vercel logs, verify environment variables

---

## ⏱️ Time Estimate
- Step 1: 5 minutes
- Step 2: 2 minutes
- Step 3: 5 minutes
- Step 4: 2 minutes
- Step 5: 3 minutes
- Step 6: 1 minute
- Step 7: 5 minutes

**Total: ~25 minutes to complete deployment!**

---

**When you finish each step, check it off and move to the next!** ✨
