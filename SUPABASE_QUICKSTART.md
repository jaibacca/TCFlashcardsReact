# 🚀 Quick Start: Supabase Connection

## Right Now - In Supabase Dashboard

You're looking at the "Connect" dialog with 4 options:

### ✅ Click: "Framework" or "Direct" → "JavaScript"

You'll see this:

```javascript
const supabaseUrl = 'https://xxxxxxxxxxxxx.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

## Copy These Two Values! 📋

1. **Supabase URL**: `https://xxxxxxxxxxxxx.supabase.co`
2. **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (very long string)

---

## Paste Them Here:

Open: `TCFlashcardsReact/.env`

Replace the placeholders:

```env
VITE_SUPABASE_URL=paste_your_url_here
VITE_SUPABASE_ANON_KEY=paste_your_key_here
```

**Example** (don't use these, use YOUR values):
```env
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDE1NTc2MDAwfQ.abc123xyz...
```

---

## Next Steps (In Order):

1. ✅ **Paste your credentials** into `.env` file
2. **Create tables** - Run SQL script in Supabase SQL Editor
3. **Import flashcards** - Upload your CSV data
4. **Enable security** - Set up Row Level Security
5. **Install package** - `npm install @supabase/supabase-js`
6. **Update React code** - Replace Express API calls with Supabase

---

## Full Guide Available:

See `SUPABASE_SETUP_STEPBYSTEP.md` for complete instructions!

---

## Quick Commands:

```bash
# Install Supabase client
cd TCFlashcardsReact
npm install @supabase/supabase-js

# Create database tables
cd backend
node scripts/init-db-multiuser.js

# Import flashcards
node scripts/seed-db.js
```

---

## Need Help?

After you paste your credentials, tell me and I'll help with the next step! 🎉
