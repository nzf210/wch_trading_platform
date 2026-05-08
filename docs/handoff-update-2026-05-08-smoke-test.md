# Handoff Update

## Scope selesai
- jalankan smoke test lokal untuk jalur `api-go -> outbox -> Redis -> executor`
- sinkronkan schema Postgres runtime dengan migration `014` sampai `020` agar stack lokal sesuai kode aktif
- perbaiki boundary decode executor untuk kolom `NUMERIC` dan `TIMESTAMP` dari Postgres
- buktikan propagasi `correlation_id` yang sama dari API lifecycle bot ke consumer executor
- buktikan satu `order_intent` bisa menghasilkan `order` dan `execution` paper setelah bot punya exchange account aktif

## File utama yang berubah
- `services/executor-rust/src/postgres/bot.rs:1`
- `services/executor-rust/src/postgres/risk.rs:1`
- `services/executor-rust/src/postgres/orders.rs:1`
- `services/executor-rust/src/postgres/executions.rs:1`
- `services/executor-rust/src/postgres/positions.rs:1`
- `docs/monthly-execution-plan.md:1`

## Hasil smoke test
- user smoke test berhasil dibuat lewat API
- bot paper berhasil dibuat dan diaktifkan dengan `correlation_id` `smoke-20260508-1405`
- `outbox_events` menyimpan dan memproses `bot.created` dan `bot.activated` dengan `correlation_id` yang sama
- executor menerima `order_intent` ber-envelope dengan `correlation_id` yang sama
- setelah bot diikat ke exchange account aktif, executor menulis:
  - `order_intents.id = 850e8400-e29b-41d4-a716-446655440000`
  - `orders.id = 1b982c83-f2a1-4f4d-a0a6-2ac9cf19a727`, status `filled`
  - `executions.id = e8f1f635-ee2b-44dc-9b96-89fa7a9b5816`, status `completed`

## Contract yang diputuskan
- query executor yang membaca `NUMERIC` harus cast ke `DOUBLE PRECISION`
- query executor yang membaca `TIMESTAMP` harus diangkat ke `TIMESTAMPTZ` via `AT TIME ZONE 'UTC'`
- paper executor saat ini tetap bergantung pada keberadaan `exchange_account` aktif untuk menurunkan field `exchange`
- scanner runtime belum bisa membuktikan jalur ini sendiri karena strategy aktif saat ini selalu `return false`

## Test atau verifikasi
- `cargo build` di `services/executor-rust`
- `docker compose exec -T postgres psql ...` untuk verifikasi `outbox_events`, `order_intents`, `orders`, `executions`
- `docker compose logs ... | rg 'smoke-20260508-1405'` untuk verifikasi propagation log

## Residual risk yang masih ada
- smoke test order path masih memakai enqueue manual ke Redis karena scanner belum emit signal/intention secara runtime
- executor consumer masih hanya log `Unhandled event type` untuk `risk.check.passed`, `order.accepted`, dan `execution.filled`
- flow ini belum dibungkus integration test otomatis, jadi replay masih manual
- stack Docker lokal masih mengandalkan migrasi manual jika volume Postgres lama sudah terlanjur terbentuk

## Next recommended step
- tambah integration test atau script smoke otomatis untuk `api-go -> Redis -> executor`
- lanjut ke metrics dasar `Milestone 6` setelah jalur smoke ini dibekukan sebagai baseline verifikasi

## Hal yang jangan diubah dulu
- jangan buka live trading
- jangan putus kompatibilitas queue `order_intents` legacy sebelum scanner runtime benar-benar diganti
- jangan refactor besar service split sebelum baseline smoke test ini punya automation minimal
