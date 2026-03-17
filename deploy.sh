#!/usr/bin/env bash
# deploy.sh — Run this on the EC2 instance to pull the latest build and restart the server.
# Usage: chmod +x deploy.sh && ./deploy.sh
set -euo pipefail

# EDIT: absolute path to the project directory on the EC2 instance
REPO_DIR="/path/to/your/app"
BRANCH="main"

echo "[deploy] Pulling latest from ${BRANCH}..."
cd "$REPO_DIR"

git fetch origin "$BRANCH"
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/${BRANCH}")

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "[deploy] Already up to date. Nothing to do."
  exit 0
fi

git pull origin "$BRANCH"
echo "[deploy] Updated to $(git rev-parse --short HEAD)"

# Uncomment whichever process manager runs your server:

# Option A: PM2 (run `pm2 list` to find your process name)
# pm2 restart personalsite

# Option B: systemd (run `systemctl list-units --type=service | grep node` to find your service name)
# sudo systemctl restart personalsite

echo "[deploy] Done."

# Optional: add to cron to poll every 5 minutes automatically:
#   crontab -e
#   */5 * * * * /path/to/deploy.sh >> /home/ubuntu/deploy.log 2>&1
