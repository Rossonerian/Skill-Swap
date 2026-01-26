# Skill Swap

Minimal README for local development and deployment.

## Running the app locally

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Deployment

This project can be deployed to Vercel or any static hosting that supports Vite builds. To build for production:

```bash
npm run build
npm run preview
```

## API Endpoints

- `GET /api/health` — Health check endpoint.
- `GET /api/items` — List items.
- `GET /api/items/:id` — Get item details.

## Environment

When integrating with Supabase, set your environment variables (example):

```
VITE_SUPABASE_URL=https://your-supabase-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

## Stack

- Vite
- TypeScript
- React
- Tailwind CSS

## Notes

- This project was generated from a template. References to external generator tooling have been removed.
