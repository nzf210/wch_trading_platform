# ADR-005: Paper dan Live Execution Dipisah di Jalur Eksekusi

- Status: `Accepted`
- Tanggal: `2026-05-07`

## Konteks

Platform default berada di paper trading, tetapi target bisnis tetap mencakup live
trading. Mencampur keduanya dalam satu jalur side effect akan memperbesar risiko
operasional dan menyulitkan audit.

## Keputusan

- `paper` dan `live` memakai contract domain yang sama.
- `paper` dan `live` memakai execution path yang berbeda.
- `live` hanya boleh aktif setelah approval eksplisit yang time-bounded dan tercatat
  di audit log.

## Konsekuensi

- Testing dan rollout bisa dimulai dari paper path tanpa memberi akses side effect
  live.
- Executor v2 boleh mulai sebagai satu codebase, tetapi boundary paper/live harus
  jelas di tingkat modul dan state machine.
- Reconciliation worker harus mengutamakan live path karena konsekuensi finansialnya
  lebih tinggi.
