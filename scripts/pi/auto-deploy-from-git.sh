#!/usr/bin/env bash
set -euo pipefail

# Pull latest commit from git and publish website files to /var/www/sounddesigner/current.
# Intended to be run from a systemd timer.

REPO_DIR="${REPO_DIR:-$HOME/SoundDesignerWebsite}"
REMOTE_NAME="${REMOTE_NAME:-origin}"
BRANCH="${BRANCH:-main}"
SITE_ROOT="${SITE_ROOT:-/var/www/sounddesigner}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
LOG_PREFIX="[sounddesigner-autodeploy]"

SITE_CURRENT="${SITE_ROOT}/current"
SITE_RELEASES="${SITE_ROOT}/releases"
LOCK_FILE="${SITE_ROOT}/.autodeploy.lock"

TRACKED_BUILD="${REPO_DIR}/_site/agency-jekyll-theme-gh-pages"
LEGACY_LOCAL_BUILD="${REPO_DIR}/agency-jekyll-theme-gh-pages/_site"

log() {
  echo "${LOG_PREFIX} $*"
}

if [ ! -d "${REPO_DIR}/.git" ]; then
  log "Repo not found at ${REPO_DIR}"
  exit 1
fi

mkdir -p "${SITE_RELEASES}"
touch "${LOCK_FILE}"

exec 9>"${LOCK_FILE}"
if ! flock -n 9; then
  log "Another deploy is in progress; skipping."
  exit 0
fi

git -C "${REPO_DIR}" fetch --quiet "${REMOTE_NAME}" "${BRANCH}"

LOCAL_REV="$(git -C "${REPO_DIR}" rev-parse HEAD)"
REMOTE_REV="$(git -C "${REPO_DIR}" rev-parse "${REMOTE_NAME}/${BRANCH}")"

if [ "${LOCAL_REV}" = "${REMOTE_REV}" ]; then
  exit 0
fi

log "New commit detected: ${LOCAL_REV} -> ${REMOTE_REV}"
git -C "${REPO_DIR}" checkout -q "${BRANCH}"
git -C "${REPO_DIR}" reset -q --hard "${REMOTE_NAME}/${BRANCH}"

if [ -f "${TRACKED_BUILD}/index.html" ]; then
  BUILD_DIR="${TRACKED_BUILD}"
elif [ -f "${LEGACY_LOCAL_BUILD}/index.html" ]; then
  log "Using legacy local build folder at ${LEGACY_LOCAL_BUILD} (may be stale if not regenerated)."
  BUILD_DIR="${LEGACY_LOCAL_BUILD}"
else
  log "No built website found (missing index.html in known build folders)."
  exit 1
fi

RELEASE_DIR="${SITE_RELEASES}/$(date +%Y%m%d%H%M%S)"
mkdir -p "${RELEASE_DIR}"

tar -C "${BUILD_DIR}" -cf - . | tar -xf - -C "${RELEASE_DIR}"
chmod -R u=rwX,go=rX "${RELEASE_DIR}"
# Keep compatibility with Jekyll baseurl '/agency-jekyll-theme-gh-pages'.
ln -sfn . "${RELEASE_DIR}/agency-jekyll-theme-gh-pages"

if [ -d "${SITE_CURRENT}" ] && [ ! -L "${SITE_CURRENT}" ]; then
  rm -rf "${SITE_CURRENT}"
fi

ln -sfn "${RELEASE_DIR}" "${SITE_CURRENT}"

# Keep only N latest releases.
ls -1dt "${SITE_RELEASES}"/* 2>/dev/null | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf

log "Deployed ${REMOTE_REV} from ${BUILD_DIR}"
