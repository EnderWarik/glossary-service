#!/usr/bin/env bash
set -euo pipefail

export PYTHONPATH="/app:${PYTHONPATH:-}"
cd /app
alembic upgrade head
exec "$@"
