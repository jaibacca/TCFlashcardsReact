import { supabase } from '../config/supabase';

/**
 * Service for syncing user progress between localStorage and Supabase
 */
export const progressSyncService = {
  /**
   * Save progress to Supabase for a logged-in user
   */
  async saveProgressToCloud(userId, stats, chapterProgress = null, reviewData = null) {
    try {
      // Load existing chapter and review data if not provided
      if (chapterProgress === null) {
        const saved = localStorage.getItem('tcFlashcardsChapterProgress');
        chapterProgress = saved ? JSON.parse(saved) : {};
      }

      if (reviewData === null) {
        const saved = localStorage.getItem('tcFlashcardsReviewData');
        reviewData = saved ? JSON.parse(saved) : {};
      }

      // Save overall stats including chapter and review data as JSON
      const { error: statsError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          stats_data: {
            ...stats,
            chapterProgress,
            reviewData
          },
          last_synced: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (statsError) throw statsError;

      console.log('✅ Progress synced to cloud');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to sync progress:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Load progress from Supabase for a logged-in user
   */
  async loadProgressFromCloud(userId) {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('stats_data, last_synced')
        .eq('user_id', userId)
        .single();

      if (error) {
        // No data found is okay - user might be new
        if (error.code === 'PGRST116') {
          return { success: true, data: null };
        }
        throw error;
      }

      console.log('✅ Progress loaded from cloud');
      return { success: true, data: data.stats_data };
    } catch (error) {
      console.error('❌ Failed to load progress:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Merge local and cloud progress (keep best stats)
   */
  mergeProgress(localStats, cloudStats) {
    if (!cloudStats) return localStats;
    if (!localStats) return cloudStats;

    const merged = {
      drills: {},
      cardHistory: {},
      streaks: {},
      chapterProgress: {},
      reviewData: {},
      totalCards: Math.max(localStats.totalCards || 0, cloudStats.totalCards || 0)
    };

    // Merge drill stats (keep higher counts)
    const drillTypes = ['hanziToPinyin', 'pinyinToEnglish', 'pinyinToHanzi', 'englishToHanzi'];
    drillTypes.forEach(type => {
      const local = localStats.drills?.[type] || { attempts: 0, correct: 0, totalTime: 0 };
      const cloud = cloudStats.drills?.[type] || { attempts: 0, correct: 0, totalTime: 0 };

      merged.drills[type] = {
        attempts: Math.max(local.attempts, cloud.attempts),
        correct: Math.max(local.correct, cloud.correct),
        totalTime: Math.max(local.totalTime, cloud.totalTime)
      };
    });

    // Merge card history (keep best performance per card)
    const allCardIds = new Set([
      ...Object.keys(localStats.cardHistory || {}),
      ...Object.keys(cloudStats.cardHistory || {})
    ]);

    allCardIds.forEach(cardId => {
      const local = localStats.cardHistory?.[cardId] || { attempts: 0, correctCount: 0 };
      const cloud = cloudStats.cardHistory?.[cardId] || { attempts: 0, correctCount: 0 };

      merged.cardHistory[cardId] = {
        attempts: Math.max(local.attempts, cloud.attempts),
        correctCount: Math.max(local.correctCount, cloud.correctCount),
        lastReviewed: local.lastReviewed || cloud.lastReviewed
      };
    });

    // Merge streaks (keep best)
    const localStreaks = localStats.streaks || { current: 0, longest: 0, lastStudyDate: null };
    const cloudStreaks = cloudStats.streaks || { current: 0, longest: 0, lastStudyDate: null };

    merged.streaks = {
      current: Math.max(localStreaks.current, cloudStreaks.current),
      longest: Math.max(localStreaks.longest, cloudStreaks.longest),
      lastStudyDate: localStreaks.lastStudyDate || cloudStreaks.lastStudyDate
    };

    // Merge chapter progress (keep most recent and completed status)
    const allChapters = new Set([
      ...Object.keys(localStats.chapterProgress || {}),
      ...Object.keys(cloudStats.chapterProgress || {})
    ]);

    allChapters.forEach(chapterId => {
      const local = localStats.chapterProgress?.[chapterId];
      const cloud = cloudStats.chapterProgress?.[chapterId];

      if (!local) {
        merged.chapterProgress[chapterId] = cloud;
      } else if (!cloud) {
        merged.chapterProgress[chapterId] = local;
      } else {
        // Both exist - merge intelligently
        const localDate = new Date(local.lastStudied || 0);
        const cloudDate = new Date(cloud.lastStudied || 0);
        const mostRecent = localDate > cloudDate ? local : cloud;

        merged.chapterProgress[chapterId] = {
          completed: local.completed || cloud.completed, // Mark complete if either says so
          accuracy: Math.max(local.accuracy || 0, cloud.accuracy || 0),
          lastStudied: mostRecent.lastStudied,
          attempts: Math.max(local.attempts || 0, cloud.attempts || 0)
        };
      }
    });

    // Merge spaced repetition review data (keep most recent review per card)
    const allReviewCards = new Set([
      ...Object.keys(localStats.reviewData || {}),
      ...Object.keys(cloudStats.reviewData || {})
    ]);

    allReviewCards.forEach(cardId => {
      const local = localStats.reviewData?.[cardId];
      const cloud = cloudStats.reviewData?.[cardId];

      if (!local) {
        merged.reviewData[cardId] = cloud;
      } else if (!cloud) {
        merged.reviewData[cardId] = local;
      } else {
        // Both exist - keep most recent review
        const localDate = new Date(local.lastReview || 0);
        const cloudDate = new Date(cloud.lastReview || 0);

        merged.reviewData[cardId] = localDate > cloudDate ? local : cloud;
      }
    });

    return merged;
  },

  /**
   * Sync progress when user logs in
   */
  async syncOnLogin(userId) {
    try {
      // Get local progress
      const localStatsStr = localStorage.getItem('tcFlashcardsStats');
      const localStats = localStatsStr ? JSON.parse(localStatsStr) : null;

      // Get local chapter progress
      const localChapterStr = localStorage.getItem('tcFlashcardsChapterProgress');
      const localChapter = localChapterStr ? JSON.parse(localChapterStr) : {};

      // Get local review data
      const localReviewStr = localStorage.getItem('tcFlashcardsReviewData');
      const localReview = localReviewStr ? JSON.parse(localReviewStr) : {};

      // Combine local data
      const combinedLocal = {
        ...localStats,
        chapterProgress: localChapter,
        reviewData: localReview
      };

      // Get cloud progress
      const { success, data: cloudStats, error } = await this.loadProgressFromCloud(userId);

      if (!success) {
        console.warn('Could not load cloud progress:', error);
        return { success: false, error };
      }

      // Merge progress
      const mergedStats = this.mergeProgress(combinedLocal, cloudStats);

      // Save merged progress to localStorage (split into separate keys)
      const { chapterProgress, reviewData, ...mainStats } = mergedStats;

      localStorage.setItem('tcFlashcardsStats', JSON.stringify(mainStats));
      localStorage.setItem('tcFlashcardsChapterProgress', JSON.stringify(chapterProgress || {}));
      localStorage.setItem('tcFlashcardsReviewData', JSON.stringify(reviewData || {}));

      // Save to cloud
      await this.saveProgressToCloud(userId, mainStats, chapterProgress, reviewData);

      console.log('✅ Progress synced on login (including chapter progress and review data)');
      return { success: true, stats: mainStats };
    } catch (error) {
      console.error('❌ Sync on login failed:', error);
      return { success: false, error: error.message };
    }
  }
};

/**
 * Simplified sync function for migration
 * Takes review data and syncs it to cloud for a specific user
 */
export const syncToCloud = async (userId, reviewData) => {
  try {
    if (!userId || !reviewData) {
      throw new Error('userId and reviewData are required');
    }

    // Convert review data to progress records
    const progressRecords = Object.entries(reviewData).map(([cardKey, data]) => ({
      user_id: userId,
      card_key: cardKey,
      interval: data.interval || 1,
      ease_factor: data.easeFactor || 2.5,
      next_review: data.nextReview || new Date().toISOString(),
      last_review: data.lastReview || data.lastReviewed || new Date().toISOString(),
      review_count: data.attempts || 0,
      correct_count: data.correctCount || 0,
    }));

    // Batch upsert to user_progress table
    const { error } = await supabase
      .from('user_progress')
      .upsert(progressRecords, {
        onConflict: 'user_id,card_key'
      });

    if (error) throw error;

    console.log(`✅ Synced ${progressRecords.length} cards to cloud`);
    return { success: true, count: progressRecords.length };
  } catch (error) {
    console.error('❌ Failed to sync to cloud:', error);
    throw error;
  }
};
