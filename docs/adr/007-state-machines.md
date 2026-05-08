# ADR-007: Definisi State Machine Inti

- Status: `Accepted`
- Tanggal: `2026-05-07`

## Konteks

Platform trading membutuhkan transisi state yang deterministik untuk bot, order, dan eksekusi. Milestone 1 mewajibkan definisi eksplisit untuk state machine ini agar bisa diimplementasikan secara konsisten di semua service.

## Keputusan

### 1. Bot State Machine

Status:
- `draft`: Konfigurasi bot sedang dibuat, belum siap dijalankan.
- `paper_active`: Bot berjalan di mode paper trading.
- `live_pending_approval`: Bot diusulkan ke mode live, menunggu persetujuan (security/risk).
- `live_active`: Bot berjalan di mode live trading.
- `paused`: Bot dihentikan sementara (user action atau risk event), posisi mungkin masih terbuka.
- `stopped`: Bot dihentikan permanen, posisi harus sudah ditutup.
- `error`: Bot berhenti karena kegagalan sistem atau API exchange.

Transisi utama:
- `draft` -> `paper_active`
- `paper_active` -> `live_pending_approval`
- `live_pending_approval` -> `live_active`
- `paper_active` / `live_active` <-> `paused`
- `*` -> `stopped`
- `*` -> `error`

### 2. Order Intent State Machine

Status:
- `created`: Niat order baru lahir dari signal atau strategi.
- `validated`: Lolos pengecekan risk gate awal.
- `rejected`: Ditolak oleh risk gate.
- `superseded`: Digantikan oleh intent baru sebelum sempat dieksekusi.

### 3. Order State Machine

Status:
- `pending`: Order sudah dibuat di database, belum dikirim ke exchange.
- `submitted`: Order sudah dikirim ke exchange, menunggu acknowledgement.
- `accepted`: Exchange menerima order (open order).
- `rejected`: Exchange menolak order.
- `cancelled`: Order dibatalkan oleh user atau sistem.
- `filled`: Order terpenuhi sepenuhnya.
- `partially_filled`: Order terpenuhi sebagian.
- `failed`: Gagal karena masalah teknis saat pengiriman atau tracking.

### 4. Execution State Machine

Status:
- `pending`: Record fill baru diterima, sedang diproses (PnL calculation, balance update).
- `completed`: Selesai diproses dan masuk ledger.
- `failed`: Gagal diproses ke ledger.

## Konsekuensi

- Setiap transisi state wajib menerbitkan event yang relevan.
- Repository layer di API dan Executor wajib memvalidasi validitas transisi state sebelum update DB.
- Reconciliator akan menggunakan state machine ini sebagai acuan untuk mendeteksi drift.
