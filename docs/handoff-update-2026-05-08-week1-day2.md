# Handoff Update

## Scope selesai
- rapikan `packages/shared-types/*` untuk contract inti v2
- pisahkan shape `domain` camelCase dan `wire` snake_case
- jadikan `apps/web/src/types/api.ts` mengacu ke shared contract wire

## File utama yang berubah
- [packages/shared-types/index.ts](/home/deploy/wch-trading-platform/packages/shared-types/index.ts:1)
- [packages/shared-types/bot.ts](/home/deploy/wch-trading-platform/packages/shared-types/bot.ts:1)
- [packages/shared-types/signal.ts](/home/deploy/wch-trading-platform/packages/shared-types/signal.ts:1)
- [packages/shared-types/order.ts](/home/deploy/wch-trading-platform/packages/shared-types/order.ts:1)
- [packages/shared-types/event.ts](/home/deploy/wch-trading-platform/packages/shared-types/event.ts:1)
- [packages/shared-types/execution.ts](/home/deploy/wch-trading-platform/packages/shared-types/execution.ts:1)
- [packages/shared-types/subscription.ts](/home/deploy/wch-trading-platform/packages/shared-types/subscription.ts:1)
- [packages/shared-types/user.ts](/home/deploy/wch-trading-platform/packages/shared-types/user.ts:1)
- [packages/shared-types/wallet.ts](/home/deploy/wch-trading-platform/packages/shared-types/wallet.ts:1)
- [apps/web/src/types/api.ts](/home/deploy/wch-trading-platform/apps/web/src/types/api.ts:1)

## Contract yang diputuskan
- `shared-types` menyimpan dua bentuk resmi:
  - `Domain` untuk konsumsi frontend/internal TypeScript dengan `camelCase` dan `Date`
  - `Wire` untuk boundary API dan antar-service dengan `snake_case` dan `ISO datetime string`
- `Api*` di frontend bukan lagi deklarasi duplikat manual; sekarang alias ke `*Wire` dari shared contract
- `SignalProvenance` dipromosikan jadi type reusable
- metadata JSON transaction diseragamkan ke `JsonObject`

## Test atau verifikasi
- `npm run build` di `apps/web`

## Next recommended step
- `Minggu 1 Hari 3`: rapikan `packages/go/domain/*` agar shape wire v2 dan penamaan boundary benar-benar sejajar dengan shared types

## Hal yang jangan diubah dulu
- jangan ubah live trading path
- jangan rename service besar
- jangan ganti contract scanner/executor sebelum domain Go disejajarkan
