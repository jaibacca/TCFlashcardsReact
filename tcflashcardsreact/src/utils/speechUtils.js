/**
 * Speech synthesis utility using Google Cloud Text-to-Speech API
 * Provides consistent, high-quality Chinese pronunciation across all platforms
 */

// Audio cache to avoid repeated API calls for the same text
const audioCache = new Map();

// Queue for pending audio requests to avoid duplicate calls
const pendingRequests = new Map();

/**
 * Get Google Cloud TTS API endpoint
 * Uses a proxy approach - we'll generate audio URLs on-demand
 */
const GOOGLE_TTS_API = 'https://translate.google.com/translate_tts';

/**
 * Speak Chinese text using Google Translate TTS
 * This is a free, reliable alternative that works consistently across platforms
 * 
 * @param {string} text - The Hanzi text to speak
 * @param {Object} options - Speech options
 * @param {number} options.rate - Speech rate (0.5 to 2, default 1)
 * @param {boolean} options.useCache - Whether to cache audio (default true)
 */
export const speakChinese = async (text, options = {}) => {
  if (!text || typeof text !== 'string') {
    console.warn('Invalid text provided for speech synthesis');
    return;
  }

  const {
    rate = 1,
    useCache = true
  } = options;

  // Create cache key
  const cacheKey = `${text}_${rate}`;

  // Check if audio is already cached
  if (useCache && audioCache.has(cacheKey)) {
    const audio = audioCache.get(cacheKey);
    audio.currentTime = 0; // Reset to start
    audio.play().catch(err => console.error('Audio playback error:', err));
    return;
  }

  // Check if request is already pending
  if (pendingRequests.has(cacheKey)) {
    await pendingRequests.get(cacheKey);
    return;
  }

  // Create new audio element with Google TTS URL
  const audioPromise = new Promise((resolve, reject) => {
    try {
      // Google Translate TTS URL parameters:
      // - ie: input encoding (UTF-8)
      // - tl: target language (zh-TW for Traditional Chinese, zh-CN for Simplified)
      // - client: client type (tw-ob for web)
      // - q: query text (the Hanzi to speak)
      const params = new URLSearchParams({
        ie: 'UTF-8',
        tl: 'zh-TW', // Traditional Chinese (Taiwan)
        client: 'tw-ob',
        q: text
      });

      const audioUrl = `${GOOGLE_TTS_API}?${params.toString()}`;
      const audio = new Audio(audioUrl);

      // Apply playback rate
      audio.playbackRate = rate;

      // Handle successful load
      audio.oncanplaythrough = () => {
        if (useCache) {
          audioCache.set(cacheKey, audio);
        }
        audio.play().catch(err => console.error('Audio playback error:', err));
        resolve();
      };

      // Handle errors
      audio.onerror = (err) => {
        console.error('Failed to load audio:', err);
        reject(err);
      };

    } catch (err) {
      console.error('Speech synthesis error:', err);
      reject(err);
    }
  });

  pendingRequests.set(cacheKey, audioPromise);
  
  try {
    await audioPromise;
  } finally {
    pendingRequests.delete(cacheKey);
  }
};

/**
 * Preload audio for a list of flashcards to improve performance
 * Call this when loading a drill to cache all audio in advance
 * 
 * @param {Array} cards - Array of flashcard objects with Hanzi property
 * @param {number} maxCards - Maximum number of cards to preload (default 50)
 */
export const preloadAudio = async (cards, maxCards = 50) => {
  if (!Array.isArray(cards) || cards.length === 0) {
    return;
  }

  console.log(`🔊 Preloading audio for ${Math.min(cards.length, maxCards)} cards...`);

  // Take first N cards and preload their audio
  const cardsToPreload = cards.slice(0, maxCards);
  
  const preloadPromises = cardsToPreload.map(card => {
    if (!card.Hanzi) return Promise.resolve();
    
    const cacheKey = `${card.Hanzi}_1`;
    
    // Skip if already cached
    if (audioCache.has(cacheKey)) {
      return Promise.resolve();
    }

    // Preload audio
    return new Promise((resolve) => {
      const params = new URLSearchParams({
        ie: 'UTF-8',
        tl: 'zh-TW',
        client: 'tw-ob',
        q: card.Hanzi
      });

      const audioUrl = `${GOOGLE_TTS_API}?${params.toString()}`;
      const audio = new Audio(audioUrl);

      audio.oncanplaythrough = () => {
        audioCache.set(cacheKey, audio);
        resolve();
      };

      audio.onerror = () => {
        // Silently fail for preloading
        resolve();
      };
    });
  });

  // Preload with a limit to avoid overwhelming the browser
  await Promise.all(preloadPromises);
  console.log(`✅ Audio preload complete: ${audioCache.size} cards cached`);
};

/**
 * Clear the audio cache (useful for memory management)
 * 
 * @param {number} keepRecent - Number of recent entries to keep (default 100)
 */
export const clearAudioCache = (keepRecent = 100) => {
  if (audioCache.size <= keepRecent) {
    return;
  }

  // Convert to array, keep last N entries, clear the rest
  const entries = Array.from(audioCache.entries());
  const toKeep = entries.slice(-keepRecent);
  
  audioCache.clear();
  toKeep.forEach(([key, value]) => {
    audioCache.set(key, value);
  });

  console.log(`🧹 Audio cache cleared, kept ${keepRecent} recent entries`);
};

/**
 * Get cache statistics (for debugging)
 */
export const getCacheStats = () => {
  return {
    size: audioCache.size,
    keys: Array.from(audioCache.keys())
  };
};

/**
 * Check if audio is supported in this browser
 */
export const isAudioSupported = () => {
  return typeof Audio !== 'undefined';
};

export default {
  speakChinese,
  preloadAudio,
  clearAudioCache,
  getCacheStats,
  isAudioSupported
};
