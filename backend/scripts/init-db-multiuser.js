const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

async function initializeDatabaseMultiUser() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Initializing multi-user database...');
    
    // Create flashcards table
    await client.query(`
      CREATE TABLE IF NOT EXISTS flashcards (
        id SERIAL PRIMARY KEY,
        hanzi VARCHAR(50) NOT NULL,
        pinyin VARCHAR(100) NOT NULL,
        english VARCHAR(200) NOT NULL,
        book VARCHAR(100),
        chapter VARCHAR(50),
        order_num INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Flashcards table created');
    
    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_book_chapter 
      ON flashcards(book, chapter);
    `);
    console.log('✅ Flashcard indexes created');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(100),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `);
    console.log('✅ Users table created');
    
    // Create user sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        session_token VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_session_token ON user_sessions(session_token);
      CREATE INDEX IF NOT EXISTS idx_session_user ON user_sessions(user_id);
    `);
    console.log('✅ User sessions table created');
    
    // Create user_progress table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        flashcard_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
        correct_count INTEGER DEFAULT 0,
        total_attempts INTEGER DEFAULT 0,
        last_attempt TIMESTAMP,
        mastery_level VARCHAR(20) DEFAULT 'new',
        UNIQUE(user_id, flashcard_id)
      );
    `);
    console.log('✅ User progress table created');
    
    // Create study sessions table
    await client.query(`
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
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_study_user ON study_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_study_date ON study_sessions(started_at);
    `);
    console.log('✅ Study sessions table created');
    
    // Create drill attempts table
    await client.query(`
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
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_attempt_user ON drill_attempts(user_id);
      CREATE INDEX IF NOT EXISTS idx_attempt_card ON drill_attempts(flashcard_id);
      CREATE INDEX IF NOT EXISTS idx_attempt_session ON drill_attempts(study_session_id);
    `);
    console.log('✅ Drill attempts table created');
    
    // Create user stats table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        total_drills INTEGER DEFAULT 0,
        total_correct INTEGER DEFAULT 0,
        total_time_seconds INTEGER DEFAULT 0,
        stats JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ User stats table created');
    
    // Create user preferences table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        preferred_drill_types TEXT[],
        daily_goal INTEGER DEFAULT 20,
        difficulty_preference VARCHAR(20) DEFAULT 'mixed',
        show_stroke_order BOOLEAN DEFAULT true,
        auto_play_audio BOOLEAN DEFAULT false,
        theme VARCHAR(20) DEFAULT 'light',
        preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ User preferences table created');
    
    // Create achievements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS achievements (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        icon VARCHAR(50),
        criteria JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Achievements table created');
    
    // Create user achievements table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, achievement_id)
      );
    `);
    console.log('✅ User achievements table created');
    
    // Create user streaks table
    await client.query(`
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
    `);
    console.log('✅ User streaks table created');
    
    // Create user decks table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_decks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ User decks table created');
    
    // Create user deck cards table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_deck_cards (
        id SERIAL PRIMARY KEY,
        deck_id INTEGER REFERENCES user_decks(id) ON DELETE CASCADE,
        flashcard_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
        order_num INTEGER DEFAULT 0,
        added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(deck_id, flashcard_id)
      );
    `);
    console.log('✅ User deck cards table created');
    
    // Create user card notes table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_card_notes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        flashcard_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
        note TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, flashcard_id)
      );
    `);
    console.log('✅ User card notes table created');
    
    // Create user card reviews table (for SRS)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_card_reviews (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        flashcard_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
        ease_factor DECIMAL(3,2) DEFAULT 2.50,
        interval_days INTEGER DEFAULT 1,
        next_review_date DATE NOT NULL,
        review_count INTEGER DEFAULT 0,
        last_reviewed TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, flashcard_id)
      );
    `);
    
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_review_next_date 
      ON user_card_reviews(user_id, next_review_date);
    `);
    console.log('✅ User card reviews table created (SRS)');
    
    // Insert sample achievements
    await client.query(`
      INSERT INTO achievements (name, description, icon, criteria) VALUES
        ('First Step', 'Complete your first drill', '🎯', '{"drill_attempts": 1}'),
        ('Practice Makes Perfect', 'Complete 100 drill attempts', '💯', '{"drill_attempts": 100}'),
        ('Week Warrior', 'Maintain a 7-day streak', '🔥', '{"streak_days": 7}'),
        ('Month Master', 'Maintain a 30-day streak', '⭐', '{"streak_days": 30}'),
        ('Perfectionist', 'Get 50 correct answers in a row', '✨', '{"consecutive_correct": 50}'),
        ('Night Owl', 'Study between midnight and 4 AM', '🦉', '{"study_time": "night"}'),
        ('Early Bird', 'Study between 5 AM and 7 AM', '🐦', '{"study_time": "morning"}')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('✅ Sample achievements inserted');
    
    console.log('✨ Multi-user database initialization complete!');
    
    // Show summary
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n📊 Database Tables:');
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    
  } catch (err) {
    console.error('❌ Error initializing database:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabaseMultiUser()
    .then(() => {
      console.log('👍 All done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to initialize:', err);
      process.exit(1);
    });
}

module.exports = initializeDatabaseMultiUser;
