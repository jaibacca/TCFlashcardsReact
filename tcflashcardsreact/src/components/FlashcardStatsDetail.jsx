import { useState, useMemo } from 'react';
import { getCardKey } from '../utils/statsUtils';
import './FlashcardStatsDetail.css';

const FlashcardStatsDetail = ({ allData, onClose }) => {
  const [sortBy, setSortBy] = useState('order'); // order, accuracy, attempts, lastReviewed, mastery
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [filterBook, setFilterBook] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Load card stats from localStorage
  const savedStats = localStorage.getItem('tcFlashcardsStats');
  const stats = savedStats ? JSON.parse(savedStats) : { cardHistory: {} };
  const cardHistory = stats.cardHistory || {};

  // Get unique books
  const books = useMemo(() => {
    const bookSet = new Set(allData.map(card => card.Book));
    const sortedBooks = Array.from(bookSet).sort((a, b) => {
      // Convert to numbers for proper sorting
      return Number(a) - Number(b);
    });
    console.log('Available books:', sortedBooks);
    return sortedBooks;
  }, [allData]);

  // Calculate card stats
  const cardStats = useMemo(() => {
    return allData.map(card => {
      const cardKey = getCardKey(card);
      const history = cardHistory[cardKey];
      
      const attempts = history?.attempts || 0;
      const correctCount = history?.correctCount || 0;
      const accuracy = attempts > 0 ? (correctCount / attempts) * 100 : 0;
      const lastReviewed = history?.lastReviewed || null;
      
      // Determine mastery level
      let masteryLevel = 'new';
      if (attempts >= 3 && accuracy >= 80) {
        masteryLevel = 'mastered';
      } else if (attempts > 0) {
        masteryLevel = 'learning';
      }
      
      return {
        ...card,
        cardKey,
        attempts,
        correctCount,
        accuracy,
        lastReviewed,
        masteryLevel
      };
    });
  }, [allData, cardHistory]);

  // Filter and sort cards
  const filteredAndSortedCards = useMemo(() => {
    let filtered = [...cardStats];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(card =>
        card.Hanzi.toLowerCase().includes(term) ||
        card.Pinyin.toLowerCase().includes(term) ||
        card.English.toLowerCase().includes(term)
      );
    }

    // Apply book filter
    if (filterBook !== 'all') {
      const bookNumber = parseInt(filterBook);
      console.log('Filtering by book:', bookNumber);
      console.log('Sample card Books before filter:', filtered.slice(0, 5).map(c => ({ Book: c.Book, type: typeof c.Book })));
      filtered = filtered.filter(card => {
        // Handle both string and number types
        return Number(card.Book) === bookNumber;
      });
      console.log('Cards after book filter:', filtered.length);
    }

    // Sort cards - NEW CARDS ALWAYS GO TO BOTTOM
    filtered.sort((a, b) => {
      // First priority: Cards with attempts come before cards without attempts
      const aHasAttempts = a.attempts > 0;
      const bHasAttempts = b.attempts > 0;

      if (aHasAttempts !== bHasAttempts) {
        return bHasAttempts ? 1 : -1; // Cards with attempts come first
      }

      // If both have no attempts, sort by order
      if (!aHasAttempts && !bHasAttempts) {
        return (a.Order || 0) - (b.Order || 0);
      }

      // Both have attempts - sort by selected column
      let compareValue = 0;

      switch (sortBy) {
        case 'order':
          compareValue = (a.Order || 0) - (b.Order || 0);
          break;
        case 'accuracy':
          compareValue = a.accuracy - b.accuracy;
          break;
        case 'attempts':
          compareValue = a.attempts - b.attempts;
          break;
        case 'lastReviewed':
          if (!a.lastReviewed && !b.lastReviewed) compareValue = 0;
          else if (!a.lastReviewed) compareValue = 1;
          else if (!b.lastReviewed) compareValue = -1;
          else compareValue = new Date(a.lastReviewed) - new Date(b.lastReviewed);
          break;
        case 'mastery':
          const masteryOrder = { mastered: 3, learning: 2, new: 1 };
          compareValue = masteryOrder[a.masteryLevel] - masteryOrder[b.masteryLevel];
          break;
        case 'hanzi':
          compareValue = a.Hanzi.localeCompare(b.Hanzi);
          break;
        case 'chapter':
          if (a.Book !== b.Book) {
            compareValue = a.Book - b.Book;
          } else {
            compareValue = a.Chapter - b.Chapter;
          }
          break;
        default:
          compareValue = 0;
      }

      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [cardStats, sortBy, sortOrder, filterBook, searchTerm]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const total = filteredAndSortedCards.length;
    const mastered = filteredAndSortedCards.filter(c => c.masteryLevel === 'mastered').length;
    const learning = filteredAndSortedCards.filter(c => c.masteryLevel === 'learning').length;
    const newCards = filteredAndSortedCards.filter(c => c.masteryLevel === 'new').length;
    const totalAttempts = filteredAndSortedCards.reduce((sum, c) => sum + c.attempts, 0);
    const avgAccuracy = total > 0
      ? filteredAndSortedCards.reduce((sum, c) => sum + c.accuracy, 0) / total
      : 0;

    return { total, mastered, learning, newCards, totalAttempts, avgAccuracy };
  }, [filteredAndSortedCards]);

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const getMasteryIcon = (level) => {
    switch (level) {
      case 'mastered': return '🏆';
      case 'learning': return '📚';
      case 'new': return '🆕';
      default: return '❓';
    }
  };

  const getMasteryColor = (level) => {
    switch (level) {
      case 'mastered': return '#4caf50';
      case 'learning': return '#ff9800';
      case 'new': return '#9e9e9e';
      default: return '#000';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flashcard-stats-detail">
      <div className="modal-content-wrapper">
        <div className="stats-detail-header">
          <h2>📊 Detailed Flashcard Statistics</h2>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        {/* Summary Stats */}
        <div className="summary-stats">
        <div className="summary-card">
          <div className="summary-value">{summaryStats.total}</div>
          <div className="summary-label">Total Cards</div>
        </div>
        <div className="summary-card mastered">
          <div className="summary-value">🏆 {summaryStats.mastered}</div>
          <div className="summary-label">Mastered</div>
        </div>
        <div className="summary-card learning">
          <div className="summary-value">📚 {summaryStats.learning}</div>
          <div className="summary-label">Learning</div>
        </div>
        <div className="summary-card new">
          <div className="summary-value">🆕 {summaryStats.newCards}</div>
          <div className="summary-label">New</div>
        </div>
        <div className="summary-card">
          <div className="summary-value">{Math.round(summaryStats.avgAccuracy)}%</div>
          <div className="summary-label">Avg Accuracy</div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search by Hanzi, Pinyin, or English..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>Book:</label>
          <select value={filterBook} onChange={(e) => setFilterBook(e.target.value)}>
            <option value="all">All Books</option>
            {books.map(book => (
              <option key={book} value={book}>Book {book}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards Table */}
      <div className="cards-table-container">
        <table className="cards-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('mastery')} className="sortable">
                Status {sortBy === 'mastery' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('hanzi')} className="sortable">
                Hanzi {sortBy === 'hanzi' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th>Pinyin</th>
              <th>English</th>
              <th onClick={() => handleSort('chapter')} className="sortable">
                Book/Ch {sortBy === 'chapter' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('attempts')} className="sortable">
                Attempts {sortBy === 'attempts' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('accuracy')} className="sortable">
                Accuracy {sortBy === 'accuracy' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('lastReviewed')} className="sortable">
                Last Reviewed {sortBy === 'lastReviewed' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedCards.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-results">
                  No cards found matching your filters
                </td>
              </tr>
            ) : (
              filteredAndSortedCards.map((card, index) => (
                <tr key={card.cardKey || index}>
                  <td>
                    <span 
                      className="mastery-badge" 
                      style={{ color: getMasteryColor(card.masteryLevel) }}
                      title={card.masteryLevel}
                    >
                      {getMasteryIcon(card.masteryLevel)}
                    </span>
                  </td>
                  <td className="hanzi-cell">{card.Hanzi}</td>
                  <td className="pinyin-cell">{card.Pinyin}</td>
                  <td className="english-cell">{card.English}</td>
                  <td className="chapter-cell">B{card.Book} Ch{card.Chapter}</td>
                  <td className="attempts-cell">
                    {card.attempts > 0 ? (
                      <span>{card.correctCount}/{card.attempts}</span>
                    ) : (
                      <span className="not-attempted">-</span>
                    )}
                  </td>
                  <td className="accuracy-cell">
                    {card.attempts > 0 ? (
                      <span className={card.accuracy >= 80 ? 'high-accuracy' : card.accuracy >= 50 ? 'medium-accuracy' : 'low-accuracy'}>
                        {Math.round(card.accuracy)}%
                      </span>
                    ) : (
                      <span className="not-attempted">-</span>
                    )}
                  </td>
                  <td className="date-cell">{formatDate(card.lastReviewed)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
};

export default FlashcardStatsDetail;
