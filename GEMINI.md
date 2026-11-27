# Project Context: Interaction Tracker (MERN Stack)

## Folder Structure
- `backend/`: Node.js, Express.js, and MongoDB Atlas (Mongoose) REST API.
- `frontend/`: React + Vite single-page application.

## Token & Quota Conservation Rules
- **Strict Ignore List:** Never read, search, or list files inside `backend/node_modules/`, `frontend/node_modules/`, `frontend/dist/`, `.git/`, or `.vscode/`.
- **Targeted File Reads:** Only read the specific routes, models, controllers, or components mentioned in the prompt or directly imported by them. Do not scan the entire codebase unless explicitly asked.
- **Minimal Diffs:** Output clean, surgical edits to existing files rather than rewriting entire files from scratch.

## Development & Stack Conventions
- **Frontend (Vite):** Use `import.meta.env.VITE_*` for client-side environment variables (never `process.env`). Keep dev server commands targeted (`cd frontend && npm run dev`).
- **Backend & Database (MongoDB Atlas):** Use Mongoose schemas/models in `backend/` and standard `process.env` variables. Never hardcode MongoDB Atlas connection strings, credentials, or IP rules.
- **Environment Variables:** Never read, print, or modify `.env` files in `backend/` or `frontend/` unless explicitly instructed.
- **Dependencies:** Check `backend/package.json` or `frontend/package.json` before installing or importing new packages.
- **API & Frontend Alignment:** When modifying a backend Express route or Mongoose schema, check the corresponding frontend API call/state so request and response payloads stay in sync.
