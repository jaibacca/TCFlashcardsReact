# Deployment Quick Reference

Quick commands and URLs for your deployed application.

---

## 📝 Deployment Information

Fill this out after deploying:

```
Frontend URL: https://_________________________.vercel.app
Backend URL:  https://_________________________.onrender.com
Database:     postgresql://_________________________

Deployment Date: _______________
Version: _______________
```

---

## 🌐 Important URLs

### Frontend (Vercel)
- **Live Site**: `https://your-app.vercel.app`
- **Dashboard**: https://vercel.com/dashboard
- **Project Settings**: https://vercel.com/[username]/[project]/settings

### Backend (Render)
- **API Base**: `https://your-backend.onrender.com/api`
- **Health Check**: `https://your-backend.onrender.com/api/health`
- **Dashboard**: https://dashboard.render.com
- **Service Logs**: https://dashboard.render.com → Your Service → Logs

### Database (Render)
- **Dashboard**: https://dashboard.render.com → Your Database
- **Connection**: Use External Database URL from dashboard

---

## ⚙️ Environment Variables

### Vercel (Frontend)
```bash
VITE_API_URL=https://your-backend.onrender.com/api
```

### Render Backend
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
FRONTEND_URL=https://your-app.vercel.app
```

---

## 🔧 Common Commands

### Test Endpoints

```bash
# Health check
curl https://your-backend.onrender.com/api/health

# Get all flashcards
curl https://your-backend.onrender.com/api/flashcards

# Get books
curl https://your-backend.onrender.com/api/flashcards/books
```

### Database Operations

```bash
# Connect to database
psql "your-external-database-url"

# Inside psql:
\dt                    # List tables
\d flashcards          # Describe flashcards table
SELECT COUNT(*) FROM flashcards;  # Count records
\q                     # Quit
```

### Initialize Production Database Locally

```bash
# Set environment variable
export DATABASE_URL="your-external-database-url"  # Mac/Linux
# OR
set DATABASE_URL=your-external-database-url       # Windows CMD
# OR  
$env:DATABASE_URL="your-external-database-url"    # Windows PowerShell

# Run initialization
cd backend
npm run init-db-production
npm run seed-db
```

---

## 🚀 Deployment Commands

### Deploy Frontend (Vercel)
```bash
# Automatic: Just push to GitHub
git add .
git commit -m "Update frontend"
git push origin main

# Manual: From Vercel dashboard
# Go to project → Deployments → Redeploy
```

### Deploy Backend (Render)
```bash
# Automatic: Just push to GitHub
git add .
git commit -m "Update backend"
git push origin main

# Manual: From Render dashboard
# Go to service → Manual Deploy → Deploy latest commit
```

---

## 🔍 Debugging Steps

1. **Check if backend is running:**
   ```
   Visit: https://your-backend.onrender.com/api/health
   Expected: {"status":"ok",...}
   ```

2. **Check browser console:**
   ```
   Press F12 → Console tab
   Look for red errors
   ```

3. **Check network requests:**
   ```
   Press F12 → Network tab
   Reload page
   Look for failed requests (red)
   ```

4. **Check backend logs:**
   ```
   Render Dashboard → Service → Logs
   Look for errors
   ```

5. **Check build logs:**
   ```
   Vercel: Project → Deployment → Build Logs
   Render: Service → Events
   ```

---

## 📊 Monitoring

### Free Tier Limits

**Render Free Tier:**
- 750 hours/month (for backend)
- Database expires in 90 days
- Spins down after 15 min inactivity
- 512 MB RAM

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Unlimited deployments
- Unlimited team members
- Serverless function: 100 GB-hours

### Check Usage

**Render:**
1. Dashboard → Usage
2. See hours used this month

**Vercel:**
1. Project Settings → Usage
2. See bandwidth used

---

## 🔄 Update Workflow

### When you make code changes:

1. **Test locally:**
   ```bash
   # Frontend
   cd TCFlashcardsReact
   npm run dev
   
   # Backend
   cd backend
   npm run dev
   ```

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

3. **Wait for deployment:**
   - Vercel: ~2-5 minutes
   - Render: ~5-10 minutes

4. **Verify deployment:**
   - Check Vercel/Render dashboard
   - Visit live site
   - Test functionality

---

## 🛠️ Maintenance Tasks

### Weekly
- [ ] Check if site is working
- [ ] Review error logs
- [ ] Check free tier usage

### Monthly
- [ ] Review analytics (if set up)
- [ ] Check database size
- [ ] Clean up old data (if needed)

### Every 80 Days
- [ ] Prepare for database expiration (Render free tier)
- [ ] Export important data
- [ ] Plan database recreation

---

## 🆘 Emergency Contacts

### Service Status Pages
- Render: https://status.render.com
- Vercel: https://www.vercel-status.com

### Support
- Render Support: help@render.com
- Vercel Support: https://vercel.com/help

### Documentation
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs

---

## 📚 Related Files

- `DEPLOYMENT_GUIDE_BEGINNERS.md` - Detailed deployment instructions
- `DEPLOYMENT_CHECKLIST.md` - Step-by-step checklist
- `DEPLOYMENT_TROUBLESHOOTING.md` - Fix common issues
- `backend/render.yaml` - Render configuration
- `TCFlashcardsReact/vercel.json` - Vercel configuration

---

## 🎯 Quick Tests

After deployment, test these:

- [ ] Frontend loads at Vercel URL
- [ ] Backend health check returns OK
- [ ] Can select Book 1, Chapter 1
- [ ] Drill starts and loads cards
- [ ] Can complete a drill
- [ ] Statistics page shows data
- [ ] No errors in browser console
- [ ] API calls succeed (Network tab)

---

## 💡 Pro Tips

1. **Keep URLs handy**: Bookmark your dashboards
2. **Monitor logs**: Check occasionally for errors
3. **Test after deploys**: Always verify changes work
4. **Use git tags**: Tag releases for easy rollback
5. **Document changes**: Keep notes of what you deploy
6. **Set reminders**: For database 90-day expiration
7. **Export data**: Regular backups of important data

---

## 🔐 Security Reminders

- ✅ Never commit `.env` files
- ✅ Never expose database URLs in client code
- ✅ Keep environment variables in platform dashboards
- ✅ Use HTTPS for all production URLs
- ✅ Restrict CORS to your frontend domain only

---

Save this file and update the URLs section after deployment!
