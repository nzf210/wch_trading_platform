# State Machine Minimum Week 1

Tanggal baseline: `2026-05-08`

Dokumen ini menutup target `Minggu 1 Hari 5` untuk memberi mapping state
minimum yang dipakai lintas `apps/api-go`, `services/scanner-go`, dan
`services/executor-rust`.

## Bot

State minimum:

- `draft`
- `paper_active`
- `live_pending_approval`
- `live_active`
- `paused`
- `stopped`
- `error`

Transisi minimum:

- `draft -> paper_active`
  Trigger: user activate paper bot
- `draft -> stopped`
  Trigger: user stop bot
- `paper_active -> paused`
  Trigger: user pause bot
- `paper_active -> live_pending_approval`
  Trigger: user request live activation
- `paper_active -> stopped`
  Trigger: user stop bot
- `live_pending_approval -> paused`
  Trigger: admin or system defers activation
- `live_pending_approval -> live_active`
  Trigger: approval final
- `live_pending_approval -> stopped`
  Trigger: user stop bot
- `live_active -> paused`
  Trigger: user or risk pause
- `live_active -> stopped`
  Trigger: user or emergency stop
- `paused -> paper_active`
  Trigger: user reactivate paper mode
- `paused -> live_pending_approval`
  Trigger: user request live activation
- `paused -> stopped`
  Trigger: user stop bot
- `* -> error`
  Trigger: unrecoverable system failure

Catatan:

- `apps/api-go` adalah owner transisi operator dan user.
- scanner dan executor tidak boleh mengubah state bot secara diam-diam tanpa
  command atau event yang jelas.

## Order Intent

State minimum:

- `created`
- `validated`
- `rejected`
- `superseded`

Transisi minimum:

- `created -> validated`
  Trigger: pre-trade validation dan risk gate lulus
- `created -> rejected`
  Trigger: risk fail, duplicate, invalid signal, atau emergency stop
- `created -> superseded`
  Trigger: intent lama digantikan intent baru yang canonical

Catatan:

- duplicate message tidak boleh membuat intent kedua dengan efek setara.
- metadata korelasi hidup di envelope, bukan di field domain.

## Order

State minimum:

- `pending`
- `submitted`
- `accepted`
- `rejected`
- `cancelled`
- `filled`
- `partially_filled`
- `failed`

Transisi minimum:

- `pending -> submitted`
  Trigger: orchestrator siap submit paper/live path
- `submitted -> accepted`
  Trigger: exchange atau paper adapter menerima order
- `submitted -> rejected`
  Trigger: exchange adapter reject
- `submitted -> failed`
  Trigger: transport atau execution failure
- `accepted -> partially_filled`
  Trigger: fill parsial masuk
- `accepted -> filled`
  Trigger: fill penuh masuk
- `accepted -> cancelled`
  Trigger: cancel sukses
- `partially_filled -> filled`
  Trigger: sisa quantity selesai
- `partially_filled -> cancelled`
  Trigger: sisa quantity dibatalkan

## Execution

State minimum:

- `pending`
- `completed`
- `failed`

Transisi minimum:

- `pending -> completed`
  Trigger: fill dicatat final
- `pending -> failed`
  Trigger: eksekusi tidak bisa diselesaikan

## Boundary Rules

- semua boundary event lintas service memakai `event_envelope` v2
- semua payload boundary memakai `snake_case`
- `signal.generated` belum boleh mem-bypass `order_intent`
- `order_intent -> order -> execution` tetap urutan canonical untuk paper path
