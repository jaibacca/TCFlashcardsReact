/**
 * Speech synthesis utility for pronouncing Chinese characters
 * Uses Web Speech API to provide audio feedback for Hanzi pronunciation
 */

// Check if speech synthesis is supported
const isSpeechSupported = () => {
  return 'speechSynthesis' in window;
};

// Get available Chinese voices
let chineseVoice = null;

const loadChineseVoice = () => {
  if (!isSpeechSupported()) return null;

  const voices = window.speechSynthesis.getVoices();
  
  // Priority order: Traditional Chinese (Taiwan) > Simplified Chinese (China) > Any Chinese
  const preferredVoices = [
    voices.find(voice => voice.lang === 'zh-TW'), // Traditional Chinese (Taiwan)
    voices.find(voice => voice.lang === 'zh-HK'), // Traditional Chinese (Hong Kong)
    voices.find(voice => voice.lang === 'zh-CN'), // Simplified Chinese (China)
    voices.find(voice => voice.lang.startsWith('zh')) // Any Chinese variant
  ];

  return preferredVoices.find(voice => voice !== undefined) || null;
};

// Initialize voice when voices are loaded
if (isSpeechSupported()) {
  // Voices might not be loaded immediately
  window.speechSynthesis.onvoiceschanged = () => {
    chineseVoice = loadChineseVoice();
    if (chineseVoice) {
      console.log('🔊 Chinese voice loaded:', chineseVoice.name, chineseVoice.lang);
    }
  };
  
  // Try loading immediately (some browsers have voices ready)
  chineseVoice = loadChineseVoice();
}

/**
 * Speak Chinese text using text-to-speech
 * @param {string} text - The Hanzi text to speak
 * @param {Object} options - Speech options
 * @param {number} options.rate - Speech rate (0.1 to 10, default 0.9 for clearer pronunciation)
 * @param {number} options.pitch - Speech pitch (0 to 2, default 1)
 * @param {number} options.volume - Speech volume (0 to 1, default 1)
 */
export const speakChinese = (text, options = {}) => {
  if (!isSpeechSupported()) {
    console.warn('Speech synthesis not supported in this browser');
    return;
  }

  if (!text || typeof text !== 'string') {
    console.warn('Invalid text provided for speech synthesis');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Reload voice if not available
  if (!chineseVoice) {
    chineseVoice = loadChineseVoice();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set Chinese voice if available
  if (chineseVoice) {
    utterance.voice = chineseVoice;
    utterance.lang = chineseVoice.lang;
  } else {
    // Fallback to zh-TW (Traditional Chinese)
    utterance.lang = 'zh-TW';
    console.warn('No Chinese voice found, using fallback language setting');
  }

  // Apply options with sensible defaults for learning
  utterance.rate = options.rate || 0.9; // Slightly slower for clearer pronunciation
  utterance.pitch = options.pitch || 1;
  utterance.volume = options.volume || 1;

  // Error handling
  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event.error);
  };

  window.speechSynthesis.speak(utterance);
};

/**
 * Cancel any ongoing speech
 */
export const cancelSpeech = () => {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Check if speech synthesis is currently speaking
 */
export const isSpeaking = () => {
  if (!isSpeechSupported()) return false;
  return window.speechSynthesis.speaking;
};

/**
 * Get list of available Chinese voices
 * Useful for debugging or allowing user to select preferred voice
 */
export const getChineseVoices = () => {
  if (!isSpeechSupported()) return [];
  
  const voices = window.speechSynthesis.getVoices();
  return voices.filter(voice => voice.lang.startsWith('zh'));
};

export default {
  speakChinese,
  cancelSpeech,
  isSpeaking,
  isSpeechSupported,
  getChineseVoices
};
