FROM golang:1.23-alpine

WORKDIR /app

# Copy shared packages
COPY packages/go packages/go

# Copy api-go
COPY apps/api-go apps/api-go

# Build
WORKDIR /app/apps/api-go
RUN go build -buildvcs=false -o /app/api ./cmd/api

EXPOSE 8080
CMD ["/app/api"]
