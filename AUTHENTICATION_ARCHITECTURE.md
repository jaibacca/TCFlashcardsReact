# 🏗️ Authentication & Sync Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER DEVICES                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐    │
│  │   Laptop     │      │    Phone     │      │   Tablet     │    │
│  │              │      │              │      │              │    │
│  │  localStorage│      │ localStorage │      │ localStorage │    │
│  │   (cache)    │      │   (cache)    │      │   (cache)    │    │
│  └──────┬───────┘      └──────┬───────┘      └──────┬───────┘    │
│         │                     │                     │             │
│         └─────────────────────┼─────────────────────┘             │
│                               │                                   │
└───────────────────────────────┼───────────────────────────────────┘
                                │
                                │ HTTPS / JWT
                                │
┌───────────────────────────────▼───────────────────────────────────┐
│                         SUPABASE CLOUD                            │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────┐      ┌─────────────────────┐           │
│  │   Supabase Auth     │      │   PostgreSQL DB     │           │
│  │                     │      │                     │           │
│  │ - Magic Links       │      │ ┌─────────────────┐ │           │
│  │ - JWT Tokens        │◄────►│ │  flashcards     │ │           │
│  │ - Session Mgmt      │      │ └─────────────────┘ │           │
│  └─────────────────────┘      │ ┌─────────────────┐ │           │
│                               │ │ user_progress   │ │           │
│                               │ │  (stats_data)   │ │           │
│                               │ └─────────────────┘ │           │
│                               └─────────────────────┘           │
└───────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────┐                                                    ┌──────────┐
│ User │                                                    │ Supabase │
└───┬──┘                                                    └────┬─────┘
    │                                                            │
    │ 1. Enter email                                            │
    ├──────────────────────────────────────────────────────────►│
    │                                                            │
    │                                     2. Generate magic link│
    │                                        Send email         │
    │◄───────────────────────────────────────────────────────────┤
    │                                                            │
    │ 3. Click link in email                                    │
    ├──────────────────────────────────────────────────────────►│
    │                                                            │
    │                                        4. Create JWT token│
    │                                           Set session     │
    │◄───────────────────────────────────────────────────────────┤
    │                                                            │
    │ 5. Authenticated! ✅                                       │
    │                                                            │
```

## Progress Sync Flow

### On Login (First Time)

```
┌─────────┐           ┌──────────────┐           ┌──────────┐
│ Device  │           │ Sync Service │           │ Supabase │
└────┬────┘           └──────┬───────┘           └────┬─────┘
     │                       │                        │
     │ Login event           │                        │
     ├──────────────────────►│                        │
     │                       │                        │
     │                       │ Load local progress    │
     │                       │ (localStorage)         │
     │                       │                        │
     │                       │ Fetch cloud progress   │
     │                       ├───────────────────────►│
     │                       │                        │
     │                       │       Cloud stats      │
     │                       │◄───────────────────────┤
     │                       │                        │
     │                       │ Merge intelligently    │
     │                       │ (keep best from both)  │
     │                       │                        │
     │                       │ Save to localStorage   │
     │                       │                        │
     │                       │ Save to Supabase       │
     │                       ├───────────────────────►│
     │                       │                        │
     │   Updated stats       │         Saved! ✅      │
     │◄──────────────────────┤◄───────────────────────┤
     │                       │                        │
```

### While Signed In (Auto-Save)

```
┌─────────┐           ┌──────────────┐           ┌──────────┐
│ Device  │           │ Statistics   │           │ Supabase │
└────┬────┘           └──────┬───────┘           └────┬─────┘
     │                       │                        │
     │ User completes drill  │                        │
     ├──────────────────────►│                        │
     │                       │                        │
     │                       │ Update stats           │
     │                       │ Save to localStorage   │
     │                       │                        │
     │                       │ Auto-save to cloud     │
     │                       ├───────────────────────►│
     │                       │                        │
     │                       │         Saved! ✅      │
     │                       │◄───────────────────────┤
     │                       │                        │
```

### On Another Device

```
┌──────────┐         ┌──────────────┐         ┌──────────┐
│ Device 2 │         │ Sync Service │         │ Supabase │
└────┬─────┘         └──────┬───────┘         └────┬─────┘
     │                      │                      │
     │ Login with same email│                      │
     ├─────────────────────►│                      │
     │                      │                      │
     │                      │ Fetch cloud progress │
     │                      ├─────────────────────►│
     │                      │                      │
     │                      │   All your progress! │
     │                      │◄─────────────────────┤
     │                      │                      │
     │                      │ Merge with local     │
     │                      │ (if any)             │
     │                      │                      │
     │   Synced stats! 🎉   │                      │
     │◄─────────────────────┤                      │
     │                      │                      │
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Components                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌────────┐    ┌────────────┐    ┌─────────────────────┐  │
│  │  App   │───►│ Statistics │───►│ Drill Components    │  │
│  └───┬────┘    └─────┬──────┘    └─────────────────────┘  │
│      │               │                                     │
│      │               │ useAuth()                           │
│      │               ├──────────────┐                      │
│      │               │              │                      │
└──────┼───────────────┼──────────────┼──────────────────────┘
       │               │              │
       │               ▼              │
       │    ┌──────────────────┐     │
       │    │   AuthContext    │     │
       │    │                  │     │
       │    │ - user state     │     │
       │    │ - signIn()       │     │
       │    │ - signOut()      │     │
       │    └────────┬─────────┘     │
       │             │                │
       ▼             ▼                ▼
┌──────────────────────────────────────────────────┐
│              Services Layer                      │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌─────────────────┐      ┌──────────────────┐ │
│  │  progressSync   │      │  flashcardsApi   │ │
│  │                 │      │                  │ │
│  │ - syncOnLogin() │      │ - getAll()       │ │
│  │ - saveToCloud() │      │ - create()       │ │
│  │ - loadFromCloud()      │ - update()       │ │
│  │ - mergeProgress()      │ - delete()       │ │
│  └────────┬────────┘      └────────┬─────────┘ │
│           │                        │           │
└───────────┼────────────────────────┼───────────┘
            │                        │
            ▼                        ▼
┌──────────────────────────────────────────────────┐
│            Supabase Client                       │
├──────────────────────────────────────────────────┤
│  @supabase/supabase-js                           │
│                                                  │
│  - supabase.auth.signInWithOtp()                 │
│  - supabase.auth.signOut()                       │
│  - supabase.from('flashcards').select()          │
│  - supabase.from('user_progress').upsert()       │
└────────────────────┬─────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────┐
│              Supabase Cloud                      │
├──────────────────────────────────────────────────┤
│  - PostgreSQL Database                           │
│  - Authentication Service                        │
│  - Row Level Security                            │
│  - Email Service                                 │
└──────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Security Layers                      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Layer 1: HTTPS Encryption                              │
│  ├─ All traffic encrypted in transit                   │
│  └─ TLS 1.3                                             │
│                                                         │
│  Layer 2: JWT Authentication                            │
│  ├─ Signed tokens from Supabase                        │
│  ├─ Automatic expiration                               │
│  └─ Secure session management                          │
│                                                         │
│  Layer 3: Row Level Security (RLS)                      │
│  ├─ Users can only access their own data               │
│  ├─ Enforced at database level                         │
│  └─ SQL policies:                                       │
│      • SELECT: WHERE auth.uid() = user_id              │
│      • INSERT: CHECK auth.uid() = user_id              │
│      • UPDATE: WHERE auth.uid() = user_id              │
│      • DELETE: WHERE auth.uid() = user_id              │
│                                                         │
│  Layer 4: Magic Links                                   │
│  ├─ No passwords to steal or leak                      │
│  ├─ One-time use tokens                                │
│  └─ Time-limited expiration                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Data Merge Strategy

When syncing progress from multiple sources:

```
Local Stats:                Cloud Stats:
- Attempts: 50             - Attempts: 30
- Correct: 40              - Correct: 25
- Streak: 5                - Streak: 10

        ↓ Merge Logic ↓

Merged Stats:
- Attempts: 50  ← Keep HIGHER
- Correct: 40   ← Keep HIGHER
- Streak: 10    ← Keep HIGHER

Result: Best progress from all sources! ✅
```

### Merge Rules

```javascript
merged = {
  drills: {
    hanziToPinyin: {
      attempts: Math.max(local.attempts, cloud.attempts),
      correct: Math.max(local.correct, cloud.correct),
      totalTime: Math.max(local.totalTime, cloud.totalTime)
    },
    // ... same for other drill types
  },
  cardHistory: {
    // Keep all cards from both sources
    // Use Math.max() for each card's stats
  },
  streaks: {
    current: Math.max(local.current, cloud.current),
    longest: Math.max(local.longest, cloud.longest),
    lastStudyDate: latest(local.date, cloud.date)
  }
}
```

## Component Hierarchy

```
App (AuthProvider wrapper in main.jsx)
│
├─ Header
│  ├─ Title
│  └─ Navigation
│
├─ Auth Component 🆕
│  ├─ Sign In Form (when not authenticated)
│  │  ├─ Email Input
│  │  ├─ Send Magic Link Button
│  │  └─ Status Messages
│  │
│  └─ User Info (when authenticated)
│     ├─ User Email Display
│     └─ Sign Out Button
│
├─ Statistics (with sync) 🔄
│  ├─ useAuth() hook
│  ├─ Progress display
│  ├─ Auto-sync on login
│  └─ Auto-save when signed in
│
├─ Data Selector
│  ├─ Book selector
│  └─ Chapter selector
│
├─ Drill Selection
│  └─ 4 drill types
│
└─ Active Drill Component
   └─ Flashcard interface
```

## Environment Variables

```
.env (Local Development)
├─ VITE_SUPABASE_URL=https://xxx.supabase.co
└─ VITE_SUPABASE_ANON_KEY=eyJ...

Vercel (Production)
├─ VITE_SUPABASE_URL
└─ VITE_SUPABASE_ANON_KEY

Supabase (Backend)
├─ JWT_SECRET (auto-managed)
├─ DATABASE_URL (auto-managed)
└─ SMTP_CONFIG (for emails)
```

## Database Schema

```sql
-- Supabase manages auth.users automatically
-- We only create user_progress table:

CREATE TABLE user_progress (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),  ← Links to Supabase auth
  stats_data JSONB,                        ← All progress as JSON
  last_synced TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id)                          ← One row per user
);

-- Example stats_data JSONB:
{
  "drills": { ... },
  "cardHistory": { ... },
  "streaks": { ... },
  "totalCards": 500
}
```

---

## Summary

This architecture provides:
- ✅ Secure passwordless authentication
- ✅ Cross-device progress synchronization
- ✅ Offline-first with cloud backup
- ✅ Smart merge strategy (no data loss)
- ✅ Row Level Security for privacy
- ✅ Scalable serverless infrastructure
- ✅ Simple deployment (Vercel + Supabase)

**Users can now learn Chinese anywhere, with progress that follows them!** 🎓✨
