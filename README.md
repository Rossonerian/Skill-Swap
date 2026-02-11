# Skill Swap

Skill Swap is a student‑focused skill‑exchange app. Students create a profile, list skills they can **teach** and **want to learn**, and get matched with other students for chat‑based exchanges.

The current version is completely **backend‑less** in terms of external services – all data is stored locally in the browser as JSON using `localStorage`, which makes it ideal for demos, prototyping, and offline use.

---

## Features

- **Authentication (local JSON)**
  - Email + password sign up and sign in.

- **Profile management**
  - **Year selector**: dropdown with `1st year`, `2nd year`, `3rd year`, `4th year`, and `Pass-out` (only one value at a time).
  - Read‑only email field sourced from authentication.
  - Profile completeness flag (`is_profile_complete`) persisted.
- **Skills (teach / learn)**
  - Separate lists for:
    - **Skills you can teach** (e.g. React, UI design).
    - **Skills you want to learn** (e.g. TypeScript, public speaking).
  - Add skills via input + “Add” button or Enter key.
  - Skills are stored on the profile as:
## Deployment (local-first)

This project is intended to run completely locally as a single-page Vite app.

- **Build command**: `npm run build`
- **Output directory**: `dist`

SPA routing is supported when serving `dist` from a static host. For local
development, use the preview command:

```bash
npm run build
npm run preview
```

Note: Vercel/Render-specific configs have been removed to keep the repo
focused on local development.
  - Shows:
    - Match score and type.
    - Key reasons for the match.
    - Skills they can teach and want to learn.

- **Chat**
  - Conversation list with last message preview and unread counts.
  - Full chat window with:
    - Grouped messages by day.
    - Timestamps (“Today 3:20 PM”, “Yesterday …”).
    - Typing indicator stub (UI only; local backend logs typing events to console).
  - Messages are stored locally per conversation; read/unread state is persisted.

### UI & UX

- **Design system**
  - Tailwind CSS + custom design tokens defined in `src/index.css`.
  - Primary palette: pastel blue, lavender, and mint.
  - Glassmorphism cards (`.glass-card`), glowing hero buttons, and subtle shadows.

- **Layout**
  - `Navbar` with:
    - Desktop top bar (logo, nav buttons, avatar dropdown).
    - Mobile top bar with slide‑in menu.
    - Mobile bottom nav bar with icons.
  - Pages use a shared **animated gradient background** (`.gradient-bg`).

- **Animations**
  - Framer Motion for page, card, and chat message animations.
  - Tailwind utilities for fade/slide/scale‑in on page sections.

---

## Architecture

### Frontend

- **Framework**: React 18 + TypeScript.
- **Bundler**: Vite.
- **Routing**: `react-router-dom`.
- **State / data**:
  - React Query for network‑style data flows (currently used in parts of the app).
  - Custom hooks for conversations, messages, typing indicators, and auth.

### Local JSON “backend”

All persistent data is stored in the browser using `localStorage`, abstracted by `src/services/localDb.ts`. The schema looks like this:

- `users`: `{ id, email, name, password }[]`
- `profiles`: `Profile[]` (see `src/types/index.ts`)
- `matches`: `LocalMatch[]`
- `conversations`: `{ id, match_id, created_at }[]`
- `messages`: `{ id, conversation_id, sender_id, content, is_read, created_at }[]`

The main services that use this local DB:

- `src/contexts/AuthContext.tsx`
  - Handles sign up/sign in/sign out via `localDb` (`localSignUp`, `localSignIn`, `localSignOut`).
  - Restores current user from a session key in `localStorage`.

- `src/pages/Profile.tsx`
  - Loads / saves profile using `getProfileByUserId` and `upsertProfile`.

- `src/services/matchService.ts`
  - Reads profiles and their `skills_teach` / `skills_learn` to compute match scores.
  - Persists match results in local JSON (`readMatches`, `writeMatches`).
  - Exposes:
    - `generateMatchesForUser(userId)`
    - `getUserMatches(userId)`
    - `getAllUsersWithScores(userId)`

- `src/services/appwriteService.ts` (now local)
  - Reimplemented to use the same JSON DB instead of Appwrite:
    - `fetchConversationsForUser`
    - `fetchMessagesForConversation`
    - `markMessagesRead`
    - `sendMessageToConversation`
  - `createMessagesChannel` / `removeChannel` return dummy values and act as no‑ops for realtime (sufficient for single‑device use).

> **Note:** The old Appwrite integration code is still present but unused. The app runs fully against `localDb` by default.

---

## Running the app locally

### Prerequisites

- Node.js 18+ (recommended).
- npm (comes with Node).

### Install dependencies

```bash
npm install
```

### Start the dev server

```bash
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Build & preview production bundle

```bash
npm run build
npm run preview
```

The build output is written to the `dist/` folder.

### Local DB tool

For quick local testing and to manipulate the app's local JSON database from the terminal, use the bundled helper script:

```bash
# initialize an empty local_db.json (optional)
./scripts/local_db_tool.py init

# add a user
./scripts/local_db_tool.py add-user --email you@example.com --password secret --name "Your Name"

# upsert a profile for an existing user
./scripts/local_db_tool.py upsert-profile --user-id user_xxx --name "Your Name" --college "My University"

# add a message to a conversation
./scripts/local_db_tool.py add-message --conversation-id convo_xxx --sender-id user_xxx --content "hello"

# show the full DB
./scripts/local_db_tool.py show
```

The script reads/writes `local_db.json` at the repository root. It's intended for local development only and mirrors the shape used by the app's `src/services/localDb.ts`.

---

## Data storage & resetting

Because the backend is fully local:

- All data is **stored per browser/device**.
- Clearing **site data** or **localStorage** will reset the app to a fresh state.

To reset manually in the browser:

1. Open DevTools → Application (or Storage) tab.
2. Under **Local Storage**, find your app’s origin.
3. Delete keys starting with:
   - `skill_swap_local_db_v1`
   - `skill_swap_session_user_id`

---

## Git & GitHub (keep simple)

This repo is configured for a simple `main`-first workflow. Recommended
practices to keep GitHub interactions minimal and predictable:

- Work locally on feature branches, but merge to `main` for releases.
- Use SSH keys for authentication to avoid credential popups.
- Keep CI minimal or disable it if you only want local builds (no `.github/workflows` present).

Common commands:

```bash
# Install deps
npm ci

# Start dev server
npm run dev

# Build for production
npm run build

# Push local main to GitHub (SSH remote expected)
git checkout main
git pull origin main
git push origin main
```

If you want me to simplify history (squash or rewrite) or remove remote branches,
I can do that — but it is destructive. Ask before a force-push.

---

## API endpoints (demo only)

The project still includes a small demo API under `/api` for examples/prototyping:

- `GET /api/health` — Health check.
- `GET /api/items` — Returns a list of mock items.
- `GET /api/items/:id` — Returns a single mock item by ID.

These endpoints are **not** used by the main Skill Swap flows; they’re only illustrative.

---

## Tech stack

- **Language**: TypeScript
- **Framework**: React 18
- **Build tool**: Vite
- **Styling**:
  - Tailwind CSS
  - Custom CSS design system (`src/index.css`)
- **UI components**:
  - Shadcn‑style UI components in `src/components/ui`
  - Lucide icons
- **Animations**:
  - Framer Motion
- **State / data**:
  - React Query (for async data patterns)
  - Custom hooks for auth, conversations, messages, typing indicator

---

## Limitations & future improvements

- **Single‑device only**:
  - All data lives in the browser; there is no shared backend.
  - Two different devices/browsers will not see each other’s profiles or messages.

- **Security**:
  - Passwords are stored in plain text in local JSON – acceptable for a prototype but **not** for production.

- **Realtime**:
  - Typing indicators and message subscriptions are local stubs; there is no cross‑device realtime.

### Possible next steps

- Replace local JSON storage with a real backend (e.g. Appwrite, Supabase, or custom Node/Express + database).
- Implement proper authentication with hashed passwords and tokens.
- Add image upload for avatars and richer profile fields (links, tags).
- Improve skill management with autocomplete and shared skill catalog.
- Add notifications and more advanced match workflows (accept/reject/invite).

---

## License

This project is intended as a learning/prototype project. Add a license here if you plan to publish or share it more broadly.
