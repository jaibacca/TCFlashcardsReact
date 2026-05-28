const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// Parse CSV data
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const data = lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const entry = {};
    
    headers.forEach((header, i) => {
      entry[header] = values[i] || '';
    });
    
    return entry;
  });
  
  return data;
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

async function seedDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Seeding database...');
    
    // Read the sample CSV file
    const csvPath = path.join(__dirname, '../../sample-data.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.log('⚠️  sample-data.csv not found. Skipping seed.');
      return;
    }
    
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const flashcards = parseCSV(csvContent);
    
    console.log(`📝 Found ${flashcards.length} flashcards to insert`);
    
    // Clear existing data
    await client.query('DELETE FROM flashcards');
    console.log('🗑️  Cleared existing flashcards');
    
    // Insert flashcards
    await client.query('BEGIN');
    
    let inserted = 0;
    for (const card of flashcards) {
      await client.query(`
        INSERT INTO flashcards (hanzi, pinyin, english, book, chapter, order_num)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        card.Hanzi,
        card.Pinyin,
        card.English,
        card.Book,
        card.Chapter,
        parseInt(card.Order) || 0
      ]);
      inserted++;
    }
    
    await client.query('COMMIT');
    
    console.log(`✅ Successfully inserted ${inserted} flashcards`);
    
    // Show summary
    const summary = await client.query(`
      SELECT book, chapter, COUNT(*) as count
      FROM flashcards
      GROUP BY book, chapter
      ORDER BY book, chapter
    `);
    
    console.log('\n📊 Database Summary:');
    summary.rows.forEach(row => {
      console.log(`   ${row.book} - Chapter ${row.chapter}: ${row.count} cards`);
    });
    
    console.log('\n✨ Database seeding complete!');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding database:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('👍 All done!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Failed to seed:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
