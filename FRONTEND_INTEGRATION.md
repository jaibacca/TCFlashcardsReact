# Frontend Integration Guide

How to connect your React frontend to the PostgreSQL backend.

## Overview

You have two options for data loading:

1. **Hybrid Approach** (Recommended): Support both CSV upload AND database loading
2. **Database Only**: Remove CSV, use database exclusively

This guide shows the **Hybrid Approach**.

## Integration Steps

### Step 1: Verify API Service Exists

The file `TCFlashcardsReact/src/services/api.js` has been created with all necessary API functions.

### Step 2: Update App.jsx to Support Database

I'll provide the changes needed to support both CSV and database sources.

#### Add Database Loading State

In `App.jsx`, add these imports at the top:

```javascript
import { flashcardsApi } from './services/api'
```

#### Add State Variables

Add these state variables (after existing useState declarations):

```javascript
const [dataSource, setDataSource] = useState('csv'); // 'csv' or 'database'
const [isLoadingFromDB, setIsLoadingFromDB] = useState(false);
const [dbError, setDbError] = useState(null);
```

#### Add Database Loading Function

Add this function before the `return` statement:

```javascript
const loadDataFromDatabase = async () => {
  setIsLoadingFromDB(true);
  setDbError(null);
  
  try {
    const data = await flashcardsApi.getAll();
    setAllData(data);
    setFilteredData(data);
    setDataSource('database');
    console.log(`✅ Loaded ${data.length} flashcards from database`);
  } catch (error) {
    console.error('Database error:', error);
    setDbError(error.message || 'Failed to connect to database');
  } finally {
    setIsLoadingFromDB(false);
  }
};
```

#### Update the Upload Section UI

Replace the data upload section in the JSX with:

```jsx
<section className="data-upload-section">
  <h2>Load Your Data</h2>
  
  {/* Data Source Toggle */}
  <div className="data-source-toggle">
    <button 
      className={`toggle-btn ${dataSource === 'database' ? 'active' : ''}`}
      onClick={() => setDataSource('database')}
    >
      💾 Database
    </button>
    <button 
      className={`toggle-btn ${dataSource === 'csv' ? 'active' : ''}`}
      onClick={() => setDataSource('csv')}
    >
      📁 CSV File
    </button>
  </div>

  {/* Database Loader */}
  {dataSource === 'database' && (
    <div className="database-section">
      {isLoadingFromDB && (
        <div className="loading">
          <span className="spinner"></span>
          Loading flashcards from database...
        </div>
      )}
      
      {dbError && (
        <div className="error-message">
          ❌ {dbError}
          <br />
          <small>Make sure the backend server is running on port 3001</small>
        </div>
      )}
      
      {!isLoadingFromDB && !dbError && allData.length === 0 && (
        <button onClick={loadDataFromDatabase} className="load-db-btn">
          Load from Database
        </button>
      )}
      
      {!isLoadingFromDB && allData.length > 0 && dataSource === 'database' && (
        <div className="data-info">
          ✓ Loaded {allData.length} flashcards from database
          <button onClick={loadDataFromDatabase} className="reload-btn">
            🔄 Reload
          </button>
        </div>
      )}
    </div>
  )}

  {/* CSV Upload */}
  {dataSource === 'csv' && (
    <div className="upload-area">
      <label htmlFor="file-upload" className="file-upload-label">
        📁 Upload CSV File
      </label>
      <input
        id="file-upload"
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="file-input"
      />
      <p className="upload-hint">
        CSV should have columns: Hanzi, Pinyin, English, Book, Chapter, Order
      </p>
      {allData.length > 0 && dataSource === 'csv' && (
        <div className="data-info">
          ✓ Loaded {allData.length} flashcards from CSV
        </div>
      )}
    </div>
  )}
</section>
```

### Step 3: Add CSS Styles

Add these styles to `App.css`:

```css
/* Data Source Toggle */
.data-source-toggle {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

.toggle-btn {
  padding: 12px 24px;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s;
}

.toggle-btn:hover {
  border-color: #667eea;
  background: #f0f4ff;
}

.toggle-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Database Section */
.database-section {
  text-align: center;
  padding: 30px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
  min-height: 150px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.load-db-btn {
  padding: 15px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s;
}

.load-db-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.reload-btn {
  margin-left: 15px;
  padding: 8px 16px;
  background: white;
  border: 2px solid #667eea;
  color: #667eea;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.reload-btn:hover {
  background: #667eea;
  color: white;
}

/* Loading Spinner */
.loading {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  color: #666;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Message */
.error-message {
  background: #fee;
  border: 2px solid #f88;
  color: #c33;
  padding: 15px;
  border-radius: 8px;
  margin: 10px 0;
}

.error-message small {
  display: block;
  margin-top: 8px;
  color: #666;
  font-size: 13px;
}
```

### Step 4: Update .gitignore

Make sure `.env` is in your `.gitignore`:

```
node_modules/
dist/
.env
.env.local
*.log
```

## Testing the Integration

### 1. Start Both Servers

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd TCFlashcardsReact
npm run dev
```

### 2. Test in Browser

1. Open http://localhost:5173
2. You should see two buttons: "💾 Database" and "📁 CSV File"
3. Click "💾 Database"
4. Click "Load from Database"
5. Should load 20 flashcards (from sample data)

### 3. Check Browser Console

Open Developer Tools (F12) and check console for:
- ✅ Success: `✅ Loaded 20 flashcards from database`
- ❌ Error: Check the error message

## Troubleshooting

### "Failed to fetch" or Connection Refused

**Problem**: Frontend can't connect to backend

**Solutions**:
1. Make sure backend is running: `cd backend && npm run dev`
2. Check backend URL in `.env`: `VITE_API_URL=http://localhost:3001/api`
3. Verify backend is on port 3001: Open http://localhost:3001/api/health
4. Check CORS settings in `backend/server.js`

### "Database query error"

**Problem**: Backend can't query database

**Solutions**:
1. Check PostgreSQL is running: `psql -U postgres -l`
2. Verify database exists: Should see `chinese_flashcards`
3. Check backend `.env` credentials
4. Run `npm run init-db` in backend directory

### Empty Data Array

**Problem**: Database loads but returns no data

**Solutions**:
1. Seed the database: `cd backend && npm run seed-db`
2. Verify data exists: `psql -U postgres -d chinese_flashcards -c "SELECT COUNT(*) FROM flashcards;"`
3. Check backend console for SQL errors

### CORS Errors

**Problem**: Browser blocks request due to CORS

**Solution**: Make sure `backend/server.js` has:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',  // Frontend URL
  credentials: true
}));
```

## Advanced Features

### Auto-Load from Database

To automatically load from database on app start, add this to `App.jsx`:

```javascript
useEffect(() => {
  // Auto-load from database on mount
  if (dataSource === 'database' && allData.length === 0) {
    loadDataFromDatabase();
  }
}, []);
```

### Add CSV Upload to Database

Want to upload CSV files to the database? Add this function:

```javascript
const uploadCSVToDatabase = async (flashcards) => {
  try {
    setIsLoadingFromDB(true);
    await flashcardsApi.bulkCreate(flashcards);
    await loadDataFromDatabase(); // Reload from DB
    alert(`✅ Successfully uploaded ${flashcards.length} flashcards to database`);
  } catch (error) {
    alert(`❌ Failed to upload: ${error.message}`);
  } finally {
    setIsLoadingFromDB(false);
  }
};
```

Then update `handleFileUpload`:

```javascript
const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const text = e.target.result;
    const parsedData = parseCSV(text);
    
    if (dataSource === 'database') {
      // Upload to database
      const confirmed = confirm(
        `Upload ${parsedData.length} flashcards to database?`
      );
      if (confirmed) {
        await uploadCSVToDatabase(parsedData);
      }
    } else {
      // Use locally
      setAllData(parsedData);
      setFilteredData(parsedData);
    }
  };
  reader.readAsText(file);
};
```

## What About Statistics?

The current statistics are stored in browser localStorage. To store them in the database:

1. Create user accounts (authentication)
2. Update `Statistics.jsx` to use `statsApi` instead of localStorage
3. Associate stats with user IDs

This is a future enhancement. For now, localStorage works well for single-user scenarios.

## Production Deployment

When deploying:

1. **Backend**: Deploy to Heroku, Railway, or Render
2. **Database**: Use the platform's PostgreSQL addon
3. **Frontend**: Update `.env` with production API URL:
   ```
   VITE_API_URL=https://your-backend.herokuapp.com/api
   ```
4. **Environment Variables**: Set all backend env vars on hosting platform

## Next Steps

1. ✅ Backend integration complete
2. 🎯 Test all features with database
3. 🔄 (Optional) Add CSV upload to database
4. 🚀 Deploy to production

Need help? Check:
- `backend/README.md` - Backend API documentation
- `BACKEND_SETUP.md` - Database setup guide
- Backend logs for debugging

Happy coding! 🎉
