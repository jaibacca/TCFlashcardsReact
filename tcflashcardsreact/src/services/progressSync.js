import { supabase } from '../config/supabase';

/**
 * Service for syncing user progress between localStorage and Supabase
 */
export const progressSyncService = {
  /**
   * Save progress to Supabase for a logged-in user
   */
  async saveProgressToCloud(userId, stats) {
    try {
      // Save overall stats as JSON
      const { error: statsError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          stats_data: stats,
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
        correctCount: Math.max(local.correctCount, cloud.correctCount)
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

      // Get cloud progress
      const { success, data: cloudStats, error } = await this.loadProgressFromCloud(userId);
      
      if (!success) {
        console.warn('Could not load cloud progress:', error);
        return { success: false, error };
      }

      // Merge progress
      const mergedStats = this.mergeProgress(localStats, cloudStats);

      // Save merged progress to both locations
      localStorage.setItem('tcFlashcardsStats', JSON.stringify(mergedStats));
      await this.saveProgressToCloud(userId, mergedStats);

      console.log('✅ Progress synced on login');
      return { success: true, stats: mergedStats };
    } catch (error) {
      console.error('❌ Sync on login failed:', error);
      return { success: false, error: error.message };
    }
  }
};
