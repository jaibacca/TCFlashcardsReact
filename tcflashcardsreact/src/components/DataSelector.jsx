import { useState, useEffect } from 'react';
import { groupByBook } from '../utils/csvParser';
import './DataSelector.css';

const DataSelector = ({ allData, onSelectionChange }) => {
  const [groupedData, setGroupedData] = useState({});
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [expandedBooks, setExpandedBooks] = useState([]);

  useEffect(() => {
    if (allData && allData.length > 0) {
      const grouped = groupByBook(allData);
      setGroupedData(grouped);
      
      const allBooks = Object.keys(grouped);
      setSelectedBooks(allBooks);
      setExpandedBooks(allBooks);
      
      const allChapterKeys = [];
      Object.entries(grouped).forEach(([book, chapters]) => {
        Object.keys(chapters).forEach(chapter => {
          allChapterKeys.push(`${book}-${chapter}`);
        });
      });
      setSelectedChapters(allChapterKeys);
    }
  }, [allData]);

  useEffect(() => {
    onSelectionChange(selectedBooks, selectedChapters);
  }, [selectedBooks, selectedChapters, onSelectionChange]);

  const toggleBook = (book) => {
    const bookChapterKeys = Object.keys(groupedData[book] || {}).map(
      chapter => `${book}-${chapter}`
    );
    const allChaptersSelected = bookChapterKeys.every(key => selectedChapters.includes(key));

    if (allChaptersSelected) {
      // Deselect all chapters in this book
      setSelectedChapters(prevChapters => 
        prevChapters.filter(c => !bookChapterKeys.includes(c))
      );
      setSelectedBooks(prev => prev.filter(b => b !== book));
    } else {
      // Select all chapters in this book
      setSelectedChapters(prevChapters => {
        const newChapters = [...prevChapters];
        bookChapterKeys.forEach(key => {
          if (!newChapters.includes(key)) {
            newChapters.push(key);
          }
        });
        return newChapters;
      });
      if (!selectedBooks.includes(book)) {
        setSelectedBooks(prev => [...prev, book]);
      }
    }
  };

  const toggleChapter = (book, chapter) => {
    const chapterKey = `${book}-${chapter}`;
    const wasSelected = selectedChapters.includes(chapterKey);

    if (wasSelected) {
      // Deselect this chapter
      setSelectedChapters(prev => prev.filter(c => c !== chapterKey));

      // Check if any chapters from this book are still selected
      const otherBookChapters = Object.keys(groupedData[book] || {})
        .map(ch => `${book}-${ch}`)
        .filter(key => key !== chapterKey && selectedChapters.includes(key));

      if (otherBookChapters.length === 0) {
        // Remove book from selected books if no chapters are selected
        setSelectedBooks(prev => prev.filter(b => b !== book));
      }
    } else {
      // Select this chapter
      setSelectedChapters(prev => [...prev, chapterKey]);

      // Add book to selected books if not already there
      if (!selectedBooks.includes(book)) {
        setSelectedBooks(prev => [...prev, book]);
      }
    }
  };

  const toggleBookExpansion = (book) => {
    setExpandedBooks(prev =>
      prev.includes(book)
        ? prev.filter(b => b !== book)
        : [...prev, book]
    );
  };

  const selectAll = () => {
    const allBooks = Object.keys(groupedData);
    setSelectedBooks(allBooks);
    
    const allChapterKeys = [];
    Object.entries(groupedData).forEach(([book, chapters]) => {
      Object.keys(chapters).forEach(chapter => {
        allChapterKeys.push(`${book}-${chapter}`);
      });
    });
    setSelectedChapters(allChapterKeys);
  };

  const deselectAll = () => {
    setSelectedBooks([]);
    setSelectedChapters([]);
  };

  const getSelectedCount = () => {
    let count = 0;
    Object.entries(groupedData).forEach(([book, chapters]) => {
      Object.entries(chapters).forEach(([chapter, entries]) => {
        const chapterKey = `${book}-${chapter}`;
        if (selectedBooks.includes(book) && selectedChapters.includes(chapterKey)) {
          count += entries.length;
        }
      });
    });
    return count;
  };

  if (Object.keys(groupedData).length === 0) {
    return null;
  }

  return (
    <div className="data-selector">
      <div className="selector-header">
        <h3>Select Books & Chapters</h3>
        <div className="selector-actions">
          <button onClick={selectAll} className="select-btn">Select All</button>
          <button onClick={deselectAll} className="deselect-btn">Deselect All</button>
        </div>
      </div>

      <div className="selected-count">
        Selected: {getSelectedCount()} flashcard{getSelectedCount() !== 1 ? 's' : ''}
      </div>

      <div className="books-list">
        {Object.entries(groupedData).map(([book, chapters]) => {
          const bookChapterKeys = Object.keys(chapters).map(ch => `${book}-${ch}`);
          const allChaptersSelected = bookChapterKeys.every(key => selectedChapters.includes(key));
          const isExpanded = expandedBooks.includes(book);
          const isBookSelected = selectedBooks.includes(book);

          return (
            <div key={book} className="book-item">
              <div className="book-header">
                <button
                  className="expand-btn"
                  onClick={() => toggleBookExpansion(book)}
                >
                  {isExpanded ? '▼' : '▶'}
                </button>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={isBookSelected && allChaptersSelected}
                    onChange={() => toggleBook(book)}
                  />
                  <span className="book-name">{book}</span>
                  <span className="item-count">
                    ({Object.values(chapters).reduce((sum, ch) => sum + ch.length, 0)} cards)
                  </span>
                </label>
              </div>

              {isExpanded && (
                <div className="chapters-list">
                  {Object.entries(chapters).map(([chapter, entries]) => {
                    const chapterKey = `${book}-${chapter}`;
                    return (
                      <label key={chapterKey} className="checkbox-label chapter-label">
                        <input
                          type="checkbox"
                          checked={selectedChapters.includes(chapterKey)}
                          onChange={() => toggleChapter(book, chapter)}
                        />
                        <span>Chapter {chapter}</span>
                        <span className="item-count">({entries.length} cards)</span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DataSelector;
