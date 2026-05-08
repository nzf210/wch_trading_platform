# Rencana Eksekusi 1 Bulan

Tanggal mulai acuan: `2026-05-08`

Dokumen ini adalah schedule eksekusi operasional untuk 1 bulan ke depan.
Dokumen ini tidak menggantikan:

- `docs/roadmap-v2-ai-handoff.md`
- `docs/backlog-v2-by-service.md`
- `docs/architecture-v2-technical-plan.md`

Dokumen ini dipakai untuk menjaga ritme kerja harian agar progres tidak lompat
acak dan tetap fokus pada jalur bernilai tertinggi.

## Status Eksekusi

- `2026-05-08`: `Minggu 1 Hari 1` selesai.
- `2026-05-08`: `Minggu 1 Hari 2` selesai.
- `2026-05-08`: `Minggu 1 Hari 3` selesai.
- `2026-05-08`: `Minggu 1 Hari 4` selesai.
- `2026-05-08`: `Minggu 1 Hari 5` selesai.
- `2026-05-08`: `Minggu 2 Hari 1` selesai.
- `2026-05-08`: `Minggu 2 Hari 2` selesai.
- `2026-05-08`: `Minggu 2 Hari 3` selesai.
- `2026-05-08`: `Minggu 2 Hari 4` selesai.
- `2026-05-08`: `Minggu 2 Hari 5` selesai.
- `2026-05-08`: `Minggu 3 Hari 1` selesai.
- `2026-05-08`: `Minggu 3 Hari 2-3` selesai.
- `2026-05-08`: `Minggu 3 Hari 4-5` selesai.
- `2026-05-08`: `Minggu 4 Hari 1` selesai.
- `2026-05-08`: `Minggu 4 Hari 2-3` selesai.
- Artefak selesai: [contract-freeze-week1.md](/home/deploy/wch-trading-platform/docs/contract-freeze-week1.md:1).
- Artefak selesai: [handoff-update-2026-05-08-week1-day2.md](/home/deploy/wch-trading-platform/docs/handoff-update-2026-05-08-week1-day2.md:1).
- Artefak selesai: [handoff-update-2026-05-08-week1-day3.md](/home/deploy/wch-trading-platform/docs/handoff-update-2026-05-08-week1-day3.md:1).
- Artefak selesai: [handoff-update-2026-05-08-week1-day4-day5.md](/home/deploy/wch-trading-platform/docs/handoff-update-2026-05-08-week1-day4-day5.md:1).
- Artefak selesai: [handoff-update-2026-05-08-week2-day1.md](/home/deploy/wch-trading-platform/docs/handoff-update-2026-05-08-week2-day1.md:1).
- Artefak selesai: [handoff-update-2026-05-08-week2-day2-day4.md](/home/deploy/wch-trading-platform/docs/handoff-update-2026-05-08-week2-day2-day4.md:1).
- Artefak selesai: [handoff-update-2026-05-08-week3-day1.md](/home/deploy/wch-trading-platform/docs/handoff-update-2026-05-08-week3-day1.md:1).
- Artefak selesai: [handoff-update-2026-05-08-week3-day2-day3.md](/home/deploy/wch-trading-platform/docs/handoff-update-2026-05-08-week3-day2-day3.md:1).
- Artefak selesai: [handoff-update-2026-05-08-week3-day4-day5.md](/home/deploy/wch-trading-platform/docs/handoff-update-2026-05-08-week3-day4-day5.md:1).
- Artefak selesai: [handoff-update-2026-05-08-week4-day1.md](/home/deploy/wch-trading-platform/docs/handoff-update-2026-05-08-week4-day1.md:1).
- Artefak selesai: [handoff-update-2026-05-08-week4-day2-day3.md](/home/deploy/wch-trading-platform/docs/handoff-update-2026-05-08-week4-day2-day3.md:1).
- Artefak selesai: [state-machine-week1.md](/home/deploy/wch-trading-platform/docs/state-machine-week1.md:1).
- Task berikutnya: `Minggu 4 Hari 4` untuk observability dasar dan propagation correlation id.

## Cara Pakai

Jika sesi baru dibuka dan pekerjaan ingin langsung dilanjutkan:

1. baca dokumen ini
2. cek minggu aktif dan hari aktif
3. lanjutkan task yang statusnya belum selesai
4. jangan lompat ke `apps/web`, `services/ai-agent`, atau live trading sebelum
   target minggu aktif selesai
5. setiap task harus meninggalkan bukti: code, test, migration, atau doc

## Prinsip Eksekusi Bulan Ini

- fokus hanya pada `paper trading path`
- jangan buka live trading production
- prioritaskan `contract -> safety -> event flow -> observability`
- jika ada konflik scope, pilih perubahan yang menurunkan risiko drift lintas
  Go, Rust, dan TypeScript
- jangan lakukan rename massal repo

## Baseline Status per 2026-05-08

- `Milestone 0`: selesai
- `Milestone 1`: sebagian selesai
- `Milestone 2`: sebagian besar selesai
- `Milestone 3`: sebagian selesai
- `Milestone 4`: baru awal
- `Milestone 5`: baru awal
- `Milestone 6`: baru awal

Kesimpulan baseline:

- API control plane dasar sudah hidup
- executor paper path sudah mulai terbentuk
- scanner sudah bisa generate signal dasar
- event delivery belum konsisten
- observability belum cukup untuk debugging end-to-end

## Target Bulan Ini

Pada akhir 1 bulan, repo harus punya satu jalur lokal yang bisa diverifikasi:

1. bot aktif paper
2. scanner menghasilkan signal dengan contract v2 minimum
3. signal menghasilkan order intent tervalidasi
4. executor menjalankan risk gate
5. order dan execution tersimpan
6. event diterbitkan lewat flow outbox/inbox yang konsisten
7. log dan test minimum cukup untuk diagnosis kegagalan

## Definition of Done Bulanan

- contract inti lintas service cukup stabil untuk dipakai bersama
- duplicate intent tidak menghasilkan efek ganda
- signal payload punya `schema_version`, `ttl`, `dedup_key`, dan provenance dasar
- paper execution bisa dijalankan lokal tanpa langkah manual ambigu
- outbox dan inbox dipakai konsisten di jalur penting
- tersedia test minimum untuk contract, risk, dan execution path inti
- tersedia dokumen status singkat yang bisa dipakai agent lain untuk lanjut

## Schedule Mingguan

### Minggu 1

Tema:

- bekukan contract inti dan rapikan control plane boundary

Target hasil:

- canonical contract minimum selesai
- field penting lintas Go, Rust, TypeScript sinkron
- gap state machine utama terdokumentasi

Fokus file:

- `packages/shared-types/*`
- `packages/go/domain/*`
- `apps/api-go/internal/trading/*`
- `docs/*` bila perlu mapping contract

### Minggu 2

Tema:

- eksekusi aman untuk paper trading

Target hasil:

- idempotency reservation enforced
- risk gate lebih tegas
- emergency stop dan duplicate handling tervalidasi

Fokus file:

- `services/executor-rust/src/app.rs`
- `services/executor-rust/src/execution/*`
- `services/executor-rust/src/risk/*`
- `services/executor-rust/src/postgres/*`

### Minggu 3

Tema:

- signal flow minimum yang stabil

Target hasil:

- payload `signal.generated` versi minimum jadi
- quantity tidak lagi hardcoded buta
- scanner dan executor memakai contract input yang konsisten

Fokus file:

- `services/scanner-go/internal/scanner/*`
- `services/scanner-go/internal/repository/*`
- `packages/shared-types/signal.ts`
- `packages/go/domain/signal.go`

### Minggu 4

Tema:

- event delivery stabil dan observability dasar

Target hasil:

- jalur event utama memakai pola yang konsisten
- retry dan dedup dasar hadir
- ada bukti observability minimum untuk tracing kasus gagal

Fokus file:

- `apps/api-go/internal/platform/outbox/*`
- `apps/api-go/internal/platform/redis/*`
- `services/executor-rust/src/redis/*`
- `services/executor-rust/src/postgres/inbox.rs`
- `apps/api-go/internal/http/*`

## Schedule Harian

### Minggu 1 Hari 1

- audit contract yang sudah ada di Go, Rust, dan TypeScript
- daftar field yang belum sinkron
- tentukan shape final minimum untuk `bot`, `signal`, `order_intent`, `order`,
  `execution`, `event envelope`

Output wajib:

- catatan gap contract
- keputusan field minimum yang dibekukan

### Minggu 1 Hari 2

- rapikan `packages/shared-types/*`
- samakan enum status dan mode dengan domain Go dan Rust
- hapus field yang ambigu atau belum punya owner jelas

Output wajib:

- shared types terisi dan konsisten

### Minggu 1 Hari 3

- rapikan `packages/go/domain/*`
- samakan penamaan field snake/camel untuk boundary serialisasi
- pastikan event envelope punya field wajib v2

Output wajib:

- domain Go selaras dengan shared types

### Minggu 1 Hari 4

- audit DTO API dan repository yang memakai contract lama
- update mapping request/response penting agar mengikuti contract baru

Output wajib:

- API tidak drift dari contract inti

### Minggu 1 Hari 5

- tambahkan test minimum untuk validator atau serializer contract
- tambahkan dokumen mapping state machine minimum

Output wajib:

- test contract minimum
- doc state machine

### Minggu 2 Hari 1

- audit alur `process_intent`
- identifikasi titik yang masih bisa menghasilkan efek ganda
- tentukan strategi reservation idempotency

Output wajib:

- catatan desain idempotency yang akan dipakai

### Minggu 2 Hari 2

- implement reservation atau guard duplicate sebelum order dibuat
- pastikan duplicate message tidak menulis order baru

Output wajib:

- enforcement idempotency di executor

### Minggu 2 Hari 3

- audit semua checker risk yang aktif
- pastikan emergency stop benar-benar memblokir eksekusi
- evaluasi `daily_loss` dan checker yang masih placeholder

Output wajib:

- risk gate minimum lebih tegas

### Minggu 2 Hari 4

- tambahkan unit test executor untuk:
  - risk pass
  - risk fail
  - duplicate intent
  - emergency stop

Output wajib:

- test execution safety minimum

### Minggu 2 Hari 5

- rapikan warning penting di executor
- pastikan paper path masih build dan bisa dijalankan lokal

Output wajib:

- build bersih atau warning turun signifikan

### Minggu 3 Hari 1

- definisikan payload final `signal.generated`
- tambahkan `schema_version`, `ttl`, `dedup_key`, `provenance`,
  `feature_snapshot`

Output wajib:

- contract signal v2 minimum

### Minggu 3 Hari 2

- implement builder signal di scanner sesuai contract baru
- simpan payload yang lebih kaya ke database

Output wajib:

- scanner menghasilkan payload konsisten

### Minggu 3 Hari 3

- ganti quantity hardcoded dengan kalkulasi minimum berbasis capital atau risk
- dokumentasikan fallback jika data belum cukup

Output wajib:

- order intent tidak lagi memakai quantity statis buta

### Minggu 3 Hari 4

- sinkronkan deserialisasi order intent di executor
- tambahkan test publish/consume minimum untuk scanner ke executor

Output wajib:

- scanner dan executor kompatibel

### Minggu 3 Hari 5

- lakukan uji jalur lokal dari bot aktif ke intent masuk executor
- catat gap runtime yang masih tersisa

Output wajib:

- bukti end-to-end parsial

### Minggu 4 Hari 1

- audit semua mekanisme messaging yang dipakai sekarang
- tentukan jalur yang dipertahankan untuk bulan ini
- kurangi campuran `Pub/Sub`, list queue, dan pseudo-stream

Output wajib:

- keputusan flow event yang konsisten

### Minggu 4 Hari 2

- rapikan outbox publisher dan inbox consumer
- pastikan metadata correlation dan causation konsisten

Output wajib:

- event envelope lebih konsisten

### Minggu 4 Hari 3

- tambahkan retry atau dedup minimum untuk consumer utama
- pastikan event yang sudah diproses tidak diproses ulang sembarang

Output wajib:

- consumer safety minimum

### Minggu 4 Hari 4

- tambahkan observability dasar:
  - structured log
  - correlation id propagation
  - error context yang cukup

Output wajib:

- diagnosa failure lebih mudah

### Minggu 4 Hari 5

- jalankan validasi akhir:
  - API test
  - scanner test/build
  - executor build/test
  - uji jalur paper trading minimum
- buat ringkasan status akhir bulan

Output wajib:

- bukti readiness akhir bulan
- dokumen status singkat untuk handoff

## Urutan Eksekusi yang Tidak Boleh Dilanggar

1. contract inti
2. execution safety
3. signal contract
4. outbox/inbox consistency
5. observability
6. baru setelah itu UI lanjutan atau AI guardrail

## Area yang Ditunda Sampai Setelah Bulan Ini

- live exchange activation production
- refactor split service besar
- AI agent guardrail lanjutan
- reporting dan analytics
- mayoritas halaman web yang masih placeholder

## Ritual Penutupan Tiap Sesi

Sebelum sesi kerja ditutup:

1. catat task yang selesai dan belum selesai
2. catat blocker teknis bila ada
3. catat file yang berubah
4. tentukan task pertama untuk sesi berikutnya

## Instruksi Lanjutan untuk Sesi Berikutnya

Jika diminta `lanjut`, urutan kerja default adalah:

1. baca `docs/monthly-execution-plan.md`
2. identifikasi minggu dan hari aktif terakhir
3. lanjutkan task berikutnya yang paling dekat dengan critical path
4. implementasikan, verifikasi, lalu update status

Kalimat pemicu yang cukup untuk melanjutkan:

- `lanjut plan bulanan`
- `kerjakan next task`
- `eksekusi minggu aktif`
