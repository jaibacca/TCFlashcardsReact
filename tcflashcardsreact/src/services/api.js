import { supabase } from '../config/supabase';

// Flashcard API using Supabase
export const flashcardsApi = {
  // Get all flashcards
  getAll: async () => {
    console.log('🔍 Attempting to fetch flashcards from Supabase...');
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .order('book', { ascending: true })
      .order('chapter', { ascending: true })
      .order('id', { ascending: true }); // Use id as fallback for ordering

    if (error) {
      console.error('❌ Supabase query error:', error);
      throw error;
    }

    console.log(`✅ Fetched ${data?.length || 0} flashcards from Supabase`);
    return data;
  },

  // Get flashcards grouped by book and chapter
  getGrouped: async () => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .order('book', { ascending: true })
      .order('chapter', { ascending: true })
      .order('id', { ascending: true }); // Use id as fallback

    if (error) throw error;

    // Group by book and chapter
    const grouped = {};
    data.forEach(card => {
      if (!grouped[card.book]) grouped[card.book] = {};
      if (!grouped[card.book][card.chapter]) grouped[card.book][card.chapter] = [];
      grouped[card.book][card.chapter].push(card);
    });

    return grouped;
  },

  // Get all unique books
  getBooks: async () => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('book')
      .order('book', { ascending: true });

    if (error) throw error;
    return [...new Set(data.map(d => d.book))];
  },

  // Get chapters for a specific book
  getChaptersByBook: async (book) => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('chapter')
      .eq('book', book)
      .order('chapter', { ascending: true });

    if (error) throw error;
    return [...new Set(data.map(d => d.chapter))];
  },

  // Get flashcards by book
  getByBook: async (book) => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('book', book)
      .order('chapter', { ascending: true })
      .order('id', { ascending: true }); // Use id as fallback

    if (error) throw error;
    return data;
  },

  // Get flashcards by book and chapter
  getByBookAndChapter: async (book, chapter) => {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('book', book)
      .eq('chapter', chapter)
      .order('id', { ascending: true }); // Use id as fallback

    if (error) throw error;
    return data;
  },

  // Add a new flashcard
  create: async (flashcard) => {
    const { data, error } = await supabase
      .from('flashcards')
      .insert([flashcard])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Bulk insert flashcards
  bulkCreate: async (flashcards) => {
    const { data, error } = await supabase
      .from('flashcards')
      .insert(flashcards)
      .select();

    if (error) throw error;
    return data;
  },

  // Update a flashcard
  update: async (id, flashcard) => {
    const { data, error } = await supabase
      .from('flashcards')
      .update(flashcard)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a flashcard
  delete: async (id) => {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Delete all flashcards
  deleteAll: async () => {
    const { error } = await supabase
      .from('flashcards')
      .delete()
      .neq('id', 0); // Delete all where id is not 0 (i.e., all rows)

    if (error) throw error;
  },
};

// Statistics API (for future use with Supabase)
export const statsApi = {
  // Get user statistics
  getUserStats: async (userId) => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  // Update user statistics
  updateUserStats: async (userId, statsData) => {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({ user_id: userId, ...statsData })
      .select();

    if (error) throw error;
    return data;
  },

  // Get card progress for a user
  getCardProgress: async (userId) => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*, flashcards(*)')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },
};

// Health check (check Supabase connection)
export const healthCheck = async () => {
  try {
    const { data, error } = await supabase
      .from('flashcards')
      .select('count')
      .limit(1);

    if (error) throw error;
    return { status: 'ok', message: 'Supabase connected' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};

export default {
  flashcards: flashcardsApi,
  stats: statsApi,
  healthCheck,
};
