#!/usr/bin/env bash
set -e
mkdir -p backups
docker compose exec -T postgres pg_dump -U wch_user wch_trading > backups/wch_trading_$(date +%Y%m%d_%H%M%S).sql
