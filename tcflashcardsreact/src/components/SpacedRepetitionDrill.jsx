import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { progressSyncService } from '../services/progressSync';
import { updateCardStats, getCardKey } from '../utils/statsUtils';
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
  const [sessionStats, setSessionStats] = useState({ reviewed: 0, correct: 0, again: 0, good: 0 });
  const queueInitialized = useRef(false);

  // Load review data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tcFlashcardsReviewData');
    if (saved) {
      setCardReviewData(JSON.parse(saved));
    }
  }, []);

  // Build review queue based on due cards - ONLY ONCE
  useEffect(() => {
    if (!data || data.length === 0) return;
    if (queueInitialized.current) return; // Already built, don't rebuild

    // Wait for cardReviewData to load from localStorage
    // Check if we have any review data at all
    if (Object.keys(cardReviewData).length === 0) {
      console.log('⏳ Waiting for review data to load...');
      return;
    }

    const now = new Date();
    const dueCards = [];
    const notDueCards = []; // All reviewed cards that aren't due yet

    console.log('🔍 SpacedRepetition: Building review queue...');
    console.log(`📊 Total cards in database: ${data.length}`);
    console.log(`📚 Review data entries: ${Object.keys(cardReviewData).length}`);

    data.forEach(card => {
      const cardKey = `${card.Hanzi}_${card.Pinyin}`;
      const reviewData = cardReviewData[cardKey];

      if (reviewData) {
        const nextReviewDate = new Date(reviewData.nextReviewDate);
        const isDue = nextReviewDate <= now;

        if (isDue) {
          dueCards.push({ ...card, reviewData });
        } else {
          // Include ALL reviewed cards that aren't due
          notDueCards.push({ ...card, reviewData });
        }
      }
    });

    console.log(`🎯 Cards due for review: ${dueCards.length}`);
    console.log(`📝 Other reviewed cards: ${notDueCards.length}`);

    // Shuffle both arrays
    const shuffledDue = dueCards.sort(() => Math.random() - 0.5);
    const shuffledNotDue = notDueCards.sort(() => Math.random() - 0.5);

    // Build queue: Always try to get 20 cards
    let queue = [];

    if (shuffledDue.length >= 20) {
      // If we have 20+ due cards, just take 20 of them
      queue = shuffledDue.slice(0, 20);
    } else {
      // Take all due cards
      queue = [...shuffledDue];

      // Fill remaining slots with any reviewed cards
      const slotsToFill = 20 - queue.length;
      const cardsToAdd = shuffledNotDue
        .slice(0, slotsToFill)
        .map(card => {
          // Mark as mastered review if interval >= 21, otherwise bonus review
          if (card.reviewData.interval >= 21) {
            return { ...card, isMasteredReview: true };
          } else {
            return { ...card, isExtraReview: true };
          }
        });

      queue = [...queue, ...cardsToAdd];
    }

    console.log(`📋 Final queue: ${queue.length} cards`);
    console.log(`   - Due: ${queue.filter(c => !c.isMasteredReview && !c.isExtraReview).length}`);
    console.log(`   - Mastered: ${queue.filter(c => c.isMasteredReview).length}`);
    console.log(`   - Extra: ${queue.filter(c => c.isExtraReview).length}`);

    setReviewQueue(queue);
    setCurrentIndex(0);
    queueInitialized.current = true; // Mark as initialized
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
      const stats = JSON.parse(localStorage.getItem('tcFlashcardsStats') || '{}');
      const chapterProgress = JSON.parse(localStorage.getItem('tcFlashcardsChapterProgress') || '{}');
      progressSyncService.saveProgressToCloud(user.id, stats, chapterProgress, updated);
    }
  }, [cardReviewData, user]);

  const [isCorrect, setIsCorrect] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [currentCardData, setCurrentCardData] = useState(null);
  const [pendingQuality, setPendingQuality] = useState(null);

  const handleCheckAnswer = () => {
    const currentCard = reviewQueue[currentIndex];
    let correct = false;

    if (isMultipleChoice) {
      correct = selectedOption && 
                selectedOption.pinyin === currentCard.Pinyin && 
                selectedOption.english === currentCard.English;
    } else {
      const pinyinMatch = userAnswer.pinyin.toLowerCase().trim() === currentCard.Pinyin.toLowerCase().trim();
      const englishMatch = userAnswer.english.toLowerCase().trim() === currentCard.English.toLowerCase().trim();
      correct = pinyinMatch && englishMatch;
    }

    setIsCorrect(correct);
    setFeedback(correct ? '✅ Correct!' : '❌ Incorrect');
    setShowAnswer(true);

    // Store the current card and quality for later
    setCurrentCardData(currentCard);
    const quality = correct ? 3 : 1;
    setPendingQuality(quality);
  };

  const handleNextCard = () => {
    // Save the review data using the stored card data
    if (pendingQuality !== null && currentCardData) {
      saveReviewData(currentCardData, pendingQuality);

      // Update session stats
      setSessionStats(prev => ({
        reviewed: prev.reviewed + 1,
        correct: pendingQuality >= 3 ? prev.correct + 1 : prev.correct,
        again: pendingQuality < 3 ? prev.again + 1 : prev.again,
        good: pendingQuality >= 3 ? prev.good + 1 : prev.good
      }));
    }

    // Move to next card first
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);

    // Then reset all states
    setShowAnswer(false);
    setUserAnswer({ pinyin: '', english: '' });
    setSelectedOption(null);
    setIsCorrect(null);
    setFeedback('');
    setCurrentCardData(null);
    setPendingQuality(null);
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
            <div className="summary-stat correct">
              <span className="summary-value">{sessionStats.correct}</span>
              <span className="summary-label">Correct</span>
            </div>
            <div className="summary-stat incorrect">
              <span className="summary-value">{sessionStats.again}</span>
              <span className="summary-label">Incorrect</span>
            </div>
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
        {currentCard.isExtraReview && (
          <span className="review-count">📚 Bonus Review</span>
        )}
        {currentCard.isNew && <span className="new-badge">NEW</span>}
        {currentCard.reviewData && !currentCard.isMasteredReview && !currentCard.isExtraReview && (
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
          <div className={`answer-reveal ${isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="feedback-message">
              <h3>{feedback}</h3>
            </div>

            <div className="correct-answer">
              <p><strong>Pinyin:</strong> {currentCard.Pinyin}</p>
              <p><strong>English:</strong> {currentCard.English}</p>
            </div>

            <button className="next-btn" onClick={handleNextCard}>
              Next Card →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpacedRepetitionDrill;
