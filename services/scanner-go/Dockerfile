# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy shared packages
COPY packages/go packages/go

# Copy scanner-go
COPY services/scanner-go services/scanner-go

# Build
WORKDIR /app/services/scanner-go
RUN go mod tidy && CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -buildvcs=false -o /app/scanner ./cmd/scanner

# Runtime stage
FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata wget

WORKDIR /app

# Create non-root user without assuming a specific host UID/GID is free
RUN addgroup -S appgroup && adduser -S -G appgroup -s /bin/sh appuser

# Copy binary from builder
COPY --from=builder /app/scanner /app/scanner

# Change ownership
RUN chown -R appuser:appgroup /app

USER appuser

CMD ["/app/scanner"]
