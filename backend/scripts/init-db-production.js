#!/usr/bin/env node

/**
 * Initialize Database for Production (Render or other hosting)
 * 
 * This script supports both local development and production DATABASE_URL
 * 
 * Usage:
 *   Local:      node init-db-production.js
 *   Production: DATABASE_URL=<url> node init-db-production.js
 */

const { Client } = require('pg');
require('dotenv').config();

// Support both DATABASE_URL and individual connection params
const getConnectionConfig = () => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false
    };
  }
  
  return {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'chinese_flashcards',
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
  };
};

async function initDatabase() {
  const config = getConnectionConfig();
  const client = new Client(config);

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected successfully!');

    console.log('\n📊 Creating tables...\n');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `);
    console.log('✅ Users table created');

    // Create flashcards table
    await client.query(`
      CREATE TABLE IF NOT EXISTS flashcards (
        id SERIAL PRIMARY KEY,
        hanzi VARCHAR(100) NOT NULL,
        pinyin VARCHAR(255) NOT NULL,
        english TEXT NOT NULL,
        book VARCHAR(100),
        chapter VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Flashcards table created');

    // Create user_progress table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        flashcard_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
        familiarity_level INTEGER DEFAULT 0,
        last_reviewed TIMESTAMP,
        times_correct INTEGER DEFAULT 0,
        times_incorrect INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, flashcard_id)
      );
    `);
    console.log('✅ User progress table created');

    // Create user_sessions table
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
    console.log('✅ User sessions table created');

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_flashcards_book ON flashcards(book);
      CREATE INDEX IF NOT EXISTS idx_flashcards_chapter ON flashcards(chapter);
      CREATE INDEX IF NOT EXISTS idx_user_progress_user ON user_progress(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_progress_card ON user_progress(flashcard_id);
      CREATE INDEX IF NOT EXISTS idx_session_token ON user_sessions(session_token);
    `);
    console.log('✅ Indexes created');

    // Get table counts
    const tables = ['users', 'flashcards', 'user_progress', 'user_sessions'];
    console.log('\n📈 Table Statistics:\n');
    
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`   ${table}: ${result.rows[0].count} rows`);
    }

    console.log('\n✨ Database initialization complete!\n');

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('👋 Database connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  console.log('🚀 Starting database initialization...\n');
  
  if (process.env.DATABASE_URL) {
    console.log('📍 Using DATABASE_URL (production mode)');
  } else {
    console.log('📍 Using individual connection params (local mode)');
  }
  
  initDatabase().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { initDatabase };
