import { useState, useMemo } from 'react';
import { generateMultipleChoiceOptions } from '../utils/csvParser';
import { updateStatistics } from './Statistics';
import './PinyinToEnglishDrill.css';

const PinyinToEnglishDrill = ({ data, isMultipleChoice }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [englishInput, setEnglishInput] = useState('');
  const [selectedEnglish, setSelectedEnglish] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  if (!data || data.length === 0) {
    return <div className="drill-container">No data available. Please load data first.</div>;
  }

  const currentCard = data[currentIndex];
  const englishOptions = useMemo(() =>
    isMultipleChoice ? generateMultipleChoiceOptions(currentCard.English, data, 'English') : [],
    [currentIndex, isMultipleChoice, data]
  );

  const checkAnswer = () => {
    const isCorrect = isMultipleChoice
      ? selectedEnglish === currentCard.English
      : englishInput.trim().toLowerCase() === currentCard.English.trim().toLowerCase();

    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    setShowAnswer(true);

    // Update statistics
    updateStatistics('pinyinToEnglish', isCorrect, currentCard.id || currentIndex);
  };

  const nextCard = () => {
    if (currentIndex < data.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetInputs();
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      resetInputs();
    }
  };

  const resetInputs = () => {
    setEnglishInput('');
    setSelectedEnglish('');
    setShowAnswer(false);
  };

  const restartDrill = () => {
    setCurrentIndex(0);
    setScore({ correct: 0, total: 0 });
    resetInputs();
  };

  return (
    <div className="drill-container">
      <div className="drill-header">
        <h2>Pinyin → English</h2>
        <div className="score">
          Score: {score.correct}/{score.total} 
          {score.total > 0 && ` (${Math.round((score.correct / score.total) * 100)}%)`}
        </div>
      </div>

      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((currentIndex + 1) / data.length) * 100}%` }}
        />
      </div>

      <div className="card-counter">
        Card {currentIndex + 1} of {data.length}
      </div>

      <div className="flashcard">
        <div className="question-section">
          <div className="pinyin-display">{currentCard.Pinyin}</div>
        </div>

        <div className="answer-section">
          {!showAnswer ? (
            <>
              <div className="input-group">
                <label>English definition:</label>
                {isMultipleChoice ? (
                  <div className="options-grid">
                    {englishOptions.map((option, idx) => (
                      <button
                        key={idx}
                        className={`option-btn ${selectedEnglish === option ? 'selected' : ''}`}
                        onClick={() => setSelectedEnglish(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={englishInput}
                    onChange={(e) => setEnglishInput(e.target.value)}
                    placeholder="Enter English definition..."
                    onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                  />
                )}
              </div>

              <button 
                className="check-btn"
                onClick={checkAnswer}
                disabled={isMultipleChoice ? !selectedEnglish : !englishInput}
              >
                Check Answer
              </button>
            </>
          ) : (
            <div className="answer-reveal">
              <div className="correct-answer">
                <h3>Correct Answer:</h3>
                <p><strong>English:</strong> {currentCard.English}</p>
                <p><strong>Hanzi:</strong> {currentCard.Hanzi}</p>
              </div>
              
              <div className={`result ${
                (isMultipleChoice 
                  ? selectedEnglish === currentCard.English
                  : englishInput.trim().toLowerCase() === currentCard.English.trim().toLowerCase()
                ) ? 'correct' : 'incorrect'
              }`}>
                {(isMultipleChoice 
                  ? selectedEnglish === currentCard.English
                  : englishInput.trim().toLowerCase() === currentCard.English.trim().toLowerCase()
                ) ? '✓ Correct!' : '✗ Incorrect'}
              </div>

              {currentCard.Book && (
                <p className="metadata">Book: {currentCard.Book}, Chapter: {currentCard.Chapter}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="navigation-controls">
        <button onClick={previousCard} disabled={currentIndex === 0}>
          ← Previous
        </button>
        <button onClick={restartDrill} className="restart-btn">
          Restart
        </button>
        {showAnswer && (
          <button onClick={nextCard} disabled={currentIndex === data.length - 1}>
            Next →
          </button>
        )}
      </div>
    </div>
  );
};

export default PinyinToEnglishDrill;
