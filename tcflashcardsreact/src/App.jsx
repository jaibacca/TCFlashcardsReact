import { useState, useCallback } from 'react'
import { parseCSV, filterData } from './utils/csvParser'
import DataSelector from './components/DataSelector'
import Statistics from './components/Statistics'
import HanziToPinyinDrill from './components/HanziToPinyinDrill'
import PinyinToEnglishDrill from './components/PinyinToEnglishDrill'
import PinyinToHanziDrill from './components/PinyinToHanziDrill'
import EnglishToHanziDrill from './components/EnglishToHanziDrill'
import './App.css'

function App() {
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [currentDrill, setCurrentDrill] = useState(null);
  const [isMultipleChoice, setIsMultipleChoice] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsedData = parseCSV(text);
      setAllData(parsedData);
      setFilteredData(parsedData);
    };
    reader.readAsText(file);
  };

  const handleSelectionChange = useCallback((books, chapters) => {
    setSelectedBooks(books);
    setSelectedChapters(chapters);
    const filtered = filterData(allData, books, chapters);
    setFilteredData(filtered);
  }, [allData]);

  const startDrill = (drillType) => {
    if (filteredData.length === 0) {
      alert('Please load data and select at least one book/chapter first.');
      return;
    }

    const shuffled = [...filteredData].sort(() => Math.random() - 0.5);
    setCurrentDrill({ type: drillType, data: shuffled });
  };

  const exitDrill = () => {
    setCurrentDrill(null);
  };

  if (currentDrill) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>Traditional Chinese Flashcards</h1>
          <button onClick={exitDrill} className="exit-drill-btn">
            ← Back to Menu
          </button>
        </header>
        {currentDrill.type === 'hanziToPinyin' && (
          <HanziToPinyinDrill data={currentDrill.data} isMultipleChoice={isMultipleChoice} />
        )}
        {currentDrill.type === 'pinyinToEnglish' && (
          <PinyinToEnglishDrill data={currentDrill.data} isMultipleChoice={isMultipleChoice} />
        )}
        {currentDrill.type === 'pinyinToHanzi' && (
          <PinyinToHanziDrill data={currentDrill.data} isMultipleChoice={isMultipleChoice} />
        )}
        {currentDrill.type === 'englishToHanzi' && (
          <EnglishToHanziDrill data={currentDrill.data} isMultipleChoice={isMultipleChoice} />
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Traditional Chinese Flashcards</h1>
        <p className="subtitle">Master Mandarin with interactive drills</p>
      </header>

      <main className="main-content">
        <section className="data-upload-section">
          <h2>Load Your Data</h2>
          <div className="upload-area">
            <label htmlFor="file-upload" className="file-upload-label">
              📁 Upload CSV File
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="file-input"
            />
            <p className="upload-hint">
              CSV should have columns: Hanzi, Pinyin, English, Book, Chapter, Order
            </p>
          </div>
          {allData.length > 0 && (
            <div className="data-info">
              ✓ Loaded {allData.length} flashcards
            </div>
          )}
        </section>

        {allData.length > 0 && (
          <>
            <Statistics allData={allData} />

            <DataSelector 
              allData={allData}
              onSelectionChange={handleSelectionChange}
            />

            <section className="options-section">
              <div className="toggle-option">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={isMultipleChoice}
                    onChange={(e) => setIsMultipleChoice(e.target.checked)}
                  />
                  <span>Multiple Choice Mode</span>
                </label>
              </div>
            </section>

            <section className="drills-section">
              <h2>Select a Drill</h2>
              <div className="drills-grid">
                <div className="drill-card" onClick={() => startDrill('hanziToPinyin')}>
                  <div className="drill-icon">漢</div>
                  <h3>Hanzi → Pinyin + English</h3>
                  <p>Given the character, provide the pinyin and definition</p>
                </div>

                <div className="drill-card" onClick={() => startDrill('pinyinToEnglish')}>
                  <div className="drill-icon">pīn</div>
                  <h3>Pinyin → English</h3>
                  <p>Given the pinyin, provide the English definition</p>
                </div>

                <div className="drill-card" onClick={() => startDrill('pinyinToHanzi')}>
                  <div className="drill-icon">✍️</div>
                  <h3>Pinyin → Hanzi</h3>
                  <p>Given the pinyin, write the correct character</p>
                </div>

                <div className="drill-card" onClick={() => startDrill('englishToHanzi')}>
                  <div className="drill-icon">🖊️</div>
                  <h3>English → Hanzi</h3>
                  <p>Given the definition, write the correct character</p>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>Traditional Chinese Learning Platform © 2024</p>
      </footer>
    </div>
  )
}

export default App

