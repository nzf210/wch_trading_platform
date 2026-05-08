# Handoff Update

## Scope selesai
- rapikan metadata outbox agar publish failure punya jejak retry yang eksplisit
- tambahkan backoff retry eksponensial kecil dengan cap dan dead-letter setelah batas retry
- selaraskan `buildEnvelope` supaya correlation ID bisa diwariskan dari context saat metadata belum lengkap
- jadikan inbox executor idempotent-upsert supaya metadata event tetap konsisten saat delivery ulang

## File utama yang berubah
- [apps/api-go/internal/platform/outbox/processor.go](/home/deploy/wch-trading-platform/apps/api-go/internal/platform/outbox/processor.go:1)
- [apps/api-go/internal/platform/outbox/processor_test.go](/home/deploy/wch-trading-platform/apps/api-go/internal/platform/outbox/processor_test.go:1)
- [services/executor-rust/src/postgres/inbox.rs](/home/deploy/wch-trading-platform/services/executor-rust/src/postgres/inbox.rs:1)
- [migrations/020_outbox_inbox_retry_metadata.sql](/home/deploy/wch-trading-platform/migrations/020_outbox_inbox_retry_metadata.sql:1)
- [docs/monthly-execution-plan.md](/home/deploy/wch-trading-platform/docs/monthly-execution-plan.md:1)

## Contract yang diputuskan
- outbox events menyimpan:
  - `retry_count`
  - `last_error`
  - `last_attempt_at`
  - `next_retry_at`
  - `failed_at`
- inbox events menyimpan:
  - `delivery_attempts`
  - `last_error`
- retry policy outbox:
  - backoff awal 5 detik
  - naik eksponensial
  - cap 5 menit
  - dead-letter setelah 5 percobaan

## Test atau verifikasi
- `go test ./internal/platform/...` di `apps/api-go`
- `cargo test` di `services/executor-rust`

## Residual risk yang masih ada
- belum ada integration test lintas DB untuk membuktikan dead-letter path outbox
- notification stream belum dipakai oleh service notifikasi
- observability masih perlu propagation log/trace yang lebih kuat di jalur consumer

## Next recommended step
- lanjut `Minggu 4 Hari 4`: tambah observability dasar, structured logging, dan propagation correlation ID yang lebih konsisten

