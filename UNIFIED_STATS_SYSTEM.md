# Unified Card Statistics System

## Overview
All drills now contribute to a **single, unified stats record** for each flashcard. This means if you practice the same word in different drills, all attempts count towards that card's overall mastery progress.

## Key Improvements

### Before (Old System)
- Each drill tracked stats separately
- Card stats were identified by index (unreliable)
- Same card in different drills = different stat entries
- No way to see overall card mastery across all practice types 

### After (New System)
- **Unified card identification**: Each card is identified by `Hanzi_Pinyin` (e.g., `你_nǐ`)
- **Cross-drill stats**: All drills update the same card record
- **Accurate mastery tracking**: See true card progress regardless of drill type
- **Better learning insights**: Know which specific cards need more practice

## Card Key Format

Each card is uniquely identified by:
```javascript
cardKey = `${card.Hanzi}_${card.Pinyin}`
// Example: "你_nǐ"
```

This ensures the same card is tracked consistently across:
- ✅ Hanzi → Pinyin + English drill
- ✅ Pinyin → English drill
- ✅ Pinyin → Hanzi drill
- ✅ English → Hanzi drill
- ✅ Chapter Progression drill
- ✅ Spaced Repetition drill

## How It Works

### Example Scenario
1. **Chapter Progression**: Answer "你" correctly → Card stats: 1 attempt, 1 correct
2. **Pinyin to English**: Answer "你" incorrectly → Card stats: 2 attempts, 1 correct (50% accuracy)
3. **Spaced Repetition**: Answer "你" correctly → Card stats: 3 attempts, 2 correct (67% accuracy)

All three practice sessions contribute to the same card's history!

## Card Mastery Criteria

A card is considered **"Mastered"** when:
- ✅ At least 3 correct answers
- ✅ At least 80% accuracy overall
- ✅ Tracked across ALL drills

This means you need to prove consistent knowledge, not just get lucky once.

## Statistics Structure

### `tcFlashcardsStats` (localStorage)
```javascript
{
  drills: {
    hanziToPinyin: { attempts: 0, correct: 0, totalTime: 0 },
    pinyinToEnglish: { attempts: 0, correct: 0, totalTime: 0 },
    pinyinToHanzi: { attempts: 0, correct: 0, totalTime: 0 },
    englishToHanzi: { attempts: 0, correct: 0, totalTime: 0 },
    spacedRepetition: { attempts: 0, correct: 0, totalTime: 0 },
    chapterProgression: { attempts: 0, correct: 0, totalTime: 0 }
  },
  cardHistory: {
    "你_nǐ": {
      attempts: 5,
      correctCount: 4,
      lastReviewed: "2024-01-15T10:30:00.000Z"
    },
    "好_hǎo": {
      attempts: 3,
      correctCount: 2,
      lastReviewed: "2024-01-15T09:15:00.000Z"
    }
    // ... more cards
  },
  streaks: {
    current: 7,
    longest: 12,
    lastStudyDate: "2024-01-15"
  },
  totalCards: 500
}
```

## New Utility Functions

### `statsUtils.js`

#### `getCardKey(card)`
Generate consistent card key from flashcard object.
```javascript
const key = getCardKey({ Hanzi: '你', Pinyin: 'nǐ' });
// Returns: "你_nǐ"
```

#### `updateCardStats(card, isCorrect, drillType)`
Update stats for a card (called by all drills).
```javascript
updateCardStats(currentCard, true, 'hanziToPinyin');
// Updates both drill stats and unified card history
```

#### `getCardStats(card)`
Retrieve stats for a specific card.
```javascript
const stats = getCardStats(currentCard);
// Returns: { attempts: 5, correctCount: 4, lastReviewed: "..." }
```

#### `isCardMastered(card)`
Check if a card meets mastery criteria.
```javascript
const mastered = isCardMastered(currentCard);
// Returns: true if 3+ correct with 80%+ accuracy
```

## Benefits

### 1. **Accurate Progress Tracking**
- See which cards you truly know vs. just got lucky on
- Identify weak cards that need more practice across all drill types

### 2. **Better Learning Experience**
- Your Spaced Repetition queue reflects your actual knowledge
- Mastered cards status is based on comprehensive practice

### 3. **Unified Dashboard**
- Statistics component shows real card mastery
- "Mastered Cards" count reflects true proficiency

### 4. **Cross-Device Sync**
- All card stats sync to Supabase cloud
- Progress persists across devices and browsers

## Migration Notes

### Existing Users
If you have existing stats:
- Old stats will continue to work
- New format will start being used immediately
- Old index-based card IDs won't be updated retroactively
- Consider using "Clear Stats" to start fresh with the new system

### Developers
All drill components now:
```javascript
import { updateCardStats, getCardKey } from '../utils/statsUtils';

// In your checkAnswer function:
updateCardStats(currentCard, isCorrect, 'drillTypeName');
```

The old `updateStatistics` function has been removed from `Statistics.jsx`.

## Technical Details

### Card Key Consistency
- Uses `Hanzi_Pinyin` format for uniqueness
- Same format across all components:
  - Drills (6 types)
  - Review data (SRS system)
  - Chapter progress tracking
  
### Data Persistence
1. **localStorage** (browser cache): `tcFlashcardsStats`
2. **Supabase cloud** (when logged in): `user_progress.stats_data`
3. **Automatic sync**: Changes save to cloud immediately

### Backward Compatibility
- Old `updateStatistics` calls replaced with `updateCardStats`
- Old stats structure still loads (won't break existing data)
- New drills (Spaced Repetition, Chapter Progression) already using new system

## Troubleshooting

### Stats Not Updating
1. Check browser console for errors
2. Verify localStorage has `tcFlashcardsStats` key
3. Check card has `Hanzi` and `Pinyin` properties
4. Clear cache and reload if needed

### Duplicate Card Entries
- Ensure all drills use `getCardKey()` utility
- Check for typos in Hanzi/Pinyin (e.g., different tone marks)
- Old index-based keys won't merge with new Hanzi_Pinyin keys

### Mastered Count Seems Wrong
- Old stats may have used index-based keys
- Consider clearing stats to start fresh
- New system will track accurately going forward

## Future Enhancements

Potential improvements:
- [ ] Migration script to convert old index-based keys to Hanzi_Pinyin
- [ ] Card difficulty rating based on cross-drill performance
- [ ] Smart drill recommendations based on weak cards
- [ ] Card learning curve graphs over time
- [ ] Export/import stats feature

## Summary

The unified card statistics system ensures that **every practice session contributes to a single, accurate picture of your mastery** for each flashcard. This creates a more reliable learning experience and helps you focus on the cards that truly need more practice.

---

**Last Updated**: January 2024
**Version**: 2.0
**Related Files**:
- `TCFlashcardsReact/src/utils/statsUtils.js`
- `TCFlashcardsReact/src/components/Statistics.jsx`
- All drill components (6 total)
