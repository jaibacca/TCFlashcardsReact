// Utility function to get the next incomplete chapter
export const getNextIncompleteChapter = (data) => {
  if (!data || data.length === 0) return null;

  // Load chapter progress and card history from localStorage
  const savedProgress = localStorage.getItem('tcFlashcardsChapterProgress');
  const chapterProgress = savedProgress ? JSON.parse(savedProgress) : {};

  const savedStats = localStorage.getItem('tcFlashcardsStats');
  const stats = savedStats ? JSON.parse(savedStats) : { cardHistory: {} };
  const cardHistory = stats.cardHistory || {};

  // Group cards by book and chapter
  const chapters = {};
  data.forEach(card => {
    const key = `${card.Book}_${card.Chapter}`;
    if (!chapters[key]) {
      chapters[key] = {
        book: card.Book,
        chapter: card.Chapter,
        key: key,
        cards: []
      };
    }
    chapters[key].cards.push(card);
  });

  // Get sorted chapter keys
  const chapterKeys = Object.keys(chapters).sort((a, b) => {
    const [bookA, chapA] = a.split('_').map(Number);
    const [bookB, chapB] = b.split('_').map(Number);
    if (bookA !== bookB) return bookA - bookB;
    return chapA - chapB;
  });

  // Helper function to check if a chapter is complete
  // A chapter is complete when ALL cards in it have been answered at least once
  const isChapterComplete = (chapterKey) => {
    const chapter = chapters[chapterKey];
    if (!chapter || !chapter.cards || chapter.cards.length === 0) return false;

    // Check if every card in this chapter has been answered at least once
    return chapter.cards.every(card => {
      const cardKey = `${card.Hanzi}_${card.Pinyin}`;
      return cardHistory[cardKey] && cardHistory[cardKey].attempts > 0;
    });
  };

  // First, prioritize "in progress" chapters that are not yet complete
  for (const key of chapterKeys) {
    if (chapterProgress[key]?.inProgress && !isChapterComplete(key)) {
      return chapters[key];
    }
  }

  // If no in-progress incomplete chapter, find first incomplete chapter
  for (const key of chapterKeys) {
    if (!isChapterComplete(key)) {
      return chapters[key];
    }
  }

  // If all chapters are complete, return the in-progress chapter (for review)
  for (const key of chapterKeys) {
    if (chapterProgress[key]?.inProgress) {
      return chapters[key];
    }
  }

  // If all complete and none in progress, return first chapter
  if (chapterKeys.length > 0) {
    return chapters[chapterKeys[0]];
  }

  return null;
};
