# 🚀 Deploy to Vercel + Render (Free Tier)

This guide helps you deploy your Traditional Chinese Flashcards app to free hosting services in about 30 minutes.

## 📦 What You're Deploying

- **Frontend**: React app → Vercel (Free)
- **Backend**: Express API → Render (Free)  
- **Database**: PostgreSQL → Render (Free)

## 🎯 Choose Your Guide

### 🌟 **New to Deployment?** 
Start here → [`DEPLOYMENT_GUIDE_BEGINNERS.md`](DEPLOYMENT_GUIDE_BEGINNERS.md)
- Step-by-step instructions with screenshots
- Explains every step in detail
- No prior knowledge needed

### ✅ **Want a Checklist?**
Use this → [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md)
- Printable checklist format
- Track your progress
- Verify everything works

### 🔧 **Something Not Working?**
Fix it here → [`DEPLOYMENT_TROUBLESHOOTING.md`](DEPLOYMENT_TROUBLESHOOTING.md)
- Common errors and solutions
- Debug strategies
- Quick fixes

### ⚡ **Quick Reference**
Deployed already? → [`DEPLOYMENT_QUICK_REFERENCE.md`](DEPLOYMENT_QUICK_REFERENCE.md)
- Commands and URLs
- Common tasks
- Maintenance schedule

---

## 🏃‍♂️ Quick Start (30 minutes)

If you're comfortable with tech, here's the express version:

### 1️⃣ Database (Render)
```bash
1. Sign up at render.com
2. New → PostgreSQL
3. Name: tcflashcards-db
4. Plan: Free
5. Create → Copy External Database URL
```

### 2️⃣ Backend (Render)
```bash
1. New → Web Service
2. Connect GitHub repo
3. Root directory: backend
4. Build: npm install
5. Start: npm start
6. Environment variables:
   - NODE_ENV=production
   - PORT=3001
   - DATABASE_URL=<paste database url>
   - FRONTEND_URL=<vercel url (add later)>
7. Deploy
8. Initialize database (see below)
```

### 3️⃣ Frontend (Vercel)
```bash
1. Sign up at vercel.com
2. Import project from GitHub
3. Root directory: TCFlashcardsReact
4. Framework: Vite
5. Environment variables:
   - VITE_API_URL=<backend url>/api
6. Deploy
```

### 4️⃣ Finalize
```bash
1. Update backend FRONTEND_URL with Vercel URL
2. Test: visit your Vercel URL
3. Should work! 🎉
```

---

## 📋 Prerequisites

Before starting, make sure you have:

- [x] Code pushed to GitHub
- [x] GitHub account
- [x] Email address (for signing up)
- [x] 30-60 minutes free time

---

## 🗄️ Initialize Database

After deploying backend, run this locally to set up tables:

```bash
# 1. Set DATABASE_URL environment variable
export DATABASE_URL="your-external-database-url"  # Mac/Linux
# OR
$env:DATABASE_URL="your-external-database-url"    # Windows PowerShell

# 2. Run initialization scripts
cd backend
npm run init-db-production
npm run seed-db
```

Or use Render's database shell to run SQL commands manually.

---

## 🔑 Configuration Files

Your repository already includes these:

- ✅ `backend/render.yaml` - Render configuration
- ✅ `TCFlashcardsReact/vercel.json` - Vercel configuration  
- ✅ `backend/config/db.js` - Supports DATABASE_URL
- ✅ `backend/scripts/init-db-production.js` - Database setup

No additional setup needed!

---

## 🌐 After Deployment

Your app will be live at:
- **Frontend**: `https://your-app-name.vercel.app`
- **Backend**: `https://tcflashcards-backend-xxxx.onrender.com`

Test these endpoints:
```bash
# Health check
https://your-backend.onrender.com/api/health

# Get flashcards
https://your-backend.onrender.com/api/flashcards

# Frontend
https://your-app.vercel.app
```

---

## ⚠️ Important Notes

### Render Free Tier
- ⏰ Spins down after 15 minutes (first request is slow)
- 📅 Database expires after 90 days (need to recreate)
- 🕐 750 hours/month limit

### Vercel Free Tier  
- ✅ Always on (no spin down)
- 📊 100 GB bandwidth/month
- 🚀 Fast global CDN

### CORS & Environment Variables
- Frontend must be in backend's `FRONTEND_URL`
- Backend must be in frontend's `VITE_API_URL`
- Both must match exactly (no trailing slashes!)

---

## 🆘 Need Help?

**Start with troubleshooting guide:**  
[`DEPLOYMENT_TROUBLESHOOTING.md`](DEPLOYMENT_TROUBLESHOOTING.md)

**Check these first:**
1. Is backend running? Test `/api/health`
2. Check environment variables in dashboards
3. Look at logs (Render & Vercel dashboards)
4. Check browser console (F12)

**Most common issues:**
- Wrong API URL in frontend ⚠️
- Wrong FRONTEND_URL in backend ⚠️
- Database not initialized ⚠️
- CORS errors (URL mismatch) ⚠️

---

## 🎓 Learning Resources

**First time deploying?**
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)

**Video tutorials:**
- Search YouTube: "Deploy React app to Vercel"
- Search YouTube: "Deploy Node.js to Render"

---

## 📞 Support

**Platform Support:**
- Render: https://render.com/docs/support
- Vercel: https://vercel.com/help

**Community:**
- Render Community: https://community.render.com
- Vercel Discord: https://vercel.com/discord

---

## ✨ Next Steps

After successful deployment:

1. **Set up monitoring** (optional)
   - Uptime monitoring (UptimeRobot, etc.)
   - Error tracking (Sentry, etc.)

2. **Custom domain** (optional, ~$12/year)
   - Buy domain (Namecheap, Google Domains)
   - Add to Vercel
   - Update backend FRONTEND_URL

3. **Continuous deployment**
   - Already set up! Just push to GitHub
   - Changes auto-deploy

4. **Backup strategy**
   - Export data before 90-day database expiration
   - Consider paid tier for permanent database

---

## 📊 Deployment Status

Use this checklist to track your deployment:

- [ ] Accounts created (Render, Vercel)
- [ ] Database deployed on Render
- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] Environment variables configured
- [ ] Database initialized with tables
- [ ] Sample data seeded (optional)
- [ ] Frontend loads in browser
- [ ] Backend health check passes
- [ ] Can complete a drill
- [ ] Statistics work
- [ ] No console errors

---

## 🎉 Success!

When everything works, you'll have:

✅ A live app anyone can access  
✅ Automatic deployments on git push  
✅ Free hosting (no credit card needed)  
✅ HTTPS/SSL automatically  
✅ Global CDN for fast loading  

**Share your app with the world!** 🌍

---

## 📚 All Deployment Guides

1. 🌟 [`DEPLOYMENT_GUIDE_BEGINNERS.md`](DEPLOYMENT_GUIDE_BEGINNERS.md) - Detailed walkthrough
2. ✅ [`DEPLOYMENT_CHECKLIST.md`](DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist
3. 🔧 [`DEPLOYMENT_TROUBLESHOOTING.md`](DEPLOYMENT_TROUBLESHOOTING.md) - Fix common issues
4. ⚡ [`DEPLOYMENT_QUICK_REFERENCE.md`](DEPLOYMENT_QUICK_REFERENCE.md) - Commands & URLs

---

**Ready to deploy?** Start with the [Beginner's Guide](DEPLOYMENT_GUIDE_BEGINNERS.md)! 🚀

