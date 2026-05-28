const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get all flashcards
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        hanzi as "Hanzi",
        pinyin as "Pinyin",
        english as "English",
        book as "Book",
        chapter as "Chapter",
        order_num as "Order"
      FROM flashcards 
      ORDER BY book, chapter, order_num
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching flashcards:', err);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// Get all unique books
router.get('/books', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT book 
      FROM flashcards 
      WHERE book IS NOT NULL
      ORDER BY book
    `);
    res.json(result.rows.map(row => row.book));
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get chapters for a specific book
router.get('/books/:book/chapters', async (req, res) => {
  try {
    const { book } = req.params;
    const result = await pool.query(`
      SELECT DISTINCT chapter 
      FROM flashcards 
      WHERE book = $1 AND chapter IS NOT NULL
      ORDER BY chapter
    `, [book]);
    res.json(result.rows.map(row => row.chapter));
  } catch (err) {
    console.error('Error fetching chapters:', err);
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

// Get flashcards by book
router.get('/book/:book', async (req, res) => {
  try {
    const { book } = req.params;
    const result = await pool.query(`
      SELECT 
        id,
        hanzi as "Hanzi",
        pinyin as "Pinyin",
        english as "English",
        book as "Book",
        chapter as "Chapter",
        order_num as "Order"
      FROM flashcards 
      WHERE book = $1
      ORDER BY chapter, order_num
    `, [book]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching flashcards by book:', err);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// Get flashcards by book and chapter
router.get('/book/:book/chapter/:chapter', async (req, res) => {
  try {
    const { book, chapter } = req.params;
    const result = await pool.query(`
      SELECT 
        id,
        hanzi as "Hanzi",
        pinyin as "Pinyin",
        english as "English",
        book as "Book",
        chapter as "Chapter",
        order_num as "Order"
      FROM flashcards 
      WHERE book = $1 AND chapter = $2
      ORDER BY order_num
    `, [book, chapter]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching flashcards by book/chapter:', err);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// Get grouped data (by book and chapter)
router.get('/grouped', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        hanzi as "Hanzi",
        pinyin as "Pinyin",
        english as "English",
        book as "Book",
        chapter as "Chapter",
        order_num as "Order"
      FROM flashcards 
      ORDER BY book, chapter, order_num
    `);
    
    // Group the data
    const grouped = {};
    result.rows.forEach(card => {
      const book = card.Book || 'Unknown';
      const chapter = card.Chapter || 'Unknown';
      
      if (!grouped[book]) {
        grouped[book] = {};
      }
      if (!grouped[book][chapter]) {
        grouped[book][chapter] = [];
      }
      
      grouped[book][chapter].push(card);
    });
    
    res.json(grouped);
  } catch (err) {
    console.error('Error fetching grouped flashcards:', err);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// Add new flashcard
router.post('/', async (req, res) => {
  try {
    const { Hanzi, Pinyin, English, Book, Chapter, Order } = req.body;
    
    if (!Hanzi || !Pinyin || !English) {
      return res.status(400).json({ 
        error: 'Hanzi, Pinyin, and English are required fields' 
      });
    }
    
    const result = await pool.query(`
      INSERT INTO flashcards (hanzi, pinyin, english, book, chapter, order_num)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING 
        id,
        hanzi as "Hanzi",
        pinyin as "Pinyin",
        english as "English",
        book as "Book",
        chapter as "Chapter",
        order_num as "Order"
    `, [Hanzi, Pinyin, English, Book, Chapter, Order]);
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding flashcard:', err);
    res.status(500).json({ error: 'Failed to add flashcard' });
  }
});

// Bulk insert flashcards
router.post('/bulk', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { flashcards } = req.body;
    
    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      return res.status(400).json({ 
        error: 'flashcards array is required and must not be empty' 
      });
    }
    
    await client.query('BEGIN');
    
    const insertedCards = [];
    for (const card of flashcards) {
      const { Hanzi, Pinyin, English, Book, Chapter, Order } = card;
      
      if (!Hanzi || !Pinyin || !English) {
        await client.query('ROLLBACK');
        return res.status(400).json({ 
          error: 'Each flashcard must have Hanzi, Pinyin, and English' 
        });
      }
      
      const result = await client.query(`
        INSERT INTO flashcards (hanzi, pinyin, english, book, chapter, order_num)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING 
          id,
          hanzi as "Hanzi",
          pinyin as "Pinyin",
          english as "English",
          book as "Book",
          chapter as "Chapter",
          order_num as "Order"
      `, [Hanzi, Pinyin, English, Book, Chapter, Order]);
      
      insertedCards.push(result.rows[0]);
    }
    
    await client.query('COMMIT');
    
    res.status(201).json({ 
      message: `Successfully inserted ${insertedCards.length} flashcards`,
      flashcards: insertedCards 
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error bulk inserting flashcards:', err);
    res.status(500).json({ error: 'Failed to bulk insert flashcards' });
  } finally {
    client.release();
  }
});

// Update flashcard
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { Hanzi, Pinyin, English, Book, Chapter, Order } = req.body;
    
    const result = await pool.query(`
      UPDATE flashcards 
      SET 
        hanzi = $1, 
        pinyin = $2, 
        english = $3, 
        book = $4, 
        chapter = $5, 
        order_num = $6
      WHERE id = $7
      RETURNING 
        id,
        hanzi as "Hanzi",
        pinyin as "Pinyin",
        english as "English",
        book as "Book",
        chapter as "Chapter",
        order_num as "Order"
    `, [Hanzi, Pinyin, English, Book, Chapter, Order, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating flashcard:', err);
    res.status(500).json({ error: 'Failed to update flashcard' });
  }
});

// Delete flashcard
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM flashcards WHERE id = $1 RETURNING id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }
    
    res.json({ message: 'Flashcard deleted successfully', id });
  } catch (err) {
    console.error('Error deleting flashcard:', err);
    res.status(500).json({ error: 'Failed to delete flashcard' });
  }
});

// Delete all flashcards
router.delete('/', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM flashcards RETURNING id');
    res.json({ 
      message: `Deleted ${result.rowCount} flashcards`,
      count: result.rowCount 
    });
  } catch (err) {
    console.error('Error deleting all flashcards:', err);
    res.status(500).json({ error: 'Failed to delete flashcards' });
  }
});

module.exports = router;
