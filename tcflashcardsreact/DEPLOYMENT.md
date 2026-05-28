# Deployment Guide

## Deploy to GitHub Pages

1. Install the GitHub Pages package:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   {
     "homepage": "https://yourusername.github.io/yourrepo",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. Create `vite.config.js` in the root (if not exists):
   ```javascript
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   
   export default defineConfig({
     plugins: [react()],
     base: '/yourrepo/'
   })
   ```

4. Deploy:
   ```bash
   npm run deploy
   ```

## Deploy to Netlify

1. Push your code to GitHub

2. Go to [netlify.com](https://netlify.com) and sign in

3. Click "Add new site" → "Import an existing project"

4. Choose your repository

5. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

6. Click "Deploy site"

## Deploy to Vercel

1. Push your code to GitHub

2. Go to [vercel.com](https://vercel.com) and sign in

3. Click "Import Project"

4. Choose your repository

5. Vercel will auto-detect Vite settings

6. Click "Deploy"

## Local Testing of Production Build

```bash
npm run build
npm run preview
```

This will build and serve the production version locally for testing.
