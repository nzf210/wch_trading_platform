# ADR-004: Risk Engine Adalah Mandatory Gate Sebelum Eksekusi

- Status: `Accepted`
- Tanggal: `2026-05-07`

## Konteks

Risk policy sudah tertulis, tetapi belum ada enforcement teknis. Ini adalah gap
terbesar antara intent produk dan kesiapan live trading.

## Keputusan

Risk engine ditempatkan di antara `signal` atau `order intent` dan executor.
Tidak ada order yang boleh berubah menjadi command ke exchange tanpa keputusan risk.

Urutan check minimum:

1. system-wide kill switch
2. tenant entitlement
3. user/subscription validity
4. exchange account health dan permission
5. bot state
6. symbol blacklist atau allowlist
7. exposure dan position sizing
8. daily loss atau drawdown
9. duplicate idempotency key
10. mode-specific rule untuk paper atau live

Output risk minimum:

- `pass`
- `reject_permanent`
- `reject_retryable`
- `pause_bot`
- `require_manual_review`

## Konsekuensi

- Executor tidak boleh mengenkapsulasi risk sebagai optional helper.
- Audit trail risk decision harus persisten dan bisa direplay.
- Fitur live activation, emergency stop, dan permission enforcement harus masuk fase
  awal implementasi trading plane.
