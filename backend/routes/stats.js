const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Get user statistics
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(`
      SELECT * FROM user_stats WHERE user_id = $1
    `, [userId]);
    
    if (result.rows.length === 0) {
      return res.json({
        drills: {
          hanziToPinyin: { attempts: 0, correct: 0, totalTime: 0 },
          pinyinToEnglish: { attempts: 0, correct: 0, totalTime: 0 },
          pinyinToHanzi: { attempts: 0, correct: 0, totalTime: 0 },
          englishToHanzi: { attempts: 0, correct: 0, totalTime: 0 }
        },
        streaks: {
          current: 0,
          longest: 0,
          lastStudyDate: null
        }
      });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Update user statistics
router.post('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { drillType, isCorrect, cardId } = req.body;
    
    // This is a simplified version - you'd want to implement the full logic
    res.json({ message: 'Stats updated', userId, drillType, isCorrect, cardId });
  } catch (err) {
    console.error('Error updating user stats:', err);
    res.status(500).json({ error: 'Failed to update statistics' });
  }
});

// Get card progress for a user
router.get('/user/:userId/cards', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        flashcard_id,
        correct_count,
        total_attempts,
        last_attempt,
        mastery_level
      FROM user_progress
      WHERE user_id = $1
    `, [userId]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching card progress:', err);
    res.status(500).json({ error: 'Failed to fetch card progress' });
  }
});

module.exports = router;
