# AGENTS.md — personalSite

Matt Pelnik's personal site, with information about him: a React SPA plus the REST APIs behind a few earlier projects, which stay on the site as live demos. One Express app serves it all. It runs on an EC2 instance under PM2. GitHub Actions tests every PR and deploys merges to `main`.

## Who this is for

These instructions are for every AI agent working in this repo, whatever the model. `CLAUDE.md` only imports this file, so every agent reads the same text. "You" means whichever agent is reading, and "Matt" is the repo owner.

Two GitHub workflows also run an agent. This file calls them by their role, not their model:

- **The reviewer** (`claude-pr-review.yml`) reviews each PR.
- **The fixer** (`claude-issue-fix.yml`) attempts small fixes on issues Matt labels `claude-fix`.

If you are running as one of them, the parts about that role apply to you. Otherwise they are separate agents, and their comments are feedback to triage (see Addressing PR review comments), not instructions from Matt.

Where things are (the code is the source of truth for the details):

- `app.js` builds the Express app: it mounts `/api`, serves `build/`, answers 404 for any other path with a file extension, then sends every other path its prerendered page (listed in `build/prerendered.json`) or the empty app shell, `build/spa.html`. **New routes must be registered before that fallback**, or the SPA swallows them. `server.js` only listens on the ports and shuts down gracefully; tests load `app.js` directly.
- `src/api/<module>/{api,db,tests}`: one module per API, mounted in `src/api/index.js`. Modules: `auth` (`/api/auth`), `fitness-tracker` (`/api/fitness`), `juicebox` and `scents` (the backend for the Netlify storefront). Each has its own Postgres database: `AUTH_DATABASE_URL`, `FITNESS_DATABASE_URL`, `DATABASE_URL` (juicebox) and `SCENTS_DATABASE_URL`. Database pools are only created through `src/api/createPool.js`.
- `src/api/health.js` serves `GET /api/health` (every database; 503 if one is down) and `GET /api/metrics` (memory snapshot; 404 unless `ADMIN_TOKEN` is set). `server.js` logs the same snapshot as one JSON line every 5 minutes, and `npm run metrics:report <log>` summarizes them.
- The frontend is built with Vite (`vite.config.mts`). `index.html` at the project root loads `src/index.tsx`, and `public/` is copied to `build/` as-is.
- After `vite build`, `scripts/prerender.mjs` loads `/`, `/about` and `/about/stats` in headless Chromium and saves their rendered HTML, with a title, description and canonical link, so crawlers that don't run JavaScript see the content. React renders over it in the browser as usual. To prerender another page, add it to `ROUTES` in that script. Building needs Playwright's Chromium (`npx playwright install chromium`).
- `src/components/` holds the site's pages. `src/fullReactProjects/` holds the three demo apps from earlier projects (fitness, juicebox, stranger).

---

## Development

```bash
docker compose up db -d --no-recreate   # local Postgres, shared by every clone
# Existing Docker volumes need this once: docker compose exec db createdb -U postgres auth
npm run seed:all          # seed all four databases
npm run dev               # Express on 3000 + Vite dev server on 3001
npm run build             # compile the frontend to build/ and prerender pages
npm run typecheck         # tsc --noEmit (Vite doesn't type-check; CI runs this)
npm run lint              # ESLint (CI fails on errors, not warnings)
npm run prod              # production server: port 80, plus 443 when Keys/ has certs
```

In development, open http://localhost:3001. Vite proxies `/api` to Express, so the frontend always calls its APIs with same-origin paths (`/api/fitness`, `/api/juicebox`). Never hardcode a host.

Copy `.env.example` to `.env`. `JWT_SECRET` is shared by juicebox and fitness auth. `STRIPE_KEY` is only needed for scents payments. Tests don't need a `.env`: any database URL it doesn't set defaults to the docker-compose Postgres (`tests/support/localDatabases.js`).

### Sharing the machine with other agents

Matt often has several agents working at once, each in its own clone or worktree of this repo. They share one Postgres container and the machine's ports.

- `docker compose up db -d --no-recreate` from any clone starts that one container, or does nothing if it's already running. Always pass `--no-recreate`: the `init-db.sql` mount path differs in each clone, so without it Compose restarts the container under everyone else. Never run `docker compose down` or remove the container: other agents are using it, and `down -v` deletes every database.
- Never kill a process you didn't start. If a port is taken, another agent's server probably has it. Wait, or tell Matt.
- Test runs reset the shared databases, so a run in another clone at the same time can fail yours. Rerun before treating a failure as real.
- Before creating a branch, check that the name is free: `git ls-remote --heads origin <name>`. Never push to a branch another agent is working on.

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

**Before pushing** a branch or opening a PR, with local Postgres running (`docker compose up db -d --no-recreate`), run:

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e              # on macOS: functional + screenshot tests
npm run test:e2e:functional   # elsewhere: screenshot baselines are macOS-only (run npm run build first)
```

- **Screenshots only run locally:** CI runs the first three and the functional e2e tests, but not the screenshot comparisons. So a branch that skipped `npm run test:e2e` on a Mac can pass CI and still change how the site looks. Say so in the PR if you couldn't run the screenshots.
- **Updating baselines:** if a screenshot changes on purpose, update them with `--update-snapshots` and look at the new images before committing them. Never commit screenshot files that aren't `-darwin`.

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
- `typescript` in `package.json` aliases `@typescript/typescript6` to provide the TS 6 API for `typescript-eslint`; `tsc` remains TS 7 from `@typescript/native`. Don't change the alias or bump `typescript` to 7 until `typescript-eslint` supports TS 7. Fix new lint findings in site code rather than suppressing them; any `eslint-disable` needs a `--` reason.
- Dev vs. production behavior is switched with `process.env.NODE_ENV`.

### Adding login to a project

Mount `authenticate(ensureProfile)` from `src/api/auth` on the module's router. Use `requireAccount` / `requireAdmin` for account access, or the module's own `requireUser` for `req.user`. Give the module a profile table keyed by the account id. Never add a password column or login endpoint to a module.

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
- Reference them in the PR description:
  - `Fixes #N` for issues the PR fully resolves (GitHub closes them on merge)
  - `Refs #N` for related or partially addressed issues
- Commits that fix a specific issue reference it in the message, e.g. `fix: hang on JWT without id (#12)`.
- When reviewing a PR (as the reviewer or in a local session), read each linked issue with `gh issue view N --comments` and confirm the change actually addresses it. Flag a PR that claims to fix an issue it doesn't, or that fixes a known open issue without linking it. If a linked issue has a design spec (see Feature specs), check the PR against it too.

### Feature specs

New features are often designed by one agent and built by another, possibly a different model. The spec lives on the feature's GitHub issue so both agents, and the reviewer, read the same version.

- **Designing:** open an issue labeled `enhancement`. Its body states the goal and why it matters, in a few lines. The first comment holds the spec, starting with the heading `## Design spec`. It covers:
  - the goal, and what's out of scope
  - the files to change, and the steps in order
  - design decisions, each with its reason
  - the tests to add or update
  - acceptance criteria: how to tell the work is done
  - deployment considerations (env vars, server steps, migrations), or "none"

  Write it for an agent that hasn't seen the conversation it came from: name exact files, functions and commands, and leave no open questions. If the work won't fit in one PR (see Instructions), split the spec into numbered parts, one PR each, with the merge order. To revise the spec, edit that comment rather than adding a new one, so there's only ever one current version.
- **Building:** read the issue and its spec comment (`gh issue view N --comments`) before changing anything, and follow the spec. Don't redesign it.
  - Small mismatches with the code, such as a moved file or a renamed function, you can adapt to. List each one under "Deviations from spec" in the PR description.
  - If following the spec would change behavior or a design decision, or the spec is wrong, stop and comment on the issue saying what's wrong. Don't improvise.
  - The PR says `Fixes #N` (or `Refs #N` for one part of a split spec).
- **Reviewing:** flag any difference between the PR and the spec that isn't listed as a deviation, and any acceptance criterion the PR doesn't meet.

Specs are built in local sessions, not by the fixer.

### Automated review and fixes

**The reviewer** (`claude-pr-review.yml`) runs once when a non-draft PR opens or is marked ready, not on every push. It skips Dependabot's PRs, which CI still tests. Matt can re-run it by commenting the trigger word on the PR; agents never do (see the last rule under Addressing PR review comments). It posts a minute or two after the PR opens, so if you open a PR during a task, check for its review before you report the task done.

**The fixer** (`claude-issue-fix.yml`) runs on an issue when Matt adds the `claude-fix` label. Nothing runs on new issues by default, so each run is a deliberate choice.

- The fixer triages first. It only writes a fix if the fix is small and self-contained. Otherwise it comments with the cause and a proposed plan, then stops.
- It pushes a `claude/issue-N-...` branch and comments a pre-filled "Create PR" link. Matt opens the PR, so CI and the reviewer run as normal. The fixer never merges.
- Cost limits: Sonnet, `--max-turns 20`, a 20-minute job timeout, and one run per issue at a time. Set a monthly spend limit on the `ANTHROPIC_API_KEY` in the Anthropic Console as a backstop.
- Only label issues that are clearly described and worth an automated attempt. For anything larger, fix it in a local session.

### Addressing PR review comments

This applies when asked to address review comments on a PR, either once or on a recurring loop (such as `/loop` in Claude Code).

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
- One pass per review: fix, push once, post a summary comment, then stop. On a loop, end it when a check finds no new comments, or after 3 rounds, whichever comes first.
- Before pushing a fix, check that the PR is still open (`gh pr view N --json state`). Matt sometimes merges while you're working, and a push after the merge strands the commit on a recreated branch.
- If you opened a PR during the pass, wait for the reviewer to post on it before reporting the pass done.
- **Never write `@claude` in a PR comment, review reply, or PR description, in any capitalization, even inside backticks.** This applies to every agent, whatever the model. The reviewer's workflow matches it as a case-insensitive substring of the raw comment, so `@Claude` or `` `@claude` `` also fires. A local session posts as the repo owner, so this would re-trigger the reviewer and start a review/fix loop. Call it "the reviewer" instead.

## Instructions

- Keep each PR to one straightforward change: one bug fix, one feature, or one config change. Small PRs are easier to review, revert and test.
  - If a request covers several things, split it into several PRs, each on its own branch from `main`, or from the branch of the PR it depends on.
  - When PRs depend on each other, say so in each description and give the merge order. Otherwise note that they're independent.
  - Problems found along the way that aren't part of the change get logged as an issue (see Issue Tracking), not added to the current PR.
- The PR description is the record of the change: its goal, the design decisions and why, deployment considerations, and anything Matt should know. When building from a design spec, link the issue rather than repeating the spec, and add "Deviations from spec". Write the description in full before the PR leaves draft, because the reviewer reads it once, when the PR opens or is marked ready. To change it later, use `gh pr edit N --body-file <file>`.
- For working notes that need to outlast a session (a to-do list, findings in progress), use `agent-notes.md` at the repo root. It's ignored by git and is scratch, not a record: anything that matters goes into the PR description or the issue.
