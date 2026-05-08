# Architecture

```txt
React Dashboard
      ↓
Go API
      ↓
PostgreSQL + Redis
      ↓
Go Scanner
      ↓
Redis Stream: signals
      ↓
Rust Executor
      ↓
Exchange API
```

## Rules

- Scanner only produces signals.
- Executor performs risk checks before paper/live orders.
- Default trading mode is paper.
- WCH is utility token for access, membership, credit, and reward.
