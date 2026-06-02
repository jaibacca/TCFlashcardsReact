import { useState, useEffect, useCallback } from 'react';
import './ChapterProgressionDrill.css';

const ChapterProgressionDrill = ({ data, isMultipleChoice }) => {
  const [currentChapter, setCurrentChapter] = useState(null);
  const [chapterCards, setChapterCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState({ pinyin: '', english: '' });
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [options, setOptions] = useState([]);
  const [chapterStats, setChapterStats] = useState({ correct: 0, total: 0 });
  const [chapterProgress, setChapterProgress] = useState({});

  // Load chapter progress from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tcFlashcardsChapterProgress');
    if (saved) {
      setChapterProgress(JSON.parse(saved));
    }
  }, []);

  // Initialize with the first incomplete chapter
  useEffect(() => {
    if (!data || data.length === 0) return;

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
      setCurrentChapter(targetChapter);
      // Shuffle cards within chapter
      setChapterCards(targetChapter.cards.sort(() => Math.random() - 0.5));
      setCurrentIndex(0);
      setChapterStats({ correct: 0, total: 0 });
    }
  }, [data, chapterProgress]);

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
      total: prev.total + 1
    }));

    setShowAnswer(true);

    // Save stats
    const stats = JSON.parse(localStorage.getItem('tcFlashcardsStats') || '{}');
    const cardKey = `${currentCard.Hanzi}_${currentCard.Pinyin}`;
    localStorage.setItem('tcFlashcardsStats', JSON.stringify({
      ...stats,
      cardHistory: {
        ...stats.cardHistory,
        [cardKey]: {
          ...stats.cardHistory?.[cardKey],
          attempts: (stats.cardHistory?.[cardKey]?.attempts || 0) + 1,
          correctCount: (stats.cardHistory?.[cardKey]?.correctCount || 0) + (isCorrect ? 1 : 0),
          lastReviewed: new Date().toISOString()
        }
      }
    }));
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    
    if (nextIndex >= chapterCards.length) {
      // Chapter complete
      saveChapterProgress();
    }

    setShowAnswer(false);
    setUserAnswer({ pinyin: '', english: '' });
    setSelectedOption(null);
    setCurrentIndex(nextIndex);
  };

  const handleOptionSelect = (option) => {
    if (!showAnswer) {
      setSelectedOption(option);
    }
  };

  const moveToNextChapter = () => {
    saveChapterProgress();
    
    // Force re-initialization with next chapter
    const allKeys = Object.keys(chapterProgress).sort((a, b) => {
      const [bookA, chapA] = a.split('_').map(Number);
      const [bookB, chapB] = b.split('_').map(Number);
      if (bookA !== bookB) return bookA - bookB;
      return chapA - chapB;
    });

    const currentKey = `${currentChapter.book}_${currentChapter.chapter}`;
    const currentIdx = allKeys.indexOf(currentKey);
    
    // Clear progress to force finding next chapter
    setCurrentChapter(null);
    setChapterCards([]);
    setCurrentIndex(0);
    
    // Trigger re-initialization
    window.location.reload();
  };

  if (!currentChapter) {
    return (
      <div className="drill-container">
        <div className="loading-message">
          <h2>Loading chapter...</h2>
        </div>
      </div>
    );
  }

  if (currentIndex >= chapterCards.length) {
    const accuracy = chapterStats.total > 0 ? Math.round((chapterStats.correct / chapterStats.total) * 100) : 0;

    return (
      <div className="drill-container">
        <div className="chapter-complete">
          <h2>🎉 Chapter Complete!</h2>
          <div className="chapter-title">
            Book {currentChapter.book} - Chapter {currentChapter.chapter}
          </div>
          <div className="chapter-summary">
            <div className="summary-stat">
              <span className="summary-value">{chapterStats.correct}</span>
              <span className="summary-label">Correct</span>
            </div>
            <div className="summary-stat">
              <span className="summary-value">{chapterStats.total}</span>
              <span className="summary-label">Total</span>
            </div>
            <div className="summary-stat">
              <span className="summary-value">{accuracy}%</span>
              <span className="summary-label">Accuracy</span>
            </div>
          </div>
          <button className="next-chapter-btn" onClick={moveToNextChapter}>
            Continue to Next Chapter →
          </button>
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
