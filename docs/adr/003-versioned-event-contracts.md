# ADR-003: Event Contract V2 Harus Terversi dan Konsisten Lintas Service

- Status: `Accepted`
- Tanggal: `2026-05-07`

## Konteks

Saat ini docs domain lebih matang daripada implementasi service, sementara
`packages/shared-types/*` masih kosong. Tanpa kontrak event yang canonical, tiap
service akan membangun asumsi payload sendiri.

## Keputusan

Setiap event v2 wajib memiliki field minimum berikut:

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

Canonical contract disimpan di `packages/shared-types` atau pengganti schema lintas
bahasa yang setara, dan menjadi referensi untuk Go, Rust, dan TypeScript.

## Konsekuensi

- Shared contract harus menjadi salah satu deliverable pertama, bukan pekerjaan
  belakangan.
- Event tanpa versi atau metadata korelasi dianggap non-compliant untuk v2.
- Refactor service yang ada harus mengikuti contract ini sebelum scale-out.
