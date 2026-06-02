# Supabase + Vercel Deployment Checklist

**Print this and check off each step as you complete it!**

---

## ✅ Pre-Deployment Preparation

### Accounts & Prerequisites
- [ ] GitHub account created
- [ ] Code pushed to GitHub repository
- [ ] Email address ready for sign-ups
- [ ] 30 minutes free time available

### Code Verification
- [ ] `TCFlashcardsReact/src/config/supabase.js` exists
- [ ] `TCFlashcardsReact/.env.example` has Supabase variables
- [ ] `@supabase/supabase-js` in package.json
- [ ] No hardcoded API URLs in code
- [ ] `.gitignore` includes `.env` files

---

## 🗄️ Part 1: Supabase Setup

### Create Account & Project
- [ ] Signed up at supabase.com (no credit card needed)
- [ ] Created new organization (or selected existing)
- [ ] Created new project:
  - [ ] Project name: _______________
  - [ ] Database password: (saved securely)
  - [ ] Region: _______________
  - [ ] Plan: Free tier
- [ ] Waited for project initialization (2-3 minutes)

### Get Credentials
- [ ] Navigated to Settings → API
- [ ] Copied Project URL: _______________
- [ ] Copied anon/public key: _______________
- [ ] Saved credentials securely (password manager/notes)

---

## 🗃️ Part 2: Database Initialization

### Create Tables
- [ ] Opened SQL Editor in Supabase
- [ ] Created new query
- [ ] Pasted SQL for table creation
- [ ] Tables created:
  - [ ] flashcards
  - [ ] users  
  - [ ] user_progress
- [ ] Indexes created
- [ ] Row Level Security enabled

### Load Sample Data
- [ ] Method chosen:
  - [ ] Option A: SQL INSERT statements
  - [ ] Option B: CSV import via Table Editor
- [ ] Data inserted successfully
- [ ] Verified in Table Editor (20+ rows in flashcards)

### Create RLS Policies
- [ ] Public read policy on flashcards created
- [ ] Public insert policy on flashcards created
- [ ] Tested: can query flashcards table

---

## 🌐 Part 3: Frontend Deployment (Vercel)

### Create Account
- [ ] Signed up at vercel.com
- [ ] Signed up with GitHub (recommended)
- [ ] Authorized Vercel to access GitHub repos

### Import Project
- [ ] Clicked "Add New..." → Project
- [ ] Found TCFlashcardsReact repository
- [ ] Clicked Import

### Configure Build Settings
- [ ] Framework: Vite (auto-detected)
- [ ] Root Directory: `TCFlashcardsReact` ✅
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Install Command: `npm install`

### Environment Variables
- [ ] Added `VITE_SUPABASE_URL`
  - Value: _______________
- [ ] Added `VITE_SUPABASE_ANON_KEY`
  - Value: _______________ (first 20 chars)
- [ ] Verified no typos in variable names
- [ ] Variables set for: Production, Preview, Development

### Deploy
- [ ] Clicked "Deploy"
- [ ] Build started (watched logs)
- [ ] Build completed successfully
- [ ] Deployment successful
- [ ] Got production URL: _______________

---

## 🧪 Part 4: Testing

### Frontend Loading
- [ ] Visited Vercel URL
- [ ] Homepage loads correctly
- [ ] No errors in browser console (F12)
- [ ] All components visible

### Database Connection
- [ ] Clicked "💾 Database" button
- [ ] Clicked "Load from Database"
- [ ] Success message appeared
- [ ] Flashcards loaded (count: _______)
- [ ] Book 1 appears in data selector

### Functionality Testing
- [ ] Expanded Book 1
- [ ] Can see chapters
- [ ] Selected Chapter 1
- [ ] Card count updates correctly
- [ ] Multiple Choice Mode toggles

### Drill Testing
Test each drill type:
- [ ] Hanzi → Pinyin + English works
- [ ] Pinyin → English works  
- [ ] Pinyin → Hanzi works
- [ ] English → Hanzi works

### Statistics Testing
- [ ] Statistics panel visible
- [ ] Accuracy calculates correctly
- [ ] Cards studied today increments
- [ ] Streak tracking works
- [ ] Progress saves (refresh page to verify)

---

## ✅ Post-Deployment Verification

### Performance
- [ ] Page loads in < 3 seconds
- [ ] No cold start delays
- [ ] Smooth interactions
- [ ] No lag when loading data

### Security
- [ ] No Supabase keys in client code (checked with F12 → Sources)
- [ ] Environment variables only in Vercel dashboard
- [ ] HTTPS working (🔒 in browser)
- [ ] No security warnings

### Mobile Testing (Optional)
- [ ] Works on mobile browser
- [ ] Touch interactions work
- [ ] Responsive design looks good

---

## 📊 Documentation

### Save Important Information
- [ ] Supabase URL: _______________
- [ ] Project name: _______________
- [ ] Region: _______________
- [ ] Vercel URL: _______________
- [ ] Deployment date: _______________
- [ ] Version/Git commit: _______________

### Bookmarks Created
- [ ] Supabase Dashboard
- [ ] Vercel Dashboard
- [ ] Production URL
- [ ] GitHub Repository

---

## 🔄 Future Updates Setup

### Automatic Deployments
- [ ] Verified auto-deploy is enabled (Vercel → Settings → Git)
- [ ] Tested: Made small change, pushed to GitHub
- [ ] Verified: Vercel auto-deployed
- [ ] Deployment time: _____ minutes

### Monitoring Setup
- [ ] Checked Supabase usage dashboard
- [ ] Checked Vercel analytics
- [ ] Set up notification preferences (optional)

---

## 📝 Optional Enhancements

### Custom Domain
- [ ] Domain purchased (service: _______________)
- [ ] Added to Vercel (Settings → Domains)
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] Custom domain working: _______________

### Authentication
- [ ] Supabase Auth enabled
- [ ] Email/password provider configured
- [ ] Social providers configured (Google, GitHub, etc.)
- [ ] Tested sign-up/sign-in flow

### Backups
- [ ] Reviewed Supabase automatic backup settings
- [ ] Documented backup retention period
- [ ] Tested manual backup (optional)

---

## 🎯 Success Criteria

Your deployment is complete and successful when:

- ✅ Frontend loads at Vercel URL without errors
- ✅ Can load flashcards from Supabase
- ✅ All drill types work correctly
- ✅ Statistics track and persist
- ✅ No errors in browser console
- ✅ Fast loading (< 3 seconds)
- ✅ Works on mobile (optional)
- ✅ HTTPS/SSL active
- ✅ Automatic deployments working

---

## 🆘 Troubleshooting Checklist

If something doesn't work:

- [ ] Checked browser console (F12) for errors
- [ ] Verified Supabase credentials in Vercel
- [ ] Checked Supabase SQL Editor for table existence
- [ ] Verified RLS policies exist
- [ ] Checked Vercel build logs
- [ ] Tested locally first
- [ ] Reviewed [DEPLOYMENT_TROUBLESHOOTING_SUPABASE.md](DEPLOYMENT_TROUBLESHOOTING_SUPABASE.md)

---

## 📚 Resources Used

- [ ] [DEPLOYMENT_GUIDE_SUPABASE.md](DEPLOYMENT_GUIDE_SUPABASE.md) - Main guide
- [ ] [DEPLOYMENT_TROUBLESHOOTING_SUPABASE.md](DEPLOYMENT_TROUBLESHOOTING_SUPABASE.md) - Fixes
- [ ] Supabase Documentation
- [ ] Vercel Documentation

---

## 💡 Lessons Learned

Write notes about your deployment experience:

**What went smoothly:**
_________________________________________________________________
_________________________________________________________________

**What was challenging:**
_________________________________________________________________
_________________________________________________________________

**What would you do differently next time:**
_________________________________________________________________
_________________________________________________________________

---

## 🎉 Completion

**Deployment completed on:** _______________  
**Deployed by:** _______________  
**Production URL:** _______________  
**Total time taken:** _____ minutes  

**Status:** [ ] Successful ✅ [ ] Needs fixes ⚠️

---

## 🔄 Maintenance Schedule

### Weekly
- [ ] Check if app is working
- [ ] Review usage in dashboards
- [ ] Check for any errors

### Monthly
- [ ] Review Supabase usage (database size, API calls)
- [ ] Review Vercel bandwidth usage
- [ ] Check for updates to dependencies

### As Needed
- [ ] Deploy updates (automatic on push)
- [ ] Add new features
- [ ] Update flashcard data

---

## 📞 Support Contacts

**Supabase:**
- Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- Status: https://status.supabase.com

**Vercel:**
- Docs: https://vercel.com/docs
- Help: https://vercel.com/help
- Status: https://www.vercel-status.com

---

**Save this checklist for future reference!**

**Date completed:** _______________  
**Checked by:** _______________  
**Signature:** _______________

---

🎊 **Congratulations on your successful deployment!** 🎊
