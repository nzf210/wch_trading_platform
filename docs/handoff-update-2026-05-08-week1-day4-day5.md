# Handoff Update

## Scope selesai
- audit dan rapikan DTO/repository `apps/api-go` agar mengikuti contract baru
- ubah lifecycle response dan subscription summary menjadi typed payload
- buat outbox publisher menghasilkan envelope v2 yang konsisten
- tambahkan test contract minimum dan dokumen state machine minimum

## File utama yang berubah
- [apps/api-go/internal/trading/bots/dto.go](/home/deploy/wch-trading-platform/apps/api-go/internal/trading/bots/dto.go:1)
- [apps/api-go/internal/trading/bots/handler.go](/home/deploy/wch-trading-platform/apps/api-go/internal/trading/bots/handler.go:1)
- [apps/api-go/internal/trading/bots/repository.go](/home/deploy/wch-trading-platform/apps/api-go/internal/trading/bots/repository.go:1)
- [apps/api-go/internal/platform/outbox/repository.go](/home/deploy/wch-trading-platform/apps/api-go/internal/platform/outbox/repository.go:1)
- [apps/api-go/internal/platform/outbox/processor.go](/home/deploy/wch-trading-platform/apps/api-go/internal/platform/outbox/processor.go:1)
- [apps/api-go/internal/platform/outbox/processor_test.go](/home/deploy/wch-trading-platform/apps/api-go/internal/platform/outbox/processor_test.go:1)
- [apps/api-go/internal/identity/subscription/dto.go](/home/deploy/wch-trading-platform/apps/api-go/internal/identity/subscription/dto.go:1)
- [apps/api-go/internal/identity/subscription/repository.go](/home/deploy/wch-trading-platform/apps/api-go/internal/identity/subscription/repository.go:1)
- [apps/api-go/internal/identity/subscription/handler.go](/home/deploy/wch-trading-platform/apps/api-go/internal/identity/subscription/handler.go:1)
- [apps/api-go/internal/trading/signals/repository.go](/home/deploy/wch-trading-platform/apps/api-go/internal/trading/signals/repository.go:1)
- [docs/state-machine-week1.md](/home/deploy/wch-trading-platform/docs/state-machine-week1.md:1)

## Contract yang diputuskan
- API response penting tidak lagi mengembalikan `map[string]interface{}` ad hoc jika ada shape domain yang jelas
- metadata outbox menyimpan `producer`, `tenant_id`, `user_id`, `bot_id`, `correlation_id`, `causation_id`, `idempotency_key`, dan `occurred_at`
- processor outbox membungkus payload ke `event_envelope` v2 sebelum publish ke Redis
- fallback contract `signal` dan `subscription.plan.features` tetap object JSON, bukan `nil`

## Test atau verifikasi
- `go test ./...` di `apps/api-go`

## Next recommended step
- lanjut ke `Minggu 2 Hari 1`: audit `process_intent` dan strategi reservation idempotency di `services/executor-rust`

## Hal yang jangan diubah dulu
- jangan ubah live trading path
- jangan ganti schema scanner dulu hanya untuk mengejar v2 penuh
- jangan refactor rename service fisik
