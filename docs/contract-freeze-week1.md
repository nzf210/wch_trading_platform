# Contract Freeze Week 1

Tanggal audit: `2026-05-08`

Dokumen ini adalah output `Minggu 1 Hari 1` dari [monthly-execution-plan.md](/home/deploy/wch-trading-platform/docs/monthly-execution-plan.md:1).
Tujuannya adalah membekukan shape minimum lintas `Go`, `Rust`, dan `TypeScript` untuk jalur `paper trading`.

## Scope Freeze

Contract minimum yang dibekukan pada tahap ini:

- `bot`
- `risk_settings`
- `signal`
- `order_intent`
- `order`
- `execution`
- `event_envelope`

Freeze ini berlaku untuk boundary serialisasi antar-service dan API wire shape.
Freeze ini belum berarti semua field sudah tersimpan di database atau sudah diproduksi
oleh semua service.

## Baseline Temuan

### Sudah relatif sinkron

- `bot` sinkron di [packages/shared-types/bot.ts](/home/deploy/wch-trading-platform/packages/shared-types/bot.ts:1) dan [packages/go/domain/bot.go](/home/deploy/wch-trading-platform/packages/go/domain/bot.go:1).
- `order_intent` sinkron di [packages/shared-types/order.ts](/home/deploy/wch-trading-platform/packages/shared-types/order.ts:3), [packages/go/domain/order.go](/home/deploy/wch-trading-platform/packages/go/domain/order.go:7), dan [services/executor-rust/src/types/order.rs](/home/deploy/wch-trading-platform/services/executor-rust/src/types/order.rs:1).
- `order` sinkron secara shape inti di ketiga bahasa yang sama.
- `execution` sinkron di [packages/go/domain/execution.go](/home/deploy/wch-trading-platform/packages/go/domain/execution.go:1) dan [services/executor-rust/src/types/execution.rs](/home/deploy/wch-trading-platform/services/executor-rust/src/types/execution.rs:1), dan API web sudah mengikuti wire shape itu.
- `event_envelope` sinkron di Go, Rust, dan TypeScript melalui [packages/go/domain/event.go](/home/deploy/wch-trading-platform/packages/go/domain/event.go:1), [services/executor-rust/src/types/event.rs](/home/deploy/wch-trading-platform/services/executor-rust/src/types/event.rs:1), dan [packages/shared-types/event.ts](/home/deploy/wch-trading-platform/packages/shared-types/event.ts:1).
- `signal` sinkron di shared types, Go, Rust, dan API web untuk shape v2 minimumnya.

### Drift yang masih nyata

- Scanner belum membangun `signal` v2 penuh. Builder aktif di [services/scanner-go/internal/scanner/scanner.go](/home/deploy/wch-trading-platform/services/scanner-go/internal/scanner/scanner.go:100) hanya mengisi field lama plus `payload`.
- Repository scanner belum menyimpan field v2 karena tabel `scanner_signals` dan insert query masih hanya mengenal `payload` dan field lama di [migrations/001_init.sql](/home/deploy/wch-trading-platform/migrations/001_init.sql:88) dan [services/scanner-go/internal/repository/repository.go](/home/deploy/wch-trading-platform/services/scanner-go/internal/repository/repository.go:48).
- `order_intent` yang dikirim scanner ke executor masih berupa `map[string]interface{}` ad hoc, belum canonical payload terketik.
- `event_envelope` belum menjadi satu-satunya transport contract; alur runtime masih campur outbox event, Redis Pub/Sub, dan Redis list queue.
- TypeScript shared types sudah lebih maju pada `signal`, tetapi belum dipakai sebagai source of truth lintas generator atau validator.

## Keputusan Freeze Minimum

### 1. Naming Boundary

- Boundary antar-service dan API memakai `snake_case`.
- TypeScript domain internal boleh tetap `camelCase`.
- Shared TypeScript tetap mempertahankan `camelCase`, tetapi harus selalu punya pasangan wire shape di API layer atau serializer eksplisit.

### 2. ID dan waktu

- Semua identifier lintas service dibekukan sebagai `UUID string`.
- Semua timestamp boundary dibekukan sebagai `RFC3339 / ISO-8601`.
- Semua payload event dan queue harus membawa timestamp eksplisit, tidak mengandalkan waktu consumer.

### 3. Bot

Field minimum:

- `id`
- `user_id`
- `exchange_account_id`
- `name`
- `mode`
- `strategy`
- `symbol`
- `quote_asset`
- `capital`
- `status`
- `config`
- `created_at`
- `updated_at`

Enum minimum:

- `mode`: `paper`, `live`
- `status`: `draft`, `paper_active`, `live_pending_approval`, `live_active`, `paused`, `stopped`, `error`

### 4. Risk Settings

Field minimum:

- `id`
- `bot_id`
- `max_position_size`
- `max_daily_loss`
- `stop_loss_percent`
- `take_profit_percent`
- `emergency_stop`
- `created_at`
- `updated_at`

### 5. Signal

Field minimum yang dibekukan:

- `id`
- `bot_id`
- `user_id`
- `exchange`
- `symbol`
- `strategy`
- `action`
- `price`
- `confidence`
- `status`
- `schema_version`
- `feature_snapshot`
- `ttl_ms`
- `dedup_key`
- `provenance`
- `payload`
- `created_at`

Enum minimum:

- `action`: `buy`, `sell`
- `status`: `pending`, `processed`, `expired`, `rejected`

Aturan tambahan:

- `schema_version` wajib untuk semua signal baru.
- `ttl_ms` adalah TTL signal, bukan timeout consumer.
- `dedup_key` adalah kunci dedup lintas publish/consume, bukan sekadar correlation ID.
- `provenance` minimum berisi `source` dan `version`; `hostname` opsional.
- `feature_snapshot` dan `payload` dibekukan sebagai object JSON, bukan string blob.

### 6. Order Intent

Field minimum:

- `id`
- `bot_id`
- `user_id`
- `signal_id`
- `side`
- `order_type`
- `quantity`
- `price`
- `status`
- `reason`
- `created_at`

Enum minimum:

- `side`: `buy`, `sell`
- `order_type`: `market`, `limit`
- `status`: `created`, `validated`, `rejected`, `superseded`

Catatan:

- `correlation_id` bukan field domain `order_intent`; metadata itu harus dibawa oleh envelope atau context transport.

### 7. Order

Field minimum:

- `id`
- `bot_id`
- `user_id`
- `signal_id`
- `order_intent_id`
- `exchange`
- `symbol`
- `side`
- `order_type`
- `quantity`
- `price`
- `status`
- `exchange_order_id`
- `idempotency_key`
- `raw_response`
- `created_at`
- `updated_at`

Enum minimum:

- `status`: `pending`, `submitted`, `accepted`, `rejected`, `cancelled`, `filled`, `partially_filled`, `failed`

### 8. Execution

Field minimum:

- `id`
- `order_id`
- `bot_id`
- `user_id`
- `filled_quantity`
- `average_price`
- `fee`
- `pnl`
- `status`
- `executed_at`
- `created_at`

Enum minimum:

- `status`: `pending`, `completed`, `failed`

### 9. Event Envelope

Field minimum:

- `event_id`
- `event_type`
- `event_version`
- `occurred_at`
- `producer`
- `tenant_id`
- `user_id`
- `bot_id`
- `correlation_id`
- `causation_id`
- `idempotency_key`
- `payload`

Aturan tambahan:

- Semua event lintas service wajib memakai envelope ini.
- `payload` memuat object domain, bukan metadata transport.
- `correlation_id` mengikuti alur request atau signal yang memicu proses.
- `causation_id` menunjuk entity atau event yang langsung memicu event saat ini.
- `idempotency_key` wajib stabil untuk publish yang tidak boleh punya efek ganda.

## Gap yang Harus Ditutup di Minggu 1

### Prioritas 1

- Jadikan dokumen ini acuan field minimum tunggal untuk Go, Rust, dan TypeScript.
- Rapikan shared types agar tidak ada field ekstra yang belum punya owner jelas.
- Pisahkan lebih tegas antara domain contract dan transport metadata.

### Prioritas 2

- Naikkan scanner ke builder `signal` v2 minimum.
- Tentukan bentuk canonical `order_intent` payload yang dikirim scanner ke executor.
- Tambahkan serializer atau validator ringan untuk contract paling kritis.

### Prioritas 3

- Selaraskan storage untuk `signal` v2, kemungkinan perlu migration tambahan.
- Audit DTO API yang masih expose shape lama atau shape campuran.

## Keputusan Lanjutan Sesi Berikutnya

Task pertama berikutnya adalah `Minggu 1 Hari 2`:

- rapikan `packages/shared-types/*`
- pastikan `event`, `signal`, `order`, dan `bot` menjadi acuan shape minimum
- hindari menambah field baru sebelum scanner dan executor memakai freeze ini
