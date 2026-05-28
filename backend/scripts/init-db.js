const pool = require('../config/db');

async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Initializing database...');
    
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
    console.log('✅ Indexes created');
    
    // Create users table (optional - for future use)
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Users table created');
    
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
    
    // Create user_stats table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_stats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        stats JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ User stats table created');
    
    console.log('✨ Database initialization complete!');
    
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
  initializeDatabase()
    .then(() => {
      console.log('👍 All done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to initialize:', err);
      process.exit(1);
    });
}

module.exports = initializeDatabase;
