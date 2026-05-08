# Production Deployment Guide

## Build Status ✅

| Service | Status | Notes |
|---------|--------|-------|
| Web (React) | ✅ BUILD SUCCESS | dist/ folder ready |
| API (Go) | ✅ BUILD SUCCESS | api-go service ready |
| Scanner (Go) | ✅ BUILD SUCCESS | scanner-go service ready |
| Executor (Rust) | ✅ BUILD SUCCESS | Binary at target/release/executor-rust |
| AI Agent | ✅ DEPENDENCIES READY | TypeScript service |
| Notification | ✅ DEPENDENCIES READY | TypeScript service |
| Nginx | ✅ CONFIG READY | Reverse proxy configured |

## Pre-Production Checklist

### 1. Environment Variables
Copy and configure production secrets:
```bash
cp .env.example .env
```

Required production values:
- `JWT_SECRET` - Generate secure random string
- `ENCRYPTION_KEY` - 32 character encryption key for API keys
- `POSTGRES_PASSWORD` - Strong database password
- `OPENAI_API_KEY` - For AI agent functionality
- `TELEGRAM_BOT_TOKEN` - For notifications
- `WCH_TOKEN_ADDRESS` - BSC mainnet token address

### 2. Database Setup
```bash
# Run migrations
docker compose up -d postgres
make migrate
```

Migrations: 22 migration files ready

### 3. Docker Build
```bash
docker compose -f docker-compose.prod.yml build
```

### 4. Start Services
```bash
docker compose -f docker-compose.prod.yml up -d
```

### 5. Verify Services
```bash
make smoke-test
```

## Production URLs
- Web: https://bot-trading.wancash.org
- API: http://localhost:8080

## Safety Rules (Enforced)
1. Default mode is paper trading
2. Live trading requires manual activation
3. All exchange API keys are encrypted
4. Withdrawal permissions are forbidden
5. All orders pass through risk engine
6. Idempotency keys required for all orders
7. Emergency stop always available
8. Scanner never executes orders
9. Executor never bypasses subscription checks
10. All important activities are audit logged

## Monitoring
- Prometheus metrics exposed on each service
- Health check endpoints available
- Structured JSON logging enabled

## Rollback Procedure
```bash
docker compose -f docker-compose.prod.yml down
git checkout <previous-tag>
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```
