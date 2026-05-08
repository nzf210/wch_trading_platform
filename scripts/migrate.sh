#!/usr/bin/env bash
set -e
docker compose exec postgres psql -U wch_user -d wch_trading -f /docker-entrypoint-initdb.d/001_init.sql
