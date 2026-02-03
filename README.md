# Study Management App (Jira-lite)

A production-ready study and task management app with Kanban board, Google Sheets sync, Pomodoro timer, and progress dashboard. Built with React, TypeScript, Vite, and Tailwind CSS.

## Features

- **Task management**: Create, edit, delete tasks with title, description, status, priority, due date, tags, and time estimates
- **Kanban & list views**: Drag-and-drop Kanban board and table list view
- **Quick create**: `Ctrl/Cmd+K` to open quick task modal; smart parsing e.g. `Study React #coding !high @tomorrow 2h`
- **Google Sheets**: Optional sync with a Google Sheet as database (OAuth 2.0)
- **Offline-first**: Tasks cached in IndexedDB; works without Google Sheets
- **Pomodoro timer**: 25 min focus / 5 min break with optional notifications
- **Progress dashboard**: Today/week/month stats, goals, upcoming deadlines
- **Focus mode**: Hide completed tasks, show only high-priority
- **Dark mode**: Toggle with `Ctrl/Cmd+D`, persisted
- **Keyboard shortcuts**: New task (K), Search (/), Dark mode (D), Escape to close modals

## Screenshots

_Add screenshots of the app here (e.g. Kanban view, Dashboard, Timer)._

## Tech stack

- **Frontend**: React 19, TypeScript, Vite 7
- **Styling**: Tailwind CSS v4
- **State**: Zustand (tasks, UI, filters)
- **Database**: Google Sheets API v4 (optional) + Dexie (IndexedDB) for offline cache
- **UI**: Radix UI (Dialog, Select, Switch), Lucide React, date-fns
- **Drag and drop**: @dnd-kit
- **Hosting**: Netlify (static)

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd Project1
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in if you use Google Sheets:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_GOOGLE_CLIENT_ID` | OAuth 2.0 Client ID (Web application) |
| `VITE_GOOGLE_API_KEY` | Google API Key |
| `VITE_GOOGLE_SHEET_ID` | ID of the Google Sheet (from the sheet URL) |

**Google Sheets API setup**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g. "Study Manager")
3. Enable **Google Sheets API**
4. Create **OAuth 2.0 credentials** (Web application)
5. Add **Authorized JavaScript origins**:  
   `http://localhost:5173`, `https://yourdomain.netlify.app`
6. Add **Authorized redirect URIs**: same as above
7. Create an **API Key** (optional, for unauthenticated quota)
8. Create a Google Sheet and set its name to **Tasks**. Add header row in the first row (include **Owner** so each user sees only their own tasks):

   | Task ID | Title | Description | Status | Priority | Due Date | Tags | Estimated Hours | Actual Hours | Created At | Updated At | Completed At | Owner |

9. Copy the Sheet ID from the URL:  
   `https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit`

The app runs fully without these variables using local/offline storage only.

### 3. Local development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 4. Build

```bash
npm run build
```

Output is in `dist/`.

### 5. Deploy to Netlify

The repo includes `netlify.toml` and `public/_redirects`, so Netlify will build and route correctly once connected.

#### Option A: Deploy from Git (recommended)

1. **Push your code** to GitHub, GitLab, or Bitbucket.

2. **Log in to [Netlify](https://app.netlify.com)** and click **Add new site** → **Import an existing project**.

3. **Connect your repo** (e.g. GitHub) and select this project.

4. **Build settings** (usually auto-filled from `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Base directory:** leave empty unless the app lives in a subfolder

5. **Environment variables** (required for Google Sheets):
   - Go to **Site settings** → **Environment variables** → **Add variable** / **Import from .env**.
   - Add (or import) these for production:
     - `VITE_GOOGLE_CLIENT_ID`
     - `VITE_GOOGLE_API_KEY`
     - `VITE_GOOGLE_SHEET_ID`

6. **Deploy** – Click **Deploy site**. Netlify runs `npm run build` and publishes `dist/`.

7. **Google OAuth for production**  
   After the first deploy you’ll get a URL like `https://your-site-name.netlify.app`. In [Google Cloud Console](https://console.cloud.google.com/) → **APIs & Services** → **Credentials** → your OAuth 2.0 Client:
   - **Authorized JavaScript origins:** add `https://your-site-name.netlify.app`
   - **Authorized redirect URIs:** add `https://your-site-name.netlify.app`
   - Save. Sign-in and Sheets sync will then work on the live site.

#### Option B: Deploy by drag-and-drop

1. **Build locally:**
   ```bash
   npm run build
   ```
2. In Netlify: **Add new site** → **Deploy manually** → drag the **`dist`** folder into the drop zone.

Note: With drag-and-drop, env vars are not injected at build time. For Google Sheets you’d need a different way to provide them (e.g. deploy from Git and set variables in Netlify).

#### Redirects (SPA)

All routes go to `index.html` so the React app can handle them. This is set in `netlify.toml` and `public/_redirects`; no extra Netlify config needed.

## Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Open quick create task modal |
| `/` | Focus search (when not in an input) |
| `Ctrl/Cmd + D` | Toggle dark mode |
| `Escape` | Close modals / clear search focus |

## Project structure

```
src/
  components/
    Common/       # Button, Input, Select, Modal, Toast
    Layout/       # Navbar, Sidebar
    Task/         # TaskCard, TaskModal, TaskQuickCreate
    Board/        # KanbanBoard, KanbanColumn, ListView
    Dashboard/    # StatsCard, ProgressChart, UpcomingDeadlines
    Timer/        # PomodoroTimer, TimeTracker
  hooks/          # useTasks, useFilters, useGoogleSheets, useKeyboardShortcuts, useLocalStorage
  lib/            # googleSheetsClient, taskParser, dateUtils, db (Dexie), taskSchema
  store/          # taskStore, uiStore, filterStore
  types/          # task, filter
  utils/          # constants
  pages/          # BoardPage, DashboardPage, TimerPage, SettingsPage
  App.tsx, main.tsx
```

## Troubleshooting

- **Google sign-in not working**: Check authorized origins and redirect URIs in Google Cloud Console. Use HTTPS in production.
- **Sheet not updating**: Ensure the sheet name is exactly `Tasks` and the first row is the header. Check browser console for API errors.
- **Offline not persisting**: IndexedDB must be enabled; private/incognito may restrict it.
- **Build fails**: Run `npm run build` locally; fix any TypeScript or lint errors.

## Contributing

1. Fork the repo and create a feature branch.
2. Follow existing code style (TypeScript strict, no `any`).
3. Add tests for critical logic if applicable.
4. Open a pull request with a short description of changes.

## License

MIT (or your chosen license).
