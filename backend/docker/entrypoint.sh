#!/usr/bin/env bash
set -euo pipefail

export PYTHONPATH="/app:/app/app/protos:${PYTHONPATH:-}"
cd /app
if [ -f "/app/app/protos/glossary.proto" ]; then
    python -m grpc_tools.protoc \
        -I/app/app/protos \
        --python_out=/app/app/protos \
        --grpc_python_out=/app/app/protos \
        /app/app/protos/glossary.proto || true
    ls -la /app/app/protos || true
fi
python - <<'PY'
import os, time
try:
    from sqlalchemy import create_engine, text
except Exception:
    raise SystemExit(0)
url = os.environ.get('DATABASE_URL') or os.environ.get('database_url')
if not url:
    raise SystemExit(0)
engine = create_engine(url)
for i in range(60):
    try:
        with engine.connect() as conn:
            conn.execute(text('SELECT 1'))
        break
    except Exception:
        time.sleep(1)
else:
    raise SystemExit(1)
PY
alembic upgrade head
exec "$@"
