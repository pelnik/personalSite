# CLAUDE.md — personalSite

## Project Overview

This is Matt Pelnik's personal portfolio site and full-stack application showcase. It is a React + Express monorepo: the Express server serves the compiled React frontend as static files and also exposes several REST APIs for portfolio projects.

The site is deployed on an EC2 instance (Ubuntu, managed with PM2) and uses GitHub Actions for CI/CD — tests run on every PR, and merges to `main` automatically build the React app on GitHub's servers and deploy it to EC2 via rsync + SSH.

---

## Architecture

### Server

`server.js` at the project root is the Express entry point. It:
- Serves `build/` as static files (the compiled React app)
- Mounts all API routes under `/api`
- Falls back to `build/index.html` for all other routes (SPA behavior)
- Runs HTTP on port 80 (dev: 3000) and HTTPS on port 443 (dev: 3443) when SSL certs are present in `Keys/`

### Frontend

React 19 SPA with TypeScript. Entry point is `src/index.tsx`. Components live in `src/components/`, organized by feature. There are also three full embedded React applications in `src/fullReactProjects/` (FitnessTrackerFrontEnd, juicebox, stranger) that are portfolio demos.

### Backend APIs

Four API modules under `src/api/`, each mounted at its own path:

| Path | Module | Description |
|---|---|---|
| `/api/fitness` | `fitness-tracker` | Full fitness tracking REST API with auth |
| `/api/juicebox` | `juicebox` | Social post/tag platform API |
| `/api/scents` | `scents` | E-commerce API (redirects to Netlify storefront) |
| `/api/admin` | `admin` | Admin utilities |

Each module follows the same internal structure:
```
module-name/
  api/         # Express route handlers
  db/          # PostgreSQL query functions
  tests/       # Jest + supertest tests (fitness only)
```

### Databases

Three separate PostgreSQL databases, each with its own connection pool:

| Database | Env Var | Module |
|---|---|---|
| `juicebox` | `DATABASE_URL` | juicebox API |
| `fitness` | `FITNESS_DATABASE_URL` | fitness-tracker API |
| `scents` | `SCENTS_DATABASE_URL` | scents API |

All database clients use `pg.Pool` with SSL in production and a 30-second idle timeout. Each client module reconnects on error.

---

## Development

```bash
npm run dev        # Express (port 3000) + React dev server (port 3001) concurrently
npm run build      # Compile React app to /build (do NOT run on EC2)
npm run prod       # Start production server (serves /build on port 80)
```

**Never run `npm run build` on the EC2 server** — it doesn't have enough memory. Builds happen in GitHub Actions.

### Environment Variables

Copy `.env.example` to `.env` and fill in values. Key vars:
- `DATABASE_URL`, `FITNESS_DATABASE_URL`, `SCENTS_DATABASE_URL` — PostgreSQL connection strings
- `JWT_SECRET` — used by juicebox and fitness-tracker auth
- `STRIPE_KEY`, `PROD_STRIPE_KEY` — optional, for scents payments
- `API_URL` — base URL for the fitness API

### Database Setup (local)

```bash
docker compose up db -d     # start Postgres
npm run seed:all            # seed all three databases
```

---

## Testing

```bash
npm run test:fitness        # API integration tests (requires Postgres running)
npm run test:frontend       # Jest/jsdom frontend tests
```

The Jest config (`jest.config.js`) switches behavior based on `JEST_ENV`:
- `JEST_ENV=fitness` → runs fitness API tests against a real database with setup/teardown
- Default → runs frontend tests in jsdom with CSS/asset mocking

Tests run automatically in GitHub Actions on every PR and push to `main` via `.github/workflows/ci.yml`.

---

## Deployment

Handled entirely by `.github/workflows/ci.yml`. On merge to `main`:
1. `test` job runs the fitness API test suite
2. `deploy` job (only if tests pass) builds React on GitHub's runner, rsyncs `build/` to EC2, then SSHes in to `git pull` and restart PM2

Required GitHub secrets: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, `EC2_PROJECT_PATH`.

The EC2 server runs the Node process under PM2 (`pm2 start "npm run prod" --name personalsite`). PM2 binary path: `/home/ubuntu/.nvm/versions/node/v22.11.0/bin/pm2`.

See `DEPLOYMENT.md` for full setup details.

---

## Code Conventions

### Backend (JavaScript)

- All route handlers use `async/await` — no `.then()` chains anywhere
- Errors follow a consistent `{ name, message }` shape and are forwarded via `next(error)`, never thrown directly to the client
- Database queries use parameterized SQL (`$1`, `$2`) throughout
- The common pattern for extracting a single row: `const { rows: [item] } = await client.query(...)`
- DB functions are exported from a barrel `db/index.js` per module
- camelCase for JS variables and functions, snake_case for DB column names

### Frontend (TypeScript/React)

- Functional components with hooks throughout — no class components
- Components are `.tsx`, some older utilities are `.jsx`
- `useEffect` for side effects (including `document.title` updates per page)
- Barrel exports via `index.js` files — import from parent directory, not individual files
- Strict TypeScript enabled; JS files are allowed but not type-checked

### General

- No `.then()` chains — always async/await
- Environment-aware behavior (dev vs production) via `process.env.NODE_ENV`

---

## Project Structure Quick Reference

```
/
├── server.js                  # Express entry point
├── src/
│   ├── index.tsx              # React entry point
│   ├── api/
│   │   ├── index.js           # API router — mounts all sub-routers
│   │   ├── fitness-tracker/   # Fitness API + tests
│   │   ├── juicebox/          # Social post API
│   │   ├── scents/            # E-commerce API
│   │   └── admin/             # Admin utilities
│   ├── components/            # React components (TypeScript)
│   ├── fullReactProjects/     # Portfolio demo apps
│   ├── css/                   # Global stylesheets
│   └── types/                 # TypeScript type declarations
├── public/                    # Static assets (pre-build)
├── Keys/                      # SSL certificates (gitignored)
├── .github/workflows/
│   └── ci.yml                 # CI/CD — test + deploy pipeline
├── DEPLOYMENT.md              # Deployment setup guide
└── docker-compose.yml         # Local dev database
```

## Claude Instructions
- For each new feature update, maintain working markdown file pr_info.md, an ignored file in the repo, with information about the goal of the feature, design decisions made, reasons for each design, considerations for deployment to site, and any other relevant information for yourself and for me. This will ultimately be used in the PR description.