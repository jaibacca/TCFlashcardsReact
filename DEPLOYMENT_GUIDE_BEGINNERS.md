# Complete Deployment Guide for Beginners

This guide will walk you through deploying your Traditional Chinese Flashcards app to free hosting services. No prior deployment experience needed!

## 🎯 What We're Deploying

- **Frontend (React)**: Vercel (Free tier)
- **Backend (Express API)**: Render (Free tier)
- **Database (PostgreSQL)**: Render (Free tier)

## 📋 Prerequisites Checklist

Before starting, make sure you have:

- [ ] GitHub account (create at https://github.com)
- [ ] Your code pushed to GitHub
- [ ] Email address for signing up to services

## 🚀 Deployment Steps Overview

1. Deploy Database (Render)
2. Deploy Backend API (Render)
3. Deploy Frontend (Vercel)
4. Test Everything

---

## Part 1: Deploy Database on Render (15 minutes)

### Step 1.1: Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with GitHub (recommended) or email
4. Verify your email

### Step 1.2: Create PostgreSQL Database

1. From Render Dashboard, click "New +"
2. Select "PostgreSQL"
3. Fill in the form:
   - **Name**: `tcflashcards-db` (or any name you like)
   - **Database**: `chinese_flashcards`
   - **User**: `postgres` (default)
   - **Region**: Choose closest to you
   - **PostgreSQL Version**: 15 or latest
   - **Plan Type**: **Free** (Important!)
4. Click "Create Database"
5. Wait 2-3 minutes for database to be created

### Step 1.3: Get Database Connection Details

After creation, you'll see these details (save them for later):

- **Internal Database URL**: `postgresql://postgres:...@dpg-...render.com/chinese_flashcards`
- **External Database URL**: `postgresql://postgres:...@dpg-...render.com/chinese_flashcards`
- **PSQL Command**: For connecting via command line

⚠️ **IMPORTANT**: Copy the **External Database URL** - you'll need it soon!

### Step 1.4: Initialize Database Tables

We need to run your database setup scripts. You have two options:

#### Option A: Using Render Shell (Easier)

1. In your database page on Render, click "Connect" → "External Connection"
2. Copy the PSQL command
3. Open your local terminal/command prompt
4. Install PostgreSQL tools if you haven't (see below)
5. Run the PSQL command to connect
6. Once connected, run your SQL commands manually

#### Option B: Using Your Backend Scripts (Recommended)

We'll do this after deploying the backend in Part 2.

---

## Part 2: Deploy Backend API on Render (20 minutes)

### Step 2.1: Prepare Your Backend Code

First, we need to create a build script for Render. In your local project:

1. Open `backend/package.json`
2. Add a build script (see the file update below)

### Step 2.2: Create Web Service on Render

1. From Render Dashboard, click "New +"
2. Select "Web Service"
3. Connect your GitHub repository:
   - Click "Connect GitHub" (if first time)
   - Authorize Render to access your repos
   - Select your `TCFlashcardsReact` repository

### Step 2.3: Configure Web Service

Fill in these settings:

- **Name**: `tcflashcards-backend`
- **Region**: Same as your database
- **Branch**: `master` (or `main`)
- **Root Directory**: `backend`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan Type**: **Free** (Important!)

### Step 2.4: Add Environment Variables

Scroll down to "Environment Variables" and add these:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `DATABASE_URL` | Paste your External Database URL from Step 1.3 |
| `FRONTEND_URL` | `https://your-app-name.vercel.app` (we'll update this later) |

⚠️ Leave `FRONTEND_URL` as a placeholder for now - we'll update it after deploying the frontend.

### Step 2.5: Deploy Backend

1. Click "Create Web Service"
2. Render will start building and deploying (takes 5-10 minutes)
3. Watch the logs - should see "Build successful" then "Deploy live"

### Step 2.6: Get Your Backend URL

Once deployed, you'll see:
- **URL**: `https://tcflashcards-backend-xxxx.onrender.com`

⚠️ **Save this URL** - you'll need it for the frontend!

### Step 2.7: Initialize Database Tables

Now we can set up your database:

1. Open a terminal in your local project
2. Create a temporary `.env` file with your database connection:

```bash
DATABASE_URL=your-external-database-url-here
```

3. Update `backend/scripts/init-db.js` to use DATABASE_URL
4. Run: `node backend/scripts/init-db.js`
5. Run: `node backend/scripts/seed-db.js`

Or use the SQL script directly on Render's database shell.

### Step 2.8: Test Backend

Visit: `https://your-backend-url.onrender.com/api/health`

You should see:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "environment": "production"
}
```

✅ If you see this, your backend is working!

⚠️ **Note**: Free tier on Render spins down after inactivity. First request may take 30-60 seconds.

---

## Part 3: Deploy Frontend on Vercel (15 minutes)

### Step 3.1: Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Sign up with GitHub (recommended)
4. Authorize Vercel

### Step 3.2: Import Project

1. From Vercel Dashboard, click "Add New..." → "Project"
2. Find your `TCFlashcardsReact` repository
3. Click "Import"

### Step 3.3: Configure Project

Vercel will auto-detect it's a Vite project. Configure:

- **Framework Preset**: Vite
- **Root Directory**: `TCFlashcardsReact`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3.4: Add Environment Variables

Click "Environment Variables" and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-backend-url.onrender.com/api` |

⚠️ Use your actual backend URL from Step 2.6!

### Step 3.5: Deploy Frontend

1. Click "Deploy"
2. Vercel will build and deploy (takes 2-5 minutes)
3. Watch the logs for "Build Completed"

### Step 3.6: Get Your Frontend URL

Once deployed, you'll see:
- **URL**: `https://your-app-name.vercel.app`

This is your live app! 🎉

### Step 3.7: Update Backend CORS

Now we need to tell the backend about the frontend URL:

1. Go back to Render Dashboard
2. Open your backend web service
3. Go to "Environment" tab
4. Edit `FRONTEND_URL` to your Vercel URL: `https://your-app-name.vercel.app`
5. Click "Save Changes"
6. Wait for backend to redeploy (automatic)

---

## Part 4: Testing Your Deployment (10 minutes)

### Test Backend API

1. Visit: `https://your-backend.onrender.com/api/health`
2. Should see: `{"status":"ok",...}`

3. Visit: `https://your-backend.onrender.com/api/flashcards`
4. Should see array of flashcards (if seeded)

### Test Frontend

1. Visit: `https://your-app.vercel.app`
2. App should load
3. Try selecting data (Book 1, Chapter 1)
4. Try running a drill
5. Check statistics

### Common Issues

#### Frontend can't connect to backend
- Check `VITE_API_URL` in Vercel environment variables
- Make sure it ends with `/api`
- Check backend `FRONTEND_URL` includes your Vercel domain

#### Backend shows CORS error
- Check `FRONTEND_URL` in Render matches your Vercel URL exactly
- No trailing slash
- Must include `https://`

#### Database connection error
- Check `DATABASE_URL` in Render backend environment
- Make sure database is running (check Render dashboard)

#### Backend is slow (first request)
- Normal on free tier! Render spins down after 15 minutes of inactivity
- First request wakes it up (takes 30-60 seconds)
- Subsequent requests are fast

---

## 🎉 You're Done!

Your app is now live on the internet! Share your Vercel URL with others.

### What's Next?

- Set up custom domain (optional, costs ~$12/year)
- Monitor usage in Render and Vercel dashboards
- Check logs when debugging issues

### Free Tier Limitations

**Render Free Tier:**
- Database: 90-day expiration (need to recreate)
- Web Service: Spins down after 15 min inactivity
- 750 hours/month

**Vercel Free Tier:**
- 100 GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS

### Getting Help

If you run into issues:

1. Check the logs:
   - Render: Click your service → "Logs" tab
   - Vercel: Click your project → "Deployments" → Click deployment → "View Function Logs"

2. Common fixes:
   - Redeploy: Sometimes just redeploying fixes issues
   - Check environment variables: Most issues are wrong URLs
   - Wait for Render: First request after inactivity is slow

---

## 📝 Quick Reference

After deployment, save these URLs:

```
Frontend: https://__________.vercel.app
Backend:  https://__________.onrender.com
Database: postgresql://__________.render.com
```

Environment Variables Summary:

**Vercel (Frontend):**
```
VITE_API_URL=https://your-backend.onrender.com/api
```

**Render Backend:**
```
NODE_ENV=production
PORT=3001
DATABASE_URL=postgresql://...
FRONTEND_URL=https://your-app.vercel.app
```

---

Good luck with your deployment! 🚀
