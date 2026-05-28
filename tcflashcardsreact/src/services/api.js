const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Generic fetch wrapper with error handling
async function apiFetch(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Flashcard API
export const flashcardsApi = {
  // Get all flashcards
  getAll: () => apiFetch('/flashcards'),

  // Get flashcards grouped by book and chapter
  getGrouped: () => apiFetch('/flashcards/grouped'),

  // Get all unique books
  getBooks: () => apiFetch('/flashcards/books'),

  // Get chapters for a specific book
  getChaptersByBook: (book) => apiFetch(`/flashcards/books/${encodeURIComponent(book)}/chapters`),

  // Get flashcards by book
  getByBook: (book) => apiFetch(`/flashcards/book/${encodeURIComponent(book)}`),

  // Get flashcards by book and chapter
  getByBookAndChapter: (book, chapter) => 
    apiFetch(`/flashcards/book/${encodeURIComponent(book)}/chapter/${encodeURIComponent(chapter)}`),

  // Add a new flashcard
  create: (flashcard) => apiFetch('/flashcards', {
    method: 'POST',
    body: JSON.stringify(flashcard),
  }),

  // Bulk insert flashcards
  bulkCreate: (flashcards) => apiFetch('/flashcards/bulk', {
    method: 'POST',
    body: JSON.stringify({ flashcards }),
  }),

  // Update a flashcard
  update: (id, flashcard) => apiFetch(`/flashcards/${id}`, {
    method: 'PUT',
    body: JSON.stringify(flashcard),
  }),

  // Delete a flashcard
  delete: (id) => apiFetch(`/flashcards/${id}`, {
    method: 'DELETE',
  }),

  // Delete all flashcards
  deleteAll: () => apiFetch('/flashcards', {
    method: 'DELETE',
  }),
};

// Statistics API (for future use)
export const statsApi = {
  // Get user statistics
  getUserStats: (userId) => apiFetch(`/stats/user/${userId}`),

  // Update user statistics
  updateUserStats: (userId, data) => apiFetch(`/stats/user/${userId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Get card progress for a user
  getCardProgress: (userId) => apiFetch(`/stats/user/${userId}/cards`),
};

// Health check
export const healthCheck = () => apiFetch('/health');

export default {
  flashcards: flashcardsApi,
  stats: statsApi,
  healthCheck,
};
