# Handoff Update

## Scope selesai
- lanjutkan `Minggu 3 Hari 2-3` untuk scanner signal/order intent path
- bangun order intent dari signal dengan sizing eksplisit, bukan quantity placeholder
- ambil `capital` dan `quote_asset` dari query bot aktif supaya sizing tidak menghitung dari data kosong
- pertahankan queue `order_intents` sementara executor masih consume jalur legacy

## File utama yang berubah
- [services/scanner-go/internal/scanner/order_intent.go](/home/deploy/wch-trading-platform/services/scanner-go/internal/scanner/order_intent.go:1)
- [services/scanner-go/internal/scanner/order_intent_test.go](/home/deploy/wch-trading-platform/services/scanner-go/internal/scanner/order_intent_test.go:1)
- [services/scanner-go/internal/scanner/scanner.go](/home/deploy/wch-trading-platform/services/scanner-go/internal/scanner/scanner.go:1)
- [services/scanner-go/internal/repository/repository.go](/home/deploy/wch-trading-platform/services/scanner-go/internal/repository/repository.go:1)
- [docs/monthly-execution-plan.md](/home/deploy/wch-trading-platform/docs/monthly-execution-plan.md:1)

## Contract yang diputuskan
- order intent sekarang dibangun dari helper typed, bukan literal inline dengan quantity tetap
- sizing default memakai `capital * 0.01 / price`
- sizing bisa dioverride lewat `bot.config`:
  - `order_allocation_pct`
  - `max_order_notional`
  - `quantity_precision`
- jika `signal.price` tidak ada atau tidak valid, intent tidak dibangun

## Test atau verifikasi
- `go test ./...` di `services/scanner-go`

## Residual risk yang masih ada
- sizing masih minimum dan belum membaca `risk_settings` dari database
- scanner masih mempertahankan queue `order_intents` lama
- executor belum diverifikasi consume bentuk intent baru secara end-to-end di sesi ini

## Next recommended step
- lanjut `Minggu 3 Hari 4-5`: sinkronkan deserialisasi intent di executor dan uji jalur local scanner -> executor

