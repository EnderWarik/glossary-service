SHELL := /bin/bash

.PHONY: up down build logs ps migrate fmt backend-shell

up:
	docker compose up -d --build
	docker compose logs -f backend

build:
	docker compose build

down:
	docker compose down -v

logs:
	docker compose logs -f --tail=200

ps:
	docker compose ps

migrate:
	docker compose exec backend alembic upgrade head
