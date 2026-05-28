# New Features - How to Use

## 1. Stable Multiple Choice Options ✅

### What Changed:
Previously, clicking on multiple choice answers would cause options to shift around or change completely. Now they stay fixed in place.

### How It Works:
1. Start any drill in multiple choice mode
2. Click on any answer option
3. Notice the options stay in their original positions
4. You can change your selection without options moving

### Why This Matters:
- Easier to compare options side-by-side
- Less confusing when making selections
- Better user experience overall

---

## 2. Improved Book/Chapter Selection 📚

### What Changed:
Books can now be expanded even when not selected, making it easy to select individual chapters.

### How to Use:

#### Selecting an Entire Book:
1. Click the checkbox next to a book name
2. All chapters in that book are automatically selected
3. The book remains expandable to see what's included

#### Selecting Individual Chapters:
1. Click the ▶ arrow to expand a book (works even if book is unchecked)
2. Check/uncheck individual chapter checkboxes
3. The book checkbox updates automatically based on chapter selections

#### Smart Selection Behavior:
- Select all chapters in a book → Book checkbox becomes checked
- Deselect all chapters in a book → Book checkbox becomes unchecked
- Select some chapters → Book checkbox reflects partial selection

### Example Workflow:

**Scenario**: You want to study only Chapter 2 from Book 1 and Chapter 3 from Book 2.

**Old Way** (didn't work well):
1. Select Book 1 (selects ALL chapters)
2. Deselect Chapter 1, Chapter 3, Chapter 4... (tedious!)
3. Select Book 2
4. Deselect all chapters except Chapter 3

**New Way** (much easier!):
1. Click "Deselect All" button
2. Expand Book 1 (even though it's unchecked)
3. Check Chapter 2 only
4. Expand Book 2
5. Check Chapter 3 only
6. Done! ✨

---

## 3. Statistics & Progress Tracking 📊

### Overview
Track your learning progress with comprehensive statistics that help you understand your strengths and areas for improvement.

### Statistics Dashboard Location:
The statistics panel appears on the main page, right after loading your CSV data and before the Book/Chapter selector.

### What You'll See:

#### A. Overview Cards (Top Row)
Four key metrics displayed in colorful cards:

1. **Overall Accuracy** (Large pink card)
   - Your success rate across all attempts
   - Formula: (Total Correct / Total Attempts) × 100%
   - Example: 45 correct out of 60 attempts = 75% accuracy

2. **Total Attempts** (Purple card)
   - How many questions you've answered
   - Counts all attempts across all drill types
   - Example: 60 attempts

3. **Mastered Cards** (Purple card)
   - Cards you know well (≥3 correct with ≥80% accuracy)
   - These need less frequent review
   - Example: 12 cards mastered

4. **Learning Cards** (Purple card)
   - Cards you've practiced but haven't mastered
   - Focus your study here
   - Example: 8 cards learning

#### B. Study Streak (Orange Bar)
- 🔥 Current streak: Consecutive days studied
- 🏆 Longest streak: Your personal record
- Updates automatically when you study on a new day

#### C. Drill Performance (Grid of Cards)
Shows individual stats for each drill type:
- Attempts count
- Correct answers count
- Accuracy percentage with color coding:
  - 🟢 Green (≥80%): Excellent
  - 🟡 Orange (60-79%): Good
  - 🔴 Red (<60%): Needs work
- Visual progress bar

#### D. Card Mastery Progress (Bottom Section)
- Color-coded progress bar:
  - 🟢 Green = Mastered
  - 🔵 Blue = Learning
  - ⚪ Gray = New (not studied yet)
- Legend showing counts of each category

### How Statistics Are Tracked:

#### When You Practice:
1. Answer a question
2. Click "Check Answer"
3. Statistics update immediately:
   - ✅ If correct: Adds to both attempts and correct count
   - ❌ If incorrect: Adds to attempts only
   - 💾 Saved instantly to browser storage

#### What Gets Tracked:
- **Per Drill**: Attempts, correct answers, accuracy for each drill type
- **Per Card**: Individual card history for spaced repetition
- **Daily Streak**: Consecutive days of study
- **Overall Progress**: Total mastered and learning cards

### Using Statistics Effectively:

#### 1. Identify Problem Areas
```
Example Reading:
Hanzi → Pinyin: 85% accuracy (green) ✓ Strong
Pinyin → English: 72% accuracy (orange) → Practice more
Pinyin → Hanzi: 45% accuracy (red) ❗ Focus here
English → Hanzi: 50% accuracy (red) ❗ Focus here
```
**Action**: Spend more time on writing drills (3 & 4)

#### 2. Track Improvement Over Time
```
Week 1: Overall Accuracy 60%
Week 2: Overall Accuracy 68%
Week 3: Overall Accuracy 75%
```
**Result**: Clear upward trend! 📈

#### 3. Build Study Habits
```
Goal: 7-day streak
Current: 3 days
Action: Study daily to build consistency
```

#### 4. Monitor Card Mastery
```
20 total flashcards:
- 5 mastered (25%)
- 10 learning (50%)
- 5 new (25%)

Goal: Get all 20 to mastered status
```

### Managing Statistics:

#### Clear Statistics:
1. Click the red "Clear Stats" button (top right)
2. Confirm in the popup dialog
3. All statistics reset to zero
4. ⚠️ **Warning**: Cannot be undone!

#### When to Clear:
- Starting with a new vocabulary set
- Beginning a new semester/course
- Want to reset your progress

#### Data Persistence:
- Statistics save automatically
- Stored in browser's localStorage
- Persist between sessions
- Separate for each browser/device
- Clearing browser data will erase stats

---

## Quick Tips 💡

### For Multiple Choice:
- Options now stay put - take your time to read all choices
- Your selected answer is highlighted in the accent color
- Can change selection before submitting

### For Book/Chapter Selection:
- Use "Deselect All" then select specific chapters for focused practice
- Expand books freely to see what's available
- Selected card count updates in real-time

### For Statistics:
- Check stats regularly to guide your study sessions
- Focus on drills with lower accuracy
- Celebrate milestones (streaks, mastered cards)
- Don't worry if accuracy is low initially - it improves with practice!

---

## Common Questions

**Q: My multiple choice options changed when I refreshed. Is that a bug?**
A: No! Options are stable within a session, but randomized between sessions for better learning.

**Q: Why can't I start a drill with no chapters selected?**
A: You need to select at least one chapter. The app will show an alert if you try.

**Q: Do statistics track in free-text mode too?**
A: Yes! Statistics track in both multiple choice and free-text input modes.

**Q: What happens to my streak if I miss a day?**
A: Current streak resets to 1 the next time you study. Your longest streak record is always saved.

**Q: Can I export my statistics?**
A: Not yet, but you can view all stats in the dashboard. This might be a future feature!

**Q: Will changing browsers lose my statistics?**
A: Yes, statistics are per-browser. Consider using the same browser for consistent tracking.

---

## Getting Started with New Features

1. **Load your data** (upload CSV)
2. **Check your statistics** (initially all zeros)
3. **Select what to study** (expand books, pick chapters)
4. **Choose a drill and practice**
5. **Check your updated stats** (go back to main menu)
6. **Track your progress over time** 📈

Enjoy the improved learning experience! 加油！(jiā yóu!)
