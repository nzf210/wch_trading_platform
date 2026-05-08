# Handoff Update

## Scope selesai
- audit alur `process_intent` di `services/executor-rust`
- identifikasi titik duplicate effect sebelum submit order
- implement reservation idempotency minimum berbasis `orders.idempotency_key`
- tambahkan guard duplicate agar redelivery intent tidak submit order kedua

## File utama yang berubah
- [services/executor-rust/src/app.rs](/home/deploy/wch-trading-platform/services/executor-rust/src/app.rs:1)
- [services/executor-rust/src/postgres/orders.rs](/home/deploy/wch-trading-platform/services/executor-rust/src/postgres/orders.rs:1)
- [services/executor-rust/src/execution/idempotency.rs](/home/deploy/wch-trading-platform/services/executor-rust/src/execution/idempotency.rs:1)
- [migrations/018_order_reservation_unique.sql](/home/deploy/wch-trading-platform/migrations/018_order_reservation_unique.sql:1)

## Strategi idempotency yang dipakai
- canonical key untuk executor sekarang adalah `intent.id`
- order dibuat sebagai reservation lebih dulu dengan `status = pending`
- insert reservation memakai `ON CONFLICT (idempotency_key) DO NOTHING`
- jika reservation gagal:
  - bila order existing sudah terminal, duplicate intent di-skip
  - bila order existing masih `pending`, intent dianggap sedang diproses dan tidak dieksekusi ulang
- setelah execution selesai, row reservation yang sama di-update menjadi hasil final

## Konsekuensi yang disengaja
- duplicate delivery tidak lagi menulis order baru atau submit ulang ke exchange/paper path
- failure saat execute tidak meninggalkan order hilang; reservation yang sama dipersist sebagai `failed`
- constraint unik `order_intent_id` ditambahkan agar satu intent tetap punya satu order canonical di level DB

## Test atau verifikasi
- `cargo test` di `services/executor-rust`

## Next recommended step
- `Minggu 2 Hari 2`: lanjutkan enforcement dengan test lebih konkret untuk duplicate intent dan rapikan consumer agar memakai correlation/idempotency metadata dari envelope

## Hal yang jangan diubah dulu
- jangan buka live trading production
- jangan pindah ke split service fisik
- jangan ubah scanner dulu sebelum test safety executor makin rapat
