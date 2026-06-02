/**
 * Unified statistics utility for all drills
 * Ensures all drills contribute to the same card's stats regardless of drill type
 */

/**
 * Generate a consistent card key from a flashcard
 * @param {Object} card - Flashcard object with Hanzi and Pinyin properties
 * @returns {string} - Unique card key in format "Hanzi_Pinyin"
 */
export const getCardKey = (card) => {
  return `${card.Hanzi}_${card.Pinyin}`;
};

/**
 * Update statistics for a card across all drills
 * @param {Object} card - Flashcard object
 * @param {boolean} isCorrect - Whether the answer was correct
 * @param {string} drillType - Type of drill (hanziToPinyin, pinyinToEnglish, etc.)
 */
export const updateCardStats = (card, isCorrect, drillType = null) => {
  const cardKey = getCardKey(card);
  const saved = localStorage.getItem('tcFlashcardsStats');
  
  const stats = saved ? JSON.parse(saved) : {
    drills: {
      hanziToPinyin: { attempts: 0, correct: 0, totalTime: 0 },
      pinyinToEnglish: { attempts: 0, correct: 0, totalTime: 0 },
      pinyinToHanzi: { attempts: 0, correct: 0, totalTime: 0 },
      englishToHanzi: { attempts: 0, correct: 0, totalTime: 0 },
      spacedRepetition: { attempts: 0, correct: 0, totalTime: 0 },
      chapterProgression: { attempts: 0, correct: 0, totalTime: 0 }
    },
    cardHistory: {},
    streaks: {
      current: 0,
      longest: 0,
      lastStudyDate: null
    },
    totalCards: 0
  };

  // Update drill-specific stats if drillType is provided
  if (drillType && stats.drills[drillType]) {
    stats.drills[drillType].attempts += 1;
    if (isCorrect) {
      stats.drills[drillType].correct += 1;
    }
  }

  // Update unified card history (this is the key improvement)
  if (!stats.cardHistory[cardKey]) {
    stats.cardHistory[cardKey] = {
      attempts: 0,
      correctCount: 0,
      lastReviewed: null
    };
  }
  
  stats.cardHistory[cardKey].attempts += 1;
  if (isCorrect) {
    stats.cardHistory[cardKey].correctCount += 1;
  }
  stats.cardHistory[cardKey].lastReviewed = new Date().toISOString();

  // Update streak
  const today = new Date().toDateString();
  const lastStudy = stats.streaks.lastStudyDate;
  
  if (lastStudy !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastStudy === yesterday.toDateString()) {
      stats.streaks.current += 1;
    } else if (lastStudy === null) {
      stats.streaks.current = 1;
    } else {
      stats.streaks.current = 1;
    }
    
    stats.streaks.longest = Math.max(stats.streaks.longest, stats.streaks.current);
    stats.streaks.lastStudyDate = today;
  }

  localStorage.setItem('tcFlashcardsStats', JSON.stringify(stats));
  return stats;
};

/**
 * Get stats for a specific card
 * @param {Object} card - Flashcard object
 * @returns {Object} - Card stats or null if not found
 */
export const getCardStats = (card) => {
  const cardKey = getCardKey(card);
  const saved = localStorage.getItem('tcFlashcardsStats');
  
  if (!saved) return null;
  
  const stats = JSON.parse(saved);
  return stats.cardHistory[cardKey] || null;
};

/**
 * Check if a card is mastered (3+ correct with 80%+ accuracy)
 * @param {Object} card - Flashcard object
 * @returns {boolean} - Whether the card is mastered
 */
export const isCardMastered = (card) => {
  const cardStats = getCardStats(card);
  if (!cardStats || cardStats.attempts === 0) return false;
  
  return cardStats.correctCount >= 3 && 
         (cardStats.correctCount / cardStats.attempts) >= 0.8;
};
