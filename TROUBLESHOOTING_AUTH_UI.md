# 🔍 TROUBLESHOOTING: Auth UI Not Visible

## Issue: Login prompt not showing on frontend

### Quick Fix Steps:

#### 1. **Stop the Dev Server** (if running)
In your terminal/PowerShell where `npm run dev` is running:
- Press **Ctrl+C** to stop it
- Confirm if prompted

#### 2. **Restart the Dev Server**
```powershell
cd C:\Users\LISTJBL\source\repos\TCFlashcardsReact
npm run dev
```

#### 3. **Hard Refresh Your Browser**
- **Chrome/Edge**: Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- **Firefox**: Press `Ctrl + F5`
- Or open DevTools (F12) → Right-click the refresh button → "Empty Cache and Hard Reload"

#### 4. **Check Browser Console**
- Press `F12` to open DevTools
- Go to **Console** tab
- Look for any red error messages
- Share them if you see any

---

## What You Should See

After restarting, you should see this on your homepage (between the "✓ Loaded X flashcards" message and the Statistics section):

### When NOT signed in:
```
┌─────────────────────────────────────────────┐
│  🔐 Sign In to Sync Progress                │
│                                             │
│  Progress will be saved across devices      │
│                                             │
│  [     Click to Sign In     ]               │
└─────────────────────────────────────────────┘
```

### When signed in:
```
┌─────────────────────────────────────────────┐
│  👤 your@email.com        [  Sign Out  ]    │
└─────────────────────────────────────────────┘
```

---

## Verification Checklist

- [ ] Dev server restarted
- [ ] Browser hard refreshed
- [ ] See purple/gradient box on homepage
- [ ] Box appears between "Loaded flashcards" and "Statistics" section
- [ ] No errors in browser console

---

## Still Not Showing?

### Check 1: Verify Files Exist
```powershell
# Check if auth files exist
dir C:\Users\LISTJBL\source\repos\TCFlashcardsReact\src\components\Auth.jsx
dir C:\Users\LISTJBL\source\repos\TCFlashcardsReact\src\components\Auth.css
dir C:\Users\LISTJBL\source\repos\TCFlashcardsReact\src\contexts\AuthContext.jsx
```

All should exist. If any are missing, let me know.

### Check 2: Look for Build Errors
When you run `npm run dev`, check the terminal output for:
- ✅ **Good**: "Local: http://localhost:5173"
- ❌ **Bad**: Red error messages about missing modules

### Check 3: Check Network Tab
1. Open browser (F12) → **Network** tab
2. Refresh page
3. Look for `Auth.jsx` and `Auth.css` in the file list
4. If they show "404" or red, there's a loading issue

### Check 4: Verify Import Paths
Open App.jsx and verify line 6:
```javascript
import Auth from './components/Auth'
```

Open main.jsx and verify line 5:
```javascript
import { AuthProvider } from './contexts/AuthContext'
```

---

## Common Issues and Solutions

### Issue: "Module not found: Can't resolve './contexts/AuthContext'"
**Solution**: 
```powershell
# Make sure you're in the right directory
cd C:\Users\LISTJBL\source\repos\TCFlashcardsReact

# Reinstall dependencies
npm install

# Restart dev server
npm run dev
```

### Issue: "useAuth is not a function"
**Solution**: Check that AuthContext.jsx exports `useAuth` properly (it does in our version)

### Issue: Auth component renders but looks broken
**Solution**: Check that Auth.css is imported in Auth.jsx (line 3)

### Issue: No purple box, just white page
**Solution**: 
1. Check browser console for CSS errors
2. Verify Auth.css exists
3. Try clearing browser cache completely

---

## Testing Steps After Fix

1. **See the Auth Box**
   - Should appear on homepage after flashcards load

2. **Click "Sign In"**
   - Should show email input form

3. **Enter Email**
   - Type your email
   - Click "Send Magic Link"

4. **Check for Errors**
   - Console should show no errors
   - Should see "Check your email" message

---

## What to Do Next

### If You See the Auth UI Now: ✅
Great! Continue with:
1. Create the database table in Supabase (STEP 1)
2. Configure authentication URLs (STEP 2)
3. Test magic link sign-in (STEP 3)

### If You Still Don't See It: ❌
Reply with:
1. Screenshot of your browser showing the homepage
2. Browser console output (any errors?)
3. Terminal output from `npm run dev`
4. Result of running: `dir src\components\Auth.jsx`

---

## Quick Commands Reference

```powershell
# Navigate to project
cd C:\Users\LISTJBL\source\repos\TCFlashcardsReact

# Install dependencies
npm install

# Start dev server
npm run dev

# Stop dev server
# Press Ctrl+C in the terminal

# Check if files exist
dir src\components\Auth.jsx
dir src\contexts\AuthContext.jsx

# Build to test for errors
npm run build
```

---

## Visual Guide: Where Auth Should Appear

```
┌─────────────────────────────────────────────┐
│  Traditional Chinese Flashcards             │
│  Master Mandarin with interactive drills   │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  ✓ Loaded 500 flashcards from database     │  ← This message
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  🔐 Sign In to Sync Progress                │  ← AUTH SHOULD BE HERE!
│  [     Click to Sign In     ]               │
└─────────────────────────────────────────────┘
┌─────────────────────────────────────────────┐
│  📊 Your Progress                           │  ← Statistics below
│  Overall Accuracy: 0%                       │
└─────────────────────────────────────────────┘
```

---

**Next Step**: Restart your dev server and hard refresh your browser! 🔄
