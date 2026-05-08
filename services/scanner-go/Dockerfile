FROM golang:1.22-alpine

WORKDIR /app

# Copy shared packages
COPY packages/go packages/go

# Copy scanner-go
COPY services/scanner-go services/scanner-go

# Build
WORKDIR /app/services/scanner-go
RUN go build -o /app/scanner ./cmd/scanner

CMD ["/app/scanner"]
