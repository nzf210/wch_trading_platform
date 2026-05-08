# MEMORY.md - Project Memory

## Project Goals
- Fokus pada analisis dan eksekusi trading & crypto.
- Performa maksimal untuk eksekusi cepat.

## Key Decisions
- [2026-05-08] Perbaikan limit konteks model MiniMax-M2.7-highspeed (diperbesar ke 204.800 tokens).
- [2026-05-08] Inisialisasi workspace `wch-flatform-trading`.

## Lessons Learned
- Konfigurasi default `contextWindow` mungkin terlalu kecil untuk model high-context seperti MiniMax; selalu verifikasi spesifikasi model.

## Significant Events
- **2026-05-08:** Setup workspace dan perbaikan error "Context limit exceeded".
- [2026-05-08] Workspace dipindahkan ke /home/deploy/wch-trading-platform.
- [2026-05-08] Memperbaiki bug normalisasi simbol di scanner-go (Binance, Bybit, OKX).
