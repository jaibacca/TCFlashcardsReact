import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { progressSyncService } from '../services/progressSync';
import { updateCardStats } from '../utils/statsUtils';
import './ChapterProgressionDrill.css';

const ChapterProgressionDrill = ({ data, isMultipleChoice }) => {
  const { user } = useAuth();
  const [currentChapter, setCurrentChapter] = useState(null);
  const [chapterCards, setChapterCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState({ pinyin: '', english: '' });
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([]);
  const [chapterStats, setChapterStats] = useState({ correct: 0, total: 0 });
  const [chapterProgress, setChapterProgress] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Sync chapter progress with cloud when user logs in
  useEffect(() => {
    const syncChapterProgress = async () => {
      if (user) {
        console.log('🔄 Syncing chapter progress for user:', user.email);
        try {
          // Load from cloud
          const { success, data: cloudStats } = await progressSyncService.loadProgressFromCloud(user.id);

          if (success && cloudStats && cloudStats.chapterProgress) {
            // Use cloud chapter progress for logged-in users
            const cloudChapter = cloudStats.chapterProgress || {};
            console.log('✅ Loaded chapter progress from cloud:', Object.keys(cloudChapter).length, 'chapters');
            setChapterProgress(cloudChapter);
            localStorage.setItem('tcFlashcardsChapterProgress', JSON.stringify(cloudChapter));
          } else {
            // No cloud data - check localStorage first (don't reset existing progress!)
            const saved = localStorage.getItem('tcFlashcardsChapterProgress');
            if (saved) {
              const localProgress = JSON.parse(saved);
              console.log('📱 Using local chapter progress:', Object.keys(localProgress).length, 'chapters');
              setChapterProgress(localProgress);

              // Sync local progress to cloud for this new user/device
              if (user && Object.keys(localProgress).length > 0) {
                console.log('☁️ Syncing local progress to cloud...');
                const stats = JSON.parse(localStorage.getItem('tcFlashcardsStats') || '{}');
                const reviewData = JSON.parse(localStorage.getItem('tcFlashcardsReviewData') || '{}');
                progressSyncService.saveProgressToCloud(user.id, stats, localProgress, reviewData);
              }
            } else {
              // New user with no local or cloud data - start fresh
              console.log('📝 New user - starting with empty chapter progress');
              setChapterProgress({});
              localStorage.setItem('tcFlashcardsChapterProgress', JSON.stringify({}));
            }
          }
        } catch (error) {
          console.error('❌ Failed to sync chapter progress:', error);
          // Fallback to localStorage
          const saved = localStorage.getItem('tcFlashcardsChapterProgress');
          setChapterProgress(saved ? JSON.parse(saved) : {});
        }
      } else {
        // Not logged in - use localStorage
        const saved = localStorage.getItem('tcFlashcardsChapterProgress');
        setChapterProgress(saved ? JSON.parse(saved) : {});
      }
      setIsLoading(false);
    };

    syncChapterProgress();
  }, [user]); // Re-sync when user changes (login/logout)

  // Initialize with the first incomplete chapter
  useEffect(() => {
    if (!data || data.length === 0 || isLoading) return;

    // Don't re-initialize if already on a chapter (prevents reset on tab switch)
    if (currentChapter !== null) return;

    // Load card history to check which cards have been answered
    const savedStats = localStorage.getItem('tcFlashcardsStats');
    const stats = savedStats ? JSON.parse(savedStats) : { cardHistory: {} };
    const cardHistory = stats.cardHistory || {};

    // Group cards by book and chapter
    const chapters = {};
    data.forEach(card => {
      const key = `${card.Book}_${card.Chapter}`;
      if (!chapters[key]) {
        chapters[key] = {
          book: card.Book,
          chapter: card.Chapter,
          cards: []
        };
      }
      chapters[key].cards.push(card);
    });

    // Find first incomplete chapter
    const chapterKeys = Object.keys(chapters).sort((a, b) => {
      const [bookA, chapA] = a.split('_').map(Number);
      const [bookB, chapB] = b.split('_').map(Number);
      if (bookA !== bookB) return bookA - bookB;
      return chapA - chapB;
    });

    // Helper function to check if a chapter is complete
    // A chapter is complete when ALL cards in it have been answered at least once
    const isChapterComplete = (chapterKey) => {
      const chapter = chapters[chapterKey];
      if (!chapter || !chapter.cards || chapter.cards.length === 0) return false;

      // Check if every card in this chapter has been answered at least once
      return chapter.cards.every(card => {
        const cardKey = `${card.Hanzi}_${card.Pinyin}`;
        return cardHistory[cardKey] && cardHistory[cardKey].attempts > 0;
      });
    };

    // Find next chapter to study
    let targetChapter = null;

    // First, look for a chapter marked as "in progress" that's not complete
    for (const key of chapterKeys) {
      if (chapterProgress[key]?.inProgress && !isChapterComplete(key)) {
        targetChapter = chapters[key];
        console.log(`📖 Resuming in-progress chapter: ${key}`);
        break;
      }
    }

    // If no in-progress incomplete chapter, find first incomplete chapter
    if (!targetChapter) {
      for (const key of chapterKeys) {
        if (!isChapterComplete(key)) {
          targetChapter = chapters[key];
          console.log(`📘 Starting incomplete chapter: ${key} (has unanswered cards)`);
          break;
        }
      }
    }

    // If no incomplete chapters, check for in-progress complete chapters (review mode)
    if (!targetChapter) {
      for (const key of chapterKeys) {
        if (chapterProgress[key]?.inProgress) {
          targetChapter = chapters[key];
          console.log(`📗 Reviewing in-progress chapter: ${key} (all cards answered)`);
          break;
        }
      }
    }

    // If all complete and none in progress, start from beginning
    if (!targetChapter && chapterKeys.length > 0) {
      targetChapter = chapters[chapterKeys[0]];
      console.log(`🔄 All chapters complete, restarting from beginning`);
    }

    if (targetChapter) {
      console.log(`📚 Loading chapter: Book ${targetChapter.book}, Chapter ${targetChapter.chapter}`);
      setCurrentChapter(targetChapter);
      // Shuffle cards within chapter
      const shuffledCards = targetChapter.cards.sort(() => Math.random() - 0.5);
      setChapterCards(shuffledCards);
      setCurrentIndex(0);
      setChapterStats({ correct: 0, total: 0 });

      // Mark this chapter as the current one in progress
      const chapterKey = `${targetChapter.book}_${targetChapter.chapter}`;
      const updated = {
        ...chapterProgress,
        [chapterKey]: {
          ...(chapterProgress[chapterKey] || {}),
          inProgress: true,
          lastAccessed: new Date().toISOString()
        }
      };
      setChapterProgress(updated);
      localStorage.setItem('tcFlashcardsChapterProgress', JSON.stringify(updated));

      // Sync to cloud immediately
      if (user) {
        const stats = JSON.parse(localStorage.getItem('tcFlashcardsStats') || '{}');
        const reviewData = JSON.parse(localStorage.getItem('tcFlashcardsReviewData') || '{}');
        progressSyncService.saveProgressToCloud(user.id, stats, updated, reviewData);
      }
    }
  }, [data, chapterProgress, isLoading, currentChapter, user]);

  // Generate multiple choice options
  useEffect(() => {
    if (isMultipleChoice && chapterCards.length > 0 && currentIndex < chapterCards.length) {
      const currentCard = chapterCards[currentIndex];
      const correctAnswer = { pinyin: currentCard.Pinyin, english: currentCard.English };
      
      // Get 3 random wrong answers from the same chapter first, then from all data
      let wrongOptions = chapterCards
        .filter(card => card.Hanzi !== currentCard.Hanzi)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(card => ({ pinyin: card.Pinyin, english: card.English }));

      // If not enough options in chapter, add from all data
      if (wrongOptions.length < 3) {
        const additionalOptions = data
          .filter(card => card.Hanzi !== currentCard.Hanzi && 
                         !wrongOptions.some(opt => opt.pinyin === card.Pinyin))
          .sort(() => Math.random() - 0.5)
          .slice(0, 3 - wrongOptions.length)
          .map(card => ({ pinyin: card.Pinyin, english: card.English }));
        wrongOptions = [...wrongOptions, ...additionalOptions];
      }

      const allOptions = [...wrongOptions, correctAnswer].sort(() => Math.random() - 0.5);
      setOptions(allOptions);
    }
  }, [currentIndex, isMultipleChoice, chapterCards, data]);

  const saveChapterProgress = useCallback(() => {
    if (!currentChapter) return;

    const chapterKey = `${currentChapter.book}_${currentChapter.chapter}`;
    const accuracy = chapterStats.total > 0 ? (chapterStats.correct / chapterStats.total) * 100 : 0;
    const completed = currentIndex >= chapterCards.length;

    const updated = {
      ...chapterProgress,
      [chapterKey]: {
        completed,
        accuracy: Math.round(accuracy),
        lastStudied: new Date().toISOString(),
        attempts: (chapterProgress[chapterKey]?.attempts || 0) + 1
      }
    };

    setChapterProgress(updated);
    localStorage.setItem('tcFlashcardsChapterProgress', JSON.stringify(updated));
  }, [currentChapter, chapterStats, currentIndex, chapterCards.length, chapterProgress]);

  const handleCheckAnswer = () => {
    if (currentIndex >= chapterCards.length) return;

    const currentCard = chapterCards[currentIndex];
    let isCorrect = false;

    if (isMultipleChoice) {
      isCorrect = selectedOption && 
                  selectedOption.pinyin.toLowerCase() === currentCard.Pinyin.toLowerCase() &&
                  selectedOption.english.toLowerCase() === currentCard.English.toLowerCase();
    } else {
      const pinyinMatch = userAnswer.pinyin.toLowerCase().trim() === currentCard.Pinyin.toLowerCase();
      const englishMatch = userAnswer.english.toLowerCase().trim() === currentCard.English.toLowerCase();
      isCorrect = pinyinMatch && englishMatch;
    }

    setChapterStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
      isCorrect // Store the result for display
    }));

    setShowAnswer(true);

    // Update unified card stats (also adds to review data automatically)
    updateCardStats(currentCard, isCorrect, 'chapterProgression');

    // Sync to cloud immediately after each answer (if logged in)
    if (user) {
      const stats = JSON.parse(localStorage.getItem('tcFlashcardsStats') || '{}');
      const reviewData = JSON.parse(localStorage.getItem('tcFlashcardsReviewData') || '{}');
      const currentProgress = JSON.parse(localStorage.getItem('tcFlashcardsChapterProgress') || '{}');
      progressSyncService.saveProgressToCloud(user.id, stats, currentProgress, reviewData);
    }
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= chapterCards.length) {
      // Finished this session - check if chapter is now complete
      const chapterKey = `${currentChapter.book}_${currentChapter.chapter}`;
      const accuracy = chapterStats.total > 0 ? (chapterStats.correct / chapterStats.total) * 100 : 0;

      // Load card history to check if ALL cards in this chapter have been answered
      const savedStats = localStorage.getItem('tcFlashcardsStats');
      const stats = savedStats ? JSON.parse(savedStats) : { cardHistory: {} };
      const cardHistory = stats.cardHistory || {};

      // Check if all cards in current chapter have been answered at least once
      const allCardsAnswered = currentChapter.cards.every(card => {
        const cardKey = `${card.Hanzi}_${card.Pinyin}`;
        return cardHistory[cardKey] && cardHistory[cardKey].attempts > 0;
      });

      const updated = {
        ...chapterProgress,
        [chapterKey]: {
          ...(chapterProgress[chapterKey] || {}),
          completed: allCardsAnswered, // Only mark complete if ALL cards answered
          accuracy: Math.round(accuracy),
          lastStudied: new Date().toISOString(),
          attempts: (chapterProgress[chapterKey]?.attempts || 0) + 1
        }
      };

      localStorage.setItem('tcFlashcardsChapterProgress', JSON.stringify(updated));
      setChapterProgress(updated);

      // Sync to cloud if user is logged in
      if (user) {
        const reviewData = JSON.parse(localStorage.getItem('tcFlashcardsReviewData') || '{}');
        progressSyncService.saveProgressToCloud(user.id, stats, updated, reviewData);
      }

      console.log(`✅ Chapter ${chapterKey} session complete. All cards answered: ${allCardsAnswered}`);

      // Move to next chapter automatically
      moveToNextChapter(updated);
      return;
    }

    setShowAnswer(false);
    setUserAnswer({ pinyin: '', english: '' });
    setSelectedOption(null);
    setCurrentIndex(nextIndex);
  };

  const moveToNextChapter = (updatedProgress) => {
    // Load card history to check which cards have been answered
    const savedStats = localStorage.getItem('tcFlashcardsStats');
    const stats = savedStats ? JSON.parse(savedStats) : { cardHistory: {} };
    const cardHistory = stats.cardHistory || {};

    // Group cards by book and chapter
    const chapters = {};
    data.forEach(card => {
      const key = `${card.Book}_${card.Chapter}`;
      if (!chapters[key]) {
        chapters[key] = {
          book: card.Book,
          chapter: card.Chapter,
          cards: []
        };
      }
      chapters[key].cards.push(card);
    });

    // Get sorted chapter keys
    const chapterKeys = Object.keys(chapters).sort((a, b) => {
      const [bookA, chapA] = a.split('_').map(Number);
      const [bookB, chapB] = b.split('_').map(Number);
      if (bookA !== bookB) return bookA - bookB;
      return chapA - chapB;
    });

    // Helper function to check if a chapter is complete
    const isChapterComplete = (chapterKey) => {
      const chapter = chapters[chapterKey];
      if (!chapter || !chapter.cards || chapter.cards.length === 0) return false;

      return chapter.cards.every(card => {
        const cardKey = `${card.Hanzi}_${card.Pinyin}`;
        return cardHistory[cardKey] && cardHistory[cardKey].attempts > 0;
      });
    };

    // Find next incomplete chapter
    let nextChapter = null;
    for (const key of chapterKeys) {
      if (!isChapterComplete(key)) {
        nextChapter = chapters[key];
        console.log(`➡️ Moving to next incomplete chapter: ${key}`);
        break;
      }
    }

    // If all complete, start over from first chapter
    if (!nextChapter && chapterKeys.length > 0) {
      nextChapter = chapters[chapterKeys[0]];
      // Reset all progress
      localStorage.setItem('tcFlashcardsChapterProgress', JSON.stringify({}));
    }

    if (nextChapter) {
      setCurrentChapter(nextChapter);
      const shuffledCards = nextChapter.cards.sort(() => Math.random() - 0.5);
      setChapterCards(shuffledCards);
      setCurrentIndex(0);
      setChapterStats({ correct: 0, total: 0 });
      setShowAnswer(false);
      setUserAnswer({ pinyin: '', english: '' });
      setSelectedOption(null);

      // Mark this new chapter as in progress
      const nextChapterKey = `${nextChapter.book}_${nextChapter.chapter}`;
      const finalProgress = {
        ...updatedProgress,
        [nextChapterKey]: {
          ...(updatedProgress[nextChapterKey] || {}),
          inProgress: true,
          lastAccessed: new Date().toISOString()
        }
      };

      setChapterProgress(finalProgress);
      localStorage.setItem('tcFlashcardsChapterProgress', JSON.stringify(finalProgress));

      // Sync to cloud
      if (user) {
        const stats = JSON.parse(localStorage.getItem('tcFlashcardsStats') || '{}');
        const reviewData = JSON.parse(localStorage.getItem('tcFlashcardsReviewData') || '{}');
        progressSyncService.saveProgressToCloud(user.id, stats, finalProgress, reviewData);
      }
    }
  };

  const handleOptionSelect = (option) => {
    if (!showAnswer) {
      setSelectedOption(option);
    }
  };

  if (isLoading) {
    return (
      <div className="drill-container">
        <div className="loading-message">
          <h2>🔄 Syncing chapter progress...</h2>
          <p>Loading your learning progress from the cloud</p>
        </div>
      </div>
    );
  }

  if (!currentChapter || currentIndex >= chapterCards.length) {
    return (
      <div className="drill-container">
        <div className="loading-message">
          <h2>Loading next chapter...</h2>
        </div>
      </div>
    );
  }

  const currentCard = chapterCards[currentIndex];
  const progress = ((currentIndex + 1) / chapterCards.length) * 100;
  const currentAccuracy = chapterStats.total > 0 ? Math.round((chapterStats.correct / chapterStats.total) * 100) : 0;

  return (
    <div className="drill-container">
      <div className="drill-header">
        <div>
          <h2>📚 Chapter Progression</h2>
          <div className="chapter-title">Book {currentChapter.book} - Chapter {currentChapter.chapter}</div>
        </div>
        <div className="session-stats">
          <div className="stat-item">
            <span className="stat-label">Progress:</span>
            <span className="stat-value">{currentIndex + 1} / {chapterCards.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Accuracy:</span>
            <span className="stat-value">{currentAccuracy}%</span>
          </div>
        </div>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
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
                    onKeyPress={(e) => e.key === 'Enter' && document.querySelector('.english-input')?.focus()}
                  />
                </div>
                <div className="input-group">
                  <label>English:</label>
                  <input
                    type="text"
                    className="english-input"
                    value={userAnswer.english}
                    onChange={(e) => setUserAnswer({ ...userAnswer, english: e.target.value })}
                    placeholder="Enter English meaning..."
                    onKeyPress={(e) => e.key === 'Enter' && handleCheckAnswer()}
                  />
                </div>
                <button className="check-btn" onClick={handleCheckAnswer}>
                  Check Answer
                </button>
              </>
            )}
          </div>
        )}

        {showAnswer && (
          <div className={`answer-reveal ${chapterStats.isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="feedback-message">
              <h3>{chapterStats.isCorrect ? '✅ Correct!' : '❌ Incorrect'}</h3>
            </div>

            <div className="correct-answer">
              <p><strong>Pinyin:</strong> {currentCard.Pinyin}</p>
              <p><strong>English:</strong> {currentCard.English}</p>
              {currentCard.Book && <p className="metadata">Book {currentCard.Book}, Chapter {currentCard.Chapter}</p>}
            </div>

            <button className="next-btn" onClick={handleNext}>
              Next Card →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterProgressionDrill;
