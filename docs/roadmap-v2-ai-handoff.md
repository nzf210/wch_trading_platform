# Roadmap V2 yang Mudah Diikuti Model AI Lain

Tanggal baseline: `2026-05-07`

Dokumen ini adalah versi eksekusi dari:

- `docs/architecture-v2-technical-plan.md`
- `docs/adr/*`
- `docs/backlog-v2-by-service.md`

Tujuannya bukan menjelaskan semua arsitektur lagi, tetapi memberi urutan kerja yang
jelas untuk model AI lain jika agent diganti di tengah jalan.

## Cara Pakai Dokumen Ini

Jika Anda adalah model baru yang masuk ke repo ini:

1. Baca `docs/adr/README.md`
2. Baca `docs/backlog-v2-by-service.md`
3. Pakai dokumen ini sebagai urutan eksekusi
4. Jangan mulai dari rename besar atau split service besar
5. Selesaikan satu milestone sampai ada bukti yang bisa diverifikasi

Aturan kerja:

- Fokus pada `contract -> control plane -> execution safety -> event flow`
- Jangan bypass ADR untuk mempercepat implementasi
- Jangan refactor struktur repo besar sebelum boundary kontrak stabil
- Setiap langkah harus meninggalkan artefak yang bisa dicek: code, schema,
  endpoint, test, atau doc keputusan

## Prinsip Eksekusi

- `P0` lebih penting daripada rename direktori
- Jalur `paper trading` harus hidup lebih dulu sebelum `live trading`
- `risk gate` harus hadir sebelum executor dianggap usable
- `idempotency`, `audit`, dan `state machine` bukan fitur tambahan
- Jika ragu, pilih perubahan yang memperjelas contract lintas Go, Rust, dan
  TypeScript

## Urutan Kerja Global

1. Bekukan contract inti
2. Hidupkan control plane minimum
3. Hidupkan paper execution yang aman
4. Hidupkan signal flow minimum
5. Tambahkan outbox/inbox dan event delivery yang stabil
6. Tambahkan observability dasar
7. Baru pecah service fisik lebih jauh

## Milestone 0: Baseline dan Guardrail

Tujuan:

- memastikan repo punya arah tunggal sebelum coding besar dimulai

Kerjakan:

- pastikan semua keputusan penting hidup di `docs/adr/*`
- pastikan backlog per service tetap sinkron dengan ADR
- tambahkan dokumen status jika nanti implementasi mulai berjalan

Definition of done:

- tidak ada keputusan arsitektur besar yang hanya hidup di chat
- model baru bisa tahu prioritas tanpa membaca seluruh repo

Output minimum:

- `docs/adr/*`
- `docs/backlog-v2-by-service.md`
- `docs/roadmap-v2-ai-handoff.md`

Status saat ini:

- selesai

## Milestone 1: Canonical Contract

Tujuan:

- menetapkan bahasa bersama lintas service

Kerjakan:

- isi `packages/shared-types/*` atau ganti dengan pendekatan schema yang bisa
  di-generate lintas bahasa
- definisikan contract untuk:
  - `bot`
  - `subscription`
  - `signal`
  - `order_intent`
  - `order`
  - `execution`
  - `event envelope`
- definisikan state machine minimum untuk:
  - `bot`
  - `order_intent`
  - `order`
  - `execution`
- definisikan field wajib event:
  `event_id`, `event_type`, `event_version`, `occurred_at`, `producer`,
  `tenant_id`, `user_id`, `bot_id`, `correlation_id`, `causation_id`,
  `idempotency_key`, `payload`

Jangan lakukan dulu:

- split service fisik besar
- integrasi exchange live

Definition of done:

- ada satu sumber contract yang jelas
- Go, Rust, dan TypeScript bisa mengacu ke shape data yang sama
- state transition utama sudah tertulis eksplisit

Bukti yang dicari:

- file schema atau shared types yang nyata
- test validasi schema jika memungkinkan
- doc mapping state machine

## Milestone 2: Control Plane Minimum di `apps/api-go`

Tujuan:

- menjadikan API sebagai pemilik mutasi state operator dan user

Kerjakan:

- implementasikan router HTTP nyata
- tambahkan endpoint minimum:
  - auth
  - exchange accounts
  - bots
  - risk settings
  - subscriptions
  - emergency stop
- tambahkan command lifecycle bot:
  - create
  - activate paper
  - request live activation
  - pause
  - stop
- tambahkan validation, auth middleware, audit injection, dan versioning

Definition of done:

- bot bisa dibuat dan diubah state-nya lewat API resmi
- semua mutasi penting lewat handler yang tervalidasi
- ada jalur audit dasar untuk aksi sensitif

Bukti yang dicari:

- route hidup selain `/health`
- request/response contract yang stabil
- test handler atau integration test minimum

## Milestone 3: Execution Safety dan Paper Path di `services/executor-rust`

Tujuan:

- memiliki jalur eksekusi yang aman tanpa membuka live trading

Kerjakan:

- implementasikan state machine:
  `order_intent -> order -> execution`
- tambahkan pre-trade risk gate
- tambahkan idempotency reservation
- simpan ledger order dan execution
- pisahkan modul paper dan live, walau live masih nonaktif
- tambahkan emergency stop global dan per-bot

Jangan lakukan dulu:

- submit live order ke exchange sungguhan

Definition of done:

- signal atau command yang valid bisa menghasilkan paper execution end-to-end
- duplicate command tidak membuat efek ganda
- risk violation memblokir order sebelum eksekusi

Bukti yang dicari:

- unit test state machine
- test idempotency
- jalur paper execution yang bisa dijalankan lokal

## Milestone 4: Signal Flow Minimum di `services/scanner-go`

Tujuan:

- menghasilkan sinyal yang punya contract cukup baik untuk diuji ke executor

Kerjakan:

- definisikan payload `signal.generated`
- tambahkan:
  - `schema version`
  - `feature snapshot`
  - `TTL`
  - `dedup key`
  - provenance dasar
- buat mode transisi: market ingest dan signal generation boleh masih satu
  service, tetapi boundary internal harus jelas

Definition of done:

- ada producer sinyal minimum dengan payload terversi
- executor paper bisa menerima input yang konsisten

Bukti yang dicari:

- payload contoh yang stabil
- test publish/consume minimum

## Milestone 5: Outbox/Inbox dan Event Delivery

Tujuan:

- membuat komunikasi antar service tahan retry dan tidak mudah drift

Kerjakan:

- tambahkan desain dan implementasi:
  - `outbox_events`
  - `inbox_events`
  - `bot_state_transitions`
  - `order_intents`
  - `positions`
  - `daily_risk_snapshots`
- tentukan stream awal:
  - `stream.control-events`
  - `stream.market-events`
  - `stream.trade-events`
  - `stream.notifications`
- implementasikan publisher dan consumer dengan correlation metadata

Definition of done:

- mutasi penting bisa diterbitkan sebagai event tanpa race besar
- consumer punya dasar idempotency dan dedup

Bukti yang dicari:

- migration baru
- publisher/consumer path minimum
- replay atau retry policy dasar

## Milestone 6: Observability Dasar

Tujuan:

- membuat debugging lintas service menjadi mungkin

Kerjakan:

- structured logging
- metrics dasar
- trace propagation
- error taxonomy lintas service

Definition of done:

- satu request atau order flow bisa diikuti lintas service dengan
  `correlation_id`

Bukti yang dicari:

- log dengan field konsisten
- metrics endpoint atau exporter dasar

## Milestone 7: Refactor Struktur Repo Bertahap

Tujuan:

- memecah boundary fisik setelah boundary logis stabil

Kerjakan:

- rename `apps/api-go` ke target transisi hanya jika API boundary sudah jelas
- pecah `services/scanner-go` menjadi `market-ingestor` dan `signal-engine`
  setelah contract signal stabil
- pecah `services/executor-rust` menjadi:
  - `risk-engine`
  - `order-orchestrator`
  - `executor-paper`
  - `executor-live`
  - `reconciliation-worker`

Definition of done:

- pemecahan direktori mengurangi coupling, bukan hanya mengganti nama
- tiap service baru punya ownership dan contract jelas

Anti-pattern:

- rename massal sebelum code path hidup
- memecah terlalu dini lalu contract terus berubah

## Prioritas Praktis Minggu Ini

Jika model baru harus langsung kerja tanpa diskusi panjang, mulai dari sini:

1. isi `packages/shared-types/*` dengan contract inti v2
2. implementasikan router dan endpoint bot lifecycle di `apps/api-go`
3. definisikan state machine `order_intent -> order -> execution` di
   `services/executor-rust`
4. tambahkan migration untuk outbox/inbox dan `order_intents`

Jika hanya satu hal boleh dikerjakan dulu, pilih:

- `Milestone 1: Canonical Contract`

Alasannya:

- semua service lain bergantung pada contract ini
- ini memberi handoff paling stabil untuk model lain
- ini menurunkan risiko refactor ulang

## Format Handoff untuk Model Berikutnya

Setiap kali selesai satu langkah penting, update ringkas dengan format ini:

```md
# Handoff Update

## Scope selesai
- ...

## File utama yang berubah
- ...

## Contract yang diputuskan
- ...

## Test atau verifikasi
- ...

## Next recommended step
- ...

## Hal yang jangan diubah dulu
- ...
```

## Pertanyaan yang Tidak Perlu Dibuka Lagi

Model lain sebaiknya tidak mengulang debat ini kecuali ada constraint baru:

- apakah perlu rewrite total: tidak
- apakah perlu live trading dulu: tidak
- apakah risk gate opsional: tidak
- apakah paper dan live boleh satu jalur tanpa pembeda: tidak
- apakah refactor repo harus dimulai dari rename: tidak

## Satu Kalimat Panduan

Bangun `contract dan safety` lebih dulu, lalu `event flow`, lalu `service split`.
