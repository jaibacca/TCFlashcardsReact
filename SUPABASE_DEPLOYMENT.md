# Supabase Deployment Guide

## Step-by-Step Deployment to Supabase

### 1. Set Up Supabase Database

#### Option A: Using Supabase SQL Editor (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Create a new query
4. Copy the contents of `backend/scripts/init-db-multiuser.js` and convert to pure SQL, OR:
5. Run the SQL from `backend/scripts/add-multiuser-tables.sql`

#### Option B: Using Node.js Script

1. Get your Supabase connection string:
   - Go to **Settings → Database**
   - Copy the connection string (Nodejs format)
   - It looks like: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

2. Update `backend/.env`:
   ```env
   DATABASE_URL=your_supabase_connection_string
   ```

3. Run the initialization script:
   ```bash
   cd backend
   node scripts/init-db-multiuser.js
   ```

4. Run the seed script (optional):
   ```bash
   node scripts/seed-db.js
   ```

---

### 2. Choose Deployment Architecture

#### Architecture A: Frontend Only (Recommended for Supabase)

**Use Supabase directly from React frontend:**

```
React App (Vercel/Netlify)
    ↓
Supabase (Database + Auth + APIs)
```

**Pros:**
- No backend server needed
- Supabase handles auth automatically
- Built-in real-time updates
- Serverless (no server costs)
- Easier to deploy

**Cons:**
- Need to rewrite Express routes
- Less control over business logic

#### Architecture B: Full Stack (Keep Express Backend)

**Keep your Express backend:**

```
React App (Vercel) → Express API (Railway/Render) → Supabase (Database only)
```

**Pros:**
- Keep existing backend code
- More control over APIs
- Can add complex logic

**Cons:**
- More expensive (need to host Express)
- More deployment steps

---

### 3. Implementation: Architecture A (Supabase Direct)

This is recommended and simpler!

#### Step 3.1: Install Supabase Client

```bash
cd TCFlashcardsReact
npm install @supabase/supabase-js
```

#### Step 3.2: Create Supabase Config

Create `TCFlashcardsReact/src/config/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### Step 3.3: Update Environment Variables

Create `TCFlashcardsReact/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these from: **Supabase Dashboard → Settings → API**

#### Step 3.4: Enable Supabase Auth

In Supabase Dashboard:
1. Go to **Authentication → Settings**
2. Enable **Email** provider
3. Configure email templates (optional)

#### Step 3.5: Set Up Row Level Security (RLS)

In Supabase SQL Editor, run:

```sql
-- Enable RLS on all user tables
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE drill_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_card_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_card_reviews ENABLE ROW LEVEL SECURITY;

-- Flashcards are public (everyone can read)
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Flashcards are viewable by everyone" ON flashcards
  FOR SELECT USING (true);

-- Users can only access their own data
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Repeat for other tables...
CREATE POLICY "Users can view own sessions" ON study_sessions
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can insert own sessions" ON study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- etc. (repeat pattern for each user-specific table)
```

#### Step 3.6: Update API Service

Replace `TCFlashcardsReact/src/services/api.js` with Supabase calls:

```javascript
import { supabase } from '../config/supabase';

// Example: Get flashcards
export const getFlashcards = async (book, chapter) => {
  let query = supabase
    .from('flashcards')
    .select('*');
    
  if (book) query = query.eq('book', book);
  if (chapter) query = query.eq('chapter', chapter);
  
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// Example: Record drill attempt
export const recordAttempt = async (attemptData) => {
  const { data, error } = await supabase
    .from('drill_attempts')
    .insert([{
      user_id: (await supabase.auth.getUser()).data.user.id,
      ...attemptData
    }]);
    
  if (error) throw error;
  return data;
};

// Authentication
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};
```

#### Step 3.7: Add Auth Components

Create `TCFlashcardsReact/src/components/Auth.jsx`:

```jsx
import { useState } from 'react';
import { signIn, signUp } from '../services/api';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const { data, error } = isSignUp 
      ? await signUp(email, password)
      : await signIn(email, password);
      
    if (error) {
      alert(error.message);
    } else {
      // Redirect to app
      window.location.href = '/';
    }
  };

  return (
    <div className="auth-container">
      <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>
      <button onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
      </button>
    </div>
  );
}
```

#### Step 3.8: Protect Routes

Update `TCFlashcardsReact/src/App.jsx`:

```jsx
import { useEffect, useState } from 'react';
import { supabase } from './config/supabase';
import Auth from './components/Auth';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="App">
      {/* Your existing app */}
      <button onClick={() => supabase.auth.signOut()}>
        Sign Out
      </button>
      {/* Rest of your app */}
    </div>
  );
}

export default App;
```

#### Step 3.9: Deploy Frontend to Vercel

1. **Push to GitHub** (you already did this!)

2. **Go to [Vercel](https://vercel.com)**

3. **Import your GitHub repository**

4. **Configure build settings:**
   - Build Command: `cd TCFlashcardsReact && npm install && npm run build`
   - Output Directory: `TCFlashcardsReact/dist`
   - Install Command: `npm install`

5. **Add environment variables:**
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

6. **Deploy!**

---

### 4. Implementation: Architecture B (Keep Express Backend)

If you want to keep your Express backend:

#### Step 4.1: Update Backend Connection

Update `backend/.env`:
```env
DATABASE_URL=your_supabase_connection_string
PORT=3000
```

#### Step 4.2: Deploy Backend to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign in with GitHub
3. **New Project → Deploy from GitHub repo**
4. Select your repo
5. **Settings:**
   - Root Directory: `backend`
   - Start Command: `npm start`
6. **Add environment variables:**
   - `DATABASE_URL` (your Supabase connection string)
   - `PORT` (3000)
7. Railway will give you a URL like: `https://your-app.up.railway.app`

#### Step 4.3: Update Frontend API URL

Update `TCFlashcardsReact/.env`:
```env
VITE_API_URL=https://your-app.up.railway.app
```

Update `TCFlashcardsReact/src/services/api.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

#### Step 4.4: Deploy Frontend to Vercel

Same as Architecture A, step 3.9

---

### 5. Alternative: Deploy Both on Vercel

You can also deploy the Express backend as Vercel Serverless Functions:

1. Create `vercel.json` in root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "TCFlashcardsReact/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "TCFlashcardsReact/dist/$1"
    }
  ]
}
```

2. Update `backend/server.js` to export for serverless:

```javascript
// At the end of server.js
module.exports = app;
```

3. Deploy to Vercel!

---

### 6. Testing Your Deployment

1. **Test Database:**
   ```sql
   SELECT COUNT(*) FROM flashcards;
   SELECT * FROM users LIMIT 5;
   ```

2. **Test API:**
   ```bash
   curl https://your-api-url.com/api/flashcards
   ```

3. **Test Authentication:**
   - Try signing up
   - Try signing in
   - Check that data is user-specific

---

### 7. Post-Deployment Checklist

- [ ] Database initialized with all tables
- [ ] Flashcards seeded
- [ ] RLS policies enabled
- [ ] Frontend deployed
- [ ] Backend deployed (if using)
- [ ] Environment variables set
- [ ] Authentication working
- [ ] User can sign up/in
- [ ] User data is isolated
- [ ] CORS configured
- [ ] Custom domain connected (optional)

---

## Recommended: Architecture A

For simplicity, I recommend **Architecture A** (Supabase Direct):
- No backend hosting needed
- Supabase Auth is battle-tested
- Easier to maintain
- Cheaper (Supabase free tier is generous)
- Real-time updates built-in

You can always add a backend later if needed!

---

## Need Help?

1. **Supabase Docs**: https://supabase.com/docs
2. **Vercel Docs**: https://vercel.com/docs
3. **Railway Docs**: https://docs.railway.app

Your database schema is solid! The tables are ready for multi-user support. Choose your deployment path and let's make it happen! 🚀
