# Visual Studio Setup Guide

This guide explains how to open and work with the Traditional Chinese Flashcards project in Visual Studio.

## Prerequisites

### Required
- **Visual Studio 2019 or 2022** (Community, Professional, or Enterprise)
- **Node.js Development Tools** workload installed
- **Node.js** v14+ installed separately
- **PostgreSQL** v12+ installed

### Installing Node.js Development Tools

1. Open **Visual Studio Installer**
2. Click **Modify** on your Visual Studio installation
3. Go to **Workloads** tab
4. Check **Node.js development**
5. Click **Modify** to install

## Opening the Solution

### Method 1: From Visual Studio

1. Open Visual Studio
2. Click **File** → **Open** → **Project/Solution**
3. Navigate to your project folder
4. Select `TCFlashcardsReact.slnx`
5. Click **Open**

### Method 2: From File Explorer

1. Navigate to your project folder
2. Double-click `TCFlashcardsReact.slnx`
3. Visual Studio will open automatically

## Solution Structure

The solution contains two projects:

```
TCFlashcardsReact (Solution)
├── backend (Node.js Project)
│   └── Runs on port 3001
└── TCFlashcardsReact (JavaScript/Vite Project)
    └── Runs on port 5173
```

## Working with the Projects

### Setting Startup Projects

#### Option 1: Run Both Projects (Recommended)

1. Right-click on the **Solution** in Solution Explorer
2. Select **Properties**
3. Choose **Multiple startup projects**
4. Set both `backend` and `TCFlashcardsReact` to **Start**
5. Click **OK**

Now pressing **F5** or clicking **Start** will run both projects!

#### Option 2: Run One Project at a Time

1. Right-click on the project you want to run
2. Select **Set as Startup Project**
3. Press **F5** or click **Start**

### Running the Backend

**In Solution Explorer:**
1. Right-click on **backend** project
2. Select **Set as Startup Project**
3. Press **F5** or **Ctrl+F5**

**Or use npm commands:**
1. Right-click on **backend** project
2. Select **Open Command Prompt Here**
3. Run: `npm run dev`

### Running the Frontend

**In Solution Explorer:**
1. Right-click on **TCFlashcardsReact** project
2. Select **Set as Startup Project**
3. Press **F5** or **Ctrl+F5**

**Or use npm commands:**
1. Right-click on **TCFlashcardsReact** project
2. Select **Open Command Prompt Here**
3. Run: `npm run dev`

## First-Time Setup

### 1. Install Dependencies

**For Backend:**
1. In Solution Explorer, right-click **backend** project
2. Select **Open Command Prompt Here**
3. Run: `npm install`

**For Frontend:**
1. In Solution Explorer, right-click **TCFlashcardsReact** project
2. Select **Open Command Prompt Here**
3. Run: `npm install`

**Or from Solution Root:**
1. Right-click on Solution
2. Select **Open Command Prompt Here**
3. Run: `npm run install:all`

### 2. Configure Backend Environment

1. In Solution Explorer, find `backend/.env.example`
2. Right-click → **Copy**
3. Right-click on **backend** folder → **Paste**
4. Rename to `.env`
5. Double-click `.env` to edit
6. Update with your PostgreSQL credentials:
   ```
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=chinese_flashcards
   DB_HOST=localhost
   DB_PORT=5432
   PORT=3001
   ```

### 3. Initialize Database

1. Create the database in PostgreSQL first
2. Right-click on **backend** project
3. Select **Open Command Prompt Here**
4. Run: `npm run init-db`
5. Run: `npm run seed-db`

## Debugging in Visual Studio

### Debugging the Backend

1. Set **backend** as startup project
2. Press **F5** (or click **Start Debugging**)
3. Visual Studio debugger attaches to Node.js
4. Set breakpoints in JavaScript files
5. Use standard debugging features (F10, F11, Watch, etc.)

### Debugging the Frontend

1. Set **TCFlashcardsReact** as startup project
2. Press **F5**
3. Vite dev server starts
4. Browser opens automatically
5. Use browser DevTools (F12) for frontend debugging

### Debugging Both Simultaneously

1. Set **Multiple startup projects** (both to Start)
2. Press **F5**
3. Both servers start
4. Use Visual Studio debugger for backend
5. Use browser DevTools for frontend

## Solution Explorer Organization

```
Solution 'TCFlashcards'
│
├── Solution Items
│   ├── README.md
│   ├── QUICK_REFERENCE.md
│   ├── BACKEND_SETUP.md
│   ├── FRONTEND_INTEGRATION.md
│   └── Other documentation files
│
├── backend
│   ├── config/
│   │   └── db.js
│   ├── routes/
│   │   ├── flashcards.js
│   │   └── stats.js
│   ├── scripts/
│   │   ├── init-db.js
│   │   └── seed-db.js
│   ├── server.js
│   ├── package.json
│   └── .env (you create this)
│
└── TCFlashcardsReact
    ├── src/
    │   ├── components/
    │   ├── services/
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── public/
    ├── index.html
    ├── package.json
    └── .env (already exists)
```

## Useful Visual Studio Features

### Task Runner Explorer

1. View → **Other Windows** → **Task Runner Explorer**
2. Shows all npm scripts from package.json
3. Double-click to run scripts
4. Right-click for options (Run, Debug, etc.)

### NPM Script Task Runner

You can run npm scripts directly:
1. In Solution Explorer, expand **npm** node under project
2. Right-click on any script (e.g., "dev", "build")
3. Select **Run Script**

### External Web Tools

Configure external tools for npm:
1. Tools → **Options**
2. Projects and Solutions → **External Web Tools**
3. Add paths to Node.js and npm if needed

### IntelliSense

- Works for JavaScript/JSX files
- Auto-completion for imports
- Hover for documentation
- Go to Definition (F12)
- Find All References (Shift+F12)

## Common Tasks

### Installing a New Package

**Method 1: Command Line**
1. Right-click project → **Open Command Prompt Here**
2. Run: `npm install package-name`

**Method 2: Package Manager**
1. Right-click project → **npm** → **Install New npm Packages**
2. Search and install

### Updating Packages

1. Right-click project
2. Select **npm** → **Update npm Packages**

### Building for Production

**Frontend:**
1. Right-click **TCFlashcardsReact**
2. Open Command Prompt
3. Run: `npm run build`

**Backend:**
1. Backend doesn't need building
2. Just copy files to server

### Viewing Logs

- **Output Window**: View → **Output** (Ctrl+W, O)
- **Error List**: View → **Error List** (Ctrl+\, E)
- **Server logs appear in Output window**

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Start Debugging | F5 |
| Start Without Debugging | Ctrl+F5 |
| Stop Debugging | Shift+F5 |
| Build Solution | Ctrl+Shift+B |
| Solution Explorer | Ctrl+Alt+L |
| Output Window | Ctrl+W, O |
| Error List | Ctrl+\, E |
| Go to Definition | F12 |
| Find All References | Shift+F12 |
| Format Document | Ctrl+K, Ctrl+D |

## Troubleshooting Visual Studio Issues

### "Node.js not found"

**Solution:**
1. Install Node.js from nodejs.org
2. Restart Visual Studio
3. Tools → Options → Projects and Solutions → External Web Tools
4. Add Node.js path if needed

### "Cannot run script"

**Solution:**
1. Right-click project → **Open Command Prompt Here**
2. Run: `npm install` to ensure dependencies exist
3. Check package.json for correct scripts

### "Port already in use"

**Solution:**
1. Stop debugging (Shift+F5)
2. Close all Node.js processes in Task Manager
3. Or change ports in:
   - Backend: `backend/.env` (PORT=3001)
   - Frontend: `vite.config.js`

### "Debugger won't attach"

**Solution:**
1. Ensure Node.js Development Tools are installed
2. Check project file (.njsproj) is valid
3. Try closing and reopening solution
4. Restart Visual Studio

### IntelliSense not working

**Solution:**
1. Close and reopen files
2. Delete `.vs` folder (hidden folder in solution directory)
3. Restart Visual Studio
4. Tools → Options → Text Editor → JavaScript/TypeScript → IntelliSense

## Working Without Visual Studio

You can still use the project without Visual Studio:

**Using Command Line:**
```bash
# From project root
npm run dev                  # Run both
npm run dev:backend          # Backend only
npm run dev:frontend         # Frontend only
```

**Using VS Code:**
1. Open project folder in VS Code
2. Use integrated terminal
3. Follow QUICK_REFERENCE.md

## Git Integration

Visual Studio has built-in Git support:

1. **Team Explorer** (Ctrl+\, Ctrl+M)
2. **View** → **Git Changes** (Ctrl+0, Ctrl+G)
3. Commit, push, pull directly from VS
4. View history and branches

**Important:** `.env` files are in `.gitignore` - don't commit them!

## Performance Tips

1. **Close unused projects**: Right-click → Unload Project
2. **Disable unused extensions**: Extensions → Manage Extensions
3. **Clear Visual Studio cache**: Close VS, delete `.vs` folder
4. **Use Ctrl+F5** for faster startup (no debugging)

## Additional Resources

- **Solution Documentation**: Check Solution Items folder
- **Backend API**: See `backend/README.md`
- **Frontend Guide**: See `TCFlashcardsReact/README.md`
- **Setup Help**: See `BACKEND_SETUP.md`
- **Quick Reference**: See `QUICK_REFERENCE.md`

## Getting Help

If you encounter issues:

1. Check **Output Window** for errors
2. Check **Error List** for build errors
3. Review project documentation
4. Check npm script outputs
5. Verify Node.js and PostgreSQL are installed

---

**Ready to start developing?**

1. Open `TCFlashcards.sln` in Visual Studio
2. Set **Multiple startup projects** (both to Start)
3. Press **F5**
4. Start coding! 🚀

加油！(jiā yóu!)
