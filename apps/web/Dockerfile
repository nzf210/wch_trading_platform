# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY apps/web/package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source
COPY packages ./packages
COPY apps/web ./apps/web

# Build
WORKDIR /app/apps/web
RUN npm run build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

# Install production dependencies only
COPY apps/web/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built assets
COPY --from=builder /app/apps/web/dist ./dist

# Create non-root user without assuming a specific host UID/GID is free
RUN addgroup -S appgroup && adduser -S -G appgroup -s /bin/sh appuser

# Change ownership
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

# Use npm start for production
CMD ["npm", "run", "start"]
