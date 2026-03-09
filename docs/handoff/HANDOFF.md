# Handoff — AI Learning Hub

## Current State
Phase 4 complete — All pages, API, AI Chat, and Progress Report Agent functional.

## Last Completed
- Phase 0: All tools set up (Claude Desktop, Claude Code, GitHub, Jira, Confluence)
- Phase 1: Project configuration (CLAUDE.md, Django + React scaffolding)
- Phase 2: Core UI + Backend API
- Phase 3: All frontend pages + Chat integration
- Phase 4: Progress Report Agent + Email system

### Frontend (React + Vite + TypeScript + MUI v7)
- **DashboardPage** — Animated dashboard: StatCards (CountUp), Lernpfad preview, Leaderboard, Quick Action
- **LearningPathsPage** — 6 Lernpfade with search, filter chips, detail drawer with clickable lessons
- **LessonPage** — Splitscreen: lesson content (60%) + AI tutor chat (40%), breadcrumbs, complete button (+XP)
- **LeaderboardPage** — Top 10 ranked table with medals, avatars, highlighted current user, API-connected
- **AchievementsPage** — Achievement cards grid, locked/unlocked state, counter chip, API-connected
- **ChatPage** — Fullscreen free chat with welcome message, typing indicator
- **ProfilePage** — User avatar, level/XP stats, progress bar to next level, API-connected
- **ChatPanel** — Shared chat component (used in LessonPage + ChatPage): messages, typing dots, auto-scroll, error handling
- **StatCard** — Reusable card with RAF-based CountUp, gradient overlay, hover effects
- **API Client** — Axios instance (`src/api/client.ts`) + endpoint functions (`src/api/endpoints.ts`)
- **DashboardLayout** — Collapsible sidebar with user avatar "WS" at bottom
- Dark theme, Framer Motion v12 animations, responsive grids throughout

### Backend (Django 5.x + DRF)
- **Models**: UserProfile (auto-create via signal), Achievement, UserAchievement, LearningPath, Lesson, LessonProgress, ChatMessage
- **Seed data**: 3 learning paths (AI Grundlagen, Prompt Engineering, Agentic Workflows), 12 lessons, 5 achievements
- **API endpoints** (all under `/api/v1/`, AllowAny for dev):
  - `GET /profile/` — User profile
  - `GET /leaderboard/` — Top 10 by XP
  - `GET /achievements/` — All achievements + unlock status
  - `GET /paths/` — All learning paths with lesson count + progress
  - `GET /paths/{slug}/` — Single path with all lessons
  - `GET /lessons/{slug}/` — Single lesson
  - `POST /lessons/{slug}/complete/` — Mark lesson complete + award XP
  - `POST /chat/` — AI chat via Anthropic API (with lesson context or free chat)
  - `GET /admin/progress-report/` — JSON progress report (staff only)
- **Anthropic integration**: Claude Sonnet 4, conversation history (last 20 msgs), first_chat achievement auto-unlock
- **Progress Report Agent**: Management command `progress_report --email <addr> [--days N] [--format html|text]`
  - Collects per-user stats: level, XP, streak, completed lessons, path progress, achievements
  - HTML email with dark theme, inline CSS, progress bars
  - Text fallback format available
  - Console backend when no SMTP credentials configured
- **Email config**: SMTP with auto-fallback to console backend (see `.env.example`)
- **Superuser**: admin / admin123
- **Admin panel**: All models registered with list_display

## Startup Commands
```powershell
# Backend
cd backend
.\.venv\Scripts\python.exe manage.py runserver

# Frontend
cd frontend
npm run dev

# Progress Report
cd backend
.\.venv\Scripts\python.exe manage.py progress_report --email recipient@example.com
```

## Next Steps
- Add proper authentication (login/register flow, JWT or session-based)
- Replace frontend dummy data with live API data (Dashboard, LearningPaths still use hardcoded data)
- Write tests (CLAUDE.md demands 10-20+ per feature — currently 0 tests)
- Add Markdown rendering for lesson content
- Implement streak tracking logic
- Add achievement auto-check on lesson completion

## Known Issues
- Anthropic API key in `.env` is invalid — chat returns 503
- Dashboard and LearningPathsPage use hardcoded dummy data (not API-connected)
- All POST endpoints set to AllowAny for dev (needs auth before production)
- Dev fallback: anonymous requests use first User from DB
- No tests written yet
