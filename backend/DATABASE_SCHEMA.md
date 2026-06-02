# Multi-User Database Schema

## Overview
This document describes the complete database schema for multi-user support in the TC Flashcards application.

## Core Tables

### 1. **users**
Stores basic user account information.

```sql
- id (PRIMARY KEY)
- username (UNIQUE) - User's login name
- email (UNIQUE) - User's email address
- password_hash - Hashed password (use bcrypt)
- display_name - Optional display name
- is_active - Account status
- created_at - Registration date
- last_login - Last login timestamp
```

**Purpose**: Core user authentication and identification.

---

### 2. **flashcards**
Your existing flashcard content (unchanged).

```sql
- id (PRIMARY KEY)
- hanzi - Chinese characters
- pinyin - Romanization
- english - English translation
- book - Source book
- chapter - Chapter number
- order_num - Order in chapter
- created_at, updated_at
```

---

## Authentication & Sessions

### 3. **user_sessions**
Manages user login sessions (for authentication tokens).

```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY -> users)
- session_token (UNIQUE) - JWT or random token
- expires_at - When session expires
- created_at - Session start time
- last_active - Last activity timestamp
```

**Purpose**: Track active user sessions, enable logout, handle session expiration.

**Use case**: When user logs in, create a session. Check token on each API request.

---

## Progress Tracking

### 4. **user_progress**
Tracks overall progress per flashcard per user.

```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY -> users)
- flashcard_id (FOREIGN KEY -> flashcards)
- correct_count - Times answered correctly
- total_attempts - Total times attempted
- last_attempt - Last attempt timestamp
- mastery_level - 'new', 'learning', 'familiar', 'mastered'
- UNIQUE(user_id, flashcard_id)
```

**Purpose**: Long-term card mastery tracking.

**Use case**: Show which cards a user has mastered, needs review, etc.

---

### 5. **study_sessions**
Records each study session a user starts.

```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY -> users)
- drill_type - 'hanziToPinyin', 'pinyinToEnglish', etc.
- started_at - Session start time
- ended_at - Session end time (NULL while active)
- total_cards - Cards studied in session
- correct_count - Correct answers in session
- total_time_seconds - Total time spent
```

**Purpose**: Track individual study sessions for analytics.

**Use case**: Show "Today you studied for 45 minutes across 3 sessions"

---

### 6. **drill_attempts**
Records every single card attempt in detail.

```sql
- id (PRIMARY KEY)
- study_session_id (FOREIGN KEY -> study_sessions)
- user_id (FOREIGN KEY -> users)
- flashcard_id (FOREIGN KEY -> flashcards)
- drill_type - Type of drill
- is_correct - TRUE/FALSE
- time_taken_ms - Milliseconds to answer
- user_answer - What they typed/selected
- attempted_at - Timestamp
```

**Purpose**: Granular data for analytics and improvement.

**Use case**: 
- "You often confuse 他 with 她"
- "Your pinyin recognition improved 25% this week"
- Graph of performance over time

---

## Statistics & Gamification

### 7. **user_stats**
Aggregated statistics per user.

```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY -> users) UNIQUE
- total_drills - Total drill attempts ever
- total_correct - Total correct answers
- total_time_seconds - Total study time
- stats (JSONB) - Flexible JSON for drill-specific stats
- created_at, updated_at
```

**Purpose**: Fast access to aggregate stats without complex queries.

**Example stats JSON**:
```json
{
  "drills": {
    "hanziToPinyin": { "attempts": 450, "correct": 390, "totalTime": 3600 },
    "pinyinToEnglish": { "attempts": 320, "correct": 285, "totalTime": 2400 }
  },
  "byBook": {
    "Book 1": { "mastered": 45, "learning": 23, "new": 12 }
  }
}
```

---

### 8. **user_streaks**
Tracks daily study streaks.

```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY -> users) UNIQUE
- current_streak - Days in a row currently
- longest_streak - Best streak ever
- last_study_date - Last date studied (DATE not TIMESTAMP)
- total_study_days - Total unique days studied
- created_at, updated_at
```

**Purpose**: Motivate daily practice with streak tracking.

**Use case**: "🔥 7 day streak! Keep it going!"

**Logic**: 
- If user studies today, increment current_streak
- If last_study_date was yesterday, continue streak
- If last_study_date was 2+ days ago, reset to 1
- Update longest_streak if current_streak > longest_streak

---

### 9. **achievements**
Defines available achievements/badges.

```sql
- id (PRIMARY KEY)
- name (UNIQUE) - Achievement name
- description - What it's for
- icon - Emoji or icon identifier
- criteria (JSONB) - Conditions to unlock
- created_at
```

**Example achievements**:
```json
{
  "name": "Week Warrior",
  "description": "Maintain a 7-day streak",
  "icon": "🔥",
  "criteria": {"streak_days": 7}
}
```

---

### 10. **user_achievements**
Tracks which users have unlocked which achievements.

```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY -> users)
- achievement_id (FOREIGN KEY -> achievements)
- unlocked_at - When they earned it
- UNIQUE(user_id, achievement_id)
```

**Purpose**: Award badges/achievements to users.

**Use case**: Display badges on profile, notifications when unlocked.

---

## User Customization

### 11. **user_preferences**
User settings and preferences.

```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY -> users) UNIQUE
- preferred_drill_types (TEXT[]) - Array of favorite drills
- daily_goal - Target cards per day
- difficulty_preference - 'easy', 'mixed', 'hard'
- show_stroke_order - Boolean
- auto_play_audio - Boolean
- theme - 'light', 'dark', 'auto'
- preferences (JSONB) - Additional custom settings
- created_at, updated_at
```

**Purpose**: Personalize user experience.

**Use case**: Remember user's favorite drills, theme choice, goals.

---

### 12. **user_decks**
Custom study decks created by users.

```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY -> users)
- name - Deck name
- description - Deck description
- is_public - Whether others can see it
- created_at, updated_at
```

**Purpose**: Let users create custom study sets.

**Use case**: "HSK 3 Vocab I Struggle With", "Foods and Restaurants"

---

### 13. **user_deck_cards**
Links flashcards to custom decks.

```sql
- id (PRIMARY KEY)
- deck_id (FOREIGN KEY -> user_decks)
- flashcard_id (FOREIGN KEY -> flashcards)
- order_num - Position in deck
- added_at
- UNIQUE(deck_id, flashcard_id)
```

**Purpose**: Define which cards are in each custom deck.

---

### 14. **user_card_notes**
Personal notes users add to cards.

```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY -> users)
- flashcard_id (FOREIGN KEY -> flashcards)
- note - User's note text
- created_at, updated_at
- UNIQUE(user_id, flashcard_id)
```

**Purpose**: Let users add mnemonic devices, personal reminders.

**Use case**: "Remember: 好 (good) = woman + child (mothers are good!)"

---

## Spaced Repetition System (SRS)

### 15. **user_card_reviews**
Implements spaced repetition algorithm (like Anki).

```sql
- id (PRIMARY KEY)
- user_id (FOREIGN KEY -> users)
- flashcard_id (FOREIGN KEY -> flashcards)
- ease_factor - Card difficulty (2.5 default, 1.3-4.0 range)
- interval_days - Days until next review
- next_review_date - When to review next
- review_count - Times reviewed
- last_reviewed
- created_at, updated_at
- UNIQUE(user_id, flashcard_id)
```

**Purpose**: Optimize review timing based on memory science.

**Algorithm** (simplified SM-2):
```
If correct:
  - interval = interval × ease_factor
  - ease_factor += 0.1
  
If incorrect:
  - interval = 1 (review tomorrow)
  - ease_factor -= 0.2
  
next_review_date = today + interval_days
```

**Use case**: "You have 23 cards due for review today"

---

## Relationships Diagram

```
users (1) ──< (many) user_sessions
users (1) ──< (many) user_progress ──> (1) flashcards
users (1) ──< (many) study_sessions ──< (many) drill_attempts ──> (1) flashcards
users (1) ──── (1) user_stats
users (1) ──── (1) user_preferences
users (1) ──< (many) user_achievements ──> (many) achievements
users (1) ──── (1) user_streaks
users (1) ──< (many) user_decks ──< (many) user_deck_cards ──> (many) flashcards
users (1) ──< (many) user_card_notes ──> (many) flashcards
users (1) ──< (many) user_card_reviews ──> (many) flashcards
```

---

## Implementation Priority

### Phase 1 (Essential for Multi-User):
1. ✅ **users** - User accounts
2. ✅ **user_sessions** - Authentication
3. ✅ **user_progress** - Card mastery
4. ✅ **study_sessions** - Session tracking
5. ✅ **drill_attempts** - Detailed attempts
6. ✅ **user_stats** - Aggregate stats

### Phase 2 (Enhanced Experience):
7. **user_preferences** - User settings
8. **user_streaks** - Streak tracking
9. **achievements** + **user_achievements** - Gamification

### Phase 3 (Advanced Features):
10. **user_decks** + **user_deck_cards** - Custom decks
11. **user_card_notes** - Personal notes
12. **user_card_reviews** - SRS algorithm

---

## Key Workflows

### User Registration
```sql
1. INSERT INTO users (username, email, password_hash)
2. INSERT INTO user_preferences (user_id) -- defaults
3. INSERT INTO user_stats (user_id) -- initialize to 0
4. INSERT INTO user_streaks (user_id) -- initialize
```

### User Login
```sql
1. SELECT * FROM users WHERE username = ?
2. Verify password
3. INSERT INTO user_sessions (user_id, session_token, expires_at)
4. UPDATE users SET last_login = NOW()
5. Return session_token to client
```

### Starting a Study Session
```sql
1. INSERT INTO study_sessions (user_id, drill_type, started_at)
2. Return session_id
```

### Recording a Drill Attempt
```sql
1. INSERT INTO drill_attempts (study_session_id, user_id, flashcard_id, ...)
2. UPSERT user_progress (increment counts, update last_attempt)
3. Check for achievements (trigger checks)
4. Update user_streaks if first study today
```

### Ending a Study Session
```sql
1. UPDATE study_sessions SET ended_at = NOW(), total_cards = ?, correct_count = ?
2. UPDATE user_stats (aggregate totals)
```

---

## API Endpoints to Implement

### Authentication
- `POST /api/auth/register` - Create user
- `POST /api/auth/login` - Login, get token
- `POST /api/auth/logout` - End session
- `GET /api/auth/me` - Get current user

### User Data
- `GET /api/users/:id/profile` - User profile
- `GET /api/users/:id/stats` - User statistics
- `GET /api/users/:id/progress` - Card progress
- `GET /api/users/:id/achievements` - Unlocked achievements

### Study Sessions
- `POST /api/sessions/start` - Start session
- `POST /api/sessions/:id/attempt` - Record attempt
- `POST /api/sessions/:id/end` - End session
- `GET /api/sessions/:id` - Get session details

### Preferences
- `GET /api/users/:id/preferences`
- `PUT /api/users/:id/preferences`

### Custom Decks
- `GET /api/users/:id/decks` - List decks
- `POST /api/users/:id/decks` - Create deck
- `PUT /api/decks/:id` - Update deck
- `DELETE /api/decks/:id` - Delete deck
- `POST /api/decks/:id/cards` - Add card to deck

### SRS Reviews
- `GET /api/users/:id/reviews/due` - Cards due today
- `POST /api/reviews/:id/submit` - Submit review result

---

## Supabase Integration

When deploying to Supabase:

1. **Use Supabase Auth** instead of custom `user_sessions` table
   - Supabase handles auth tokens automatically
   - Use `auth.users` table (built-in)
   - Reference via `user_id UUID`

2. **Row Level Security (RLS)**
   ```sql
   -- Example: Users can only see their own progress
   ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view own progress" ON user_progress
     FOR SELECT USING (auth.uid() = user_id);
   ```

3. **Realtime Subscriptions**
   - Enable realtime on `user_stats` to see live updates
   - Subscribe to `study_sessions` for live study tracking

4. **Storage** (optional)
   - Store user avatars in Supabase Storage
   - Store audio pronunciations

---

## Performance Considerations

### Indexes Already Created
- `flashcards(book, chapter)`
- `user_sessions(session_token)`
- `study_sessions(user_id, started_at)`
- `drill_attempts(user_id, flashcard_id, study_session_id)`
- `user_card_reviews(user_id, next_review_date)`

### Query Optimization
- Use `user_stats` for aggregates (don't COUNT(*) drill_attempts every time)
- Denormalize data when needed
- Cache frequently accessed data
- Use database functions for complex calculations

### Maintenance
- Clean up expired sessions regularly
- Archive old drill_attempts after 6 months
- Backup user data regularly

---

## Security Notes

1. **Passwords**: Always use bcrypt (10+ rounds)
2. **Tokens**: Use secure random tokens or JWT
3. **RLS**: Enable on all user-related tables
4. **Validation**: Validate all user input
5. **Rate Limiting**: Prevent abuse on API endpoints
6. **CORS**: Configure properly for frontend

---

## Migration from Single-User

If you have existing data:

```sql
-- Create a default user for existing data
INSERT INTO users (username, email, password_hash) 
VALUES ('demo', 'demo@example.com', 'hashed_password')
RETURNING id;

-- Migrate existing stats to that user
INSERT INTO user_stats (user_id, stats)
SELECT 1, stats FROM old_stats_table;
```

---

## Next Steps

1. Run `backend/scripts/init-db-multiuser.js` to create all tables
2. Implement authentication (or use Supabase Auth)
3. Update API routes to require authentication
4. Update frontend to handle user sessions
5. Migrate existing frontend to call authenticated endpoints
6. Add user registration/login UI
7. Test with multiple users
8. Deploy to Supabase!
