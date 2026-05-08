# ADR-002: PostgreSQL Tetap Menjadi Source of Truth dan Outbox/Inbox Menjadi Default

- Status: `Accepted`
- Tanggal: `2026-05-07`

## Konteks

Schema PostgreSQL sudah memodelkan domain utama, tetapi jalur event dan side effect
belum punya pola konsistensi yang baku. Mengandalkan delivery broker saja tidak cukup
untuk mencegah duplicate effect pada sistem trading.

## Keputusan

- `PostgreSQL` tetap menjadi source of truth transaksional untuk domain state utama.
- Semua mutasi state penting harus menulis domain state dan `outbox_events` dalam satu
  transaksi.
- Semua consumer event harus menyimpan `inbox_events` atau metadata dedup setara
  sebelum menjalankan side effect.

## Konsekuensi

- Publisher dan consumer menjadi sedikit lebih kompleks, tetapi integritas state jauh
  lebih kuat.
- Retry, replay, dan rekonsiliasi menjadi realistis untuk sistem trading.
- Backlog implementasi perlu memasukkan tabel `outbox_events`, `inbox_events`, dan
  worker publisher/replayer sejak fase awal v2.
