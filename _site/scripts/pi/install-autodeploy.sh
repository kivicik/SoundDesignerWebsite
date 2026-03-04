#!/usr/bin/env bash
set -euo pipefail

# Installs a systemd service+timer that checks git every INTERVAL seconds
# and deploys the site whenever a new commit is available.

INTERVAL="${INTERVAL:-10s}"
BRANCH="${BRANCH:-main}"
REMOTE_NAME="${REMOTE_NAME:-origin}"
SITE_ROOT="${SITE_ROOT:-/var/www/sounddesigner}"
REPO_DIR="${REPO_DIR:-$HOME/SoundDesignerWebsite}"
RUN_USER="${RUN_USER:-$USER}"

SERVICE_NAME="sounddesigner-autodeploy.service"
TIMER_NAME="sounddesigner-autodeploy.timer"
SERVICE_PATH="/etc/systemd/system/${SERVICE_NAME}"
TIMER_PATH="/etc/systemd/system/${TIMER_NAME}"
SCRIPT_PATH="${REPO_DIR}/scripts/pi/auto-deploy-from-git.sh"

if [ ! -f "${SCRIPT_PATH}" ]; then
  echo "Missing deploy script: ${SCRIPT_PATH}"
  exit 1
fi

chmod +x "${SCRIPT_PATH}"

sudo tee "${SERVICE_PATH}" >/dev/null <<EOF
[Unit]
Description=SoundDesigner auto-deploy from git
After=network-online.target
Wants=network-online.target

[Service]
Type=oneshot
User=${RUN_USER}
Environment=REPO_DIR=${REPO_DIR}
Environment=REMOTE_NAME=${REMOTE_NAME}
Environment=BRANCH=${BRANCH}
Environment=SITE_ROOT=${SITE_ROOT}
ExecStart=${SCRIPT_PATH}
EOF

sudo tee "${TIMER_PATH}" >/dev/null <<EOF
[Unit]
Description=Run SoundDesigner auto-deploy check every ${INTERVAL}

[Timer]
OnBootSec=30s
OnUnitActiveSec=${INTERVAL}
AccuracySec=1s
Unit=${SERVICE_NAME}
Persistent=true

[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now "${TIMER_NAME}"
sudo systemctl start "${SERVICE_NAME}"

echo "Installed ${SERVICE_NAME} + ${TIMER_NAME}"
echo "Interval: ${INTERVAL}"
echo "Repo: ${REPO_DIR}"
echo "Branch: ${REMOTE_NAME}/${BRANCH}"
echo ""
echo "Check status:"
echo "  systemctl status ${TIMER_NAME} --no-pager"
echo "  journalctl -u ${SERVICE_NAME} -n 50 --no-pager"
