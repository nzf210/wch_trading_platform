# ADR-001: Pisahkan Control Plane, Trading Plane, dan Support Plane

- Status: `Accepted`
- Tanggal: `2026-05-07`

## Konteks

Repo saat ini sudah mengandung API, scanner, executor, notification service, dan AI
agent, tetapi boundary operasionalnya belum tegas. Akibatnya, keputusan desain dan
hak akses service berisiko drift saat implementasi mulai bertambah.

## Keputusan

Arsitektur v2 dibagi menjadi tiga plane:

- `Control plane`: auth, subscription, bot lifecycle, exchange account onboarding,
  risk configuration, admin operation.
- `Trading plane`: market ingest, signal generation, risk evaluation, order
  orchestration, execution, reconciliation.
- `Support plane`: notification, reporting, AI agent, audit export.

Service di support plane tidak boleh menjadi bagian dari hot path trading.

## Konsekuensi

- Boundary ownership service menjadi lebih jelas.
- Security posture membaik karena akses secret dan akses operasi sensitif bisa
  dibatasi per plane.
- Refactor repo harus mengarah pada boundary ini, meskipun implementasi transisi
  masih boleh menggabungkan beberapa modul dalam service yang sama.
