/**
 * Migration utility to add existing cardHistory cards to reviewData
 * This is a one-time fix for users who practiced cards before the unified stats update
 */

export const migrateCardHistoryToReviewData = () => {
  console.log('🔄 Starting migration: cardHistory → reviewData');

  // Load existing data
  const statsStr = localStorage.getItem('tcFlashcardsStats');
  if (!statsStr) {
    console.log('⚠️ No stats found, nothing to migrate');
    return { success: false, message: 'No stats found' };
  }

  const stats = JSON.parse(statsStr);
  const cardHistory = stats.cardHistory || {};
  const reviewData = JSON.parse(localStorage.getItem('tcFlashcardsReviewData') || '{}');

  let addedCount = 0;
  let skippedCount = 0;

  // Process each card in cardHistory
  Object.keys(cardHistory).forEach(cardKey => {
    const card = cardHistory[cardKey];

    // Skip if already in reviewData
    if (reviewData[cardKey]) {
      skippedCount++;
      console.log(`⏭️ Skipped ${cardKey} (already in reviewData)`);
      return;
    }

    // Calculate initial interval based on accuracy
    const accuracy = card.attempts > 0 ? (card.correctCount / card.attempts) : 0;
    let initialInterval;

    if (accuracy >= 0.8 && card.correctCount >= 2) {
      // Good performance - 1 day interval
      initialInterval = 1;
    } else if (accuracy >= 0.5) {
      // Moderate performance - review soon
      initialInterval = 0;
    } else {
      // Poor performance - immediate review
      initialInterval = 0;
    }

    // Create review data entry
    const now = new Date();
    const nextReview = new Date(now);
    nextReview.setDate(nextReview.getDate() + initialInterval);

    reviewData[cardKey] = {
      easeFactor: 2.5,
      interval: initialInterval,
      nextReviewDate: nextReview.toISOString(),
      reviews: card.attempts,  // Use existing attempts as review count
      lastReview: card.lastReviewed || now.toISOString()
    };

    addedCount++;
    console.log(`✅ Added ${cardKey} (accuracy: ${Math.round(accuracy * 100)}%, interval: ${initialInterval} days)`);
  });

  // Save updated reviewData
  localStorage.setItem('tcFlashcardsReviewData', JSON.stringify(reviewData));

  const summary = {
    success: true,
    addedCount,
    skippedCount,
    totalCards: Object.keys(reviewData).length,
    message: `Migration complete! Added ${addedCount} cards, skipped ${skippedCount} (already existed)`
  };

  console.log('✅ Migration complete!');
  console.log(`📊 Added: ${addedCount}, Skipped: ${skippedCount}, Total in reviewData: ${summary.totalCards}`);

  return summary;
};

/**
 * Check if migration is needed
 */
export const needsMigration = () => {
  const statsStr = localStorage.getItem('tcFlashcardsStats');
  if (!statsStr) return false;

  const stats = JSON.parse(statsStr);
  const cardHistoryCount = Object.keys(stats.cardHistory || {}).length;
  const reviewDataCount = Object.keys(
    JSON.parse(localStorage.getItem('tcFlashcardsReviewData') || '{}')
  ).length;

  // Migration needed if cardHistory has more cards than reviewData
  return cardHistoryCount > reviewDataCount;
};
