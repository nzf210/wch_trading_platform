# WCH Trading Platform

SaaS Trading Bot dengan WCH Token sebagai utility token untuk access, membership, credit, dan reward.

## Stack

- Frontend: React + TypeScript + Tailwind
- API: Golang
- Scanner: Golang
- Executor: Rust
- Database: PostgreSQL
- Queue/Cache: Redis
- AI Agent: TypeScript
- Deployment: Docker Compose

## Core Concept

SaaS Trading Bot adalah produk utama. WCH Token digunakan untuk access, membership, credit, dan reward.

## Safety Rules

1. Default mode adalah paper trading.
2. Live trading harus diaktifkan manual.
3. API key exchange harus encrypted.
4. Withdrawal permission dilarang.
5. Semua order wajib melewati risk engine.
6. Semua order wajib punya idempotency key.
7. Emergency stop wajib tersedia.
8. Scanner tidak boleh eksekusi order.
9. Executor tidak boleh bypass subscription.
10. Semua aktivitas penting masuk audit log.

## Development

```bash
cp .env.example .env
docker compose up -d
```

## Local URLs

- Web: http://localhost:3000
- API: http://localhost:8080
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## MVP v1

- Login/register
- React dashboard
- Bot CRUD
- Paper trading mode
- Go scanner BTCUSDT/ETHUSDT
- Rust paper executor
- PostgreSQL schema
- Redis streams
- WCH membership mock
- Bot logs
- Risk settings
