# Quick Start Guide

## Running the Application

1. Open a terminal in the `TCFlashcardsReact` directory

2. Install dependencies (first time only):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## First Steps

1. **Upload Sample Data**
   - Click "📁 Upload CSV File"
   - Select the `sample-data.csv` file included in the project
   - You should see "✓ Loaded 20 flashcards"

2. **Select What to Study**
   - The Book & Chapter selector will appear
   - By default, all content is selected
   - You can deselect specific books or chapters if desired

3. **Choose Your Mode**
   - Toggle "Multiple Choice Mode" on or off
   - Multiple choice is easier for beginners

4. **Start Learning**
   - Click on any of the 4 drill cards:
     * **Hanzi → Pinyin + English** (Easiest)
     * **Pinyin → English** (Easy)
     * **Pinyin → Hanzi** (Hard - requires writing)
     * **English → Hanzi** (Hardest - requires writing)

## Tips for Each Drill

### Drill 1: Hanzi → Pinyin + English
- Look at the Chinese character
- Type (or select) the pinyin with correct tones
- Type (or select) the English meaning
- Press "Check Answer" to verify

### Drill 2: Pinyin → English
- Read the pinyin romanization
- Type (or select) the English meaning
- Great for pronunciation practice!

### Drill 3 & 4: Writing Characters
**Multiple Choice Mode:**
- Select the correct character from 4 options

**Free Input Mode:**
- Draw the character on the canvas using your mouse/touchscreen
- Use "Undo" to remove the last stroke
- Use "Clear" to start over
- Click "Submit" when done
- Compare your drawing with the correct character

## Creating Your Own Vocabulary

1. Create a CSV file with these columns:
   ```
   Hanzi,Pinyin,English,Book,Chapter,Order
   ```

2. Add your vocabulary:
   ```csv
   你好,nǐ hǎo,hello,Greetings,1,1
   早安,zǎo ān,good morning,Greetings,1,2
   ```

3. Upload your CSV file in the application

## Pinyin Tone Marks

Use these tone marks in your CSV and when typing answers:
- First tone (high level): ā ē ī ō ū ǖ
- Second tone (rising): á é í ó ú ǘ
- Third tone (low dipping): ǎ ě ǐ ǒ ǔ ǚ
- Fourth tone (falling): à è ì ò ù ǜ
- Neutral tone: a e i o u ü (no mark)

## Keyboard Shortcuts

- **Enter**: Submit answer or move to next card (when answer is shown)
- **Esc**: (future feature) Exit drill

## Troubleshooting

**Problem**: Canvas drawing doesn't work on mobile
- **Solution**: Make sure you're using touch gestures, not hover

**Problem**: Pinyin tones not matching
- **Solution**: Check that you're using the correct tone marks (ā á ǎ à)

**Problem**: No data appears after upload
- **Solution**: Check that your CSV has the correct column names (case-sensitive)

## Next Steps

1. Study with the sample data to learn how each drill works
2. Create your own vocabulary CSV for your textbook or course
3. Practice regularly - consistency is key to language learning!
4. Use multiple drill types to reinforce learning from different angles

Enjoy learning Traditional Chinese! 加油！(jiā yóu - Keep it up!)
