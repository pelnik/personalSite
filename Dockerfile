# =============================================================================
# Multi-stage Dockerfile for personalSite
# Supports both development and production builds
# =============================================================================

# -----------------------------------------------------------------------------
# Base stage: Common setup for all stages
# -----------------------------------------------------------------------------
FROM node:24-alpine AS base

WORKDIR /app

# -----------------------------------------------------------------------------
# Dependencies stage: Install node modules
# -----------------------------------------------------------------------------
FROM base AS deps

COPY package*.json ./
RUN npm ci

# -----------------------------------------------------------------------------
# Development stage: For local development with hot reload
# -----------------------------------------------------------------------------
FROM base AS development

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Development ports (Express: 3000, Vite: 3001)
EXPOSE 3000 3001

# Vite must listen on all interfaces to be reachable from outside the container.
CMD ["npx", "concurrently", "npm run server:dev", "npm run client:dev -- --host 0.0.0.0"]

# -----------------------------------------------------------------------------
# Build stage: Build the React frontend
# -----------------------------------------------------------------------------
FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# -----------------------------------------------------------------------------
# Production stage: Minimal image for production deployment
# -----------------------------------------------------------------------------
FROM node:24-alpine AS production

WORKDIR /app

# Only what the server needs at runtime. Every server dependency is pure JS,
# so there's nothing to compile.
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built assets and server code
COPY --from=builder /app/build ./build
COPY app.js server.js ./
COPY src/api ./src/api

# Production ports (HTTP: 80, HTTPS: 443)
EXPOSE 80 443

ENV NODE_ENV=production

CMD ["node", "server.js"]
