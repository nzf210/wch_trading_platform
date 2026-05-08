# Backlog Implementasi V2 Per Service

Tanggal baseline: `2026-05-07`

Dokumen ini menurunkan `docs/architecture-v2-technical-plan.md` dan `docs/adr/*`
menjadi backlog implementasi yang mengacu ke repo saat ini.

## Prioritas Program

- `P0`: contract, safety, data consistency, control plane dasar
- `P1`: service split trading plane, observability, deployment hardening
- `P2`: support plane, AI guardrail lanjutan, reporting

## Shared Foundation

Owner repo saat ini: `packages/*`, `infra/*`, `docs/*`

- `P0` Definisikan canonical shared contract untuk `bot`, `subscription`,
  `signal`, `order_intent`, `order`, `execution`, dan envelope event v2.
- `P0` Isi `packages/shared-types/*` atau ganti dengan schema lintas bahasa yang
  bisa di-generate ke Go, Rust, dan TypeScript.
- `P0` Tambahkan desain tabel `outbox_events`, `inbox_events`,
  `bot_state_transitions`, `order_intents`, `positions`,
  `daily_risk_snapshots`, `live_activation_requests`, `secret_key_versions`.
- `P1` Standarkan `correlation_id`, `causation_id`, `idempotency_key`, dan error
  taxonomy lintas service.
- `P1` Definisikan topologi stream awal:
  `stream.control-events`, `stream.market-events`, `stream.trade-events`,
  `stream.notifications`.

## apps/api-go -> Target `apps/api-control`

- `P0` Implementasikan router HTTP yang nyata untuk auth, exchange accounts, bots,
  risk settings, subscriptions, dan admin ops.
- `P0` Jadikan API sebagai control plane resmi untuk mutasi state operator dan user.
- `P0` Tambahkan request validation, auth middleware, audit injection, dan API
  versioning.
- `P0` Tambahkan command untuk bot lifecycle:
  create, activate paper, request live activation, pause, stop.
- `P0` Tambahkan command untuk emergency stop dan live activation workflow.
- `P1` Tambahkan idempotency untuk command sensitif.
- `P1` Tambahkan structured logging, metrics, dan trace propagation.

## services/scanner-go -> Target `services/market-ingestor` + `services/signal-engine`

- `P0` Pisahkan kontrak antara market data ingest dan signal generation walau masih
  dalam satu service transisi.
- `P0` Definisikan payload `signal.generated` lengkap dengan
  schema version, feature snapshot, TTL, dan dedup key.
- `P1` Implementasikan scheduler atau feed ingestion per exchange, symbol, dan
  timeframe.
- `P1` Implementasikan signal publisher ke `stream.market-events` atau
  `stream.trade-events` sesuai boundary final.
- `P1` Tambahkan provenance dan observability untuk kualitas sinyal.

## services/executor-rust -> Target

Target transisi:

- `services/risk-engine`
- `services/order-orchestrator`
- `services/executor-paper`
- `services/executor-live`
- `services/reconciliation-worker`

Backlog:

- `P0` Implementasikan state machine `order_intent -> order -> execution`.
- `P0` Tambahkan pre-trade risk gate sesuai ADR-004.
- `P0` Tambahkan idempotency reservation sebelum submit order.
- `P0` Implementasikan persistence ke ledger order dan execution.
- `P0` Pisahkan paper dan live path di level modul.
- `P0` Tambahkan emergency stop global dan per-bot.
- `P1` Implementasikan adapter exchange dan error classification per exchange.
- `P1` Implementasikan reconciliation loop untuk order, fill, position, dan PnL.
- `P1` Tambahkan retry stream, dead-letter handling, dan poison message policy.
- `P1` Tambahkan controlled concurrency per account, bot, dan symbol.

## services/notification-service

- `P1` Jadikan service ini consumer murni dari event notifikasi, bukan pemilik state
  trading.
- `P1` Standarkan template event ke Telegram, email, dan webhook.
- `P1` Tambahkan retry policy dan dead-letter flow untuk provider notifikasi.
- `P2` Tambahkan batching atau rate control untuk burst event.

## services/ai-agent

- `P2` Pertahankan posisi di support plane, jauh dari hot path trading.
- `P2` Implementasikan guard `command-policy`, `trading-safety`, dan `file-scope`
  yang saat ini masih placeholder.
- `P2` Pastikan agent tidak punya akses untuk bypass risk, submit order live, atau
  mendekripsi secret exchange.

## apps/web

- `P1` Sinkronkan UI dengan state machine bot v2:
  `draft`, `paper_active`, `live_pending_approval`, `live_active`, `paused`,
  `stopped`, `error`.
- `P1` Tambahkan surface untuk risk configuration, audit-aware live activation, dan
  emergency stop.
- `P2` Tambahkan observability ringan di UI untuk status service dan bot health.

## Urutan Eksekusi yang Direkomendasikan

1. Shared contract dan event envelope
2. API control plane dasar
3. Executor transisi: risk gate, order intent, idempotency, paper path
4. Scanner transisi: market ingest + signal contract
5. Outbox/inbox dan event publishing
6. Observability dasar
7. Split service fisik bila boundary sudah stabil

## Implikasi Refactor Repo

Refactor struktur v2 sebaiknya dimulai dari scaffolding dan rename yang mendukung
backlog di atas, bukan rename massal. Nilai tertinggi ada pada pembentukan boundary
kontrak dan ownership service, lalu baru pemecahan direktori fisik.
