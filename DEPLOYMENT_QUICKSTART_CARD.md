# 🚀 Deploy Your App - Quick Start Card

**Print or save this for quick reference!**

---

## ✨ What You're Deploying

```
Frontend (React)  →  Vercel    →  Free, Always On
Backend (API)     →  Render    →  Free, Spins Down
Database (SQL)    →  Render    →  Free, 90 Days
```

**Total Cost: $0** | **Time: 30-60 minutes**

---

## 📋 Pre-Flight Checklist

- [ ] Code pushed to GitHub
- [ ] GitHub account ready
- [ ] 1 hour free time
- [ ] Read [DEPLOYMENT_README.md](DEPLOYMENT_README.md)

---

## 🎯 Three-Step Deployment

### 1️⃣ Database (render.com)
```
Sign up → New → PostgreSQL → Free tier
Name: tcflashcards-db
Copy: External Database URL
```
**Time: 5 minutes**

### 2️⃣ Backend (render.com)
```
New → Web Service → Connect GitHub
Root: backend
Environment Variables:
  DATABASE_URL = <paste from step 1>
  FRONTEND_URL = <will add after step 3>
  NODE_ENV = production
  PORT = 3001
Deploy!
```
**Time: 10 minutes + build time**

### 3️⃣ Frontend (vercel.com)
```
Sign up → Import from GitHub
Root: TCFlashcardsReact
Environment Variables:
  VITE_API_URL = <backend-url-from-step-2>/api
Deploy!
```
**Time: 5 minutes + build time**

### ✅ Finalize
```
Go back to Render backend →
Update FRONTEND_URL = <vercel-url-from-step-3>
Wait for auto-redeploy
```

---

## 🗄️ Initialize Database

**After step 2, run this locally:**

```bash
# Set environment variable
export DATABASE_URL="your-external-database-url"   # Mac/Linux
$env:DATABASE_URL="your-external-database-url"     # Windows

# Initialize tables
cd backend
npm run init-db-production
npm run seed-db
```

---

## ✅ Test Your Deployment

Visit these URLs (replace with yours):

```
Frontend:  https://your-app.vercel.app
           → Should see homepage ✅

Backend:   https://your-backend.onrender.com/api/health
           → Should see {"status":"ok"} ✅

Full Test: Load data → Select chapter → Start drill
           → Should work! ✅
```

---

## 🆘 Something Broken?

### Frontend shows "Network Error"
```
Check: VITE_API_URL in Vercel settings
Should be: https://your-backend.onrender.com/api
```

### Backend shows "CORS Error"
```
Check: FRONTEND_URL in Render backend settings
Should be: https://your-app.vercel.app
No trailing slash!
```

### Database connection fails
```
Check: DATABASE_URL in Render backend settings
Should be: postgresql://... (from database page)
```

### Backend is really slow
```
Normal! Free tier spins down after 15 min.
First request takes 30-60 seconds.
```

---

## 📚 Full Documentation

Need more help? We have complete guides:

- 📘 [DEPLOYMENT_README.md](DEPLOYMENT_README.md) - Start here
- 📗 [DEPLOYMENT_GUIDE_BEGINNERS.md](DEPLOYMENT_GUIDE_BEGINNERS.md) - Step-by-step
- 📙 [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Track progress
- 📕 [DEPLOYMENT_TROUBLESHOOTING.md](DEPLOYMENT_TROUBLESHOOTING.md) - Fix issues
- 📔 [DEPLOYMENT_QUICK_REFERENCE.md](DEPLOYMENT_QUICK_REFERENCE.md) - Commands
- 📓 [DEPLOYMENT_ARCHITECTURE.md](DEPLOYMENT_ARCHITECTURE.md) - How it works

---

## 💾 Save Your URLs

After deployment, write them here:

```
Frontend URL:   https://______________________.vercel.app

Backend URL:    https://______________________.onrender.com

Database URL:   postgresql://______________________

Deployed on:    ____________________
```

---

## 🔑 Environment Variables Reference

### Vercel (Frontend)
```env
VITE_API_URL=https://your-backend.onrender.com/api
```

### Render Backend
```env
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
FRONTEND_URL=https://your-app.vercel.app
```

---

## ⚠️ Important Notes

### Free Tier Limits
- **Render Backend**: Spins down after 15 min inactivity
- **Render Database**: Expires after 90 days (must recreate)
- **Vercel**: 100 GB bandwidth/month

### First Request is Slow
- Cold start: 30-60 seconds
- Subsequent requests: Fast (<1 second)
- This is normal on free tier!

### Database Expiration
- Set reminder for 80 days
- Export data before expiration
- Recreate database and restore data

---

## 🎉 Success Criteria

You're done when:

- ✅ Frontend loads at Vercel URL
- ✅ Backend responds at /api/health
- ✅ Can load flashcards from database
- ✅ Can complete a drill
- ✅ Statistics work
- ✅ No errors in browser console (F12)

---

## 🔄 Future Updates

After initial deployment:

```bash
# Make code changes
git add .
git commit -m "Update feature"
git push origin main

# Automatic deployment!
# Vercel: 2-5 minutes
# Render: 5-10 minutes
```

---

## 📞 Need Help?

1. Check [DEPLOYMENT_TROUBLESHOOTING.md](DEPLOYMENT_TROUBLESHOOTING.md)
2. Review logs in Render/Vercel dashboards
3. Verify all environment variables
4. Test each component individually

---

## 🏆 You Got This!

**Deploy with confidence!** Everything you need is in this repository.

**Start here:** [DEPLOYMENT_README.md](DEPLOYMENT_README.md)

---

**Good luck! 🚀**

---

*Created: [Date]*  
*Project: Traditional Chinese Flashcards*  
*Stack: React + Express + PostgreSQL*  
*Services: Vercel + Render (Free Tier)*
