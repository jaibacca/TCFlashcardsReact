import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { syncToCloud } from '../services/progressSync';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user ?? null;
      const wasAnonymous = !user;
      const nowAuthenticated = !!newUser;

      setUser(newUser);
      setLoading(false);

      // Auto-migrate local data ONLY for brand new users (first sign-in ever)
      if (wasAnonymous && nowAuthenticated && event === 'SIGNED_IN' && newUser) {
        // Check if user already has cloud data - if they do, DON'T migrate
        const hasExistingData = await checkUserHasCloudData(newUser.id);

        if (!hasExistingData) {
          console.log('🔄 New user detected - migrating local progress to cloud...');
          await migrateLocalProgressToCloud(newUser.id);
        } else {
          console.log('ℹ️ Existing user signed in - loading cloud data, skipping migration');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [user]);

  // Check if user already has any cloud data
  const checkUserHasCloudData = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('stats_data')
        .eq('user_id', userId)
        .single();

      if (error) {
        // PGRST116 = no rows, means new user
        if (error.code === 'PGRST116') {
          return false;
        }
        console.error('Error checking cloud data:', error);
        return true; // Assume they have data to be safe
      }

      // Check if stats_data has any meaningful content
      const hasData = data && 
        data.stats_data && 
        (Object.keys(data.stats_data).length > 0 ||
         data.stats_data.reviewData ||
         data.stats_data.cardHistory ||
         data.stats_data.chapterProgress);

      return hasData;
    } catch (error) {
      console.error('Error checking cloud data:', error);
      return true; // Assume they have data to be safe
    }
  };

  // Function to migrate local storage data to cloud
  const migrateLocalProgressToCloud = async (userId) => {
    try {
      // Get all local data
      const reviewData = localStorage.getItem('tcFlashcardsReviewData');
      const statsData = localStorage.getItem('tcFlashcardsStats');
      const chapterProgress = localStorage.getItem('tcFlashcardsChapterProgress');

      if (!reviewData && !statsData && !chapterProgress) {
        console.log('ℹ️ No local data to migrate');
        return;
      }

      let migratedCount = 0;

      // Migrate review data (Spaced Repetition)
      if (reviewData) {
        const parsed = JSON.parse(reviewData);
        if (Object.keys(parsed).length > 0) {
          await syncToCloud(userId, parsed);
          migratedCount += Object.keys(parsed).length;
          console.log(`✅ Migrated ${Object.keys(parsed).length} spaced repetition cards`);
        }
      }

      // Migrate stats data
      if (statsData) {
        const parsed = JSON.parse(statsData);
        const cardHistory = parsed.cardHistory || {};

        // Convert stats format to review data format for syncing
        const statsAsReviewData = {};
        Object.entries(cardHistory).forEach(([key, history]) => {
          statsAsReviewData[key] = {
            attempts: history.attempts || 0,
            correctCount: history.correctCount || 0,
            lastReviewed: history.lastReviewed || null,
            interval: 1,
            easeFactor: 2.5,
            nextReview: new Date().toISOString(),
          };
        });

        if (Object.keys(statsAsReviewData).length > 0) {
          await syncToCloud(userId, statsAsReviewData);
          migratedCount += Object.keys(statsAsReviewData).length;
          console.log(`✅ Migrated ${Object.keys(statsAsReviewData).length} drill statistics`);
        }
      }

      // Migrate chapter progress
      if (chapterProgress) {
        const parsed = JSON.parse(chapterProgress);
        const chapterReviewData = {};

        Object.entries(parsed).forEach(([key, data]) => {
          chapterReviewData[key] = {
            lastReviewed: data.lastCompleted || new Date().toISOString(),
            interval: 1,
            easeFactor: 2.5,
            nextReview: data.lastCompleted || new Date().toISOString(),
            attempts: data.timesCompleted || 0,
            correctCount: Math.round((data.timesCompleted || 0) * (data.averageAccuracy || 0) / 100),
          };
        });

        if (Object.keys(chapterReviewData).length > 0) {
          await syncToCloud(userId, chapterReviewData);
          migratedCount += Object.keys(chapterReviewData).length;
          console.log(`✅ Migrated ${Object.keys(chapterReviewData).length} chapter progress records`);
        }
      }

      if (migratedCount > 0) {
        console.log(`🎉 Successfully migrated ${migratedCount} total records to cloud`);

        // Emit event for toast notification
        window.dispatchEvent(new CustomEvent('migrationComplete', {
          detail: {
            message: `Successfully synced ${migratedCount} records to your account! Your progress is now saved across all devices.`
          }
        }));

        // Optional: Clear local storage after successful migration
        // Uncomment if you want to remove local data after migration
        // localStorage.removeItem('tcFlashcardsReviewData');
        // localStorage.removeItem('tcFlashcardsStats');
        // localStorage.removeItem('tcFlashcardsChapterProgress');
      }

    } catch (error) {
      console.error('❌ Failed to migrate local progress:', error);
      // Don't throw - we don't want to break the auth flow
      // User data is still in localStorage as backup
    }
  };

  const signInWithEmail = async (email) => {
    try {
      // Check for rate limit cooldown (client-side)
      const lastAttempt = localStorage.getItem('lastAuthAttempt');
      if (lastAttempt) {
        const timeSinceLastAttempt = Date.now() - parseInt(lastAttempt);
        const cooldownPeriod = 10000; // 10 seconds client-side cooldown

        if (timeSinceLastAttempt < cooldownPeriod) {
          const waitTime = Math.ceil((cooldownPeriod - timeSinceLastAttempt) / 1000);
          throw new Error(`Please wait ${waitTime} seconds before trying again`);
        }
      }

      // Record this attempt
      localStorage.setItem('lastAuthAttempt', Date.now().toString());

      // Use environment variable for redirect URL, fallback to current origin
      const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      console.log('🔗 Auth redirect URL:', redirectUrl);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true,
        }
      });
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    signInWithEmail,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
