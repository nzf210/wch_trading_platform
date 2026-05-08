# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source
COPY src ./src

# Build TypeScript
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built source
COPY --from=builder /app/dist ./dist

# Create non-root user without assuming a specific host UID/GID is free
RUN addgroup -S appgroup && adduser -S -G appgroup -s /bin/sh appuser

# Change ownership
RUN chown -R appuser:appgroup /app

USER appuser

CMD ["node", "dist/index.js"]
