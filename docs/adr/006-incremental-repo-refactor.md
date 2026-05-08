# ADR-006: Refactor Repo V2 Dilakukan Bertahap dari Struktur Saat Ini

- Status: `Accepted`
- Tanggal: `2026-05-07`

## Konteks

Repo saat ini masih berupa skeleton dengan beberapa komponen awal:

- `apps/api-go`
- `services/scanner-go`
- `services/executor-rust`
- `services/notification-service`
- `services/ai-agent`
- `packages/shared-types`

Refactor penuh ke struktur target v2 sebelum kontrak dan backlog jelas akan
menghasilkan perpindahan folder tanpa nilai arsitektural yang nyata.

## Keputusan

Refactor dilakukan bertahap:

1. stabilkan keputusan arsitektur dalam ADR,
2. tetapkan backlog implementasi per service,
3. bentuk boundary v2 lewat modul dan kontrak,
4. pecah service fisik hanya saat ownership dan contract sudah stabil.

Struktur target pragmatis:

- `apps/api-control`
- `services/market-ingestor`
- `services/signal-engine`
- `services/risk-engine`
- `services/order-orchestrator`
- `services/executor-paper`
- `services/executor-live`
- `services/reconciliation-worker`
- `services/notification-service`
- `services/reporting-worker`

## Konsekuensi

- Langkah berikutnya setelah ADR adalah backlog dan scaffolding transisi, bukan
  rename massal.
- `services/executor-rust` masih boleh menampung modul risk dan orchestration pada
  fase awal selama boundary contract dipisah.
- `services/scanner-go` lebih aman ditransisikan dulu menjadi `market-ingestor` dan
  `signal-engine` di level modul sebelum dipecah secara fisik.
