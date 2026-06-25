# OmniMind Frontend — multi-stage Next.js standalone (Sprint 5)
# Build: docker build -f Dockerfile --build-arg OMNIMIND_DOCKER_BUILD=1 -t omnimind-frontend:latest ./frontend

# ── Stage 1: dependencies ────────────────────────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# ── Stage 2: build ───────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV OMNIMIND_DOCKER_BUILD=1 \
    NEXT_TELEMETRY_DISABLED=1

ARG NEXT_PUBLIC_BACKEND_URL=http://dynamic-core-service:8001
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}

RUN npm run build

# ── Stage 3: runtime ───────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

LABEL org.opencontainers.image.title="OmniMind Frontend" \
      org.opencontainers.image.vendor="OmniMind"

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S omnimind && adduser -S omnimind -u 1001 -G omnimind

COPY --from=builder /app/public ./public
COPY --from=builder --chown=omnimind:omnimind /app/.next/standalone ./
COPY --from=builder --chown=omnimind:omnimind /app/.next/static ./.next/static

USER omnimind

EXPOSE 3000

HEALTHCHECK --interval=20s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1

CMD ["node", "server.js"]
