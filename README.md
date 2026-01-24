# RMV Stainless Steel Fabrication - Frontend

This is the frontend web app (React + Vite). It needs the backend API running.

Backend repo (separate): https://github.com/sean-camara/RMV-Stainless-Steel-Fabrication-Backend

## Quick Start (TL;DR) - Docker (recommended)

Docker is the default and recommended way to run this project to avoid Node/version mismatches.

1. Start the backend first (see backend README). It should expose the API at http://localhost:5000.
2. Copy env file:
   ```bash
   # PowerShell
   Copy-Item .env.example .env
   ```
3. Set `VITE_API_URL=http://localhost:5000/api` in `.env`.
4. Run:
   ```bash
   docker compose up --build
   ```
5. Open: http://localhost:5173

## Quick start (Docker - recommended)

Prerequisite:
- Docker Desktop

Steps:
1. Start the backend (in its repo):
   - Follow the backend README
   - Make sure API is running at http://localhost:5000
2. Clone this repo:
   ```bash
   git clone https://github.com/sean-camara/RMV-Stainless-Steel-Fabrication.git
   cd RMV-Stainless-Steel-Fabrication
   ```
3. Create your env file:
   ```bash
   # PowerShell
   Copy-Item .env.example .env

   # macOS/Linux
   cp .env.example .env
   ```
4. Set `VITE_API_URL` in `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
5. Start the frontend:
   ```bash
   docker compose up --build
   ```
6. Open the app:
   http://localhost:5173

Stop containers:
```bash
docker compose down
```

## Quick start (Local - no Docker)
This is optional. Use Docker above unless you specifically need local Node tooling.

Prerequisites:
- Node.js 18+
- npm
- Git
- Backend running on http://localhost:5000

Steps:
1. Clone this repo:
   ```bash
   git clone https://github.com/sean-camara/RMV-Stainless-Steel-Fabrication.git
   cd RMV-Stainless-Steel-Fabrication
   ```
2. Create your env file:
   ```bash
   # PowerShell
   Copy-Item .env.example .env

   # macOS/Linux
   cp .env.example .env
   ```
3. Install dependencies:
   ```bash
   npm install
   # or: npm ci
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. Open the app:
   http://localhost:5173

## Environment variables (.env)

Required:
- VITE_API_URL (example: http://localhost:5000/api)

Optional:
- FRONTEND_URL
- NODE_ENV

Note: VITE_API_URL can be set to http://localhost:5000 or
http://localhost:5000/api. The axios client will append /api if missing.

## VS Code setup (simple)

1. Install extensions:
   - ESLint
   - Tailwind CSS IntelliSense
   - Docker (if using Docker)
2. Open this repo in VS Code.
3. Run one of these:
   - Docker: `docker compose up --build`
   - Local: `npm run dev`

## Troubleshooting

- Login/API errors:
  - Confirm backend is running and `VITE_API_URL` is correct.
  - Ensure backend CORS allows http://localhost:5173.
- Docker frontend not reachable:
  - Make sure the container runs with `--host 0.0.0.0` (handled in Dockerfile).
