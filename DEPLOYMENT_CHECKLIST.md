# Deployment Checklist

Use this checklist to ensure everything is set up correctly before and after deployment.

## ✅ Pre-Deployment Checklist

### Code Preparation
- [ ] All changes committed to Git
- [ ] Code pushed to GitHub
- [ ] `backend/.env.example` is up to date
- [ ] `TCFlashcardsReact/.env.example` is up to date
- [ ] No sensitive data (passwords, keys) in code
- [ ] `.gitignore` includes `.env` files

### Backend Ready
- [ ] `backend/config/db.js` supports `DATABASE_URL`
- [ ] CORS configuration includes production frontend URL
- [ ] Health check endpoint works: `/api/health`
- [ ] All routes tested locally

### Frontend Ready
- [ ] API calls use `VITE_API_URL` environment variable
- [ ] Build works locally: `npm run build`
- [ ] Preview works locally: `npm run preview`
- [ ] No hardcoded localhost URLs in code

### Database Scripts
- [ ] `init-db.js` script exists and works
- [ ] `seed-db.js` script exists and works
- [ ] SQL schema files are up to date
- [ ] Multi-user tables script ready (if needed)

---

## 🗄️ Database Deployment (Render)

### Setup
- [ ] Render account created
- [ ] PostgreSQL database created
- [ ] Database name: `chinese_flashcards`
- [ ] Region selected (note: ________________)
- [ ] Plan: Free tier selected

### Configuration
- [ ] External Database URL copied
- [ ] Database URL saved securely
- [ ] Connection tested (optional)

### Data Initialization
- [ ] Tables created (via init-db script or SQL)
- [ ] Sample data seeded (optional)
- [ ] Multi-user tables created (if needed)

**Database URL:** `____________________________________________`

---

## 🖥️ Backend Deployment (Render)

### Setup
- [ ] Web service created
- [ ] GitHub repository connected
- [ ] Service name: `tcflashcards-backend`
- [ ] Region: Same as database
- [ ] Root directory: `backend`
- [ ] Plan: Free tier selected

### Build Configuration
- [ ] Runtime: Node
- [ ] Build Command: `npm install`
- [ ] Start Command: `npm start`

### Environment Variables
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `3001`
- [ ] `DATABASE_URL` = `<External Database URL>`
- [ ] `FRONTEND_URL` = `<Vercel URL>` (add after frontend deployment)

### Deployment
- [ ] First deploy successful
- [ ] Build logs checked (no errors)
- [ ] Service is "Live"
- [ ] Auto-deploy enabled (optional)

### Testing
- [ ] Health check works: `https://<backend-url>/api/health`
- [ ] Flashcards endpoint works: `https://<backend-url>/api/flashcards`
- [ ] Stats endpoint works: `https://<backend-url>/api/stats`
- [ ] CORS working (after frontend deploy)

**Backend URL:** `____________________________________________`

---

## 🌐 Frontend Deployment (Vercel)

### Setup
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Project name chosen
- [ ] Framework: Vite detected

### Build Configuration
- [ ] Root Directory: `TCFlashcardsReact`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`

### Environment Variables
- [ ] `VITE_API_URL` = `https://<backend-url>/api`

### Deployment
- [ ] First deploy successful
- [ ] Build logs checked (no errors)
- [ ] Preview URL works
- [ ] Production URL assigned
- [ ] Auto-deploy enabled (main branch)

### Testing
- [ ] Homepage loads
- [ ] Can select book/chapter
- [ ] Drill starts and loads cards
- [ ] Statistics page loads
- [ ] Data persists correctly

**Frontend URL:** `____________________________________________`

---

## 🔗 Integration Testing

### Backend ↔ Database
- [ ] Backend can connect to database
- [ ] Queries return data
- [ ] No connection pool errors in logs

### Frontend ↔ Backend
- [ ] API calls succeed (no CORS errors)
- [ ] Data loads in frontend
- [ ] POST requests work (if applicable)
- [ ] Error handling works

### End-to-End
- [ ] User can complete full drill session
- [ ] Statistics update correctly
- [ ] Page refreshes maintain state
- [ ] All drill types work

---

## 🔧 Post-Deployment Configuration

### Backend Updates
- [ ] FRONTEND_URL updated with Vercel URL
- [ ] Service redeployed after URL update
- [ ] CORS error resolved

### DNS & Custom Domain (Optional)
- [ ] Custom domain purchased
- [ ] Domain added to Vercel
- [ ] DNS records configured
- [ ] SSL certificate active
- [ ] Backend FRONTEND_URL updated with custom domain

### Monitoring Setup
- [ ] Render email notifications enabled
- [ ] Vercel deployment notifications enabled
- [ ] Error tracking configured (optional)

---

## 📊 Verification

### Performance
- [ ] Frontend loads in < 3 seconds
- [ ] API responses < 1 second (after warmup)
- [ ] Images/assets load correctly
- [ ] No console errors in browser

### Security
- [ ] No API keys in frontend code
- [ ] Database URL not exposed
- [ ] CORS restricted to your domain
- [ ] HTTPS working on all URLs

### Free Tier Limits
- [ ] Database size monitored (< 1GB)
- [ ] Render hours tracked (< 750/month)
- [ ] Vercel bandwidth monitored (< 100GB/month)

---

## 📝 Documentation

- [ ] Deployment URLs documented
- [ ] Environment variables documented
- [ ] Known issues noted
- [ ] Update schedule planned (for database 90-day limit)

---

## 🚨 Troubleshooting

If something doesn't work, check:

1. **Logs First**
   - Render: Service → Logs tab
   - Vercel: Deployment → Function Logs
   - Browser: Console (F12)

2. **Environment Variables**
   - Check spelling and values
   - No trailing slashes
   - Correct protocols (https://)

3. **CORS Issues**
   - Verify FRONTEND_URL in backend
   - Check backend CORS configuration
   - Ensure no typos in URLs

4. **Database Issues**
   - Check DATABASE_URL is correct
   - Verify database is running
   - Check connection pool settings

5. **Build Failures**
   - Check build logs for errors
   - Verify package.json scripts
   - Check Node version compatibility

---

## 🎯 Success Criteria

Your deployment is complete when:

✅ Frontend loads at your Vercel URL  
✅ Backend responds at health check endpoint  
✅ Database contains flashcard data  
✅ User can complete a full drill session  
✅ Statistics are tracked correctly  
✅ No errors in browser console  
✅ No errors in Render logs  

---

## 📞 Getting Help

If stuck:

1. Check `DEPLOYMENT_GUIDE_BEGINNERS.md` - Common Issues section
2. Review logs in Render and Vercel
3. Test API endpoints individually
4. Check browser network tab for failed requests
5. Verify all URLs are correct (no typos)

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version:** _______________  

---

## 🔄 Re-deployment Notes

For future updates:

### Frontend (Vercel)
- Push to GitHub → Auto-deploys
- Or: Vercel Dashboard → Deployments → Redeploy

### Backend (Render)
- Push to GitHub → Auto-deploys
- Or: Render Dashboard → Manual Deploy → Deploy latest commit

### Database Schema Changes
- Connect to database via Render shell
- Run migration scripts
- Or: Run scripts locally with DATABASE_URL

---

Save this completed checklist for your records!
