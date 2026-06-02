# 🚀 New Features: Spaced Repetition & Chapter Progression

## Overview

Two powerful new learning drills have been added to help you master Traditional Chinese more effectively:

1. **🧠 Spaced Repetition** - Smart review system using the Anki SM-2 algorithm
2. **📚 Chapter Progression** - Systematic chapter-by-chapter learning

These "Recommended Drills" appear prominently at the top of the main page.

---

## 🧠 Spaced Repetition Drill

### What It Does

The Spaced Repetition drill implements the **Anki SM-2 algorithm** (SuperMemo 2) for optimal memory retention. It automatically schedules card reviews based on how well you know each one.

### How It Works

1. **First Review**: When you see a card for the first time, it's marked as "NEW"
2. **Rate Your Knowledge**: After seeing the answer, rate yourself:
   - **Again** (< 1min) - You forgot it completely
   - **Hard** (6min) - You remembered but it was difficult
   - **Good** (1 day) - You remembered with reasonable effort
   - **Easy** (4 days) - You knew it instantly

3. **Smart Scheduling**: Based on your rating, the algorithm calculates when you should see this card again
4. **Review Queue**: Cards due for review appear automatically

### Rating System

The drill uses a 0-5 quality scale (Anki method):
- **0-1**: Total blackout or incorrect → Reset to beginning
- **2**: Correct but difficult → Short interval
- **3**: Correct with reasonable effort → Normal interval
- **4**: Perfect recall → Longer interval
- **5**: Too easy → Much longer interval

### Intervals

- **Again**: Less than 1 minute (retry immediately)
- **Hard**: 6 minutes (review soon)
- **Good**: 1 day → 6 days → increasing intervals
- **Easy**: 4 days → much longer intervals

### Session Summary

At the end of each session, you'll see:
- Total cards reviewed
- Overall accuracy
- Breakdown by rating (Again, Hard, Good, Easy)

### Storage

- Review data stored in `localStorage` as `tcFlashcardsReviewData`
- Each card tracks:
  - Ease factor (difficulty multiplier)
  - Current interval
  - Next review date
  - Total number of reviews
  - Last review timestamp

---

## 📚 Chapter Progression Drill

### What It Does

The Chapter Progression drill helps you learn systematically by working through the material chapter by chapter, in order.

### How It Works

1. **Automatic Chapter Selection**: The drill automatically starts with the first incomplete chapter
2. **Progress Through Book/Chapter**: Shows "Book X - Chapter Y" prominently
3. **Complete Chapter**: Work through all cards in the chapter
4. **Move to Next**: Click "Continue to Next Chapter" when done
5. **Tracks Progress**: Remembers which chapters you've completed

### Features

- **Structured Learning**: Cards presented in logical book/chapter order
- **Progress Tracking**: Shows current card number (e.g., "5 / 20")
- **Session Accuracy**: Live accuracy percentage as you progress
- **Chapter Summary**: See your performance when you complete a chapter
  - Cards correct
  - Total cards
  - Accuracy percentage

### Storage

- Chapter progress stored in `localStorage` as `tcFlashcardsChapterProgress`
- Each chapter tracks:
  - Completion status
  - Accuracy
  - Last studied date
  - Number of attempts

### Completion Behavior

When you complete a chapter:
1. Progress is saved
2. Summary screen shows your performance
3. "Continue to Next Chapter" button advances to the next incomplete chapter
4. If all chapters complete, starts over from the beginning

---

## 🎨 UI Improvements

### New Layout

The UI has been reorganized for better learning flow:

```
┌─────────────────────────────────────────┐
│  Header & Auth                          │
├─────────────────────────────────────────┤
│  Multiple Choice Toggle                 │
├─────────────────────────────────────────┤
│  🚀 RECOMMENDED DRILLS (Featured)       │
│  ┌──────────────┐  ┌──────────────┐    │
│  │ 🧠 Spaced    │  │ 📚 Chapter   │    │
│  │ Repetition   │  │ Progression  │    │
│  └──────────────┘  └──────────────┘    │
├─────────────────────────────────────────┤
│  📝 PRACTICE DRILLS                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐          │
│  │漢→ │ │pīn→│ │pīn→│ │Eng→│          │
│  │Pīn│ │Eng│ │漢  │ │漢  │          │
│  └────┘ └────┘ └────┘ └────┘          │
├─────────────────────────────────────────┤
│  Data Selector                          │
├─────────────────────────────────────────┤
│  Statistics                             │
└─────────────────────────────────────────┘
```

### Featured Drills Styling

- **Prominent Position**: Top of the page for easy access
- **Larger Cards**: 300px minimum width vs 250px for practice drills
- **Special Gradient**: Orange/red gradient instead of purple
- **Badges**: "Smart" and "Structured" labels
- **Enhanced Hover**: More dramatic lift and glow effect

### Visual Indicators

**Spaced Repetition:**
- 🆕 "NEW" badge for cards you haven't seen before
- 🔄 "Review #X" badge showing how many times you've reviewed a card
- Color-coded rating buttons:
  - Red for "Again"
  - Orange for "Hard"
  - Green for "Good"
  - Blue for "Easy"

**Chapter Progression:**
- 📚 Chapter indicator: "Book X - Chapter Y"
- Progress bar showing completion within chapter
- Live accuracy counter
- Prominent chapter title throughout the drill

---

## 🎯 Usage Recommendations

### When to Use Spaced Repetition

- **Daily Review**: Start each study session with spaced repetition
- **Long-term Retention**: Best for cards you want to remember forever
- **Efficient Learning**: Focus on cards you're about to forget
- **Mixed Content**: Reviews cards from all books/chapters

### When to Use Chapter Progression

- **First-time Learning**: When encountering new material
- **Systematic Study**: Following a textbook or course
- **Chapter Mastery**: Want to thoroughly learn one chapter before moving on
- **Structured Progress**: Prefer organized, sequential learning

### Complementary Use

**Recommended Learning Flow:**

1. **Start with Chapter Progression**: Learn new material chapter by chapter
2. **Switch to Spaced Repetition**: Review previously learned cards
3. **Use Practice Drills**: Focus on specific skills (writing, reading, etc.)
4. **Return to Chapter Progression**: Learn next chapter
5. **Repeat**

This creates a learning loop:
```
New Material (Chapter) → Review (Spaced Rep) → Practice (Drills) → Repeat
```

---

## 📊 How Progress is Tracked

### Spaced Repetition Data

Stored in `localStorage.tcFlashcardsReviewData`:
```json
{
  "你_nǐ": {
    "easeFactor": 2.5,
    "interval": 6,
    "nextReviewDate": "2024-01-15T10:00:00.000Z",
    "reviews": 3,
    "lastReview": "2024-01-09T10:00:00.000Z"
  }
}
```

### Chapter Progression Data

Stored in `localStorage.tcFlashcardsChapterProgress`:
```json
{
  "1_1": {
    "completed": true,
    "accuracy": 85,
    "lastStudied": "2024-01-10T15:30:00.000Z",
    "attempts": 2
  }
}
```

### Integration with Statistics

Both drills update the main statistics tracking:
- Card history (attempts, correct count)
- Overall accuracy
- Last reviewed timestamp

---

## 🔄 Sync with Authentication

If you're signed in:
- ✅ Spaced repetition schedules sync across devices
- ✅ Chapter progress syncs across devices
- ✅ You can start a chapter on your laptop and continue on your phone
- ✅ Review cards that come due on any device

---

## 🎓 Learning Science

### Why Spaced Repetition Works

Based on the **spacing effect** and **testing effect**:
1. **Spacing Effect**: Information is better retained when review sessions are spaced out over time
2. **Testing Effect**: Actively recalling information strengthens memory more than passive review
3. **Difficulty Levels**: Harder recalls create stronger memories

The SM-2 algorithm is proven effective in apps like Anki, used by millions of learners worldwide.

### Why Chapter Progression Works

Based on **scaffolding** and **mastery learning**:
1. **Scaffolding**: Building knowledge in logical sequence
2. **Mastery Learning**: Ensuring understanding before moving forward
3. **Context**: Learning related words together aids retention
4. **Completion**: Finishing chapters provides motivation and sense of progress

---

## 🛠️ Technical Implementation

### Files Created

1. **SpacedRepetitionDrill.jsx** - Component for SRS drill
2. **SpacedRepetitionDrill.css** - Styling for SRS drill
3. **ChapterProgressionDrill.jsx** - Component for chapter drill
4. **ChapterProgressionDrill.css** - Styling for chapter drill

### Files Modified

1. **App.jsx** - Added new drills, reorganized UI
2. **App.css** - Added featured drill styling

### SM-2 Algorithm Implementation

The `calculateNextReview()` function in `SpacedRepetitionDrill.jsx` implements:
- Ease factor calculation: `EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))`
- Interval calculation based on previous interval and ease factor
- Minimum ease factor of 1.3 to prevent cards from becoming too difficult

---

## 📱 Mobile Responsive

Both new drills are fully responsive:
- **Hanzi Display**: Scales from 96px → 64px (tablet) → 48px (mobile)
- **Rating Buttons**: Grid layout adapts to screen size (4 columns → 2 columns on mobile)
- **Progress Indicators**: Stack vertically on small screens

---

## 🚀 Quick Start

1. **Open the app** at http://localhost:5173 (or your deployed URL)
2. **See the new drills** at the top of the page
3. **Click "🧠 Spaced Repetition"** to start smart reviews
4. **Or click "📚 Chapter Progression"** to learn systematically
5. **Rate your knowledge** honestly for best results
6. **Return daily** for spaced repetition reviews

---

## 🎉 Benefits

### For Beginners
- **Chapter Progression** provides a clear learning path
- **Structured progress** reduces overwhelm
- **Visual feedback** shows improvement

### For Advanced Learners
- **Spaced Repetition** maintains large vocabularies efficiently
- **Optimized timing** focuses on cards you're about to forget
- **Data-driven** approach maximizes retention

### For All Users
- **Automatic scheduling** - no manual planning needed
- **Cross-device sync** - study anywhere
- **Proven algorithms** - based on learning science
- **Comprehensive tracking** - see your progress

---

## 💡 Tips for Success

1. **Be Honest with Ratings**: Don't overestimate your knowledge
2. **Review Daily**: Consistency is key for spaced repetition
3. **Complete Chapters**: Don't skip ahead too quickly
4. **Use Both Drills**: They complement each other
5. **Track Your Stats**: Watch your accuracy improve over time

---

## 🔜 Future Enhancements

Potential future improvements:
- Custom study sessions (cram mode, specific difficulty)
- Adjustable algorithm parameters
- Study reminders/notifications
- Study streak tracking
- Leaderboards
- Card tagging and custom decks

---

**Happy Learning! 🎓✨**

Your journey to Traditional Chinese mastery just got smarter and more structured!
