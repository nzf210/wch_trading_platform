module wch-trading-platform/services/scanner-go

go 1.18

replace wch-trading-platform/packages/go => ../../packages/go

require (
	github.com/google/uuid v1.6.0
	github.com/joho/godotenv v1.5.1
	github.com/lib/pq v1.10.9
	github.com/redis/go-redis/v9 v9.0.5
	wch-trading-platform/packages/go v0.0.0
)

require (
	github.com/cespare/xxhash/v2 v2.2.0 // indirect
	github.com/dgryski/go-rendezvous v0.0.0-20200823014737-9f7001d12a5f // indirect
)
