FROM python:3.11-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1 \
	PYTHONUNBUFFERED=1
WORKDIR /app

FROM base AS builder
RUN apt-get update && apt-get install -y --no-install-recommends build-essential && rm -rf /var/lib/apt/lists/*
COPY requirements.txt ./
RUN pip install --upgrade pip && pip wheel --no-cache-dir --no-deps --wheel-dir /wheels -r requirements.txt

FROM base AS runtime
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/*
COPY app /app/app
COPY alembic.ini /app/alembic.ini
COPY alembic /app/alembic
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
