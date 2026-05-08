# WCH Trading Platform: Assessment Arsitektur Saat Ini dan Plan V2

## Tujuan Dokumen

Dokumen ini menggantikan assessment generik dengan evaluasi konkret berbasis repo saat ini, lalu menerjemahkannya menjadi plan arsitektur v2 yang layak untuk skala besar.

Dokumen ini sekarang dilengkapi oleh:

- `docs/adr/*` untuk keputusan arsitektur yang sudah dibakukan
- `docs/backlog-v2-by-service.md` untuk turunan backlog implementasi per service
- `docs/roadmap-v2-ai-handoff.md` untuk urutan eksekusi yang mudah diikuti model AI lain

Target dokumen ini:

- memisahkan `konsep yang sudah dideklarasikan` dari `fitur yang benar-benar sudah terimplementasi`,
- memberi assessment per area dengan tingkat urgensi yang jelas,
- mendefinisikan arsitektur target v2,
- memberi roadmap migrasi yang bisa dieksekusi bertahap tanpa rewrite total.

## Ringkasan Eksekutif

Secara konsep, repo ini sudah mengarah ke platform trading event-driven dengan pemisahan API, scanner, executor, AI agent, notification, PostgreSQL, dan Redis. Namun secara implementasi, kondisi saat ini masih sangat awal:

- API Go baru expose health check walaupun modul auth sudah mulai ada.
- Scanner Go dan executor Rust masih placeholder.
- Mayoritas modul domain, Redis stream, risk, subscription, exchange integration, dan shared types masih `TODO`.
- Skema database sudah cukup kaya secara domain, tetapi implementasi aplikasi belum benar-benar memakai kontrak data tersebut.

Kesimpulan praktis:

- Repo ini belum layak disebut platform trading terdistribusi yang siap scale.
- Repo ini layak dijadikan fondasi v2, tetapi butuh penataan arsitektur, kontrak data, observability, security boundary, dan model operasi yang jauh lebih disiplin.
- Jalur yang benar bukan rewrite penuh dulu, tetapi `stabilize core domain + event contracts + execution safety` lalu baru scale-out.

## Baseline Repo Saat Ini

### Komponen yang terlihat di repo

- `apps/web`: frontend React.
- `apps/api-go`: API utama.
- `services/scanner-go`: producer sinyal.
- `services/executor-rust`: engine eksekusi order.
- `services/notification-service`: Telegram/email/webhook notifications.
- `services/ai-agent`: orchestrator AI untuk generate task internal.
- `PostgreSQL` untuk data transaksional.
- `Redis` untuk stream, cache, dan lock.
- `docker-compose.yml` sebagai orchestration lokal tunggal.

### Fakta implementasi yang relevan

- `apps/api-go/cmd/api/main.go` hanya start koneksi DB, Redis, dan `/health`.
- `apps/api-go/internal/http/router.go` masih kosong.
- Modul auth di `apps/api-go/internal/auth/*` sudah lebih maju dibanding area lain.
- `services/scanner-go/cmd/scanner/main.go` hanya loop heartbeat.
- `services/executor-rust/src/main.rs` dan `src/app.rs` masih placeholder.
- Dokumen `docs/architecture.md`, `docs/api.md`, `docs/redis.md`, `docs/risk-policy.md` masih berfungsi sebagai draft intent, bukan cerminan implementasi aktual.
- Migrations sudah memodelkan domain penting: users, wallets, plans, subscriptions, exchange_accounts, bots, risk_settings, scanner_signals, orders, executions, wch_transactions, bot_logs, audit_logs.

### Gap struktur yang langsung terlihat

- Banyak migration file bernomor lanjut hanya placeholder karena schema besar sudah ditaruh di `001_init.sql`.
- Ada `node_modules` di dalam repo service, menambah noise dan risiko drift.
- Tidak ada boundary yang jelas antara `control plane` dan `trading plane`.
- Tidak ada kontrak event yang terversi dan dipakai lintas service.

## Assessment Per Area

Skala penilaian:

- `1/5`: belum siap
- `2/5`: fondasi ada tapi belum operasional
- `3/5`: usable terbatas
- `4/5`: production-capable
- `5/5`: scale-capable

### 1. Domain Model dan Product Surface

Status: `2/5`

Yang sudah ada:

- Model bisnis utama sudah terlihat: user, subscription, exchange account, bot, risk, signal, order, execution, WCH transaction.
- Safety rules inti sudah tertulis di README dan risk policy.

Masalah konkret:

- Domain contract hidup di migration dan docs, bukan di service contract yang benar-benar dipakai.
- Shared types di `packages/shared-types/*` semua masih kosong.
- Belum ada definisi state machine yang tegas untuk `bot`, `signal`, `order`, `execution`, `subscription`.

Dampak:

- Service akan mudah drift satu sama lain.
- Sulit membuat retry, reconciliation, dan audit yang konsisten.

Prioritas:

- `P0`

Keputusan v2:

- Tetapkan canonical domain contract per aggregate.
- Semua stateful entity harus punya lifecycle resmi dan event resmi.

### 2. API Layer dan Control Plane

Status: `1.5/5`

Yang sudah ada:

- Bootstrap config, DB, Redis, auth hashing/JWT, dan auth repository dasar.

Masalah konkret:

- HTTP router belum diimplementasikan.
- API draft belum direalisasikan.
- Belum ada versioning API, middleware auth, idempotency, rate limiting, request validation, audit injection, tracing, atau admin boundary.
- `main.go` langsung pakai `net/http` default mux tanpa struktur route yang jelas.

Dampak:

- Control plane belum bisa menjadi single source of truth untuk bot lifecycle dan operator action.
- Sulit menskalakan API secara aman karena contract belum stabil.

Prioritas:

- `P0`

Keputusan v2:

- API v2 harus menjadi control plane resmi untuk semua perubahan state operator dan user.

### 3. Scanner / Signal Generation

Status: `1/5`

Yang sudah ada:

- Boundary konsep scanner sebagai producer sinyal sudah benar.
- Service terpisah sudah disediakan.

Masalah konkret:

- Engine scanner, strategy, indicator, feed, scheduler, publisher semuanya masih placeholder.
- Belum ada aturan partitioning per symbol, exchange, timeframe, atau bot cohort.
- Belum ada contract kualitas sinyal: provenance, version, feature snapshot, dedup key, expiry.

Dampak:

- Belum ada jalur valid dari market data ke execution.
- Kalau nanti langsung diisi tanpa kontrak yang ketat, risk dan observability akan rusak dari awal.

Prioritas:

- `P1`

Keputusan v2:

- Scanner tidak boleh publish sinyal tanpa schema version, feature snapshot, TTL, dan dedup key.

### 4. Execution Engine

Status: `1/5`

Yang sudah ada:

- Pilihan Rust untuk jalur eksekusi adalah arah yang masuk akal.
- Folder risk, exchange, execution, security, redis, postgres sudah dipisah secara konseptual.

Masalah konkret:

- Semua modul inti executor masih `TODO`.
- Belum ada order intent pipeline, reservation model, idempotency store, exchange adapter contract, reconciliation loop, atau kill switch yang benar-benar aktif.
- Belum ada pemisahan jelas antara paper execution dan live execution path.

Dampak:

- Ini area paling kritis; tanpa ini platform tidak punya execution safety.
- Risiko kerugian operasional paling besar akan muncul di sini saat live trading dibuka.

Prioritas:

- `P0`

Keputusan v2:

- Executor v2 harus didesain sebagai deterministic state machine dengan strict idempotency, pre-trade risk gate, dan post-trade reconciliation.

### 5. Risk dan Safety Controls

Status: `1.5/5`

Yang sudah ada:

- Risk policy tertulis jelas.
- Tabel `risk_settings`, `orders`, `executions`, `audit_logs` sudah ada di schema.

Masalah konkret:

- Tidak ada implementasi risk engine aktif di API maupun executor.
- Belum ada hirarki risk: tenant, user, exchange account, bot, symbol, global system.
- Belum ada manual approval workflow untuk activation live trading.
- Belum ada dual control untuk operasi sensitif seperti live enable, key rotation, emergency stop reset.

Dampak:

- Safety rules sekarang masih deklaratif.
- Tidak ada jaminan teknis bahwa live trading tidak bisa bypass policy.

Prioritas:

- `P0`

Keputusan v2:

- Risk engine diposisikan sebagai mandatory gate sebelum order intent berubah menjadi exchange command.

### 6. Data Layer dan Persistence

Status: `2.5/5`

Yang sudah ada:

- Schema domain cukup lengkap untuk MVP-plus.
- Pemilihan PostgreSQL tepat untuk control plane dan ledger utama.

Masalah konkret:

- Schema besar ditaruh dalam satu migration awal; menyulitkan evolusi dan review.
- Belum terlihat unique constraints, partial indexes, check constraints, partition strategy, retention strategy, atau archival policy untuk tabel event-heavy seperti `scanner_signals`, `orders`, `executions`, `bot_logs`, `audit_logs`.
- Belum ada outbox table, inbox table, atau replay/reconciliation metadata.

Dampak:

- Pada volume besar, bottleneck dan query drift akan muncul cepat.
- Sulit menjamin exactly-once effect di atas at-least-once delivery.

Prioritas:

- `P0`

Keputusan v2:

- PostgreSQL dipertahankan sebagai source of truth transaksional, tetapi event publishing harus memakai outbox pattern.

### 7. Messaging, Async Flow, dan Redis Usage

Status: `1.5/5`

Yang sudah ada:

- Redis stream, cache, dan lock sudah dideskripsikan.
- Async intent arsitektur sudah benar.

Masalah konkret:

- Implementasi Redis stream publisher/consumer belum ada.
- Belum ada consumer group strategy, retry queue, dead-letter queue, visibility timeout policy, atau poison message handling.
- Redis saat ini berpotensi dipakai sekaligus untuk stream, cache, dan distributed lock tanpa isolasi beban.

Dampak:

- Di skala besar, ini cepat menjadi single noisy bottleneck.
- Failure mode akan susah dianalisis tanpa delivery semantics yang jelas.

Prioritas:

- `P0`

Keputusan v2:

- Redis boleh dipakai di fase awal v2, tetapi event contract dan retry topology harus dibakukan. Untuk scale lebih tinggi, broker dedicated perlu dipertimbangkan.

### 8. Security dan Secrets Management

Status: `1.5/5`

Yang sudah ada:

- Ada intent untuk encrypt API key exchange.
- README sudah melarang withdrawal permission.

Masalah konkret:

- Implementasi encryption exchange account belum ada.
- `JWT_SECRET` default hardcoded fallback terlalu lemah untuk production.
- Belum ada KMS/Vault boundary, secret rotation policy, scoped service identity, atau enforcement permission check ke exchange.
- Belum ada pemisahan network/runtime untuk komponen sensitif.

Dampak:

- Surface area kebocoran secret masih terlalu besar.
- Tidak aman untuk multi-tenant live trading.

Prioritas:

- `P0`

Keputusan v2:

- Exchange secret harus dienkripsi envelope-style dan hanya bisa didekripsi di execution boundary yang berwenang.

### 9. Observability, Audit, dan Operasional

Status: `1/5`

Yang sudah ada:

- Tabel `bot_logs` dan `audit_logs`.
- `infra/monitoring` ada sebagai folder, tetapi belum terbukti jadi sistem observability aktif.

Masalah konkret:

- Tidak ada metrics, tracing, structured logs, error taxonomy, correlation ID, dashboard, alerting, atau runbook.
- Audit log masih schema saja; belum ada injection wajib di action sensitif.
- Health check baru tersedia di API.

Dampak:

- Incident analysis akan lambat.
- Tidak mungkin mengoperasikan trading system besar tanpa visibility end-to-end.

Prioritas:

- `P0`

Keputusan v2:

- Semua command, event, dan external call harus punya trace/correlation ID yang konsisten.

### 10. AI Agent Boundary

Status: `2/5`

Yang sudah ada:

- Ada pembatasan normatif bahwa AI agent tidak boleh bypass risk atau live trade.
- Orchestrator agent sudah dipisah dari service trading inti.

Masalah konkret:

- Import agent spesialis di orchestrator mengacu ke file yang tidak tampak dalam repo yang dibaca.
- Guard file untuk command policy, trading safety, dan file scope masih `TODO`.
- AI agent masih berada dekat dengan sistem inti tanpa boundary operasional yang ketat.

Dampak:

- Jika agent dipakai untuk workflow internal, belum ada jaminan policy enforcement yang cukup.
- Harus diasumsikan non-trust boundary sampai guard benar-benar implemented.

Prioritas:

- `P2`

Keputusan v2:

- AI agent tetap diposisikan di control/support plane, bukan di hot path trading.

### 11. Deployment, Environment, dan Scaling Model

Status: `1.5/5`

Yang sudah ada:

- Docker Compose lokal untuk semua service.
- Struktur service terpisah sudah membantu transisi ke orchestrator yang lebih matang.

Masalah konkret:

- Belum ada environment promotion model, HA strategy, autoscaling primitive, service discovery, config layering, atau blue/green/canary pattern.
- `docker-compose.yml` masih mewakili single-host topology.
- Belum ada pemisahan workload latency-sensitive versus best-effort.

Dampak:

- Skala besar tidak bisa bertumpu pada topologi single host dan shared Redis/Postgres tanpa pembagian peran.

Prioritas:

- `P1`

Keputusan v2:

- V2 didesain cloud-native walau implementasi awal masih bisa jalan di Compose untuk dev.

## Masalah Sistemik yang Paling Penting

Tiga masalah terbesar saat ini:

1. `Contract gap`: docs dan schema lebih matang daripada implementasi service.
2. `Safety gap`: risk, idempotency, approval, dan reconciliation belum ada secara teknis.
3. `Operations gap`: observability, retry topology, dan deployment model belum siap untuk beban besar.

Jika ketiga hal ini tidak ditutup lebih dulu, scale-out hanya akan memperbesar failure rate dan operational risk.

## Prinsip Arsitektur V2

### Prinsip inti

1. `Control plane` dan `trading plane` dipisah.
2. Semua mutasi penting lewat command yang tervalidasi.
3. Semua side effect async lewat event yang terversi.
4. `PostgreSQL` adalah source of truth untuk state transaksi.
5. `Outbox + inbox + idempotency` adalah default, bukan opsional.
6. `Risk first`: tidak ada jalur ke exchange tanpa risk gate.
7. `Paper` dan `live` punya execution path berbeda tetapi kontrak yang sama.
8. `Observability by design`, bukan ditambah belakangan.

### Target non-functional

- Multi-tenant dengan isolasi kuat di level tenant/user/account/bot.
- Aman untuk ribuan bot aktif.
- Aman untuk ratusan ribu hingga jutaan event per hari.
- MTTR rendah melalui observability dan reconciliation.
- Bisa menahan retry, duplicate delivery, dan partial failure tanpa order ganda.

## Arsitektur Target V2

### Layer utama

#### 1. Control Plane

Komponen:

- `api-control`
- `auth-service`
- `subscription-service`
- `bot-config-service`
- `risk-config-service`
- `admin-ops-service`

Tanggung jawab:

- user auth,
- exchange account onboarding,
- bot lifecycle,
- plan/subscription enforcement,
- live activation workflow,
- operator audit trail.

Karakter:

- strongly consistent,
- CRUD + command driven,
- source of truth untuk state non-market.

#### 2. Trading Plane

Komponen:

- `market-ingestor`
- `signal-engine`
- `risk-evaluator`
- `order-orchestrator`
- `executor-live`
- `executor-paper`
- `reconciliation-worker`

Tanggung jawab:

- market data ingestion,
- signal generation,
- pre-trade risk,
- order intent processing,
- exchange execution,
- fill reconciliation,
- position dan PnL updates.

Karakter:

- event-driven,
- latency-sensitive,
- failure-aware,
- deterministic.

#### 3. Support Plane

Komponen:

- `notification-service`
- `ai-agent`
- `reporting-worker`
- `audit-exporter`

Tanggung jawab:

- notifikasi,
- report,
- internal tooling,
- non-critical automations.

Karakter:

- tidak berada di hot path trading,
- boleh eventual,
- boleh degrade tanpa menghentikan trading inti.

## Topologi Data dan Message Flow V2

### Sumber data utama

- `PostgreSQL primary`: users, subscriptions, exchange accounts, bots, risk settings, orders, executions, audit.
- `Redis`: low-latency cache, locks terbatas, short-lived coordination.
- `Event broker`: stream event antar service.

Catatan:

- Jika tetap memakai Redis Streams di fase awal, pisahkan logical usage minimal per concern.
- Untuk scale lebih tinggi, pertimbangkan migrasi event backbone ke Kafka, NATS JetStream, atau broker setara.

### Pola event yang wajib

Setiap event minimal memiliki:

- `event_id`
- `event_type`
- `event_version`
- `occurred_at`
- `producer`
- `tenant_id`
- `user_id`
- `bot_id`
- `correlation_id`
- `causation_id`
- `idempotency_key`
- `payload`

### Event inti v2

- `bot.created`
- `bot.activated`
- `bot.paused`
- `subscription.verified`
- `signal.generated`
- `risk.check.requested`
- `risk.check.passed`
- `risk.check.failed`
- `order.intent.created`
- `order.submitted`
- `order.accepted`
- `order.rejected`
- `execution.filled`
- `execution.partially_filled`
- `execution.failed`
- `position.updated`
- `pnl.updated`
- `emergency_stop.activated`

## Desain Domain V2

### Aggregate utama

#### User

- identitas,
- role,
- status,
- tenant scope.

#### Subscription

- plan,
- entitlement,
- quota,
- active window,
- source of payment verification.

#### ExchangeAccount

- exchange,
- permission status,
- encryption metadata,
- connectivity status,
- live eligibility.

#### Bot

- strategy,
- mode,
- symbol universe,
- state,
- config version.

Bot state minimum:

- `draft`
- `paper_active`
- `live_pending_approval`
- `live_active`
- `paused`
- `stopped`
- `error`

#### RiskProfile

- per bot default,
- overrides per symbol,
- daily loss,
- max exposure,
- stop/take profit,
- emergency flags.

#### OrderIntent

- hasil keputusan internal untuk mengeksekusi order,
- belum tentu sudah dikirim ke exchange.

#### Order

- representasi command ke exchange atau paper engine.

#### Execution

- representasi fill/partial fill/cancel/failure.

### Aturan penting

- `signal` bukan authorization untuk order.
- `risk pass` bukan execution; itu hanya izin lanjut.
- `order intent` harus immutable setelah dibuat, kecuali superseded oleh event lain.
- `execution` hanya boleh lahir dari order yang valid.

## Data Architecture V2

### PostgreSQL tetap dipakai untuk

- identity dan auth data,
- subscription dan entitlement,
- exchange account registry,
- bot config,
- order ledger,
- execution ledger,
- audit log.

### Tabel baru yang direkomendasikan

- `outbox_events`
- `inbox_events`
- `bot_state_transitions`
- `order_intents`
- `positions`
- `daily_risk_snapshots`
- `live_activation_requests`
- `secret_key_versions`

### Aturan schema

- Tambahkan `tenant_id` jika platform memang akan multi-tenant formal.
- Tambahkan check constraint untuk field enum-like.
- Tambahkan index komposit untuk jalur query panas.
- Partisi `orders`, `executions`, `scanner_signals`, `audit_logs`, `bot_logs` berdasarkan waktu.
- Tetapkan retention dan archive policy sejak awal.

### Outbox pattern

Setiap perubahan state penting:

1. commit state domain + record outbox event dalam satu transaksi DB,
2. publisher terpisah membaca outbox,
3. consumer menyimpan inbox untuk dedup,
4. side effect hanya dieksekusi sekali secara efektif.

Ini lebih realistis untuk sistem trading daripada berharap Redis delivery cukup untuk exactly-once.

## Risk Engine V2

### Posisi risk engine

Risk engine duduk di antara `signal/order intent` dan `executor`.

### Hierarki check

1. system-wide kill switch
2. tenant entitlement
3. user/subscription validity
4. exchange account health dan permission
5. bot state
6. symbol blacklist/allowlist
7. max exposure / position size
8. daily loss / drawdown
9. duplicate idempotency key
10. mode-specific rule: paper atau live

### Output risk engine

- `pass`
- `reject_permanent`
- `reject_retryable`
- `pause_bot`
- `require_manual_review`

### Mandatory operational controls

- live trading activation harus explicit, time-bounded, dan tercatat di audit.
- emergency stop harus global dan per-bot.
- withdrawal permission mismatch harus men-disable exchange account.
- risk decision harus tersimpan sebagai record audit yang bisa direplay.

## Execution Architecture V2

### Jalur hot path

1. `signal.generated`
2. `risk.check.requested`
3. `risk.check.passed`
4. `order.intent.created`
5. `executor` reserve idempotency key
6. submit ke exchange atau paper engine
7. persist `order`
8. emit `order.submitted`
9. ingest fill/cancel/update
10. persist `execution`
11. update `position` dan `PnL`
12. emit event lanjutan

### Executor wajib punya

- adapter per exchange,
- pre-submit validation,
- idempotency reservation,
- retry policy per error class,
- reconciliation loop,
- dead-letter handling,
- paper/live path separation,
- controlled concurrency per bot/account/symbol.

### Mengapa ini penting

Di platform trading, masalah utama bukan hanya throughput. Masalah utamanya adalah mencegah:

- order ganda,
- lost fill,
- state mismatch dengan exchange,
- retry yang menghasilkan side effect baru.

## Messaging Architecture V2

### Jika fase awal tetap Redis Streams

Gunakan stream terpisah minimal:

- `stream.control-events`
- `stream.market-events`
- `stream.trade-events`
- `stream.notifications`

Wajib ada:

- consumer group per service,
- retry stream,
- dead-letter stream,
- poison message counter,
- replay tooling.

### Saat perlu naik kelas ke broker yang lebih kuat

Trigger migrasi broker:

- backlog stream makin sering tinggi,
- consumer group recovery lambat,
- replay menjadi operasi mahal,
- ordering/partition requirement makin ketat,
- market throughput tumbuh jauh di atas control-plane throughput.

## Security Architecture V2

### Secrets

- API key exchange tidak disimpan plaintext.
- Gunakan envelope encryption.
- Simpan metadata key version.
- Dekripsi hanya di execution boundary yang berwenang.

### Identity dan access

- service-to-service auth wajib ada.
- admin operation dipisah dari user operation.
- live activation dan secret rotation perlu higher privilege.

### Network

- control plane dan trading plane berada pada segment runtime berbeda.
- AI agent dan notification service tidak boleh punya akses luas ke secret execution.

### Audit

Minimal semua aksi berikut wajib tercatat:

- login penting,
- create/update/delete exchange account,
- bot activation/pause,
- live enable/disable,
- emergency stop,
- key rotation,
- manual override.

## Observability dan Reliability V2

### Metrics minimum

- request latency/error rate API,
- queue lag per stream/topic,
- risk reject rate,
- order submit success rate,
- exchange API latency/error class,
- reconciliation drift count,
- duplicate idempotency detection,
- bot active count per mode,
- PnL snapshot freshness.

### Tracing

- satu `correlation_id` dari API command sampai execution dan notification.
- external call ke exchange harus masuk trace.

### Logging

- structured JSON,
- severity yang konsisten,
- event name yang stabil,
- tanpa secret leakage.

### Runbook minimum

- broker lag tinggi,
- exchange outage,
- DB slow query,
- duplicate submission suspicion,
- reconciliation mismatch,
- global emergency stop.

## Rekomendasi Struktur Service V2

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

Catatan:

- Tidak semua harus dipisah sejak hari pertama.
- Untuk tahap transisi, `risk-engine` dan `order-orchestrator` masih bisa hidup sebagai modul di service executor selama contract-nya sudah dipisah tegas.

## Roadmap Migrasi yang Direkomendasikan

### Fase 0: Stabilize Foundation

Target:

- berhenti menambah fitur sebelum kontrak inti jelas.

Pekerjaan:

- isi `shared-types` atau ganti dengan schema contract lintas bahasa,
- definisikan state machine untuk bot/order/execution/subscription,
- rapikan migration strategy,
- putuskan canonical event schema.

Exit criteria:

- semua service mengacu pada kontrak data yang sama.

### Fase 1: Bangun Control Plane yang Benar

Target:

- API bisa mengelola lifecycle user, exchange account, subscription, dan bot.

Pekerjaan:

- implement router, middleware, validation, auth, audit,
- implement bot CRUD dan bot state transition,
- implement exchange account onboarding dengan encryption,
- implement subscription entitlement check.

Exit criteria:

- semua perubahan state operator/user hanya lewat API control plane.

### Fase 2: Bangun Trading Spine

Target:

- jalur end-to-end paper trading yang deterministic.

Pekerjaan:

- implement scanner publish signal,
- implement risk gate,
- implement order intent,
- implement paper executor,
- implement outbox/inbox,
- implement observability dasar.

Exit criteria:

- paper trading end-to-end stabil, replayable, dan ter-audit.

### Fase 3: Live Trading Safe Launch

Target:

- live trading dibuka terbatas dan aman.

Pekerjaan:

- exchange adapter production-grade,
- permission verification,
- live activation workflow,
- reconciliation worker,
- emergency stop global/per bot,
- alerting dan on-call runbook.

Exit criteria:

- live trading hanya untuk cohort terbatas dengan monitoring penuh.

### Fase 4: Scale-Out

Target:

- naik ke beban besar tanpa rewrite core.

Pekerjaan:

- partisi data panas,
- horizontal consumer scaling,
- broker evolution bila perlu,
- read model dan analytics pipeline,
- archive dan retention policy.

Exit criteria:

- throughput naik tanpa regress safety dan without manual heroics.

## Prioritas Implementasi 30 Hari

Urutan paling masuk akal:

1. definisikan contract entity + event versioning,
2. implement API control plane minimum,
3. implement audit trail dan idempotency primitives,
4. implement outbox/inbox,
5. implement paper trading spine end-to-end,
6. implement risk engine minimum,
7. baru masuk ke live trading readiness.

## Hal yang Sebaiknya Tidak Dilakukan

- Jangan langsung pecah menjadi terlalu banyak microservice sebelum contract dan observability matang.
- Jangan membuka live trading hanya karena schema dan docs sudah terlihat lengkap.
- Jangan menyatukan AI agent ke hot path eksekusi.
- Jangan mengandalkan Redis lock sebagai satu-satunya mekanisme correctness.
- Jangan menambah strategy scanner sebelum order/risk/reconciliation spine stabil.

## Keputusan Arsitektur Final yang Direkomendasikan

Jika tujuan Anda adalah "layak untuk scale besar", arah yang paling benar untuk repo ini adalah:

- pertahankan PostgreSQL sebagai ledger utama,
- gunakan event-driven architecture dengan outbox/inbox,
- pisahkan control plane dan trading plane,
- jadikan risk engine dan executor sebagai boundary paling ketat,
- treat Redis sebagai komponen performa/transport, bukan source of truth,
- tahan live trading sampai paper spine, observability, dan reconciliation benar-benar stabil.

## Lampiran: Delta Antara Repo Saat Ini dan V2

Perubahan arsitektur paling signifikan dari kondisi saat ini:

- dari `service placeholders` menjadi `contract-first services`,
- dari `single compose topology` menjadi `plane-separated topology`,
- dari `docs-driven intent` menjadi `enforced runtime rules`,
- dari `best-effort async` menjadi `idempotent event processing`,
- dari `schema-only audit` menjadi `operationally useful observability`.

## Rekomendasi Tindak Lanjut

Dokumen ini cukup untuk menjadi baseline keputusan teknis. Jika ingin dilanjutkan, langkah paling bernilai berikutnya adalah membuat:

- `ADR set` untuk event contract, outbox pattern, dan risk boundary,
- `state machine spec` untuk bot/order/execution,
- `implementation backlog` per service berdasarkan fase di atas.
