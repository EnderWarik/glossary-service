# Glossary Service (FastAPI + Vue + Postgres)

Полноценный учебный сервис «Глоссарий»: REST API на FastAPI, SPA на Vue 3, хранение в Postgres, доставка через Docker Compose. Поддерживаются операции:

- Список терминов
- Термин по ключевому слову
- Добавление/обновление/удаление термина

Валидация входных данных и формирование схем — через Pydantic.

## Архитектура
- backend: FastAPI, Pydantic, SQLAlchemy, Alembic (авто-миграции при старте)
- frontend: Vue 3 + TypeScript + Vite (Cytoscape — граф связей)
- db: Postgres 16

Маршруты API смонтированы под префиксом `/api`:
- Swagger UI: `/api/docs`
- ReDoc: `/api/redoc`
- OpenAPI JSON: `/api/openapi.json`

Защита API — Bearer токен в заголовке `Authorization`. Исключения: `/api/docs`, `/api/redoc`, `/api/openapi.json` и preflight `OPTIONS`.

## Как работает деплой
- Скрипт `deploy/deploy_subdomain.sh` пересылает проект на сервер (rsync), затем выполняет на сервере:
  - `docker compose -f docker-compose.prod.yml build` — сборка образов
  - `docker compose -f docker-compose.prod.yml up -d --remove-orphans` — запуск сервисов
- Порты сервисов проброшены только на localhost сервера:
  - backend → 127.0.0.1:8000, frontend → 127.0.0.1:8080
- Внешний доступ организует Nginx (вручную на сервере):
  - `/` → прокси на фронтенд
  - `/api` → прокси на бэкенд

