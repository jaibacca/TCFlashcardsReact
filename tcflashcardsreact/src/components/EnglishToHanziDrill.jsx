import { useState, useMemo } from 'react';
import { generateMultipleChoiceOptions } from '../utils/csvParser';
import { updateStatistics } from './Statistics';
import StrokeInput from './StrokeInput';
import './EnglishToHanziDrill.css';

const EnglishToHanziDrill = ({ data, isMultipleChoice }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedHanzi, setSelectedHanzi] = useState('');
  const [drawnHanzi, setDrawnHanzi] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  if (!data || data.length === 0) {
    return <div className="drill-container">No data available. Please load data first.</div>;
  }

  const currentCard = data[currentIndex];
  const hanziOptions = useMemo(() =>
    isMultipleChoice ? generateMultipleChoiceOptions(currentCard.Hanzi, data, 'Hanzi') : [],
    [currentIndex, isMultipleChoice, data]
  );

  const handleStrokeComplete = (imageData, strokes) => {
    setDrawnHanzi({ imageData, strokes });
  };

  const checkAnswer = () => {
    const isCorrect = isMultipleChoice
      ? selectedHanzi === currentCard.Hanzi
      : drawnHanzi !== null;

    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    setShowAnswer(true);

    // Update statistics
    updateStatistics('englishToHanzi', isCorrect, currentCard.id || currentIndex);
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
    setSelectedHanzi('');
    setDrawnHanzi(null);
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
        <h2>English → Hanzi</h2>
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
          <div className="english-display">{currentCard.English}</div>
          <div className="pinyin-hint">({currentCard.Pinyin})</div>
        </div>

        <div className="answer-section">
          {!showAnswer ? (
            <>
              <div className="input-group">
                <label>Write the Hanzi character:</label>
                {isMultipleChoice ? (
                  <div className="options-grid hanzi-options">
                    {hanziOptions.map((option, idx) => (
                      <button
                        key={idx}
                        className={`option-btn hanzi-btn ${selectedHanzi === option ? 'selected' : ''}`}
                        onClick={() => setSelectedHanzi(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <StrokeInput 
                    onStrokeComplete={handleStrokeComplete}
                    expectedCharacter={null}
                  />
                )}
              </div>

              <button 
                className="check-btn"
                onClick={checkAnswer}
                disabled={isMultipleChoice ? !selectedHanzi : !drawnHanzi}
              >
                Check Answer
              </button>
            </>
          ) : (
            <div className="answer-reveal">
              <div className="correct-answer">
                <h3>Correct Answer:</h3>
                <div className="hanzi-answer">{currentCard.Hanzi}</div>
                <p><strong>Pinyin:</strong> {currentCard.Pinyin}</p>
                <p><strong>English:</strong> {currentCard.English}</p>
              </div>
              
              {!isMultipleChoice && drawnHanzi && (
                <div className="drawn-comparison">
                  <div className="comparison-item">
                    <h4>Your Drawing:</h4>
                    <img src={drawnHanzi.imageData} alt="Your drawing" />
                  </div>
                  <div className="comparison-item">
                    <h4>Correct Character:</h4>
                    <div className="reference-hanzi">{currentCard.Hanzi}</div>
                  </div>
                </div>
              )}

              <div className={`result ${
                (isMultipleChoice 
                  ? selectedHanzi === currentCard.Hanzi
                  : true
                ) ? 'correct' : 'incorrect'
              }`}>
                {(isMultipleChoice 
                  ? selectedHanzi === currentCard.Hanzi
                    ? '✓ Correct!'
                    : '✗ Incorrect'
                  : '✓ Drawing submitted! Compare with the correct character above.'
                )}
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

export default EnglishToHanziDrill;
