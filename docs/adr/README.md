# ADR Index

Dokumen ini memecah keputusan penting dari `docs/architecture-v2-technical-plan.md`
menjadi Architecture Decision Record (ADR) yang bisa dipakai untuk review,
implementasi, dan refactor repo v2.

## Status

- `Accepted`: keputusan sudah jadi baseline v2.
- `Proposed`: keputusan masih perlu validasi sebelum diimplementasikan luas.

## Daftar ADR

- [ADR-001: Pisahkan Control Plane, Trading Plane, dan Support Plane](./001-control-trading-support-plane.md)
- [ADR-002: PostgreSQL Tetap Menjadi Source of Truth dan Outbox/Inbox Menjadi Default](./002-postgres-outbox-inbox.md)
- [ADR-003: Event Contract V2 Harus Terversi dan Konsisten Lintas Service](./003-versioned-event-contracts.md)
- [ADR-004: Risk Engine Adalah Mandatory Gate Sebelum Eksekusi](./004-risk-engine-mandatory-gate.md)
- [ADR-005: Paper dan Live Execution Dipisah di Jalur Eksekusi](./005-separate-paper-and-live-execution.md)
- [ADR-006: Refactor Repo V2 Dilakukan Bertahap dari Struktur Saat Ini](./006-incremental-repo-refactor.md)
