# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for caching
COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src

# Install and build
RUN npm ci && npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built source
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -S appgroup && adduser -S -G appgroup appuser

# Change ownership
RUN chown -R appuser:appgroup /app

USER appuser

CMD ["node", "dist/orchestrator.js"]
