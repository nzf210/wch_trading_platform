# API Draft

Base URL: /api

## Auth

- POST /auth/register
- POST /auth/login
- GET /auth/me

## Bots

- GET /bots
- POST /bots
- GET /bots/{id}
- PATCH /bots/{id}
- POST /bots/{id}/pause
- POST /bots/{id}/resume

## Wallet / WCH

- GET /wallets
- POST /wallets/connect
- GET /wch/balance
- GET /wch/transactions

## Exchange

- GET /exchange/accounts
- POST /exchange/accounts
- DELETE /exchange/accounts/{id}
