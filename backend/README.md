# Traditional Chinese Flashcards - Backend API

Backend server for the Traditional Chinese Flashcards application using Express.js and PostgreSQL.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Set up PostgreSQL**:
   - Install PostgreSQL if not already installed
   - Create a database:
   ```sql
   CREATE DATABASE chinese_flashcards;
   ```

3. **Configure environment variables**:
   - Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   - Edit `.env` with your PostgreSQL credentials:
   ```
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=chinese_flashcards
   DB_PASSWORD=your_password
   DB_PORT=5432
   PORT=3001
   ```

4. **Initialize the database**:
```bash
npm run init-db
```

5. **Seed the database** (optional - loads sample data):
```bash
npm run seed-db
```

## Running the Server

**Development mode** (with auto-restart):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
- **GET** `/api/health` - Check if API is running

### Flashcards

#### Get all flashcards
- **GET** `/api/flashcards`
- Returns: Array of all flashcards

#### Get all books
- **GET** `/api/flashcards/books`
- Returns: Array of unique book names

#### Get chapters for a book
- **GET** `/api/flashcards/books/:book/chapters`
- Returns: Array of chapter numbers for the specified book

#### Get flashcards by book
- **GET** `/api/flashcards/book/:book`
- Returns: Array of flashcards from the specified book

#### Get flashcards by book and chapter
- **GET** `/api/flashcards/book/:book/chapter/:chapter`
- Returns: Array of flashcards from the specified book and chapter

#### Get grouped flashcards
- **GET** `/api/flashcards/grouped`
- Returns: Object with flashcards grouped by book and chapter

#### Add a flashcard
- **POST** `/api/flashcards`
- Body:
```json
{
  "Hanzi": "你好",
  "Pinyin": "nǐ hǎo",
  "English": "hello",
  "Book": "Book 1",
  "Chapter": "1",
  "Order": 1
}
```

#### Bulk insert flashcards
- **POST** `/api/flashcards/bulk`
- Body:
```json
{
  "flashcards": [
    {
      "Hanzi": "你好",
      "Pinyin": "nǐ hǎo",
      "English": "hello",
      "Book": "Book 1",
      "Chapter": "1",
      "Order": 1
    },
    ...
  ]
}
```

#### Update a flashcard
- **PUT** `/api/flashcards/:id`
- Body: Same as POST (all fields)

#### Delete a flashcard
- **DELETE** `/api/flashcards/:id`

#### Delete all flashcards
- **DELETE** `/api/flashcards`

### Statistics (Future Feature)

- **GET** `/api/stats/user/:userId` - Get user statistics
- **POST** `/api/stats/user/:userId` - Update user statistics
- **GET** `/api/stats/user/:userId/cards` - Get card progress

## Database Schema

### flashcards
```sql
CREATE TABLE flashcards (
  id SERIAL PRIMARY KEY,
  hanzi VARCHAR(50) NOT NULL,
  pinyin VARCHAR(100) NOT NULL,
  english VARCHAR(200) NOT NULL,
  book VARCHAR(100),
  chapter VARCHAR(50),
  order_num INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### users (optional)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### user_progress (optional)
```sql
CREATE TABLE user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  flashcard_id INTEGER REFERENCES flashcards(id),
  correct_count INTEGER DEFAULT 0,
  total_attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMP,
  mastery_level VARCHAR(20) DEFAULT 'new'
);
```

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database connection
├── routes/
│   ├── flashcards.js      # Flashcard routes
│   └── stats.js           # Statistics routes
├── scripts/
│   ├── init-db.js         # Database initialization
│   └── seed-db.js         # Seed sample data
├── server.js              # Main Express server
├── package.json
├── .env.example           # Environment variables template
└── README.md
```

## Error Handling

All endpoints return errors in this format:
```json
{
  "error": "Error message here"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## CORS

CORS is configured to allow requests from:
- Development: `http://localhost:5173` (Vite default)
- Production: Set `FRONTEND_URL` in `.env`

## Testing

Test the API using curl, Postman, or your frontend:

```bash
# Health check
curl http://localhost:3001/api/health

# Get all flashcards
curl http://localhost:3001/api/flashcards

# Get books
curl http://localhost:3001/api/flashcards/books

# Add a flashcard
curl -X POST http://localhost:3001/api/flashcards \
  -H "Content-Type: application/json" \
  -d '{
    "Hanzi": "謝謝",
    "Pinyin": "xiè xie",
    "English": "thank you",
    "Book": "Book 1",
    "Chapter": "1",
    "Order": 2
  }'
```

## Deployment

See main project README for deployment instructions to:
- Heroku
- Railway
- Render
- Other platforms

## License

MIT
