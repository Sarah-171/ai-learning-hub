# Handoff — AI Learning Hub

## Current State
Phase 5 complete — Admin Report UI with persistent progress reports.

## Last Completed
- Phase 0: All tools set up (Claude Desktop, Claude Code, GitHub, Jira, Confluence)
- Phase 1: Project configuration (CLAUDE.md, Django + React scaffolding)
- Phase 2: Core UI + Backend API
- Phase 3: All frontend pages + Chat integration
- Phase 4: Progress Report Agent + Email system
- Phase 5: Admin Report UI — persistent reports, list/detail views, generate from frontend

### Frontend (React + Vite + TypeScript + MUI v7)
- **DashboardPage** — Animated dashboard: StatCards (CountUp), Lernpfad preview, Leaderboard, Quick Action
- **LearningPathsPage** — 6 Lernpfade with search, filter chips, detail drawer with clickable lessons
- **LessonPage** — Splitscreen: lesson content (60%) + AI tutor chat (40%), breadcrumbs, complete button (+XP)
- **LeaderboardPage** — Top 10 ranked table with medals, avatars, highlighted current user, API-connected
- **AchievementsPage** — Achievement cards grid, locked/unlocked state, counter chip, API-connected
- **ChatPage** — Fullscreen free chat with welcome message, typing indicator
- **ProfilePage** — User avatar, level/XP stats, progress bar to next level, API-connected
- **ReportsPage** — Report list table, "Neuen Report generieren" button, click to detail view
- **ReportDetailPage** — Summary cards (Users/Level/Lektionen), per-user cards with XP progress, path progress bars, lesson chips, achievements, Framer Motion stagger
- **ChatPanel** — Shared chat component (used in LessonPage + ChatPage): messages, typing dots, auto-scroll, error handling
- **StatCard** — Reusable card with RAF-based CountUp, gradient overlay, hover effects
- **API Client** — Axios instance (`src/api/client.ts`) + endpoint functions (`src/api/endpoints.ts`)
- **DashboardLayout** — Collapsible sidebar with Admin entry + user avatar "WS" at bottom
- Dark theme, Framer Motion v12 animations, responsive grids throughout

### Backend (Django 5.x + DRF)
- **Models**: UserProfile (auto-create via signal), Achievement, UserAchievement, LearningPath, Lesson, LessonProgress, ChatMessage, ProgressReport
- **ProgressReport model**: name (YYYYMMDD-Fortschrittstracking), data (JSONField with per-user stats), summary (HTML), total_users, avg_level, total_completed_lessons
- **Seed data**: 3 learning paths (AI Grundlagen, Prompt Engineering, Agentic Workflows), 12 lessons, 5 achievements
- **API endpoints** (all under `/api/v1/`):
  - `GET /profile/` — User profile
  - `GET /leaderboard/` — Top 10 by XP
  - `GET /achievements/` — All achievements + unlock status
  - `GET /paths/` — All learning paths with lesson count + progress
  - `GET /paths/{slug}/` — Single path with all lessons
  - `GET /lessons/{slug}/` — Single lesson
  - `POST /lessons/{slug}/complete/` — Mark lesson complete + award XP
  - `POST /chat/` — AI chat via Anthropic API (with lesson context or free chat)
  - `GET /reports/` — List all reports (AllowAny for dev)
  - `GET /reports/{id}/` — Single report with full data (AllowAny for dev)
  - `POST /reports/generate/` — Generate new report (AllowAny for dev)
- **Anthropic integration**: Claude Sonnet 4, conversation history (last 20 msgs), first_chat achievement auto-unlock
- **Progress Report**: Management command `progress_report` (no args needed)
  - Collects all user stats: level, XP, streak, completed lessons, path progress, achievements
  - Saves to DB as ProgressReport (update_or_create for same-day reports)
  - No email — all reports accessible via Admin UI
- **Superuser**: admin / admin123
- **Admin panel**: All models registered with list_display (incl. ProgressReport)

## Startup Commands
```powershell
# Backend
cd backend
.\.venv\Scripts\python.exe manage.py runserver

# Frontend
cd frontend
npm run dev

# Generate Progress Report (CLI)
cd backend
.\.venv\Scripts\python.exe manage.py progress_report
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
- All endpoints set to AllowAny for dev (needs auth before production)
- Dev fallback: anonymous requests use first User from DB
- No tests written yet
