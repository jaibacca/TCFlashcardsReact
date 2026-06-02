# Deployment Troubleshooting Guide

Common issues when deploying to Vercel and Render, and how to fix them.

---

## 🔍 How to Debug

### Check Logs

**Render Backend Logs:**
1. Go to Render Dashboard
2. Click your backend service
3. Click "Logs" tab
4. Look for red error messages

**Vercel Frontend Logs:**
1. Go to Vercel Dashboard
2. Click your project
3. Click "Deployments"
4. Click the deployment
5. Scroll down to "Build Logs" or "Function Logs"

**Browser Console:**
1. Open your deployed site
2. Press F12 (or Cmd+Option+I on Mac)
3. Go to "Console" tab
4. Look for red errors

**Browser Network Tab:**
1. Press F12
2. Go to "Network" tab
3. Reload page
4. Look for failed requests (red)
5. Click on failed request to see details

---

## 🚨 Common Issues & Solutions

### Issue 1: Frontend Shows "Network Error" or "Failed to Fetch"

**Symptoms:**
- App loads but can't get data
- Console shows: `Failed to fetch` or `Network Error`
- Network tab shows failed API calls

**Causes:**
1. Backend not running
2. Wrong API URL in frontend
3. CORS error

**Solutions:**

**Step 1: Test Backend Directly**
```bash
# Visit in browser:
https://your-backend-url.onrender.com/api/health
```
- Should see: `{"status":"ok",...}`
- If doesn't load: Backend is down or not deployed
- If shows error: Check Render logs

**Step 2: Check Frontend API URL**
1. Go to Vercel Dashboard
2. Click your project → Settings → Environment Variables
3. Check `VITE_API_URL` value
4. Should be: `https://your-backend-url.onrender.com/api`
5. Common mistakes:
   - Missing `/api` at end
   - Wrong URL
   - `http://` instead of `https://`
6. If wrong, update and redeploy

**Step 3: Check CORS Configuration**
1. Go to Render Dashboard
2. Click backend service → Environment
3. Check `FRONTEND_URL` value
4. Should be: `https://your-app-name.vercel.app`
5. Common mistakes:
   - Trailing slash (`/` at end)
   - Wrong URL
   - Missing `https://`
6. If wrong, update and wait for redeploy

---

### Issue 2: Backend Shows "Failed to Connect to Database"

**Symptoms:**
- Backend health check fails
- Logs show: `Connection terminated` or `ECONNREFUSED`
- API calls return 500 errors

**Causes:**
1. Database not running
2. Wrong DATABASE_URL
3. Database credentials expired

**Solutions:**

**Step 1: Check Database Status**
1. Go to Render Dashboard
2. Check if database shows "Available"
3. If suspended: Free tier database expired (90 days)
   - Need to create new database
   - See "Database Expired" section below

**Step 2: Verify DATABASE_URL**
1. Go to your database in Render
2. Copy the "External Database URL"
3. Go to backend service → Environment
4. Check `DATABASE_URL` matches
5. If wrong, update and save

**Step 3: Test Connection**
```bash
# In terminal, install PostgreSQL client:
# Windows: Download from postgresql.org
# Mac: brew install postgresql

# Test connection:
psql "your-external-database-url-here"

# If connects successfully:
\dt  # List tables
\q   # Quit
```

---

### Issue 3: Backend Slow or Times Out (First Request)

**Symptoms:**
- First API call takes 30-60 seconds
- Subsequent calls are fast
- Frontend shows loading spinner for long time

**Cause:**
- Render free tier spins down after 15 minutes of inactivity
- First request wakes it up (cold start)

**Solutions:**

**Not Really a Problem:**
- This is expected behavior on free tier
- No way to fix without upgrading to paid plan

**Workarounds:**
1. Keep alive service (ping backend every 10 minutes)
   - Use cron-job.org or similar
   - Make request to `/api/health` every 10 min
   - WARNING: May exceed free tier hours

2. Upgrade to paid tier ($7/month)
   - No spin-down
   - Always fast

3. Warn users:
   - Add loading message: "Waking up server..."
   - Set longer timeout in frontend

---

### Issue 4: Build Fails on Vercel

**Symptoms:**
- Deployment fails
- Build logs show errors
- Site not deployed

**Common Errors:**

**Error: "Cannot find module"**
```
Solution:
1. Check package.json has all dependencies
2. Make sure you're not importing from devDependencies in code
3. Run locally: npm install && npm run build
4. Fix any errors, commit, push
```

**Error: "Command 'npm run build' failed"**
```
Solution:
1. Check build logs for specific error
2. Test locally: npm run build
3. Common issues:
   - Linting errors (unused variables)
   - TypeScript errors
   - Missing environment variables
4. Fix, commit, push
```

**Error: "VITE_API_URL is not defined"**
```
Solution:
1. Add environment variable in Vercel
2. Settings → Environment Variables
3. Add: VITE_API_URL = https://your-backend.onrender.com/api
4. Redeploy
```

---

### Issue 5: Build Fails on Render (Backend)

**Symptoms:**
- Backend deployment fails
- Logs show "Build failed"

**Common Errors:**

**Error: "Cannot find module 'pg'"**
```
Solution:
1. Check package.json includes all dependencies
2. Make sure pg, express, cors, dotenv are in "dependencies" not "devDependencies"
3. Verify package.json syntax is valid
4. Push changes and redeploy
```

**Error: "Port already in use"**
```
Solution:
1. Make sure server.js uses process.env.PORT
2. Should have: const PORT = process.env.PORT || 3001;
3. Don't hardcode port number
```

---

### Issue 6: Database Tables Don't Exist

**Symptoms:**
- Backend works but queries fail
- Logs show: `relation "flashcards" does not exist`
- API returns empty arrays

**Cause:**
- Database created but tables not initialized

**Solutions:**

**Option 1: Use Render Database Shell**
1. Go to database in Render
2. Click "Connect" → "External Connection"
3. Copy PSQL command
4. Open local terminal
5. Paste PSQL command (installs PostgreSQL client if needed)
6. Run SQL from your init scripts:
```sql
-- Copy and paste contents of backend/scripts/init-db.sql
-- Or init-db-multiuser.js SQL commands
```

**Option 2: Use Local Script**
1. Create temporary `.env` file:
```
DATABASE_URL=your-external-database-url
```
2. Update `backend/scripts/init-db.js` to use DATABASE_URL
3. Run: `node backend/scripts/init-db.js`
4. Run: `node backend/scripts/seed-db.js`

---

### Issue 7: CORS Error in Browser Console

**Symptoms:**
- Console shows: `CORS policy: No 'Access-Control-Allow-Origin' header`
- API calls fail with CORS error
- Backend logs show request received

**Cause:**
- Backend FRONTEND_URL doesn't match actual frontend URL
- Or CORS not configured in backend

**Solutions:**

**Step 1: Check Backend CORS Config**
1. Look at `backend/server.js`
2. Should have:
```javascript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true
}));
```

**Step 2: Check FRONTEND_URL**
1. Go to Render backend service
2. Environment tab
3. Check `FRONTEND_URL` = `https://your-app.vercel.app`
4. Must match exactly:
   - No trailing slash
   - Correct domain
   - https:// (not http://)

**Step 3: Redeploy Backend**
1. After changing FRONTEND_URL
2. Click "Manual Deploy" → "Clear build cache & deploy"

---

### Issue 8: Environment Variables Not Working

**Symptoms:**
- Backend can't find DATABASE_URL
- Frontend can't find VITE_API_URL
- Logs show `undefined` for env vars

**Solutions:**

**For Vercel (Frontend):**
1. Must start with `VITE_`
2. Access with: `import.meta.env.VITE_API_URL`
3. Added in: Project Settings → Environment Variables
4. Need to redeploy after adding/changing
5. Can't be changed without redeployment (built into code)

**For Render (Backend):**
1. Access with: `process.env.DATABASE_URL`
2. Added in: Service → Environment tab
3. Auto-redeploys when changed
4. Must require dotenv: `require('dotenv').config()`

---

### Issue 9: Free Tier Database Expired (90 Days)

**Symptoms:**
- Database shows "Suspended" or "Deleted"
- Backend can't connect
- After 90 days of creation

**Cause:**
- Render free databases expire after 90 days

**Solution:**

**You must create a new database:**

1. **Create New Database:**
   - Render Dashboard → New → PostgreSQL
   - Same settings as before
   - Free tier

2. **Get New Database URL:**
   - Copy External Database URL

3. **Update Backend:**
   - Backend service → Environment
   - Update `DATABASE_URL` to new URL
   - Save (auto-redeploys)

4. **Reinitialize Tables:**
   - Run init-db script with new URL
   - Run seed-db script
   - Or use database shell

5. **Data Migration (if needed):**
   - If you had important data in old database
   - Should have regular backups
   - Or export before 90 days

**Prevention:**
- Set calendar reminder for 80 days
- Export data regularly
- Consider paid tier ($7/month, no expiration)

---

### Issue 10: Vercel Shows "404 - This Page Could Not Be Found"

**Symptoms:**
- Homepage loads but navigation shows 404
- Direct links to /stats or other routes fail
- Refresh on any page except home shows 404

**Cause:**
- SPA routing not configured (client-side routing)
- Vercel doesn't know to serve index.html for all routes

**Solution:**

**Make sure you have `vercel.json`:**

Create `TCFlashcardsReact/vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Push and redeploy.

---

## 🔧 Debugging Checklist

When something doesn't work, check in this order:

1. **Is backend running?**
   - Visit: `https://your-backend.onrender.com/api/health`
   - Should see: `{"status":"ok"}`

2. **Is database connected?**
   - Check Render backend logs
   - Should see: "Connected to PostgreSQL"

3. **Can frontend reach backend?**
   - Check browser Network tab
   - API calls should succeed (200 status)

4. **Are environment variables correct?**
   - Vercel: Check VITE_API_URL
   - Render: Check FRONTEND_URL and DATABASE_URL

5. **Is CORS configured?**
   - Check browser console for CORS errors
   - Verify FRONTEND_URL in backend

6. **Are tables initialized?**
   - Query: `https://your-backend.onrender.com/api/flashcards`
   - Should return data (if seeded)

---

## 📞 Still Stuck?

If none of these solutions work:

1. **Check the full error message:**
   - Copy exact error from logs
   - Search for error online

2. **Verify all URLs:**
   - Backend URL correct?
   - Frontend URL correct?
   - Database URL correct?

3. **Test locally:**
   - Does it work on localhost?
   - If yes: deployment config issue
   - If no: code issue

4. **Start fresh:**
   - Sometimes easier to delete and recreate
   - Database, backend, or frontend
   - Follow checklist carefully

5. **Check service status:**
   - status.render.com
   - vercel-status.com
   - Sometimes providers have outages

---

## 🛠️ Useful Commands

**Test backend locally:**
```bash
cd backend
npm install
npm start
# Visit: http://localhost:3001/api/health
```

**Test frontend locally:**
```bash
cd TCFlashcardsReact
npm install
npm run build
npm run preview
# Visit: http://localhost:4173
```

**Connect to production database:**
```bash
psql "your-external-database-url"
```

**Check environment in code:**
```javascript
// Backend: console.log all env vars
console.log('Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DB_URL_SET: !!process.env.DATABASE_URL,
  FRONTEND_URL: process.env.FRONTEND_URL
});

// Frontend: check in browser console
console.log('API URL:', import.meta.env.VITE_API_URL);
```

---

Remember: Most deployment issues are due to wrong environment variables or URLs!

Double-check everything before panicking. 😊
