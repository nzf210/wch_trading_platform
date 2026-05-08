# Handoff Update

## Scope selesai
- tambahkan observability dasar dengan structured JSON logging di `api-go` dan `executor-rust`
- propagasikan `correlation_id` dari web client -> nginx -> api-go -> outbox -> executor consumer
- rapikan consumer `order_intents` supaya correlation context dari envelope v2 ikut masuk ke pipeline executor
- selesaikan validasi akhir bulan dengan menjalankan test/build inti lintas API, scanner, executor, dan web
- perbaiki regresi build frontend yang terdeteksi saat validation pass

## File utama yang berubah
- `packages/go/logger/logger.go:1`
- `apps/api-go/internal/http/request_logger.go:1`
- `apps/api-go/internal/http/router.go:1`
- `apps/api-go/cmd/api/main.go:1`
- `apps/api-go/internal/platform/outbox/processor.go:1`
- `apps/web/src/lib/api.ts:1`
- `apps/web/src/components/trading/TradingDataInitializer.tsx:1`
- `apps/web/src/pages/trading/ExecutionsFeed.tsx:1`
- `apps/web/src/pages/trading/LiveOrders.tsx:1`
- `apps/web/src/store/useTradingStore.ts:1`
- `infra/nginx/default.conf:1`
- `services/executor-rust/src/main.rs:1`
- `services/executor-rust/src/app.rs:1`
- `services/executor-rust/src/redis/consumer.rs:1`
- `services/executor-rust/Cargo.toml:1`
- `docs/monthly-execution-plan.md:1`

## Contract yang diputuskan
- semua request HTTP baru dari web mengirim `X-Correlation-ID`
- `api-go` mempertahankan `correlation_id` yang sama di response dan di event outbox
- outbox processor tidak lagi membuat correlation ID baru jika metadata event sudah punya nilai yang valid
- consumer executor memakai `correlation_id` dari envelope v2; fallback hanya dipakai untuk payload legacy raw
- log dasar lintas service memakai format JSON dengan field `correlation_id` yang konsisten

## Test atau verifikasi
- `go test ./...` di `apps/api-go`
- `go test ./...` di `services/scanner-go`
- `cargo test redis::consumer -- --nocapture` di `services/executor-rust`
- `npm run build` di `apps/web`

## Residual risk yang masih ada
- belum ada integration test otomatis yang benar-benar mengeksekusi alur `web -> api-go -> redis -> executor`
- structured logging sudah ada, tetapi metrics endpoint atau exporter dasar untuk `Milestone 6` belum dibuat
- executor masih punya warning build lama yang tidak memblokir test, tetapi belum dibersihkan di sesi ini
- queue `order_intents` masih mode transisi karena payload raw legacy masih didukung

## Next recommended step
- jalankan smoke test lokal end-to-end dengan satu bot paper aktif dan grep log berdasarkan satu `correlation_id`
- setelah itu lanjut ke hardening `Milestone 6` dengan metrics dasar (`/metrics` atau exporter) sebelum membuka scope baru yang lebih lebar

## Hal yang jangan diubah dulu
- jangan buka live trading production
- jangan rename massal repo atau split service fisik besar
- jangan menghapus kompatibilitas payload legacy `order_intents` sebelum producer scanner cutover penuh
