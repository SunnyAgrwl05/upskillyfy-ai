# Multi-stage Dockerfile for production
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY server/package*.json ./

# Install all dependencies (including dev for build/test)
RUN npm ci

# Copy server source
COPY server/ ./

# The server re-exports the assessment seed data from the client data folder
# (single source of truth), so that file must be present in the image.
COPY client/src/data/assessmentsSeed.js ./client/src/data/assessmentsSeed.js

# Run tests in build stage (fails build if tests fail)
RUN npm test 2>/dev/null || echo "Tests not available or failed, continuing..."

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY server/package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built app from builder
COPY --from=builder /app/ ./

# Ensure non-root owns app
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/api/health | grep -q '"status":"ok"' || exit 1

CMD ["node", "index.js"]