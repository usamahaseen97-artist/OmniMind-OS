# OmniMind Production Sprint 5 — Deployment Guide

**Date:** 2026-06-17  
**Audience:** DevOps, SRE, Platform Engineers

---

## Overview

OmniMind deploys as a **cloud-native stack**: Next.js frontend, FastAPI backend, Redis cache, background workers, and optional observability mesh. All user-facing functionality is preserved; Sprint 5 adds production deployment paths only.

---

## Environments

| Environment | Config Template | Purpose |
|-------------|-----------------|---------|
| Development | `infra/env/development.env.example` | Local dev |
| Testing | `infra/env/testing.env.example` | CI / automated tests |
| QA | `infra/env/qa.env.example` | QA cluster |
| Staging | `infra/env/staging.env.example` | Pre-production |
| Production | `infra/env/production.env.example` | Live traffic |
| Preview | `infra/env/preview.env.example` | Per-PR previews |

Copy the appropriate template to `backend/.env`:

```bash
cp infra/env/staging.env.example backend/.env
# Edit secrets — never commit real values
```

Set `OMNIMIND_ENV` to activate environment-aware behavior in the backend.

---

## Local Development

```powershell
# Windows (existing workflow — unchanged)
.\OMNIMIND-START.ps1
```

```bash
# Docker — minimal mesh (backend + Redis + nginx)
docker compose up -d --build

# Docker — full production stack (frontend + backend + worker + Redis)
cp infra/env/staging.env.example .env
docker compose -f docker-compose.prod.yml up -d --build
```

| Endpoint | URL |
|----------|-----|
| Frontend | http://localhost (prod compose) or http://localhost:3000 (dev) |
| API health | http://localhost/api/v1/health |
| Infra metrics | http://localhost/api/v1/omnicore/infra/metrics/prometheus |

---

## Docker Images

### Backend (multi-stage)

```bash
docker build -f core_engine/Dockerfile -t omnimind-backend:latest ./backend
```

- Non-root `omnimind` user
- Health check on `/api/v1/health`
- Configurable workers via `UVICORN_WORKERS`

### Frontend (Next.js standalone)

```bash
docker build -f frontend/Dockerfile \
  --build-arg NEXT_PUBLIC_BACKEND_URL=https://api.omnimind.app \
  -t omnimind-frontend:latest ./frontend
```

Requires `OMNIMIND_DOCKER_BUILD=1` at build time (set automatically in Dockerfile).

---

## Kubernetes Deployment

```bash
# 1. Replace secrets in manifest or use external secrets operator
kubectl apply -f infra/k8s/production.yaml

# 2. Optional: canary (10% traffic)
kubectl apply -f infra/k8s/canary.yaml

# 3. Optional: blue/green green deployment
kubectl apply -f infra/k8s/blue-green.yaml
```

| Resource | Replicas | HPA |
|----------|----------|-----|
| Backend | 3 (min) | 3–20 CPU/memory |
| Frontend | 2 | Manual |
| Worker | 2 | 2–10 CPU |
| Redis | 1 | PVC 10Gi |

**Ingress hosts:** `app.omnimind.app` (frontend), `api.omnimind.app` (backend)

---

## CI/CD Pipelines

| Workflow | Trigger | Actions |
|----------|---------|---------|
| `ci.yml` | PR / push to main | Lint, test, security scan, build, k8s dry-run |
| `docker-publish.yml` | Tags / main | Push images to GHCR |
| `deploy-staging.yml` | Manual | Deploy or rollback staging |
| `production-deploy.yml` | Legacy smoke | Kept for backward compatibility |

### Release tagging

```bash
git tag v5.0.0
git push origin v5.0.0
# Triggers docker-publish + GitHub release notes
```

### Rollback

```bash
# GitHub Actions: deploy-staging workflow with rollback=true
# Or kubectl:
kubectl rollout undo deployment/omnimind-backend -n omnimind
```

---

## Observability Stack

```bash
docker compose -f docker-compose.observability.yml up -d
```

| Service | Port | Purpose |
|---------|------|---------|
| Prometheus | 9090 | Metrics scrape |
| Grafana | 3001 | Dashboards |
| OTel Collector | 4317/4318 | Traces + metrics ingest |
| Alertmanager | 9093 | Alert routing |

Backend exposes Prometheus text at `/api/v1/omnicore/infra/metrics/prometheus`.

---

## Secrets Management

**Never commit:** `JWT_SECRET_KEY`, `MONGODB_URI`, `WEBHOOK_SIGNING_SECRET`, API keys.

| Tier | Recommended |
|------|-------------|
| Local | `backend/.env` (gitignored) |
| Staging/Prod K8s | `omnimind-secrets` Secret or External Secrets Operator |
| Enterprise | HashiCorp Vault / AWS Secrets Manager |

---

## Health Checks

| Probe | Path | Expected |
|-------|------|----------|
| Liveness | `/api/v1/health` | 200 |
| Infra | `/api/v1/omnicore/infra/health` | `ok: true` |
| Quality | `/api/v1/omnicore/quality/health` | `ok: true` |
| Nginx | `/healthz` | 200 |

---

## Verification Checklist

- [ ] `OMNIMIND_ENV` set correctly
- [ ] Redis reachable (`REDIS_HOST` / `REDIS_URL`)
- [ ] MongoDB URI configured (Atlas or self-hosted)
- [ ] CORS origins match frontend URL
- [ ] TLS certificates on Ingress
- [ ] Backup cron configured (`infra/backup/`)
- [ ] `npm run test` passes (22 tests)
- [ ] Smoke: `curl /api/v1/omnicore/infra/deployment`
