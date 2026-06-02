-- Additional tables for complete multi-user support

-- 1. User Sessions (for authentication)
CREATE TABLE IF NOT EXISTS user_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_session_token ON user_sessions(session_token);
CREATE INDEX idx_session_user ON user_sessions(user_id);

-- 2. User Study Sessions (track each study session)
CREATE TABLE IF NOT EXISTS study_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  drill_type VARCHAR(50) NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  total_cards INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0
);

CREATE INDEX idx_study_user ON study_sessions(user_id);
CREATE INDEX idx_study_date ON study_sessions(started_at);

-- 3. Drill Attempts (detailed per-attempt tracking)
CREATE TABLE IF NOT EXISTS drill_attempts (
  id SERIAL PRIMARY KEY,
  study_session_id INTEGER REFERENCES study_sessions(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  flashcard_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
  drill_type VARCHAR(50) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken_ms INTEGER,
  user_answer TEXT,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attempt_user ON drill_attempts(user_id);
CREATE INDEX idx_attempt_card ON drill_attempts(flashcard_id);
CREATE INDEX idx_attempt_session ON drill_attempts(study_session_id);

-- 4. User Preferences (save user settings)
CREATE TABLE IF NOT EXISTS user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  preferred_drill_types TEXT[], -- Array of drill types they prefer
  daily_goal INTEGER DEFAULT 20, -- Cards per day goal
  difficulty_preference VARCHAR(20) DEFAULT 'mixed',
  show_stroke_order BOOLEAN DEFAULT true,
  auto_play_audio BOOLEAN DEFAULT false,
  theme VARCHAR(20) DEFAULT 'light',
  preferences JSONB DEFAULT '{}', -- For any additional custom preferences
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. User Achievements/Badges (gamification)
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  criteria JSONB, -- Conditions to unlock
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

-- 6. User Study Streaks (detailed streak tracking)
CREATE TABLE IF NOT EXISTS user_streaks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  total_study_days INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. User Custom Decks/Collections (let users create custom study sets)
CREATE TABLE IF NOT EXISTS user_decks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_deck_cards (
  id SERIAL PRIMARY KEY,
  deck_id INTEGER REFERENCES user_decks(id) ON DELETE CASCADE,
  flashcard_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
  order_num INTEGER DEFAULT 0,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(deck_id, flashcard_id)
);

-- 8. User Notes (let users add personal notes to cards)
CREATE TABLE IF NOT EXISTS user_card_notes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  flashcard_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, flashcard_id)
);

-- 9. User Reviews/SRS (Spaced Repetition System)
CREATE TABLE IF NOT EXISTS user_card_reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  flashcard_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
  ease_factor DECIMAL(3,2) DEFAULT 2.50, -- SRS ease factor
  interval_days INTEGER DEFAULT 1, -- Days until next review
  next_review_date DATE NOT NULL,
  review_count INTEGER DEFAULT 0,
  last_reviewed TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, flashcard_id)
);

CREATE INDEX idx_review_next_date ON user_card_reviews(user_id, next_review_date);

-- Insert some sample achievements
INSERT INTO achievements (name, description, icon, criteria) VALUES
  ('First Step', 'Complete your first drill', '🎯', '{"drill_attempts": 1}'),
  ('Practice Makes Perfect', 'Complete 100 drill attempts', '💯', '{"drill_attempts": 100}'),
  ('Week Warrior', 'Maintain a 7-day streak', '🔥', '{"streak_days": 7}'),
  ('Month Master', 'Maintain a 30-day streak', '⭐', '{"streak_days": 30}'),
  ('Perfectionist', 'Get 50 correct answers in a row', '✨', '{"consecutive_correct": 50}'),
  ('Night Owl', 'Study between midnight and 4 AM', '🦉', '{"study_time": "night"}'),
  ('Early Bird', 'Study between 5 AM and 7 AM', '🐦', '{"study_time": "morning"}')
ON CONFLICT (name) DO NOTHING;
