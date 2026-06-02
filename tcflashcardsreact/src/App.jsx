import { useState, useCallback, useEffect } from 'react'
import { parseCSV, filterData } from './utils/csvParser'
import { flashcardsApi } from './services/api'
import DataSelector from './components/DataSelector'
import Statistics from './components/Statistics'
import Auth from './components/Auth'
import SpacedRepetitionDrill from './components/SpacedRepetitionDrill'
import ChapterProgressionDrill from './components/ChapterProgressionDrill'
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
  const [isMultipleChoice, setIsMultipleChoice] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load flashcards from Supabase on component mount
  useEffect(() => {
    async function loadFlashcards() {
      try {
        setLoading(true);
        setError(null);
        const data = await flashcardsApi.getAll();

        // Convert Supabase data format to match CSV format
        const formattedData = data.map(card => ({
          Hanzi: card.hanzi,
          Pinyin: card.pinyin,
          English: card.english,
          Book: card.book,
          Chapter: card.chapter,
          Order: card.order_num || card.id // Use id as fallback if order_num doesn't exist
        }));

        setAllData(formattedData);
        setFilteredData(formattedData);
        console.log(`✅ Loaded ${formattedData.length} flashcards from Supabase`);
      } catch (err) {
        console.error('Failed to load flashcards from Supabase:', err);
        setError('Failed to load flashcards. Please check your Supabase connection.');
      } finally {
        setLoading(false);
      }
    }

    loadFlashcards();
  }, []);

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
    // Special drills don't need data filtering
    if (drillType === 'spacedRepetition' || drillType === 'chapterProgression') {
      setCurrentDrill({ type: drillType, data: allData });
      return;
    }

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

  // Show loading state
  if (loading) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>Traditional Chinese Flashcards</h1>
          <p className="subtitle">Master Mandarin with interactive drills</p>
        </header>
        <main className="main-content">
          <div className="data-info">
            ⏳ Loading flashcards from database...
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>Traditional Chinese Flashcards</h1>
          <p className="subtitle">Master Mandarin with interactive drills</p>
        </header>
        <main className="main-content">
          <div className="data-upload-section">
            <div style={{ color: 'red', padding: '20px', textAlign: 'center', fontSize: '18px' }}>
              ❌ {error}
              <br /><br />
              <button onClick={() => window.location.reload()} className="file-upload-label" style={{ fontSize: '16px' }}>
                🔄 Retry Connection
              </button>
            </div>
            <p style={{ marginTop: '20px', color: '#666', textAlign: 'center' }}>
              Please check your internet connection and refresh the page.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (currentDrill) {
    return (
      <div className="app-container">
        <header className="app-header">
          <h1>Traditional Chinese Flashcards</h1>
          <button onClick={exitDrill} className="exit-drill-btn">
            ← Back to Menu
          </button>
        </header>
        {currentDrill.type === 'spacedRepetition' && (
          <SpacedRepetitionDrill data={allData} isMultipleChoice={isMultipleChoice} />
        )}
        {currentDrill.type === 'chapterProgression' && (
          <ChapterProgressionDrill data={allData} isMultipleChoice={isMultipleChoice} />
        )}
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
        {allData.length > 0 && (
          <div className="data-info">
            ✓ Loaded {allData.length} flashcards from database
          </div>
        )}

        <Auth />

        {allData.length > 0 && (
          <>
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

            <section className="drills-section featured-drills">
              <h2>🚀 Recommended Drills</h2>
              <div className="drills-grid featured">
                <div className="drill-card featured" onClick={() => startDrill('spacedRepetition')}>
                  <div className="drill-icon">🧠</div>
                  <h3>Spaced Repetition</h3>
                  <p>Smart review system using the Anki method</p>
                  <span className="drill-badge">Smart</span>
                </div>

                <div className="drill-card featured" onClick={() => startDrill('chapterProgression')}>
                  <div className="drill-icon">📚</div>
                  <h3>Chapter Progression</h3>
                  <p>Systematic learning chapter by chapter</p>
                  <span className="drill-badge">Structured</span>
                </div>
              </div>
            </section>

            <section className="drills-section">
              <h2>📝 Practice Drills</h2>
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

            <DataSelector 
              allData={allData}
              onSelectionChange={handleSelectionChange}
            />

            <Statistics allData={allData} />
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

