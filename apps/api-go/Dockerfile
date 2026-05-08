# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache git

# Copy shared packages
COPY packages/go packages/go

# Copy api-go
COPY apps/api-go apps/api-go

# Build
WORKDIR /app/apps/api-go
RUN go mod tidy && CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -buildvcs=false -o /app/api ./cmd/api

# Runtime stage
FROM alpine:3.19

RUN apk add --no-cache ca-certificates tzdata wget

WORKDIR /app

# Create non-root user without assuming a specific host UID/GID is free
RUN addgroup -S appgroup && adduser -S -G appgroup -s /bin/sh appuser

# Copy binary from builder
COPY --from=builder /app/api /app/api

# Change ownership
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 8080

CMD ["/app/api"]
