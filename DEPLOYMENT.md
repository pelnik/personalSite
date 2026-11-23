# Deployment and operations

How the site gets to the server, what the server needs, and how to check its memory.

## How a deploy works

Everything runs from `.github/workflows/ci.yml` on a merge to `main`:

1. **`test` job** (GitHub's runner):
   - type check
   - API tests
   - `npm run build`
   - functional e2e tests against that build
   - uploads `build/` as an artifact
2. **`deploy` job** (only if `test` passed):
   1. Downloads that same `build/` and rsyncs it to the server.
   2. Over SSH:
      - loads nvm, `git pull origin main`, then `nvm use` (the version in `.nvmrc`). If that version isn't installed on the server, the deploy stops here and the running server isn't touched.
      - `npm ci --omit=dev`: production dependencies only, because the frontend is already built
      - `pm2 delete personalsite`, then `pm2 start ecosystem.config.js` and `pm2 save`. The app is started fresh from the file so changed Node flags and limits apply; `pm2 restart` wouldn't pick them up.
      - `curl http://localhost/api/health`, retried for about 30 seconds. If the server doesn't come back healthy, the job fails.

**Never run `npm run build` on the server.** It doesn't have the memory, and it doesn't have the dev dependencies either.

GitHub secrets the deploy needs: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, `EC2_PROJECT_PATH`.

## The server

- **Instance:** an EC2 nano running Ubuntu, with 512 MB of RAM.
- **Node:** installed with nvm under `ubuntu`. The version is in `.nvmrc` (24); the deploy sources nvm and runs `nvm use`, because SSH sessions don't load nvm on their own. See [Upgrading Node](#upgrading-node).
- **Process manager:** PM2, running as `ubuntu`, configured by `ecosystem.config.js`:
  - heap capped at 192 MB
  - heap snapshots on `SIGUSR2`
  - restart if memory passes 300 MB
  - 12 seconds for a graceful shutdown
  - timestamped logs
- **Ports:** `server.js` serves HTTP on 80, and HTTPS on 443 with the certificates in `Keys/` (not in git; see [Certificates](#certificates)).
  - Binding ports below 1024 as a non-root user needs a capability on the `node` binary. Check with `getcap $(which node)`.
  - **Each new Node version needs this granted again** (see [Upgrading Node](#upgrading-node)), or the server can't bind 80 or 443.
- **`.env` in the project folder:**
  - `DATABASE_URL`, `FITNESS_DATABASE_URL`, `SCENTS_DATABASE_URL`, `AUTH_DATABASE_URL`
  - `JWT_SECRET`
  - `STRIPE_KEY`, `PROD_STRIPE_KEY`
  - `ADMIN_TOKEN` (optional; enables `/api/metrics`)
  - `METRICS_INTERVAL_MS` (optional)

## Certificates

The site uses Let's Encrypt certificates, renewed by certbot (set up in #23):

- **Getting and renewing certificates:** `certbot --webroot` writes HTTP-01 challenge files to `/var/www/certbot`, and `app.js` serves them at `/.well-known/acme-challenge/`. Set `ACME_WEBROOT` to use another folder. The folder is outside `build/`, because the deploy's `rsync --delete` replaces `build/`.
- **Installing a renewed certificate:** a certbot deploy hook, `/etc/letsencrypt/renewal-hooks/deploy/personalsite.sh`, copies the renewed files into `Keys/` under the names `server.js` reads, then runs `pm2 restart personalsite`. The restart keeps the settings from `ecosystem.config.js`.
- **Checking:** `.github/workflows/cert-expiry.yml` checks the live certificate every Monday. It opens an issue if renewal looks stuck, and fails if it can't read the certificate at all. On the server, check with `sudo certbot renew --dry-run` and `systemctl list-timers | grep certbot`.

## One-time setup

Before merging the shared auth API (Part 1 of #57), create the `auth` database on the same Postgres host as the other databases and add `AUTH_DATABASE_URL` to the server's `.env`. The new pool is included in `/api/health`, so the deploy health check requires this setup. After that deploy, run `npm run seed:auth` **once, on the empty auth database**. Once site registration is available, use `npm run auth:make-admin -- <username>` to grant site admin access.

Do not rerun `seed:auth` or `seed:all` after real accounts exist. `seed:auth` drops every account and resets their ids; a still-valid token could then authenticate as a different account with the same id. If rebuilding auth is ever necessary, plan the account reset, rotate `JWT_SECRET` to invalidate those tokens, and reseed the project databases so their profiles match the new account ids and usernames.

Run these once on the server, as `ubuntu`, with nvm loaded (`source ~/.nvm/nvm.sh`).

1. **`node_modules` must belong to `ubuntu`, or `npm ci` fails.** If `ls -ld node_modules` shows `root`, run `sudo chown -R ubuntu:ubuntu node_modules`.
2. **Log rotation.** PM2 logs grow forever without it:

   ```bash
   pm2 install pm2-logrotate
   pm2 set pm2-logrotate:max_size 10M
   pm2 set pm2-logrotate:retain 14   # about 2 weeks of metrics history
   ```

3. **Start on boot.** Run `pm2 startup` and follow the command it prints. The deploy's `pm2 save` then keeps the process list up to date.
4. **Swap.** `free -h` should show some. If it shows `Swap: 0B`, add 1 GB, so a memory spike slows the box down instead of getting a process killed:

   ```bash
   sudo fallocate -l 1G /swapfile && sudo chmod 600 /swapfile
   sudo mkswap /swapfile && sudo swapon /swapfile
   echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
   ```

5. **Optional: `ADMIN_TOKEN`** in `.env`, to use `/api/metrics`. Generate one with `openssl rand -hex 32`.

## Upgrading Node

Do this on the server **before** merging a change to `.nvmrc`. The deploy only runs `nvm use`; it never installs Node, because a new Node binary also needs its port capability granted by hand. Run as `ubuntu`, replacing `24` with the new version:

```bash
source ~/.nvm/nvm.sh
nvm install 24
nvm use 24
nvm alias default 24         # new shells (manual pm2 commands, pm2 startup) use it too
npm install -g pm2           # global packages are per Node version

# Let the new binary bind ports 80 and 443 as ubuntu
sudo setcap 'cap_net_bind_service=+ep' "$(readlink -f "$(nvm which 24)")"

# Restart PM2's daemon under the new Node; it brings the saved processes
# back. (The app itself runs on the Node that ran `pm2 start`, set by
# `interpreter` in ecosystem.config.js, so it follows .nvmrc on each deploy.)
pm2 update
pm2 describe personalsite | grep -i "node.js version"   # should show the new version
curl -s localhost/api/health

# Point the boot script at the new Node: run unstartup and startup,
# run the sudo command each one prints, then save.
pm2 unstartup
pm2 startup
pm2 save
```

Then merge the `.nvmrc` change. Deploys run `nvm use`, which now finds the new version. The certbot renewal hook (#23) already picks the newest nvm `pm2`, so it needs no change.

**To roll back:** run `nvm use <old version> && nvm alias default <old version> && pm2 update`, revert `.nvmrc`, and redo the `pm2 unstartup` and `pm2 startup` steps.

## Checking memory

### Is something leaking?

`server.js` logs one JSON line every 5 minutes with memory, event-loop delay and database pool stats. Summarize them on the server:

```bash
cd <project folder>
node scripts/memory-report.js ~/.pm2/logs/personalsite-out.log          # per hour
node scripts/memory-report.js --daily ~/.pm2/logs/personalsite-out*.log  # per day, including rotated logs
```

**Watch the `heap floor` column,** the lowest heap use in each period, which is roughly what survives garbage collection.

- **A flat floor is healthy,** even if `heap peak` swings around.
- **A floor that climbs day after day is a leak.**
- **`rss peak` rising while the heap floor stays flat** points outside the JavaScript heap: native memory, or buffers.
- **A count in `restarts`** means the process restarted. If that happens on a regular cycle, `max_memory_restart` may be what's catching a leak.

Other quick checks:

```bash
pm2 monit                     # live memory and CPU
pm2 describe personalsite     # restart count, uptime, memory
curl -s localhost/api/health  # every database reachable?
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" localhost/api/metrics   # current snapshot
```

### Finding what's leaking

Compare two heap snapshots taken a few hours apart:

1. **Take the first one:** `kill -USR2 $(pm2 pid personalsite)`. It writes a `Heap.*.heapsnapshot` file to the project folder (git ignores it).
2. **Wait** a few hours, ideally while the heap floor climbs, then take a second one the same way.
3. **Copy both to your laptop** (`scp ubuntu@<host>:<project folder>/Heap.*.heapsnapshot .`), then **delete them from the server**. Each one is tens of MB.
4. **Compare them in Chrome:**
   - Open DevTools → **Memory** → **Load** both files.
   - Select the second, switch the view to **Comparison** against the first, and sort by **Size Delta**.
   - Whatever grew the most is the leak. Expand it to see what keeps it alive (**Retainers**).

**Taking a snapshot needs roughly as much free memory again as the heap uses,** and PM2 restarts the app if RSS passes 300 MB (`max_memory_restart`), which would cut the snapshot off and clear the leaked state. Check `pm2 describe personalsite` first: only take one if memory + heapUsed stays well under 300 MB (in practice, heapUsed under about 80 MB). If it's higher, skip the snapshot, or temporarily raise `max_memory_restart` in `ecosystem.config.js` and run `pm2 delete personalsite && pm2 start ecosystem.config.js` first.

## Rollback

- **Normal rollback:** revert the merge commit on `main`. CI deploys the previous version, and its `npm ci` reinstalls the previous dependencies.
- **If the server is down and a deploy can't run,** SSH in and start it the old way:

  ```bash
  source ~/.nvm/nvm.sh && cd <project folder>
  pm2 delete personalsite; pm2 start "npm run prod" --name personalsite && pm2 save
  ```
