# Handoff Update

## Scope Rencana (Minggu 4, Hari 4-5)

- **Tujuan:** Membangun fondasi observability dengan structured logging dan memastikan setiap request/event dapat dilacak end-to-end melalui `correlation_id`.

- **Tasks:**
    1.  **Implementasi Structured Logging di `api-go`:**
        -   Ganti `log.Printf` standar dengan library logging terstruktur (e.g., `slog` dari Go 1.21+ atau `zerolog`).
        -   Setiap log entry harus dalam format JSON.
        -   Pastikan `correlation_id` selalu ada di setiap log entry, diekstrak dari context.
    2.  **Implementasi Structured Logging di `executor-rust`:**
        -   Gunakan `tracing` crate dengan `tracing-subscriber` untuk output JSON.
        -   Propagasi `correlation_id` dari event yang diterima ke semua log dalam scope pemrosesan event tersebut.
    3.  **Propagasi `correlation_id` via HTTP Headers:**
        -   Web client (`apps/web`) harus generate `correlation_id` (UUID v4) untuk setiap request baru ke `api-go`.
        -   `api-go` harus membaca `X-Correlation-ID` dari header request dan meneruskannya ke dalam `context.Context`. Jika tidak ada, generate yang baru.
        -   Pastikan Nginx (`infra/nginx/default.conf`) meneruskan header `X-Correlation-ID`.
    4.  **Verifikasi Propagasi di Event Bus (Redis):**
        -   Saat `api-go` mempublikasikan event ke outbox (yang kemudian ke Redis), `correlation_id` dari context harus dimasukkan ke dalam metadata event.
        -   `executor-rust` dan service lainnya saat menerima event harus mengekstrak `correlation_id` dan menggunakannya dalam logging scope mereka.

## File Kunci untuk Dimodifikasi

-   `packages/go/logger/logger.go`: Inisialisasi dan konfigurasi structured logger.
-   `apps/api-go/internal/http/middleware/request_logger.go`: Middleware untuk inject logger ke context dan log request/response.
-   `apps/api-go/internal/platform/outbox/publisher.go`: Memastikan `correlation_id` masuk ke event envelope.
-   `services/executor-rust/src/main.rs`: Inisialisasi `tracing-subscriber`.
-   `services/executor-rust/src/app.rs`: Ekstraksi `correlation_id` dari event dan set di `tracing` span.
-   `apps/web/src/lib/api.ts` (atau sejenisnya): Axios/fetch interceptor untuk menambahkan `X-Correlation-ID` header.
-   `infra/nginx/default.conf`: Konfigurasi `proxy_pass_header`.

## Ekspektasi Hasil

-   Semua log dari `api-go` dan `executor-rust` dalam format JSON.
-   Setiap log dari request yang berasal dari web hingga dieksekusi oleh `executor-rust` memiliki `correlation_id` yang sama.
-   Memudahkan debugging dan tracing alur sistem secara manual dengan mem-filter log berdasarkan `correlation_id`.

## Test atau Verifikasi

-   Jalankan satu alur penuh (misal: create bot dari UI).
-   Gunakan `docker-compose logs -f` untuk memantau log dari `api-go` dan `executor-rust`.
-   Grep log berdasarkan satu `correlation_id` dan pastikan semua step dari request tersebut muncul.

## Next Recommended Step

-   Lanjut ke `Minggu 5`: Implementasi fitur-fitur lanjutan seperti autentikasi user dan peningkatan UI.
