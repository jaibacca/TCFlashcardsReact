# Traditional Chinese Flashcards

A React-based web application for learning Traditional Chinese (Mandarin) using interactive flashcards, similar to Anki.

## Features

### Four Learning Drills

1. **Hanzi → Pinyin + English**: Given a Chinese character, identify the correct pinyin (with tones) and English definition
2. **Pinyin → English**: Given the pinyin romanization, identify the English definition
3. **Pinyin → Hanzi**: Given the pinyin, write the correct Chinese character using stroke recognition
4. **English → Hanzi**: Given the English definition, write the correct Chinese character using stroke recognition

### Additional Features

- **📊 Comprehensive Statistics & Progress Tracking**: 
  - Overall accuracy and performance metrics
  - Per-drill statistics with visual feedback
  - Study streak tracking (consecutive days)
  - Card mastery levels (new, learning, mastered)
  - Persistent local storage
- **📚 Flexible Book & Chapter Selection**: 
  - Expand books even when unselected
  - Easy individual chapter selection
  - Smart selection behavior
- **✅ Stable Multiple Choice Options**: 
  - Options stay in fixed positions
  - No shifting or regeneration during use
- **CSV Data Import**: Load your vocabulary from CSV files
- **Stroke Recognition Canvas**: Draw Chinese characters for drills 3 and 4
- **Session Progress Tracking**: View your score during each drill
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

### Using the Application

1. **Load Data**: Click "Upload CSV File" and select a CSV file with your vocabulary
2. **Select Content**: Choose which books and chapters you want to study
3. **Choose Mode**: Toggle "Multiple Choice Mode" if you prefer multiple choice questions
4. **Start a Drill**: Click on one of the four drill types to begin
5. **Practice**: Answer the questions and track your progress

### CSV Format

Your CSV file should have the following columns:

```
Hanzi,Pinyin,English,Book,Chapter,Order
```

Example:
```csv
Hanzi,Pinyin,English,Book,Chapter,Order
你好,nǐ hǎo,hello,Book 1,1,1
謝謝,xiè xie,thank you,Book 1,1,2
再見,zài jiàn,goodbye,Book 1,1,3
```

A sample CSV file (`sample-data.csv`) is included in the project root.

## Project Structure

```
TCFlashcardsReact/
├── src/
│   ├── components/
│   │   ├── HanziToPinyinDrill.jsx      # Drill 1: Hanzi → Pinyin + English
│   │   ├── PinyinToEnglishDrill.jsx    # Drill 2: Pinyin → English
│   │   ├── PinyinToHanziDrill.jsx      # Drill 3: Pinyin → Hanzi (stroke input)
│   │   ├── EnglishToHanziDrill.jsx     # Drill 4: English → Hanzi (stroke input)
│   │   ├── StrokeInput.jsx             # Canvas component for drawing characters
│   │   ├── DataSelector.jsx            # Book/Chapter selection component
│   │   └── *.css                       # Component styles
│   ├── utils/
│   │   └── csvParser.js                # CSV parsing and data utilities
│   ├── App.jsx                         # Main application component
│   ├── App.css                         # Main application styles
│   └── main.jsx                        # Application entry point
├── sample-data.csv                     # Sample vocabulary data
└── package.json
```

## Technologies Used

- **React 19**: UI framework
- **Vite**: Build tool and development server
- **HTML5 Canvas**: For stroke recognition input
- **CSS3**: Styling and animations

## Features in Detail

### Stroke Recognition

Drills 3 and 4 include a canvas-based stroke input system where you can:
- Draw Chinese characters with your mouse or touch screen
- Undo individual strokes
- Clear the canvas
- Compare your drawing with the correct character

### Statistics & Progress Tracking

The Statistics Dashboard provides:
- **Overall Metrics**: Accuracy percentage, total attempts, mastered cards, learning cards
- **Study Streaks**: Track consecutive days of study with current and longest streak
- **Per-Drill Performance**: Individual stats for each drill type with color-coded accuracy
- **Card Mastery Progress**: Visual progress bar showing distribution of new, learning, and mastered cards
- **Persistent Storage**: All statistics saved locally in browser
- **Clear Stats Option**: Reset progress when starting fresh

**How It Works**:
- Statistics update automatically after each answer
- Cards become "mastered" after ≥3 correct attempts with ≥80% accuracy
- Streaks increment daily when you study on consecutive days
- View detailed breakdown to identify areas for improvement

### Data Selection

The Data Selector allows you to:
- **Expand any book** to view chapters (even if book is unselected)
- **Select individual chapters** easily without selecting entire books first
- **Smart selection**: Book selection updates automatically based on chapter selections
- View flashcard counts for each book and chapter
- Use "Select All" / "Deselect All" for quick selection

### Multiple Choice Mode

When enabled:
- Instead of typing answers, select from 4 options
- **Options stay in fixed positions** (won't shift when clicking)
- Options are randomly generated from your dataset
- Reduces typing but increases recognition skills

## Additional Documentation

- **[NEW_FEATURES_GUIDE.md](NEW_FEATURES_GUIDE.md)**: Detailed guide for new features
- **[STATISTICS_GUIDE.md](STATISTICS_GUIDE.md)**: Complete statistics feature explanation
- **[UPDATE_SUMMARY.md](UPDATE_SUMMARY.md)**: Technical summary of recent updates
- **[QUICKSTART.md](QUICKSTART.md)**: Quick start guide for new users

## Building for Production

```bash
npm run build
```

The production build will be created in the `dist/` directory.

## License

MIT License - feel free to use and modify for your learning needs!

