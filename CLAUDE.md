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
- Serves Let's Encrypt challenge files at `/.well-known/acme-challenge/` from `ACME_WEBROOT` (default `/var/www/certbot`), outside `build/` so deploys don't wipe them

### Frontend

React 19 SPA with TypeScript, built with Vite (`vite.config.mts`). `index.html` at the project root loads `src/index.tsx`. Files in `public/` are copied to `build/` as-is. Components live in `src/components/`, organized by feature. There are also three full embedded React applications in `src/fullReactProjects/` (FitnessTrackerFrontEnd, juicebox, stranger) that are portfolio demos.

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
  tests/       # Jest + supertest tests
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
npm run dev        # Express (port 3000) + Vite dev server (port 3001) concurrently
npm run build      # Compile React app to /build (do NOT run on EC2)
npm run typecheck  # tsc --noEmit (Vite doesn't type-check; CI runs this)
npm run prod       # Start production server (serves /build on port 80)
```

Open the site at http://localhost:3001 in development. Vite proxies `/api` requests to Express, so the frontend always calls its APIs with same-origin paths (`/api/fitness`, `/api/juicebox`). Never hardcode a host.

**Never run `npm run build` on the EC2 server** — it doesn't have enough memory. Builds happen in GitHub Actions.

### Environment Variables

Copy `.env.example` to `.env` and fill in values. Key vars:
- `DATABASE_URL`, `FITNESS_DATABASE_URL`, `SCENTS_DATABASE_URL` — PostgreSQL connection strings
- `JWT_SECRET` — used by juicebox and fitness-tracker auth
- `STRIPE_KEY`, `PROD_STRIPE_KEY` — optional, for scents payments
- `API_URL` — base URL for the fitness API
- `ACME_WEBROOT` — optional; the certbot webroot (default `/var/www/certbot`)

### Database Setup (local)

```bash
docker compose up db -d     # start Postgres
npm run seed:all            # seed all three databases
```

---

## Testing

All tests need local Postgres (`docker compose up db -d`).

```bash
npm test                     # all API tests (same as npm run test:api)
npm run test:fitness         # fitness API tests only
npm run test:e2e             # build, then all Playwright tests including screenshots
npm run test:e2e:functional  # Playwright without screenshots (what CI runs)
```

**API tests (Jest + supertest).** `jest.config.js` has one project per API module: `fitness`, `juicebox`, `scents` and `core` (the `/api` router and admin). Select one with `--selectProjects`. Each project's `tests/setup.js` rebuilds its database. Tests mount the real `/api` router (`tests/support/apiApp.js`), so error shapes and status codes match production.

**End-to-end tests (Playwright, `tests/e2e/`).** They run against `build/` served by the real `server.js` on port 3100, after reseeding juicebox and fitness. The fixture in `tests/e2e/fixtures.ts`:

- blocks analytics
- forwards hardcoded `https://pelnik.dev/api/...` calls to the local server
- mocks the third-party Stranger's Things API
- fails a test on any console error or failed request (use `allowErrors` for expected ones)

Screenshot baselines (`tests/e2e/__screenshots__/`) are macOS-specific and run locally only. Update them with `--update-snapshots` only when a visual change is intended.

**Safety:**

- Test setup refuses to drop tables unless the database host is local (`tests/support/assertLocalDatabase.js`).
- `stripe` is stubbed in test files, and `STRIPE_KEY` is forced to a dummy value (`tests/support/testEnv.js`). The scents seed archives every product in whatever Stripe account it's given.

**Known bugs.** Tests named `KNOWN BUG: …` pin current buggy behavior on purpose. When fixing one, update that test in the same change.

Tests run automatically in GitHub Actions on every PR and push to `main` via `.github/workflows/ci.yml`.

---

## Deployment

Handled entirely by `.github/workflows/ci.yml`. On merge to `main`:

1. `test` job runs all API tests, builds React on GitHub's runner, runs the functional e2e tests against that build, and uploads `build/` as an artifact
2. `deploy` job (only if tests pass) downloads that same `build/`, rsyncs it to EC2, then SSHes in to `git pull` and restart PM2

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
- Components are `.tsx`, some older utilities are `.jsx`. Any file containing JSX must use a `.jsx`/`.tsx` extension (Vite requires it)
- `useEffect` for side effects (including `document.title` updates per page)
- Barrel exports via `index.js` files — import from parent directory, not individual files. Exception: pages lazy-loaded with `React.lazy` in `src/components/Main.tsx` import their module directly, so they get their own chunk
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
├── Keys/                      # SSL certificates (gitignored); certbot's deploy hook copies renewed certs here
├── .github/workflows/
│   ├── ci.yml                 # CI/CD — test + deploy pipeline
│   ├── claude-pr-review.yml   # Automated Claude review on PRs
│   ├── claude-issue-fix.yml   # Claude fix attempt on issues labeled claude-fix
│   └── cert-expiry.yml        # Weekly check; opens an issue if the SSL cert has < 1/4 of its lifetime (max 21 days) left
├── DEPLOYMENT.md              # Deployment setup guide
└── docker-compose.yml         # Local dev database
```

## Issue Tracking

Bugs are tracked as GitHub Issues on `pelnik/personalSite`, labeled `bug`. Non-bug improvements use `enhancement`.

### Logging bugs

- When you find a bug outside the scope of the current task, log it as an issue instead of fixing it inline or only mentioning it in chat.
- Search for duplicates first: `gh issue list --state all --search "<keywords>"`. If one exists, add a comment to it instead.
- Create with `gh issue create --label bug --title "..." --body "..."`. The body should include:
  - what happens vs. what should happen
  - steps to reproduce (route, request, or test command)
  - the relevant files and line numbers
  - severity: does it affect the live site, a demo app, or only dev/tests?
- Don't log speculative or cosmetic findings as bugs.

### Linking issues to PRs

- Before pushing a branch or opening a PR, check open issues (`gh issue list --state open`) for any the change fixes or touches.
- Reference them in the PR description and in `pr_info.md`:
  - `Fixes #N` for issues the PR fully resolves (GitHub closes them on merge)
  - `Refs #N` for related or partially addressed issues
- Commits that fix a specific issue reference it in the message, e.g. `fix: hang on JWT without id (#12)`.
- When reviewing a PR (including the automated Claude PR review), read each linked issue with `gh issue view N` and confirm the change actually addresses it. Flag a PR that claims to fix an issue it doesn't, or that fixes a known open issue without linking it.

### Automated fixes (`claude-fix` label)

`.github/workflows/claude-issue-fix.yml` runs Claude on an issue when the repo owner adds the `claude-fix` label. Nothing runs on new issues by default, so each run is a deliberate choice.

- Claude triages first. It only writes a fix if the fix is small and self-contained. Otherwise it comments with the cause and a proposed plan, then stops.
- It pushes a `claude/issue-N-...` branch and comments a pre-filled "Create PR" link. You open the PR, so CI and the Claude review run as normal. Claude never merges.
- Cost limits: Sonnet, `--max-turns 20`, a 20-minute job timeout, and one run per issue at a time. Set a monthly spend limit on the `ANTHROPIC_API_KEY` in the Anthropic Console as a backstop.
- Only label issues that are clearly described and worth an automated attempt. For anything larger, fix it in a normal session.

The PR review (`claude-pr-review.yml`) runs once when a non-draft PR opens or is marked ready, not on every push. Comment `@claude` on the PR to re-run it.

### Addressing PR review comments

This applies when asked to address review comments on a PR, either once or on a `/loop`.

- Read the comments to handle:
  - Conversation comments: `gh pr view N --comments`. Skip any you've already replied to.
  - Inline threads: the REST comments endpoint can't tell resolved from unresolved, so use GraphQL and only handle unresolved threads that don't already have your reply:

    ```bash
    gh api graphql -F n=N --jq '.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved|not)' -f query='
      query($n:Int!){repository(owner:"pelnik",name:"personalSite"){pullRequest(number:$n){
        reviewThreads(first:100){nodes{isResolved path line comments(first:20){nodes{databaseId author{login} body}}}}}}}'
    ```
- Triage each comment before changing anything:
  - **Fix** clear correctness, security, or data-loss problems.
  - **Decline** style, naming, or optional suggestions. Reply with a short reason and don't change code, unless the change is trivially right and in scope.
  - **Leave for Matt** anything that's a judgment call: design, scope, or a behavior change. List these in the summary.
- Reply on each thread with what happened: fixed in `<sha>`, declined and why, or left for Matt. For inline threads, reply to the thread's first comment: `gh api repos/pelnik/personalSite/pulls/N/comments/<databaseId>/replies -f body='...'`.
- One pass per review: fix, push once, post a summary comment, then stop. On a `/loop`, end the loop when a check finds no new comments, or after 3 rounds, whichever comes first.
- **Never write `@claude` in a PR comment, review reply, or PR description, in any capitalization, even inside backticks.** The review workflow matches it as a case-insensitive substring of the raw comment, so `@Claude` or `` `@claude` `` also fires. A local session posts as the repo owner, so this would re-trigger the automated review and start a review/fix loop. Call it "the Claude review" instead.

## Claude Instructions

- For each new feature update, maintain working markdown file pr_info.md, an ignored file in the repo, with information about the goal of the feature, design decisions made, reasons for each design, considerations for deployment to site, and any other relevant information for yourself and for me. This will ultimately be used in the PR description.
