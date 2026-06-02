# 🧠 Spaced Repetition Drill Update

## ✅ Changes Made

### **New Behavior:**
The Spaced Repetition drill now:
- ✅ **Reviews only previously seen cards** (no NEW cards)
- ✅ **Limits to 20 cards maximum** per session
- ✅ **Shows only cards that are due for review** (based on SRS schedule)
- ✅ **Randomly selects from due cards** (up to 20)

---

## 📊 Before vs After

### Before:
```
- Showed ALL cards from database
- Included NEW cards (never reviewed)
- Could have 500+ cards in queue
- Overwhelming for users
```

### After:
```
- Shows only previously reviewed cards
- No NEW cards (use Chapter Progression for new cards)
- Maximum 20 cards per session
- Focused, manageable review sessions
```

---

## 🎯 Review Queue Logic

### Card Selection Criteria:
1. **Must have been reviewed before** (has review data in localStorage)
2. **Must be due for review** (`nextReviewDate <= now`)
3. **Shuffled randomly** from qualifying cards
4. **Limited to 20 cards** maximum

### Code Flow:
```javascript
1. Load all flashcards from database
2. Check each card's review history (localStorage)
3. If card has review data AND is due → add to queue
4. Shuffle the queue
5. Take first 20 cards
6. Start review session
```

---

## 💡 User Experience

### New Card Learning Flow:
```
1. Use Chapter Progression to learn new cards
   ↓
2. Each card you review gets added to SRS system
   ↓
3. Use Spaced Repetition to review due cards (up to 20)
   ↓
4. Continue cycle: Learn new → Review old
```

### No Reviews Due:
When there are no cards due for review, users see:
```
┌─────────────────────────────────────────┐
│  🎉 No reviews due!                     │
│                                         │
│  You don't have any flashcards due     │
│  for review right now.                 │
│                                         │
│  Use other drills to learn new cards,  │
│  or come back later when your reviews  │
│  are due.                               │
│                                         │
│  💡 Tip: Complete chapters with        │
│     Chapter Progression to add cards   │
│     to your review queue!               │
└─────────────────────────────────────────┘
```

---

## 🎨 UI Updates

### Main Page Button:
**Old text**: "Smart review system using the Anki method"
**New text**: "Review up to 20 due cards using smart scheduling"

### Drill Header:
Shows progress: **"5 / 20"** (current card / total cards)

### No Cards Message:
- Clearer messaging about why no cards are shown
- Helpful tip pointing users to Chapter Progression
- Styled hint box with purple accent

---

## 📚 How Cards Enter Review Queue

### Chapter Progression:
- When you review cards in Chapter Progression, they get added to SRS system
- Each card gets initial review data:
  - Ease factor: 2.5
  - Interval: 0
  - Next review date: based on your rating

### Other Drills:
- Regular practice drills also update card history
- But only Spaced Repetition uses the SRS scheduling

### Review Rating Impact:
- **Again**: Card appears in < 1 minute
- **Hard**: Card appears in 6 minutes
- **Good**: Card appears in 1 day
- **Easy**: Card appears in 4 days

---

## 🔧 Technical Details

### Modified Files:
1. **`src/components/SpacedRepetitionDrill.jsx`**
   - Updated review queue building logic
   - Removed NEW card handling
   - Added 20-card limit
   - Updated no-cards message

2. **`src/components/SpacedRepetitionDrill.css`**
   - Added `.hint` style for tip message
   - Purple accent color and border

3. **`src/App.jsx`**
   - Updated button description text

### Key Code Change:
```javascript
// OLD: Included NEW cards
if (!reviewData) {
  queue.push({ ...card, isNew: true });
} else if (new Date(reviewData.nextReviewDate) <= now) {
  queue.push({ ...card, reviewData });
}

// NEW: Only reviewed cards
if (reviewData && new Date(reviewData.nextReviewDate) <= now) {
  queue.push({ ...card, reviewData });
}

// NEW: Limit to 20 cards
const shuffled = queue.sort(() => Math.random() - 0.5);
const limited = shuffled.slice(0, 20);
```

---

## 🎓 Learning Benefits

### Why 20 Cards?
1. **Manageable Sessions**: 20 cards takes ~10-15 minutes
2. **Focus**: Easier to concentrate on fewer cards
3. **Daily Habit**: Encourages daily practice
4. **Quality Over Quantity**: Better retention with focused review

### Why No NEW Cards?
1. **Clear Purpose**: Spaced Repetition is for *review*, not learning
2. **Separation of Concerns**: 
   - Chapter Progression = Learn new
   - Spaced Repetition = Review old
3. **Better UX**: Users know what to expect
4. **Efficient**: Don't waste review time on unfamiliar cards

---

## 📊 Example Scenarios

### Scenario 1: New User
```
User has completed 0 chapters
→ Spaced Repetition: "No reviews due!"
→ Action: Use Chapter Progression to learn first chapter
```

### Scenario 2: Beginner
```
User has reviewed 15 cards total
10 cards are due for review
→ Spaced Repetition: Shows 10 cards (all due cards < 20)
```

### Scenario 3: Active Learner
```
User has reviewed 100 cards total
35 cards are due for review
→ Spaced Repetition: Shows 20 cards (random selection from 35)
→ After session: 15 cards still due (can do another session)
```

### Scenario 4: Up-to-date
```
User has reviewed 200 cards total
0 cards are due for review
→ Spaced Repetition: "No reviews due!"
→ Action: Learn new cards or wait for reviews to become due
```

---

## 🔄 Workflow Recommendations

### Daily Study Routine:
```
Morning:
1. Spaced Repetition (10 min) - Review 20 due cards
2. Chapter Progression (15 min) - Learn 1 new chapter

Evening:
1. Spaced Repetition (10 min) - Review remaining due cards
2. Practice Drills (10 min) - Target weak areas
```

### Building Your Review Queue:
```
Week 1: Complete 3-5 chapters → Build initial review queue
Week 2: Daily reviews (20 cards) + 1-2 new chapters
Week 3+: Maintain daily reviews + steady new card intake
```

---

## 🎯 Success Metrics

### Good Sign:
- Seeing 20 cards in Spaced Repetition daily
- Completing most cards with "Good" or "Easy" ratings
- Steady completion of new chapters

### Need More Learning:
- Seeing 0-5 cards in Spaced Repetition
- Many "Again" ratings
- Solution: Complete more chapters to build queue

### Overwhelmed:
- 20+ cards due every day
- Many "Hard" ratings
- Solution: Reduce new card intake, focus on reviews

---

## 💡 Tips for Users

1. **Start with Chapter Progression**: Build your review queue
2. **Daily Reviews**: Check Spaced Repetition every day
3. **Honest Ratings**: Rate cards accurately for best results
4. **20 Card Limit**: If you have more, come back later for another session
5. **Balance**: Mix learning new cards with reviewing old ones

---

## 🚀 What's Next?

Future enhancements could include:
- Adjustable card limit (10, 20, 30 cards per session)
- "Review All Due" mode for power users
- Due card counter on main page button
- Study statistics (cards reviewed per day)
- Streak tracking for daily reviews

---

**The Spaced Repetition drill now provides focused, efficient review sessions of up to 20 previously-learned cards!** 🧠✨
