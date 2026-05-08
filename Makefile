.PHONY: dev up down logs build migrate

dev:
	cp -n .env.example .env || true
	docker compose up -d

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

build:
	docker compose build

migrate:
	docker compose exec postgres psql -U wch_user -d wch_trading -f /docker-entrypoint-initdb.d/001_init.sql
