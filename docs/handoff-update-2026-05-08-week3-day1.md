# Handoff Update

## Scope selesai
- mulai `Minggu 3` dengan contract `signal.generated` v2 minimum
- tambahkan builder signal typed di scanner
- simpan field v2 ke `scanner_signals`
- publish `signal.generated` sebagai event envelope v2 sambil mempertahankan queue intent lama
- sinkronkan reader signal di API agar membaca kolom v2 baru

## File utama yang berubah
- [services/scanner-go/internal/scanner/signal_builder.go](/home/deploy/wch-trading-platform/services/scanner-go/internal/scanner/signal_builder.go:1)
- [services/scanner-go/internal/scanner/scanner.go](/home/deploy/wch-trading-platform/services/scanner-go/internal/scanner/scanner.go:1)
- [services/scanner-go/internal/scanner/signal_builder_test.go](/home/deploy/wch-trading-platform/services/scanner-go/internal/scanner/signal_builder_test.go:1)
- [services/scanner-go/internal/repository/repository.go](/home/deploy/wch-trading-platform/services/scanner-go/internal/repository/repository.go:1)
- [apps/api-go/internal/trading/signals/repository.go](/home/deploy/wch-trading-platform/apps/api-go/internal/trading/signals/repository.go:1)
- [migrations/019_scanner_signal_v2.sql](/home/deploy/wch-trading-platform/migrations/019_scanner_signal_v2.sql:1)

## Contract yang diputuskan
- `signal.generated` sekarang membawa:
  - `schema_version`
  - `feature_snapshot`
  - `ttl_ms`
  - `dedup_key`
  - `provenance`
- scanner publish envelope v2 ke `stream.market-events`
- queue `order_intents` lama tetap dipertahankan selama transisi executor belum consume signal langsung

## Test atau verifikasi
- `go test ./...` di `services/scanner-go`

## Residual risk yang masih ada
- `signal.id` belum UUID canonical; saat ini hash-based string untuk stabilitas dedup transisi
- quantity intent masih placeholder `0.001`
- scanner belum memakai strategy-specific feature snapshot yang kaya

## Next recommended step
- lanjut `Minggu 3 Hari 2-3`: samakan intent builder dan quantity calculation minimum agar tidak hardcoded buta

## Hal yang jangan diubah dulu
- jangan putus queue `order_intents` lama dulu
- jangan buka live order path
