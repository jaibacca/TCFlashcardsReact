import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { progressSyncService } from '../services/progressSync';
import { updateCardStats, getCardKey } from '../utils/statsUtils';
import { speakChinese, preloadAudio } from '../utils/speechUtils';
import './SpacedRepetitionDrill.css';

// SM-2 Algorithm for Spaced Repetition (Anki method)
const calculateNextReview = (easeFactor, interval, quality) => {
  // Quality: 0=total blackout, 1=incorrect, 2=correct but difficult, 3=correct, 4=perfect, 5=too easy
  let newEaseFactor = easeFactor;
  let newInterval = interval;

  if (quality < 3) {
    // Failed recall - reset to beginning
    newInterval = 0;
  } else {
    // Successful recall
    if (interval === 0) {
      newInterval = 1; // 1 day
    } else if (interval === 1) {
      newInterval = 6; // 6 days
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }

    // Adjust ease factor
    newEaseFactor = newEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // Ensure ease factor is at least 1.3
    if (newEaseFactor < 1.3) {
      newEaseFactor = 1.3;
    }
  }

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    nextReviewDate: nextReviewDate.toISOString()
  };
};

const SpacedRepetitionDrill = ({ data, isMultipleChoice }) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewQueue, setReviewQueue] = useState([]);
  const [userAnswer, setUserAnswer] = useState({ pinyin: '', english: '' });
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([]);
  const [cardReviewData, setCardReviewData] = useState({});
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0, again: 0, hard: 0, good: 0, easy: 0 });

  // Load review data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tcFlashcardsReviewData');
    if (saved) {
      setCardReviewData(JSON.parse(saved));
    }
  }, []);

  // Build review queue based on due cards (only previously reviewed cards)
  useEffect(() => {
    if (!data || data.length === 0) return;

    const now = new Date();
    const dueQueue = [];
    const masteredCards = [];

    console.log('🔍 SpacedRepetition: Building review queue...');
    console.log(`📊 Total cards in database: ${data.length}`);
    console.log(`📚 Review data entries: ${Object.keys(cardReviewData).length}`);

    data.forEach(card => {
      const cardKey = `${card.Hanzi}_${card.Pinyin}`;
      const reviewData = cardReviewData[cardKey];

      // Only include cards that have been reviewed before (no NEW cards)
      if (reviewData) {
        const nextReviewDate = new Date(reviewData.nextReviewDate);
        const isDue = nextReviewDate <= now;

        if (isDue) {
          console.log(`✅ Card due: ${cardKey}, next review: ${reviewData.nextReviewDate}`);
          dueQueue.push({ ...card, reviewData });
        } else {
          // Check if card is mastered (interval > 21 days = at least 4 successful reviews)
          if (reviewData.interval >= 21) {
            masteredCards.push({ ...card, reviewData });
          }
          console.log(`⏰ Card not due yet: ${cardKey}, next review: ${reviewData.nextReviewDate}, interval: ${reviewData.interval} days`);
        }
      }
    });

    console.log(`🎯 Cards due for review: ${dueQueue.length}`);
    console.log(`🏆 Mastered cards available: ${masteredCards.length}`);

    // Shuffle due cards
    const shuffledDue = dueQueue.sort(() => Math.random() - 0.5);

    // Add 2-3 random mastered cards for long-term retention check (if available)
    let finalQueue = shuffledDue;
    if (masteredCards.length > 0 && shuffledDue.length < 20) {
      const numMasteredToAdd = Math.min(
        3, // Add up to 3 mastered cards
        masteredCards.length,
        20 - shuffledDue.length // Don't exceed 20 total
      );

      const randomMastered = masteredCards
        .sort(() => Math.random() - 0.5)
        .slice(0, numMasteredToAdd)
        .map(card => ({ ...card, isMasteredReview: true })); // Flag as mastered review

      finalQueue = [...shuffledDue, ...randomMastered];
      console.log(`✨ Added ${numMasteredToAdd} mastered cards for long-term retention check`);
    }

    // Limit to 20 cards total
    const limited = finalQueue.slice(0, 20);

    console.log(`📋 Final queue size: ${limited.length} (${limited.filter(c => c.isMasteredReview).length} mastered)`);
    setReviewQueue(limited);
    setCurrentIndex(0);

    // Preload audio for all cards in review queue
    if (limited.length > 0) {
      preloadAudio(limited);
    }
  }, [data, cardReviewData]);

  // Generate multiple choice options
  useEffect(() => {
    if (isMultipleChoice && reviewQueue.length > 0 && currentIndex < reviewQueue.length) {
      const currentCard = reviewQueue[currentIndex];
      const correctAnswer = { pinyin: currentCard.Pinyin, english: currentCard.English };
      
      // Get 3 random wrong answers
      const wrongOptions = data
        .filter(card => card.Hanzi !== currentCard.Hanzi)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(card => ({ pinyin: card.Pinyin, english: card.English }));

      const allOptions = [...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5);
      setOptions(allOptions);
    }
  }, [currentIndex, isMultipleChoice, reviewQueue, data]);

  const saveReviewData = useCallback((card, quality) => {
    const cardKey = getCardKey(card);
    const existingData = cardReviewData[cardKey] || {
      easeFactor: 2.5,
      interval: 0,
      reviews: 0
    };

    const { easeFactor, interval, nextReviewDate } = calculateNextReview(
      existingData.easeFactor,
      existingData.interval,
      quality
    );

    const newReviewData = {
      ...existingData,
      easeFactor,
      interval,
      nextReviewDate,
      reviews: existingData.reviews + 1,
      lastReview: new Date().toISOString()
    };

    const updated = { ...cardReviewData, [cardKey]: newReviewData };
    setCardReviewData(updated);
    localStorage.setItem('tcFlashcardsReviewData', JSON.stringify(updated));

    // Update unified card stats
    const isCorrect = quality >= 3;
    updateCardStats(card, isCorrect, 'spacedRepetition');

    // Sync to cloud if user is logged in
    if (user) {
      const chapterProgress = JSON.parse(localStorage.getItem('tcFlashcardsChapterProgress') || '{}');
      progressSyncService.saveProgressToCloud(user.id, updatedStats, chapterProgress, updated);
    }
  }, [cardReviewData, user]);

  const handleRating = (quality) => {
    if (currentIndex >= reviewQueue.length) return;

    const currentCard = reviewQueue[currentIndex];
    saveReviewData(currentCard, quality);

    // Update session stats
    const ratingMap = { 0: 'again', 1: 'again', 2: 'hard', 3: 'good', 4: 'easy', 5: 'easy' };
    setSessionStats(prev => ({
      reviewed: prev.reviewed + 1,
      correct: quality >= 3 ? prev.correct + 1 : prev.correct,
      [ratingMap[quality]]: prev[ratingMap[quality]] + 1
    }));

    // Move to next card
    setShowAnswer(false);
    setUserAnswer({ pinyin: '', english: '' });
    setSelectedOption(null);
    setCurrentIndex(prev => prev + 1);
  };

  const handleCheckAnswer = () => {
    setShowAnswer(true);

    // Pronounce the Hanzi character
    if (currentIndex < reviewQueue.length) {
      const currentCard = reviewQueue[currentIndex];
      speakChinese(currentCard.Hanzi);
    }
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  if (!reviewQueue || reviewQueue.length === 0) {
    return (
      <div className="drill-container">
        <div className="no-cards-message">
          <h2>🎉 No reviews due!</h2>
          <p>You don't have any flashcards due for review right now.</p>
          <p>Use other drills to learn new cards, or come back later when your reviews are due.</p>
          <p className="hint">💡 Tip: Complete chapters with Chapter Progression to add cards to your review queue!</p>
          <p className="hint">🏆 Note: We also include a few random mastered cards to check long-term retention!</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= reviewQueue.length) {
    return (
      <div className="drill-container">
        <div className="session-complete">
          <h2>🎉 Review Session Complete!</h2>
          <div className="session-summary">
            <div className="summary-stat">
              <span className="summary-value">{sessionStats.reviewed}</span>
              <span className="summary-label">Cards Reviewed</span>
            </div>
            <div className="summary-stat">
              <span className="summary-value">{Math.round((sessionStats.correct / sessionStats.reviewed) * 100)}%</span>
              <span className="summary-label">Accuracy</span>
            </div>
          </div>
          <div className="rating-breakdown">
            <div className="rating-item again">Again: {sessionStats.again}</div>
            <div className="rating-item hard">Hard: {sessionStats.hard}</div>
            <div className="rating-item good">Good: {sessionStats.good}</div>
            <div className="rating-item easy">Easy: {sessionStats.easy}</div>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = reviewQueue[currentIndex];
  const progress = ((currentIndex + 1) / reviewQueue.length) * 100;

  return (
    <div className="drill-container">
      <div className="drill-header">
        <h2>🧠 Spaced Repetition Review</h2>
        <div className="session-progress">
          {currentIndex + 1} / {reviewQueue.length}
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="card-info">
        {currentCard.isMasteredReview && (
          <span className="mastered-badge">🏆 Long-term Check</span>
        )}
        {currentCard.isNew && <span className="new-badge">NEW</span>}
        {currentCard.reviewData && (
          <span className="review-count">Review #{currentCard.reviewData.reviews + 1}</span>
        )}
      </div>

      <div className="flashcard">
        <div className="question-section">
          <div className="hanzi-display">{currentCard.Hanzi}</div>
        </div>

        {!showAnswer && (
          <div className="answer-section">
            {isMultipleChoice ? (
              <>
                <div className="options-grid">
                  {options.map((option, idx) => (
                    <div
                      key={idx}
                      className={`option-btn ${selectedOption === option ? 'selected' : ''}`}
                      onClick={() => handleOptionSelect(option)}
                    >
                      <div className="option-pinyin">{option.pinyin}</div>
                      <div className="option-english">{option.english}</div>
                    </div>
                  ))}
                </div>
                <button
                  className="check-btn"
                  onClick={handleCheckAnswer}
                  disabled={!selectedOption}
                >
                  Check Answer
                </button>
              </>
            ) : (
              <>
                <div className="input-group">
                  <label>Pinyin:</label>
                  <input
                    type="text"
                    value={userAnswer.pinyin}
                    onChange={(e) => setUserAnswer({ ...userAnswer, pinyin: e.target.value })}
                    placeholder="Enter pinyin..."
                  />
                </div>
                <div className="input-group">
                  <label>English:</label>
                  <input
                    type="text"
                    value={userAnswer.english}
                    onChange={(e) => setUserAnswer({ ...userAnswer, english: e.target.value })}
                    placeholder="Enter English meaning..."
                  />
                </div>
                <button className="check-btn" onClick={handleCheckAnswer}>
                  Show Answer
                </button>
              </>
            )}
          </div>
        )}

        {showAnswer && (
          <div className="answer-reveal">
            <div className="correct-answer">
              <h3>Correct Answer:</h3>
              <p><strong>Pinyin:</strong> {currentCard.Pinyin}</p>
              <p><strong>English:</strong> {currentCard.English}</p>
            </div>

            <div className="rating-section">
              <h3>How well did you know this?</h3>
              <div className="rating-buttons">
                <button className="rating-btn again" onClick={() => handleRating(1)}>
                  <span className="rating-label">Again</span>
                  <span className="rating-time">&lt;1m</span>
                </button>
                <button className="rating-btn hard" onClick={() => handleRating(2)}>
                  <span className="rating-label">Hard</span>
                  <span className="rating-time">6m</span>
                </button>
                <button className="rating-btn good" onClick={() => handleRating(3)}>
                  <span className="rating-label">Good</span>
                  <span className="rating-time">1d</span>
                </button>
                <button className="rating-btn easy" onClick={() => handleRating(4)}>
                  <span className="rating-label">Easy</span>
                  <span className="rating-time">4d</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpacedRepetitionDrill;
