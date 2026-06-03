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

          if (success && cloudStats) {
            // Use cloud chapter progress for logged-in users
            const cloudChapter = cloudStats.chapterProgress || {};
            console.log('✅ Loaded chapter progress from cloud:', Object.keys(cloudChapter).length, 'chapters');
            setChapterProgress(cloudChapter);
            localStorage.setItem('tcFlashcardsChapterProgress', JSON.stringify(cloudChapter));
          } else {
            // New user - start fresh
            console.log('📝 New user - starting with empty chapter progress');
            setChapterProgress({});
            localStorage.setItem('tcFlashcardsChapterProgress', JSON.stringify({}));
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

    // Find next chapter to study
    let targetChapter = null;
    for (const key of chapterKeys) {
      if (!chapterProgress[key] || !chapterProgress[key].completed) {
        targetChapter = chapters[key];
        break;
      }
    }

    // If all complete, start from beginning
    if (!targetChapter && chapterKeys.length > 0) {
      targetChapter = chapters[chapterKeys[0]];
    }

    if (targetChapter) {
      console.log(`📚 Loading chapter: Book ${targetChapter.book}, Chapter ${targetChapter.chapter}`);
      setCurrentChapter(targetChapter);
      // Shuffle cards within chapter
      setChapterCards(targetChapter.cards.sort(() => Math.random() - 0.5));
      setCurrentIndex(0);
      setChapterStats({ correct: 0, total: 0 });
    }
  }, [data, chapterProgress, isLoading, currentChapter]);

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
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;

    if (nextIndex >= chapterCards.length) {
      // Chapter complete - mark it and move to next chapter automatically
      const chapterKey = `${currentChapter.book}_${currentChapter.chapter}`;
      const accuracy = chapterStats.total > 0 ? (chapterStats.correct / chapterStats.total) * 100 : 0;

      const updated = {
        ...chapterProgress,
        [chapterKey]: {
          completed: true,
          accuracy: Math.round(accuracy),
          lastStudied: new Date().toISOString(),
          attempts: (chapterProgress[chapterKey]?.attempts || 0) + 1
        }
      };

      localStorage.setItem('tcFlashcardsChapterProgress', JSON.stringify(updated));
      setChapterProgress(updated);

      // Sync to cloud if user is logged in
      if (user) {
        const stats = JSON.parse(localStorage.getItem('tcFlashcardsStats') || '{}');
        const reviewData = JSON.parse(localStorage.getItem('tcFlashcardsReviewData') || '{}');
        progressSyncService.saveProgressToCloud(user.id, stats, updated, reviewData);
      }

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

    // Find next incomplete chapter
    let nextChapter = null;
    for (const key of chapterKeys) {
      if (!updatedProgress[key] || !updatedProgress[key].completed) {
        nextChapter = chapters[key];
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
      setChapterCards(nextChapter.cards.sort(() => Math.random() - 0.5));
      setCurrentIndex(0);
      setChapterStats({ correct: 0, total: 0 });
      setShowAnswer(false);
      setUserAnswer({ pinyin: '', english: '' });
      setSelectedOption(null);
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
          <div className="answer-reveal">
            <div className={`result ${chapterStats.isCorrect ? 'correct' : 'incorrect'}`}>
              {chapterStats.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </div>

            <div className="correct-answer">
              <h3>Correct Answer:</h3>
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
