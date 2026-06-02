import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { progressSyncService } from '../services/progressSync';
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

  // Build review queue based on due cards
  useEffect(() => {
    if (!data || data.length === 0) return;

    const now = new Date();
    const queue = [];

    data.forEach(card => {
      const cardKey = `${card.Hanzi}_${card.Pinyin}`;
      const reviewData = cardReviewData[cardKey];

      if (!reviewData) {
        // New card - add to queue
        queue.push({ ...card, isNew: true });
      } else if (new Date(reviewData.nextReviewDate) <= now) {
        // Due for review
        queue.push({ ...card, reviewData });
      }
    });

    // Shuffle queue
    const shuffled = queue.sort(() => Math.random() - 0.5);
    setReviewQueue(shuffled);
    setCurrentIndex(0);
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
    const cardKey = `${card.Hanzi}_${card.Pinyin}`;
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

    // Update stats
    const currentStats = JSON.parse(localStorage.getItem('tcFlashcardsStats') || '{}');
    const updatedStats = {
      ...currentStats,
      cardHistory: {
        ...currentStats.cardHistory,
        [cardKey]: {
          ...currentStats.cardHistory?.[cardKey],
          attempts: (currentStats.cardHistory?.[cardKey]?.attempts || 0) + 1,
          correctCount: (currentStats.cardHistory?.[cardKey]?.correctCount || 0) + (quality >= 3 ? 1 : 0),
          lastReviewed: new Date().toISOString()
        }
      }
    };
    localStorage.setItem('tcFlashcardsStats', JSON.stringify(updatedStats));

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
  };

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  if (!reviewQueue || reviewQueue.length === 0) {
    return (
      <div className="drill-container">
        <div className="no-cards-message">
          <h2>🎉 All caught up!</h2>
          <p>No cards due for review right now.</p>
          <p>Come back later or practice other drills to add more cards to your review queue.</p>
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
