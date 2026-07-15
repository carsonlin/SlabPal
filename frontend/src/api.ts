// Single source of truth for the backend base URL.
// Override per-environment with VITE_API_URL (e.g. in frontend/.env.production);
// falls back to the local dev server so `npm run dev` works with no config.
export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000"
