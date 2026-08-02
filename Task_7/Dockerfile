# ──────────────────────────────────────────────────────
# Stage 1: BUILDER — Install dependencies & compile TS
# ──────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests and install ALL deps (including devDeps for tsc)
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy source code and compile TypeScript → JavaScript
COPY src/ ./src/
RUN npm run build

# ──────────────────────────────────────────────────────
# Stage 2: RUNNER — Lightweight production image
# ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Copy only production dependency manifests
COPY package*.json ./
RUN npm ci --omit=dev

# Copy only compiled JS artifacts from builder stage
COPY --from=builder /app/dist ./dist

# Set production environment
ENV NODE_ENV=production
ENV PORT=3009

EXPOSE 3009

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3009/api/health || exit 1

CMD ["node", "dist/src/app.js"]
