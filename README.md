# Skill Swap 🎓

**A peer-to-peer student skill exchange platform.** Users create profiles, list skills they can teach and want to learn, discover matched peers, and chat in real-time to arrange skill swaps.

> **🏠 Current Status**: Running **Locally** with in-browser data storage. No backend or cloud services required.

---

## 📚 Table of Contents

- [What is Skill Swap?](#what-is-skill-swap)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Setup & Installation](#local-setup--installation)
- [Running Locally](#running-locally)
- [Architecture](#architecture)
- [File Structure Deep Dive](#file-structure-deep-dive)
- [Documentation](#documentation)

---

## What is Skill Swap?

**Skill Swap** is a platform that connects students to exchange knowledge and skills with peers. Instead of formal tutoring, students find classmates who can teach what they want to learn (and vice versa).

### Target Users
- 🎓 **Students** wanting to learn new skills from peers
- 👥 **Peer learners** looking to share expertise
- 🤝 **Collaborative learners** preferring informal knowledge exchange

---

## Key Features

✨ **Intuitive User Profiles**
- Sign up with email and password
- Add skills you can teach
- List skills you want to learn
- Include year of study and bio

🎯 **Smart Skill Matching**
- Automatic matching algorithm that finds reciprocal skill pairs
- Match scoring based on complementary interests
- View top matches with detailed scoring breakdown

💬 **Real-Time Chat**
- Direct messaging between matched peers
- Conversation history
- Typing indicators
- Message persistence (local storage)

📱 **Responsive Design**
- Mobile-first interface using Tailwind CSS
- Shadcn/ui component library for polished UX
- Smooth animations and transitions

---

## How It Works

### 1. **Sign Up & Build Your Profile**
   - Register with email and password (stored locally)
   - Create or edit your profile with:
     - Your name and year of study
     - **Skills you can teach** (e.g., JavaScript, Photography)
     - **Skills you want to learn** (e.g., UI Design, Spanish)

### 2. **Discover Matches**
   - The app analyzes skill compatibility with all other profiles
   - **Match Score**: Calculated based on skill overlap
     - You teach what they want to learn ✓
     - They teach what you want to learn ✓
   - Browse all matches or view your top matches

### 3. **Connect & Chat**
   - Click on any match to open a conversation
   - Send messages in real-time
   - Discuss skill swap details (time, format, topics)
   - Build your skill-sharing network

---

## Tech Stack

### Frontend
- **React 18** — UI library
- **Vite** — Lightning-fast build tool
- **TypeScript** — Type-safe JavaScript
- **Tailwind CSS** — Utility-first styling
- **Shadcn/ui** — Pre-built, customizable components
- **React Router** — Client-side navigation
- **TanStack Query** — Server state management
- **Framer Motion** — Smooth animations

### Storage (Local Mode)
- **Browser localStorage** — All data stored locally
- **JSON** — Simple file format for data persistence
- **No backend required** ✅

### Optional Cloud (Future)
- **Supabase** — PostgreSQL database, authentication, real-time
- **Express.js** — Node.js backend framework
- **Render** — Backend hosting
- **Vercel** — Frontend hosting

---

## Project Structure

```
skill-swap/
├── public/                    # Static assets
├── scripts/                   # Utility scripts (local DB tools)
├── src/
│   ├── pages/                # Full-page components (Auth, Dashboard, Chat, etc.)
│   ├── components/           # Reusable UI components
│   │   ├── ui/              # Shadcn/ui components
│   │   └── chat/            # Chat-specific components
│   ├── contexts/            # React Context (Authentication)
│   ├── hooks/               # Custom React hooks
│   ├── services/            # Business logic (API, matching, local DB)
│   ├── lib/                 # Utility functions
│   ├── types/               # TypeScript type definitions
│   └── demo/                # Demo data for testing
├── server/                  # Backend (Node.js + Express)
│   ├── src/
│   │   ├── index.ts        # Express server & routes
│   │   ├── middleware.ts   # JWT auth, headers
│   │   └── supabase.ts     # Supabase client
│   └── schema.sql          # Database schema (for cloud)
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts       # Tailwind CSS config
└── package.json            # Dependencies & scripts
```

---

## Local Setup & Installation

### Prerequisites
- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- A text editor (VS Code recommended)

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd Skill-Swap
```

### Step 2: Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install backend dependencies (optional, for cloud mode)
cd server && npm install && cd ..
```

### Step 3: Start Development Server
```bash
npm run dev
```

This starts the **Vite dev server** at `http://localhost:5173`:
- **Full hot module replacement (HMR)** — Changes are instant
- **Local data mode** — All data stored in browser
- **No backend needed** ✅

---

## Running Locally

### Development Mode (Recommended)
```bash
npm run dev
```
- Frontend dev server: **http://localhost:5173**
- Auto-reloads on file changes
- Uses browser localStorage for data
- Open in browser and start using immediately

### Production Build
```bash
npm run build
```
Creates optimized `dist/` folder ready for deployment.

### Preview Production Build
```bash
npm run build
npm run preview
```
Preview the production build locally at **http://localhost:4173**.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│         React Frontend (Vite)                   │
│  ┌──────────────────────────────────────────┐  │
│  │ Pages: Auth, Dashboard, Browse,          │  │
│  │ Matches, Chat, Profile                   │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │ Services Layer:                          │  │
│  │ - matchService (scoring algorithm)       │  │
│  │ - localDb (localStorage persistence)     │  │
│  │ - api (future backend adapter)           │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│      Browser Storage (Local Mode)               │
│                                                 │
│  localStorage: {                                │
│    users: [],        // Auth data              │
│    profiles: [],     // User skills & bios     │
│    matches: [],      // Computed matches       │
│    conversations: [], // Chat threads          │
│    messages: []      // Messages               │
│  }                                              │
└─────────────────────────────────────────────────┘
```

### Local Data Flow

1. **User Auth** → Stored in localStorage with JWT token
2. **Profile Creation** → Saved to localStorage profiles
3. **Skill Matching** → `matchService.ts` analyzes skills in real-time
4. **Chat Messages** → Persisted to localStorage conversations
5. **Page Refresh** → All data automatically restored from localStorage

---

## File Structure Deep Dive

### Pages (`src/pages/`)
- **Index.tsx** — Landing/home page
- **Auth.tsx** — Login/signup form
- **Dashboard.tsx** — Main user dashboard
- **Browse.tsx** — Browse all available skill profiles
- **Matches.tsx** — View matched pairs
- **Chat.tsx** — Real-time chat interface
- **Profile.tsx** — View/edit user profile

### Components (`src/components/`)
- **Navbar.tsx** — Top navigation bar
- **UserCard.tsx** — User profile card display
- **SkillTag.tsx** — Individual skill badge
- **MatchBadge.tsx** — Match score & percentage
- **SkeletonCard.tsx** — Loading placeholders
- **chat/ChatWindow.tsx** — Message display & input
- **chat/ConversationList.tsx** — List of active chats

### Services (`src/services/`)
- **localDb.ts** — Browser localStorage management
  - `getUsers()`, `addUser()`, `updateProfile()`
  - `getMatches()`, `updateMatches()`
  - `saveMessage()`, `getMessages()`
- **matchService.ts** — Skill matching algorithm
  - Calculates compatibility scores
  - Finds reciprocal skill pairs
- **api.ts** — Backend API adapter (for future cloud mode)

### Hooks (`src/hooks/`)
- **useConversations.ts** — Fetch and manage chat conversations
- **useMessages.ts** — Load and send messages
- **useTypingIndicator.ts** — Show typing status
- **use-mobile.tsx** — Detect mobile vs desktop

### Contexts (`src/contexts/`)
- **AuthContext.tsx** — User authentication state
  - Login/signup
  - JWT token management
  - User persistence

### Types (`src/types/`)
- **index.ts** — All TypeScript interfaces:
  - `User`, `Profile`, `Skill`, `Message`, `Match`, etc.

---

## How to Use

### Create an Account
1. Go to **http://localhost:5173**
2. Click **Sign Up**
3. Enter email and password
4. Create your profile with skills

### Add Skills
1. Go to **Profile** page
2. Add skills you **can teach** (e.g., "Python", "Guitar")
3. Add skills you **want to learn** (e.g., "UI Design", "Spanish")
4. Save profile

### Find Matches
1. Go to **Matches** page
2. View all automatic matches
3. See match scores and reasons
4. Click to view match details

### Chat with Matches
1. Click on any match
2. Open **Chat** page
3. Send messages to discuss skill exchanges
4. Arrange time, format, topics, etc.

### Test with Demo Data
Create multiple profiles with different skills to test the matching algorithm.

---

## Documentation

- **[DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md)** — Detailed deployment checklist, verification steps, and troubleshooting guide
- **Development** — See `vite.config.ts` and `tailwind.config.ts` for build configuration

---

## Environment Variables (Cloud Mode Only)

If deploying to the cloud in the future, create these files:

### Frontend (`.env.local`)
```
VITE_API_URL=http://localhost:8888
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your-key
```

### Backend (`server/.env.local`)
```
PORT=8888
JWT_SECRET=<generate with: openssl rand -base64 32>
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

**Note**: NOT needed for local development with localStorage mode.

---

## Build & Deployment (Future)

When ready to deploy to production:

```bash
# Build frontend for production
npm run build

# Build backend for production (if needed)
cd server && npm run build
```

The built files are:
- Frontend: `dist/` folder
- Backend: `server/dist/` folder

For detailed deployment instructions with Vercel, Render, and Supabase, see [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md).

---

## Troubleshooting Local Mode

| Issue | Solution |
|-------|----------|
| Data not persisting | Check localStorage is enabled in browser |
| Lost data after refresh | Clear browser cache carefully (data in localStorage) |
| Can't log in | Make sure localStorage has space (clear old data) |
| Slow matching | Reduce number of profiles (reload page to reset) |

---

## Technology Details

### Frontend Dependencies
- **@radix-ui/*** — Unstyled, accessible component primitives
- **class-variance-authority** — Style variant system
- **clsx** — Dynamic CSS class utility
- **embla-carousel-react** — Carousel/slider component
- **date-fns** — Date manipulation
- **framer-motion** — Animation library
- **react-hook-form & @hookform/resolvers** — Form validation
- **@tanstack/react-query** — Server state management
- **appwrite** — Backend-as-a-service SDK
- **@supabase/supabase-js** — Supabase client (for cloud mode)

### Backend (Optional)
- **Node.js 18+**
- **Express.js** — Web framework
- **TypeScript** — Type-safe server code
- **Supabase** — PostgreSQL database
- **jsonwebtoken** — JWT authentication

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m "Add feature"`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## License

This project is open source. See [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md) for more information.

---

## Support & Questions

- Check the **Troubleshooting Local Mode** section above
- Review [DEPLOYMENT_STATUS.md](DEPLOYMENT_STATUS.md) for deployment-specific issues
- Inspect browser console (F12) for error messages
- Check localStorage contents in DevTools → Application → Local Storage

---

**Happy skill swapping! 🎓**
- [ ] Advanced filters (campus, major, availability).
- [ ] Video call integration for skill lessons.

---

**Questions?** Check the backend logs in Render, frontend console in your browser, or Supabase SQL Editor to debug any issues.
