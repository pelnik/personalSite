# Deployment Guide

## How It Works

GitHub Actions handles everything automatically on every merge to `main`:

1. **Tests run** — the `test` job spins up a Postgres container and runs the API test suite
2. **Build runs** (only if tests pass) — the `deploy` job builds the React app on GitHub's servers
3. **Files are pushed to EC2** — the compiled `/build` folder is rsync'd directly to the server over SSH
4. **Server restarts** — GitHub SSHes in, runs `git pull` for any server-side code changes, then restarts the Node process via PM2

The `/build` folder is never committed to the repo. The EC2 server never runs `npm run build`.

---

## Workflow File

Everything lives in `.github/workflows/ci.yml`. Two jobs:

- **`test`** — runs on every PR and every push to `main`
- **`deploy`** — runs only on push to `main`, only after `test` passes (`needs: test`)

On a PR, only `test` runs. On a merge to `main`, both run in sequence.

---

## One-Time Setup

### 1. Add GitHub Secrets

Go to: GitHub repo → Settings → Secrets and variables → Actions → New repository secret

| Secret | Value |
|---|---|
| `EC2_HOST` | Your EC2 public IP or hostname |
| `EC2_USER` | SSH username (`ubuntu` for Ubuntu AMIs, `ec2-user` for Amazon Linux) |
| `EC2_SSH_KEY` | Full contents of your `.pem` file (including the `-----BEGIN` and `-----END` lines) |
| `EC2_PROJECT_PATH` | Absolute path to the project on EC2 (e.g. `/home/ubuntu/personalSite`) |

### 2. Install PM2 on EC2

SSH into the EC2 instance and run:

```bash
npm install -g pm2
cd /path/to/project
pm2 start "npm run prod" --name personalsite
pm2 save
pm2 startup
```

The `pm2 startup` command prints another command to run — copy and run it. This makes PM2 start automatically on server reboots.

To verify it's running:

```bash
pm2 list
```

### 3. Remove the build folder from git tracking

The `/build` folder is already in `.gitignore`, but if it was previously committed you need to untrack it:

```bash
git rm -r --cached build/
git commit -m "chore: stop tracking build folder"
git push origin main
```

If `git rm -r --cached build/` says the path is not in the index, skip this step — the folder was never committed and you're already clean.

---

## Normal Workflow

**Opening a PR:** Push your branch, open a PR on GitHub. The `test` job runs automatically and results appear on the PR. Nothing deploys.

**Merging to main:** The `test` job runs, then the `deploy` job runs. The site is updated automatically — no manual steps needed.

---

## Troubleshooting

**Deploy job fails on "Copy build to EC2"** — Check that the `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, and `EC2_PROJECT_PATH` secrets are all set correctly. Ensure the EC2 security group allows inbound SSH (port 22) from anywhere (or from GitHub's IP ranges).

**Deploy job fails on "Pull source & restart server"** — SSH works but something failed on the server. Check the Actions log for the exact error. Common causes: PM2 process name doesn't match `personalsite` (run `pm2 list` on EC2 to find the exact name and update the workflow), or `git pull` fails due to local changes on the server.

**Site doesn't update after a successful deploy** — The build was pushed and the server restarted, but you may be seeing a cached version. Hard refresh the browser (`Cmd+Shift+R` / `Ctrl+Shift+R`).
