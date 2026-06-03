// Utility function to get the next incomplete chapter
export const getNextIncompleteChapter = (data) => {
  if (!data || data.length === 0) return null;

  // Load chapter progress from localStorage
  const saved = localStorage.getItem('tcFlashcardsChapterProgress');
  const chapterProgress = saved ? JSON.parse(saved) : {};

  // Group cards by book and chapter
  const chapters = {};
  data.forEach(card => {
    const key = `${card.Book}_${card.Chapter}`;
    if (!chapters[key]) {
      chapters[key] = {
        book: card.Book,
        chapter: card.Chapter,
        key: key
      };
    }
  });

  // Get sorted chapter keys
  const chapterKeys = Object.keys(chapters).sort((a, b) => {
    const [bookA, chapA] = a.split('_').map(Number);
    const [bookB, chapB] = b.split('_').map(Number);
    if (bookA !== bookB) return bookA - bookB;
    return chapA - chapB;
  });

  // Find first incomplete chapter, prioritizing "in progress" chapters
  // First, look for a chapter marked as "in progress"
  for (const key of chapterKeys) {
    if (chapterProgress[key]?.inProgress && !chapterProgress[key]?.completed) {
      return chapters[key];
    }
  }

  // If no in-progress chapter, find first incomplete chapter
  for (const key of chapterKeys) {
    if (!chapterProgress[key] || !chapterProgress[key].completed) {
      return chapters[key];
    }
  }

  // If all complete, return first chapter
  if (chapterKeys.length > 0) {
    return chapters[chapterKeys[0]];
  }

  return null;
};
