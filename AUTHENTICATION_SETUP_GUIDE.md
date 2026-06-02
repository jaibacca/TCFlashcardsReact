# 🔐 Email Authentication Setup Guide

## ✅ What's Been Implemented

The email authentication system has been set up with the following components:

### 1. **Authentication Context** (`src/contexts/AuthContext.jsx`)
- Manages user authentication state across the entire app
- Provides `useAuth()` hook for components
- Handles sign-in with magic links (passwordless)
- Handles sign-out
- Listens to Supabase auth state changes

### 2. **Auth UI Component** (`src/components/Auth.jsx`)
- Beautiful sign-in interface with email input
- Magic link sending with loading states
- Shows signed-in user with sign-out button
- Success/error message handling
- Mobile-responsive design

### 3. **Progress Sync Service** (`src/services/progressSync.js`)
- Syncs progress between localStorage and Supabase cloud
- Smart merge strategy: keeps best progress from both sources
- Auto-sync on login
- Auto-save to cloud when stats change

### 4. **Integration Complete**
- ✅ App wrapped with `AuthProvider` in `main.jsx`
- ✅ Auth component added to App.jsx
- ✅ Statistics component updated to use sync service
- ✅ Progress automatically syncs when signed in

---

## 📋 Required: Create Database Table

You need to create the `user_progress` table in your Supabase database:

### Option 1: SQL Editor (Recommended)
1. Go to your Supabase project: https://supabase.com/dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire contents of `backend/scripts/create-user-progress-table.sql`
5. Paste it into the SQL editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned" ✅

### Option 2: Table Editor
If you prefer GUI, you can create the table manually, but SQL is easier.

---

## 🔧 Configure Email Authentication in Supabase

### Step 1: Enable Email Provider
1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Make sure **Email** is enabled (it should be by default)

### Step 2: Configure Email Templates (Optional but Recommended)
1. Go to **Authentication** → **Email Templates**
2. Customize the "Magic Link" template if you want
3. The default template works fine for testing

### Step 3: Configure Site URL
1. Go to **Authentication** → **URL Configuration**
2. Add your site URLs:
   - **Site URL**: `https://your-app.vercel.app` (or `http://localhost:5173` for local)
   - **Redirect URLs**: Add both:
     - `https://your-app.vercel.app`
     - `http://localhost:5173`

---

## 🧪 Testing Locally

### 1. Start your dev server:
```bash
cd tcflashcardsreact
npm run dev
```

### 2. Test the authentication flow:

1. **Open the app** at `http://localhost:5173`
2. You should see a **"🔐 Sign In to Sync Progress"** button
3. Click it and enter your email
4. Click **"📧 Send Magic Link"**
5. Check your email for the magic link
6. Click the link in the email
7. You'll be redirected back to the app, now signed in!
8. You should see your email displayed with a "Sign Out" button

### 3. Test progress syncing:

**Test 1: Single Device**
1. Do some drills while signed in
2. Check that progress is saved (view Statistics)
3. Sign out, then sign back in
4. Progress should still be there ✅

**Test 2: Cross-Device** (the real test!)
1. Sign in on Device 1 (e.g., your laptop)
2. Do some drills and note your progress
3. Sign in on Device 2 (e.g., your phone or another browser)
4. Your progress should appear automatically! 🎉
5. Do more drills on Device 2
6. Go back to Device 1 and refresh
7. All progress should be synced! ✅

---

## 🚀 Deploy to Vercel

### 1. Commit and push your changes:
```bash
git add .
git commit -m "Add email authentication with cross-device sync"
git push origin master
```

### 2. Vercel will automatically deploy
- Watch the deployment at https://vercel.com/dashboard
- Should take 1-2 minutes

### 3. Configure Supabase Redirect URLs
After deployment, add your Vercel URL to Supabase:
1. Go to **Authentication** → **URL Configuration**
2. Add your production URL to **Redirect URLs**: `https://your-app.vercel.app`

---

## 🎯 How It Works

### Authentication Flow
1. User enters email → Supabase sends magic link
2. User clicks link in email → Authenticated!
3. `AuthContext` detects auth state change
4. `Statistics` component triggers sync
5. Progress loads from cloud and merges with local

### Progress Sync Strategy
- **On Login**: Merges local and cloud progress (keeps best)
- **While Signed In**: Auto-saves to cloud on every stats change
- **On Sign Out**: Progress stays in localStorage (still works offline)
- **On Next Sign In**: Syncs again!

### Merge Logic
When combining local and cloud progress:
- ✅ Keeps **higher** attempt counts
- ✅ Keeps **higher** correct counts
- ✅ Keeps **longer** streaks
- ✅ Preserves all card history
- 🎯 Result: You never lose progress!

---

## 🐛 Troubleshooting

### "Check your email" but no email received?
1. Check spam folder
2. Make sure email is correctly typed
3. Check Supabase Email Logs: **Authentication** → **Logs**
4. For development, Supabase's free tier might have email rate limits

### Email link doesn't redirect properly?
1. Check your Supabase URL Configuration has correct redirect URLs
2. Make sure you're using the same domain (don't mix localhost and 127.0.0.1)

### Progress not syncing?
1. Open browser console (F12)
2. Look for sync messages: "✅ Progress synced" or errors
3. Check if user is actually signed in: `useAuth()` should show user object
4. Verify the `user_progress` table exists in Supabase

### Can't sign out?
1. Check browser console for errors
2. Try clearing localStorage: `localStorage.clear()` in console
3. Try a hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

---

## 📊 Database Schema

The `user_progress` table stores:
```json
{
  "drills": {
    "hanziToPinyin": { "attempts": 50, "correct": 42, "totalTime": 12345 },
    "pinyinToEnglish": { "attempts": 30, "correct": 25, "totalTime": 6789 },
    ...
  },
  "cardHistory": {
    "card123": { "attempts": 5, "correctCount": 4 },
    ...
  },
  "streaks": {
    "current": 7,
    "longest": 15,
    "lastStudyDate": "2024-01-15"
  },
  "totalCards": 500
}
```

This JSON is stored in the `stats_data` JSONB column for flexibility.

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ You can sign in with just your email (no password!)
- ✅ Your email appears at the top of the app when signed in
- ✅ Progress persists after signing out and back in
- ✅ Progress syncs across different devices/browsers
- ✅ Console shows "✅ Progress synced to cloud" messages
- ✅ Supabase dashboard shows rows in the `user_progress` table

---

## 🔒 Security Features

Your authentication system includes:
- ✅ **Row Level Security (RLS)**: Users can only access their own progress
- ✅ **Magic Links**: No passwords to hack or forget
- ✅ **Supabase Auth**: Battle-tested authentication service
- ✅ **HTTPS**: All traffic encrypted in production
- ✅ **JWT Tokens**: Secure session management

---

## 📚 Next Steps (Optional Enhancements)

Consider adding these features later:
1. **Social Auth**: Sign in with Google, GitHub, etc.
2. **Profile Settings**: Let users update their display name
3. **Data Export**: Let users download their progress as JSON
4. **Leaderboards**: Show top learners (with permission)
5. **Study Reminders**: Email notifications for streaks

---

## 💡 Tips

- **Test thoroughly** before relying on cloud sync
- **Keep local progress** as a backup (it's in localStorage)
- **Sign in early** when starting to learn for best sync experience
- **Don't clear localStorage** unless you want to reset progress (if signed in, it'll re-sync from cloud)

---

## Need Help?

If you run into issues:
1. Check the browser console for error messages
2. Check Supabase logs: **Authentication** → **Logs**
3. Verify your environment variables in Vercel
4. Make sure the database table was created successfully

Happy learning! 🎓✨
