# CLAUDE.md — personalSite

Matt Pelnik's portfolio site: a React SPA plus several portfolio REST APIs, all served by one Express app. It runs on an EC2 instance under PM2. GitHub Actions tests every PR and deploys merges to `main`.

Where things are (the code is the source of truth for the details):

- `app.js` builds the Express app: it mounts `/api`, serves `build/`, answers 404 for any other path with a file extension, then sends `build/index.html` for every other path. **New routes must be registered before that fallback**, or the SPA swallows them. `server.js` only listens on the ports and shuts down gracefully; tests load `app.js` directly.
- `src/api/<module>/{api,db,tests}`: one module per API, mounted in `src/api/index.js`. Modules: `fitness-tracker` (`/api/fitness`), `juicebox` and `scents` (the backend for the Netlify storefront). Each has its own Postgres database: `FITNESS_DATABASE_URL`, `DATABASE_URL` (juicebox) and `SCENTS_DATABASE_URL`. Database pools are only created through `src/api/createPool.js`.
- `src/api/health.js` serves `GET /api/health` (every database; 503 if one is down) and `GET /api/metrics` (memory snapshot; 404 unless `ADMIN_TOKEN` is set). `server.js` logs the same snapshot as one JSON line every 5 minutes, and `npm run metrics:report <log>` summarizes them.
- The frontend is built with Vite (`vite.config.mts`). `index.html` at the project root loads `src/index.tsx`, and `public/` is copied to `build/` as-is.
- `src/components/` holds the site's pages. `src/fullReactProjects/` holds three embedded portfolio demo apps (fitness, juicebox, stranger).

---

## Development

```bash
docker compose up db -d   # local Postgres
npm run seed:all          # seed all three databases
npm run dev               # Express on 3000 + Vite dev server on 3001
npm run build             # compile the frontend to build/
npm run typecheck         # tsc --noEmit (Vite doesn't type-check; CI runs this)
npm run prod              # production server: port 80, plus 443 when Keys/ has certs
```

In development, open http://localhost:3001. Vite proxies `/api` to Express, so the frontend always calls its APIs with same-origin paths (`/api/fitness`, `/api/juicebox`). Never hardcode a host.

Copy `.env.example` to `.env`. `JWT_SECRET` is shared by juicebox and fitness auth. `STRIPE_KEY` is only needed for scents payments.

**Never run `npm run build` on the EC2 server.** It doesn't have enough memory. Builds happen in GitHub Actions.

---

## Testing

All tests need local Postgres.

```bash
npm test                     # all API tests (same as npm run test:api)
npm run test:fitness         # fitness API tests only
npm run test:e2e             # build, then all Playwright tests including screenshots
npm run test:e2e:functional  # Playwright without screenshots (what CI runs)
```

- **API tests** are Jest projects: `fitness`, `juicebox`, `scents`, and `core` (the `/api` router and shared helpers). Pick one with `--selectProjects`. Each project rebuilds its database. Tests mount the real `/api` router, so status codes and error shapes match production.
- **E2E tests** run Playwright against `build/`, served by the real `server.js` on port 3100. The shared fixture fails a test on any console error or failed request; pass `allowErrors` for expected ones. Screenshot baselines are macOS-only and run locally. Update them with `--update-snapshots` only for intended visual changes.
- **Safety:**
  - Test setup refuses to drop tables unless the database host is local.
  - Stripe is stubbed and given a dummy key. The scents seed archives every product in whatever Stripe account it's given.
- **Known bugs:** tests named `KNOWN BUG: …` pin current buggy behavior on purpose. When fixing one, update that test in the same change.

---

## Deployment

`.github/workflows/ci.yml` handles it:

- On every PR, the `test` job runs the API tests, builds, and runs the functional e2e tests. Merging requires it to pass; an admin can override this from the PR in an emergency.
- On merge to `main`, the `deploy` job rsyncs that tested `build/` to EC2, then SSHes in to `git pull`, run `npm ci --omit=dev`, and start PM2 fresh from `ecosystem.config.js` (process `personalsite`; heap cap, heap snapshots, memory restart limit). A health check on `/api/health` fails the job if the server doesn't come back.
- Secrets: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, `EC2_PROJECT_PATH`.
- Server setup, one-time steps, checking memory (heap snapshots, `npm run metrics:report`) and rollback: `DEPLOYMENT.md`.
- **The server's Node version comes from `.nvmrc`.** The deploy's `nvm use` picks it, and `interpreter` in `ecosystem.config.js` makes PM2 run the app on that binary. Changing it needs manual steps on the server first (install, port capability, `nvm alias default`, `pm2 update`; see `DEPLOYMENT.md`), or the next deploy fails at `nvm use` and restores the previous commit.

SSL:

- `server.js` reads certs from `Keys/`.
- `app.js` serves certbot's HTTP challenges from `ACME_WEBROOT` (default `/var/www/certbot`). That folder is outside `build/` because the deploy's `rsync --delete` replaces `build/`.
- `cert-expiry.yml` checks the cert weekly.

---

## Code Conventions

### Backend (JavaScript)

- Route handlers use `async/await`. No `.then()` chains, anywhere in the repo.
- Errors have the shape `{ name, message }` and are passed on with `next(error)`, never thrown directly to the client.
- SQL is always parameterized (`$1`, `$2`).
- To read a single row: `const { rows: [item] } = await client.query(...)`.
- Each module exports its DB functions from a barrel file, `db/index.js`.
- camelCase for JS names, snake_case for DB columns.
- `dependencies` is only for what the server needs at runtime, because EC2 installs with `npm ci --omit=dev`. Frontend packages go in `devDependencies`. Prefer pure-JS server packages (e.g. `bcryptjs`); the 512 MB instance can't be relied on to compile native addons.

### Frontend (TypeScript/React)

- Functional components with hooks; no class components.
- Components are `.tsx`. Some older utilities are `.jsx`. Any file containing JSX must use a `.jsx` or `.tsx` extension, because Vite requires it.
- Side effects go in `useEffect`, including the per-page `document.title` update.
- Import from a folder's `index.js` barrel file, not from individual files. Exception: pages lazy-loaded with `React.lazy` in `src/components/Main.tsx` import their module directly, so each gets its own chunk.
- TypeScript runs in strict mode. JS files are allowed but not type-checked.
- Dev vs. production behavior is switched with `process.env.NODE_ENV`.

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

- Keep each PR to one straightforward change: one bug fix, one feature, or one config change. Small PRs are easier to review, revert and test.
  - If a request covers several things, split it into several PRs, each on its own branch from `main`, or from the branch of the PR it depends on.
  - When PRs depend on each other, say so in each description and give the merge order. Otherwise note that they're independent.
  - Problems found along the way that aren't part of the change get logged as an issue (see Issue Tracking), not added to the current PR.
- For each new feature update, maintain working markdown file pr_info.md, an ignored file in the repo, with information about the goal of the feature, design decisions made, reasons for each design, considerations for deployment to site, and any other relevant information for yourself and for me. This will ultimately be used in the PR description.
