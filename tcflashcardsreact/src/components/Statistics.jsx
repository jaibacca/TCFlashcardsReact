import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { progressSyncService } from '../services/progressSync';
import './Statistics.css';

const Statistics = ({ allData }) => {
  const [stats, setStats] = useState(null);
  const { user } = useAuth();

  // Load stats from localStorage or cloud
  useEffect(() => {
    const loadStats = async () => {
      const saved = localStorage.getItem('tcFlashcardsStats');
      if (saved) {
        setStats(JSON.parse(saved));
      } else {
        setStats({
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
          totalCards: allData?.length || 0
        });
      }
    };

    loadStats();
  }, [allData]);

  // Sync progress when user logs in
  useEffect(() => {
    if (user) {
      const syncProgress = async () => {
        console.log('🔄 Syncing progress for user:', user.email);
        const result = await progressSyncService.syncOnLogin(user.id);
        if (result.success && result.stats) {
          setStats(result.stats);
          console.log('✅ Progress synced successfully');
        }
      };
      syncProgress();
    }
  }, [user]);

  // Auto-save to cloud when stats change (if user is signed in)
  useEffect(() => {
    if (user && stats) {
      const saveToCloud = async () => {
        await progressSyncService.saveProgressToCloud(user.id, stats);
      };
      saveToCloud();
    }
  }, [stats, user]);

  if (!stats) return null;

  const drillNames = {
    hanziToPinyin: 'Hanzi → Pinyin + English',
    pinyinToEnglish: 'Pinyin → English',
    pinyinToHanzi: 'Pinyin → Hanzi',
    englishToHanzi: 'English → Hanzi',
    spacedRepetition: 'Spaced Repetition',
    chapterProgression: 'Chapter Progression'
  };

  const calculateAccuracy = (drill) => {
    if (drill.attempts === 0) return 0;
    return Math.round((drill.correct / drill.attempts) * 100);
  };

  // Calculate overall accuracy from unified card history (not drill stats)
  const getOverallAccuracy = () => {
    const cardHistory = Object.values(stats.cardHistory || {});
    if (cardHistory.length === 0) return 0;

    const totalAttempts = cardHistory.reduce((sum, card) => sum + (card.attempts || 0), 0);
    const totalCorrect = cardHistory.reduce((sum, card) => sum + (card.correctCount || 0), 0);

    if (totalAttempts === 0) return 0;
    return Math.round((totalCorrect / totalAttempts) * 100);
  };

  // Calculate total attempts from unified card history (not drill stats)
  const getTotalAttempts = () => {
    const cardHistory = Object.values(stats.cardHistory || {});
    return cardHistory.reduce((sum, card) => sum + (card.attempts || 0), 0);
  };

  const getMasteredCards = () => {
    return Object.values(stats.cardHistory).filter(card => 
      card.correctCount >= 3 && (card.correctCount / card.attempts) >= 0.8
    ).length;
  };

  const getLearningCards = () => {
    return Object.values(stats.cardHistory).filter(card => 
      card.attempts > 0 && !((card.correctCount >= 3 && (card.correctCount / card.attempts) >= 0.8))
    ).length;
  };

  const clearStats = async () => {
    if (window.confirm('Are you sure you want to clear all statistics? This will delete all your progress including chapter progression and spaced repetition data. This cannot be undone.')) {
      // Clear all localStorage
      localStorage.removeItem('tcFlashcardsStats');
      localStorage.removeItem('tcFlashcardsChapterProgress');
      localStorage.removeItem('tcFlashcardsReviewData');

      const emptyStats = {
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
        totalCards: allData?.length || 0
      };

      setStats(emptyStats);

      // If user is logged in, also clear from cloud database
      if (user) {
        console.log('🗑️ Clearing stats from cloud database for user:', user.email);
        try {
          await progressSyncService.saveProgressToCloud(
            user.id,
            emptyStats,
            {}, // Empty chapter progress
            {}  // Empty review data
          );
          console.log('✅ Cloud database cleared successfully');
          alert('All statistics cleared successfully from both local storage and cloud database!');
        } catch (error) {
          console.error('❌ Failed to clear cloud database:', error);
          alert('Statistics cleared locally, but failed to clear from cloud database. Please try again or contact support.');
        }
      } else {
        alert('All local statistics cleared successfully!');
      }
    }
  };

  return (
    <div className="statistics-container">
      <div className="stats-header">
        <h2>📊 Your Progress</h2>
        <button onClick={clearStats} className="clear-stats-btn">Clear Stats</button>
      </div>

      <div className="stats-overview">
        <div className="stat-card highlight">
          <div className="stat-value">{getOverallAccuracy()}%</div>
          <div className="stat-label">Overall Accuracy</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{getTotalAttempts()}</div>
          <div className="stat-label">Total Attempts</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{getMasteredCards()}</div>
          <div className="stat-label">Mastered Cards</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{getLearningCards()}</div>
          <div className="stat-label">Learning Cards</div>
        </div>
      </div>

      <div className="streak-section">
        <div className="streak-card">
          <div className="streak-icon">🔥</div>
          <div className="streak-info">
            <div className="streak-current">{stats.streaks.current} day streak</div>
            <div className="streak-longest">Longest: {stats.streaks.longest} days</div>
          </div>
        </div>
      </div>

      <div className="drills-stats">
        <h3>Drill Performance</h3>
        <div className="drills-stats-grid">
          {Object.entries(stats.drills).map(([drillKey, drill]) => (
            <div key={drillKey} className="drill-stat-card">
              <h4>{drillNames[drillKey]}</h4>
              <div className="drill-stats-details">
                <div className="drill-stat-row">
                  <span>Attempts:</span>
                  <strong>{drill.attempts}</strong>
                </div>
                <div className="drill-stat-row">
                  <span>Correct:</span>
                  <strong>{drill.correct}</strong>
                </div>
                <div className="drill-stat-row">
                  <span>Accuracy:</span>
                  <strong className={calculateAccuracy(drill) >= 80 ? 'good' : calculateAccuracy(drill) >= 60 ? 'ok' : 'needs-work'}>
                    {calculateAccuracy(drill)}%
                  </strong>
                </div>
              </div>
              <div className="accuracy-bar">
                <div 
                  className="accuracy-fill" 
                  style={{ width: `${calculateAccuracy(drill)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {Object.keys(stats.cardHistory).length > 0 && (
        <div className="card-progress-section">
          <h3>Card Mastery Progress</h3>
          <div className="progress-bar-large">
            <div 
              className="progress-fill-mastered" 
              style={{ width: `${(getMasteredCards() / stats.totalCards) * 100}%` }}
            />
            <div 
              className="progress-fill-learning" 
              style={{ 
                width: `${(getLearningCards() / stats.totalCards) * 100}%`,
                left: `${(getMasteredCards() / stats.totalCards) * 100}%`
              }}
            />
          </div>
          <div className="progress-legend">
            <div className="legend-item">
              <div className="legend-color mastered"></div>
              <span>Mastered: {getMasteredCards()}</span>
            </div>
            <div className="legend-item">
              <div className="legend-color learning"></div>
              <span>Learning: {getLearningCards()}</span>
            </div>
            <div className="legend-item">
              <div className="legend-color new"></div>
              <span>New: {stats.totalCards - getMasteredCards() - getLearningCards()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
