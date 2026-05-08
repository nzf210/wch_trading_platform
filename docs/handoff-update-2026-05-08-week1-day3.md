# Handoff Update

## Scope selesai
- rapikan `packages/go/domain/*` agar lebih sejajar dengan canonical contract v2
- standarkan metadata JSON lintas domain Go
- tambahkan test serialisasi boundary untuk `signal` dan `event_envelope`

## File utama yang berubah
- [packages/go/domain/json.go](/home/deploy/wch-trading-platform/packages/go/domain/json.go:1)
- [packages/go/domain/bot.go](/home/deploy/wch-trading-platform/packages/go/domain/bot.go:1)
- [packages/go/domain/signal.go](/home/deploy/wch-trading-platform/packages/go/domain/signal.go:1)
- [packages/go/domain/order.go](/home/deploy/wch-trading-platform/packages/go/domain/order.go:1)
- [packages/go/domain/event.go](/home/deploy/wch-trading-platform/packages/go/domain/event.go:1)
- [packages/go/domain/subscription.go](/home/deploy/wch-trading-platform/packages/go/domain/subscription.go:1)
- [packages/go/domain/wallet.go](/home/deploy/wch-trading-platform/packages/go/domain/wallet.go:1)
- [packages/go/domain/serialization_test.go](/home/deploy/wch-trading-platform/packages/go/domain/serialization_test.go:1)

## Contract yang diputuskan
- semua object JSON bebas di domain Go sekarang melewati alias `domain.JSONObject`
- `event_type` sekarang punya type khusus `domain.EventType`, bukan string polos
- `signal`, `bot.config`, `plan.features`, `wch_transaction.metadata`, dan `order.raw_response` diseragamkan ke `JSONObject`
- serialisasi boundary tetap `snake_case` dan field opsional envelope tetap `omitempty`

## Test atau verifikasi
- `go test ./...` di `packages/go`

## Next recommended step
- `Minggu 1 Hari 4`: audit DTO `apps/api-go` dan repository yang masih membentuk payload ad hoc atau shape lama

## Hal yang jangan diubah dulu
- jangan pecah service scanner/executor
- jangan ubah flow live trading
- jangan ubah schema database hanya untuk mengejar naming symmetry
