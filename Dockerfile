# =============================================================================
# Multi-stage Dockerfile for personalSite
# Supports both development and production builds
# =============================================================================

# -----------------------------------------------------------------------------
# Base stage: Common setup for all stages
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies needed for bcrypt native compilation
RUN apk add --no-cache python3 make g++

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

# Development ports (Express: 3000, React: 3001)
EXPOSE 3000 3001

CMD ["npm", "run", "start:express"]

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
FROM node:20-alpine AS production

WORKDIR /app

# Install only production dependencies and bcrypt build tools
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --only=production && \
    npm rebuild bcrypt && \
    apk del python3 make g++

# Copy built assets and server code
COPY --from=builder /app/build ./build
COPY server.js ./
COPY src/api ./src/api

# Production ports (HTTP: 80, HTTPS: 443)
EXPOSE 80 443

ENV NODE_ENV=production

CMD ["node", "server.js"]
