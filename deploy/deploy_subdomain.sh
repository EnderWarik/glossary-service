#!/usr/bin/env bash
set -euo pipefail

SSH_USER="${SSH_USER:-root}"
SSH_HOST="${SSH_HOST:-example.com}"
SSH_PORT="${SSH_PORT:-22}"
APP_NAME="${APP_NAME:-glossary}"
REMOTE_DIR_DEFAULT="/${SSH_USER}/${APP_NAME}"
REMOTE_DIR="${REMOTE_DIR:-${REMOTE_DIR_DEFAULT}}"
SUBDOMAIN="${SUBDOMAIN:-app.example.com}"

echo "Ensuring remote directory exists: ${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}"
ssh -p "${SSH_PORT}" -o StrictHostKeyChecking=no "${SSH_USER}@${SSH_HOST}" "mkdir -p '${REMOTE_DIR}'"

echo "Syncing project (excluding local artifacts) ..."
rsync -az -e "ssh -p ${SSH_PORT}" --delete \
  --exclude .git --exclude node_modules --exclude frontend/dist --exclude .venv \
  ./ "${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/"

echo "Building and starting services with docker-compose.prod.yml ..."
ssh -p "${SSH_PORT}" "${SSH_USER}@${SSH_HOST}" bash -lc "\
  set -euo pipefail; \
  cd '${REMOTE_DIR}'; \
  docker compose -f docker-compose.prod.yml build; \
  docker compose -f docker-compose.prod.yml up -d --remove-orphans; \
  docker compose -f docker-compose.prod.yml ps; \
"

echo "Done. Configure Nginx for ${SUBDOMAIN} manually to proxy: / -> 127.0.0.1:8080, /api -> 127.0.0.1:8000"


