# Skill Swap

Skill Swap is a student-focused skill exchange app built with React + TypeScript (Vite). Users register, create profiles listing skills they can teach and learn, get matched, and chat.

## Current architecture

### Local-first development (default)
- Frontend: `src/` React app, `npm run dev` for local dev.
- Local DB: `src/services/localDb.ts` uses `localStorage` and `local_db.json` (dev helper script `scripts/local_db_tool.py`).
- Matching: `src/services/matchService.ts` computes score based on reciprocal teach/learn skills.
- Auth: `src/contexts/AuthContext.tsx` with local sign-up/sign-in fallback.
- Chat: `src/services/appwriteService.ts` + local service stubs.

### Production full-stack (current target)
- Frontend hosting: Vercel deploy from repo root.
- Backend API: Render Node service in `server/`.
- Database: Supabase Postgres.

## Key project files
- `src/contexts/AuthContext.tsx`: auth state, API requests to backend, token storage.
- `src/services/api.ts`: backend adapter (`/auth/login`, `/matches`, `/profile`, `/conversations`, `/messages`).
- `server/src/index.ts`: Express routes, JWT auth middleware, Supabase calls.
- `server/src/supabase.ts`: Supabase client instantiation via env vars.
- `server/schema.sql`: table definitions and RPC functions for match generation etc.
- `src/services/matchService.ts`: local service logic and scoring.

## Environment variables
### Frontend (`.env.local`)
- `VITE_API_URL` (e.g., `https://...onrender.com`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

### Backend (`server/.env.local` or Render service env)
- `PORT` (example: 8888)
- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Setup
1. `npm install`
2. `npm run dev` (frontend local)
3. In another shell: `cd server && npm install && npm run build && npm start`
4. Hit `http://localhost:5173`, and API health at `<backend>/health`.

## Supabase setup
1. Create Supabase project.
2. Run `server/schema.sql`.
3. Add RLS / policies (also in SQL file comments).
4. Set env vars in Render and locally.

## Render deployment checklist
- App type: Web Service, `root` path `server/`.
- Build command: `npm install && npm run build`
- Start command: `npm run start` (or `node ./dist/index.js`)
- Environment variables present.

## Vercel deployment checklist
- Add `VITE_API_URL` in Vercel dashboard.
- Build: `npm run build`
- Output directory: `dist`

## Current status
- Local backend + frontend works with env setup tested.
- SQL match function return type fixed.
- Render deployment fails when env vars missing; ensure Render service envs are set and redeploy.

## Notes
- Local storage mode remains available for quick prototyping.
- Full cloud data sharing requires Supabase-backed endpoints in `server/`.
- Passwords in local mode are plain text; production must use hashed credentials and secure auth flows.
