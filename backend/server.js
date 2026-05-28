const express = require('express');
const cors = require('cors');
require('dotenv').config();

const flashcardsRouter = require('./routes/flashcards');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/flashcards', flashcardsRouter);
app.use('/api/stats', statsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Traditional Chinese Flashcards API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      flashcards: '/api/flashcards',
      stats: '/api/stats'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║  🚀 TC Flashcards API Server                          ║
║  📡 Port: ${PORT}                                     ║
║  🌍 Environment: ${process.env.NODE_ENV || 'development'}                    ║
║  ✅ Server is running!                                ║
╚═══════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
