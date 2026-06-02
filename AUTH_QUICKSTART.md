# 🚀 Email Auth Quick Start Card

## ⚡ 3 Steps to Enable Cross-Device Sync

### Step 1: Create Database Table (1 minute)
```sql
-- In Supabase SQL Editor, run:
-- backend/scripts/create-user-progress-table.sql
```

### Step 2: Configure URLs (30 seconds)
```
Supabase Dashboard → Authentication → URL Configuration
Add redirect URLs:
  - http://localhost:5173
  - https://your-app.vercel.app
```

### Step 3: Deploy (1 minute)
```bash
git add .
git commit -m "Add email authentication"
git push origin master
```

## ✅ Test It Works

1. Open app → Click "Sign In"
2. Enter email → Check inbox
3. Click magic link → Signed in!
4. Do some drills
5. Open app on another device
6. Sign in → Progress synced! 🎉

## 📋 Files Created

- `src/contexts/AuthContext.jsx` - Auth state
- `src/components/Auth.jsx` - Sign in UI
- `src/services/progressSync.js` - Sync logic
- `backend/scripts/create-user-progress-table.sql` - Database

## 🔍 Verify It's Working

Look for these signs:
- ✅ Sign in button visible on homepage
- ✅ Email shown when signed in
- ✅ Console: "✅ Progress synced to cloud"
- ✅ Supabase: Rows in `user_progress` table
- ✅ Other device: Progress appears!

## 🆘 Quick Fixes

**No email?** → Check spam folder
**Link broken?** → Add redirect URL in Supabase
**Not syncing?** → Check browser console for errors
**Table error?** → Run SQL script in Supabase

## 📖 Full Documentation

- **AUTHENTICATION_SETUP_GUIDE.md** - Complete guide
- **AUTHENTICATION_SUMMARY.md** - Feature overview

---

**That's it! Your users can now learn Chinese anywhere! 🎓✨**
