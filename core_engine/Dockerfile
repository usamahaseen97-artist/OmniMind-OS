# OmniMind V11 — multi-stage production backend image (Sprint 5)
# Build: docker build -f core_engine/Dockerfile -t omnimind-backend:latest ./backend

# ── Stage 1: build dependencies ──────────────────────────────────────────────
FROM python:3.11-slim AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM python:3.11-slim AS runtime

LABEL org.opencontainers.image.title="OmniMind Backend" \
      org.opencontainers.image.vendor="OmniMind" \
      maintainer="devops@omnimind.io"

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    OMNIMIND_ENV=production

WORKDIR /app

# Non-root user for container security
RUN groupadd -r omnimind && useradd -r -g omnimind -d /app -s /sbin/nologin omnimind

COPY --from=builder /install /usr/local
COPY . .

RUN chown -R omnimind:omnimind /app

USER omnimind

EXPOSE 8001

HEALTHCHECK --interval=15s --timeout=5s --start-period=45s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8001/api/v1/health', timeout=3)" || exit 1

# Workers default 2 in container; override via UVICORN_WORKERS env
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port 8001 --workers ${UVICORN_WORKERS:-2} --loop uvloop --proxy-headers --forwarded-allow-ips='*'"]
