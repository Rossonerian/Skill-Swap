# Skill Swap

**A student peer-to-peer skill exchange app.** Users create profiles, list skills they can teach and want to learn, discover matched peers, and chat to arrange skill swaps.

---

## What is Skill Swap?

- **For students**: Find peers to exchange skills with (e.g., "I teach Python, want to learn UI Design").
- **Matching engine**: Automatically pairs users with reciprocal skill interests (you teach what they want to learn, and vice versa).
- **Real-time chat**: Connect with matched peers to discuss and arrange skill exchanges.

---

## How It Works

### 1. **Sign Up & Profile**
- Register with email/password.
- Create profile: add year of study, skills you can **teach**, and skills you want to **learn**.

### 2. **Get Matched**
- The app uses `matchService.ts` to score potential matches based on complementary skills.
- View a list of top matches with match scores and reasons.

### 3. **Chat & Connect**
- Click on a match to open a chat.
- Exchange messages and arrange how/when to swap skills.

---

## Architecture

### Frontend (React + Vite)
- **Location**: `src/`
- **Key files**:
  - `src/pages/`: Page components (Auth, Dashboard, Browse, Matches, Chat, Profile).
  - `src/contexts/AuthContext.tsx`: Manages login/signup and JWT tokens.
  - `src/services/api.ts`: Adapter layer that talks to your backend API.
  - `src/services/matchService.ts`: Match scoring algorithm.

### Backend (Node.js + Express + TypeScript)
- **Location**: `server/`
- **Key files**:
  - `server/src/index.ts`: Express server with routes for auth, profiles, matches, conversations, and messages.
  - `server/src/middleware.ts`: JWT authentication middleware.
  - `server/src/supabase.ts`: Supabase database client.
  - `server/schema.sql`: Database schema, tables, and SQL functions.

### Database (Supabase PostgreSQL)
- Stores user profiles, skill lists, matches, conversations, and messages.
- Uses Row-Level Security (RLS) to ensure users only see their own data.

### Two deployment modes:

#### **Local/Development Mode**
- All data stored in browser `localStorage`.
- No backend needed.
- Great for testing and offline use.

#### **Production Mode (Cloud)**
- Frontend hosted on **Vercel**.
- Backend API hosted on **Render**.
- Database on **Supabase**.
- Full multi-user, persistent data sharing.

---

## Quick Start

### Prerequisites
- Node.js 18+, npm, and git.

### 1. Install & Build Locally

```bash
# Install dependencies
npm install

# Install backend dependencies
cd server && npm install && cd ..

# Build backend for production
cd server && npm run build && cd ..

# Build frontend for production
npm run build
```

### 2. Run Locally (Development)

```bash
# Terminal 1: Start frontend dev server
npm run dev
# Opens http://localhost:5173

# Terminal 2: Start backend
cd server
SUPABASE_URL=<your-url> SUPABASE_SERVICE_ROLE_KEY=<your-key> npm start
# Backend runs on http://localhost:8888
```

### 3. Test Backend Health

```bash
curl http://localhost:8888/health
# Should return: {"status":"ok"}
```

---

## Environment Variables

### Frontend (`.env.local`)
Create this file in the project root:

```
VITE_API_URL=http://localhost:8888
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-key
```

### Backend (`server/.env.local`)
Create this file in the `server/` directory:

```
PORT=8888
JWT_SECRET=<generate with: openssl rand -base64 32>
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

---

## Production Deployment

### Render (Backend)

1. **Connect your GitHub repo to Render**.
2. **Create a new Web Service** pointing to the `server/` directory.
3. **Configure**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
4. **Add Environment Variables** in Render dashboard:
   - `PORT`
   - `JWT_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. **Deploy** — Render will build and start your backend.

### Vercel (Frontend)

1. **Connect your GitHub repo to Vercel**.
2. **Configure**:
   - Framework: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Add Environment Variables**:
   - `VITE_API_URL=https://your-render-service.onrender.com` (update with your Render URL)
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
4. **Deploy** — Vercel will build your React app and serve it globally.

### Supabase (Database)

1. **Create a Supabase project**.
2. **In Supabase SQL Editor, run `server/schema.sql`** to create tables and RLS policies.
3. **Grab your credentials** (Project URL and Service Role Key) from **Settings → API**.
4. **Add them to Render and Vercel env vars** (see above).

---

## Verifying Deployment is Working

### Check Backend Health
```bash
# Replace with your Render URL
curl https://your-render-service.onrender.com/health
# Expected: {"status":"ok"}
```

### Check Frontend is Live
- Visit your Vercel URL (shown in Vercel dashboard).
- You should see the Skill Swap login page.

### Test Full Flow
1. **Sign up** on the live frontend.
2. **Add some skills** to your profile.
3. **Check Supabase SQL Editor** — verify your user appears in the `profiles` table.
4. **Go to Matches** — if other profiles exist, you'll see matches.
5. **Try sending a message** in chat — check `messages` table in Supabase.

---

## File Structure

```
Skill-Swap/
├── src/                    # React frontend
│   ├── contexts/          # Auth context
│   ├── pages/             # Route pages
│   ├── services/          # API adapter, match service
│   └── components/        # UI components
├── server/                # Node.js backend
│   ├── src/
│   │   ├── index.ts       # Express server
│   │   ├── middleware.ts  # JWT auth
│   │   └── supabase.ts    # DB client
│   └── schema.sql         # Database setup
├── package.json           # Frontend deps
├── vite.config.ts         # Vite bundler config
└── README.md              # This file
```

---

## Troubleshooting

### Backend won't start
- ❌ **Error**: `Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY`
- ✅ **Fix**: Ensure those env vars are set in `server/.env.local` or in Render dashboard, then restart.

### Frontend can't reach backend
- ❌ **Error**: Network request fails
- ✅ **Fix**: Verify `VITE_API_URL` is correct in frontend `.env.local` and backend is running.

### Render deploy fails
- ❌ **Check**: Render build logs for errors.
- ✅ **Fix**: Ensure all 4 env vars are set in Render dashboard before redeploying.

### Vercel says "Build Failed"
- ❌ **Check**: Vercel build logs.
- ✅ **Fix**: Verify `VITE_API_URL` and Supabase env vars are in Vercel project settings.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn UI |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL (Supabase) |
| **Auth** | JWT tokens |
| **Hosting** | Vercel (frontend), Render (backend), Supabase (db) |

---

## Security Notes

- **Passwords**: Hashed using bcrypt in production (see `server/src/index.ts` for auth routes).
- **JWT**: Tokens signed with `JWT_SECRET`; keep it secret!
- **RLS**: Supabase Row-Level Security policies ensure users only see their own data.
- **CORS**: Backend only accepts requests from your Vercel domain.

---

## Next Steps / Future Features

- [ ] Image upload for user avatars.
- [ ] Skill tag autocomplete from a shared catalog.
- [ ] Push notifications for new matches or messages.
- [ ] Skill ratings and reviews after exchanges.
- [ ] Advanced filters (campus, major, availability).
- [ ] Video call integration for skill lessons.

---

**Questions?** Check the backend logs in Render, frontend console in your browser, or Supabase SQL Editor to debug any issues.
