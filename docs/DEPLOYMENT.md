# Deployment

Production deployment guide for OmniMind OS V12. For environment templates see `infra/env/`.

> **Canonical guide:** This document supersedes scattered deployment notes. Historical detail: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

---

## Environments

| Environment | Template | `OMNIMIND_ENV` |
|-------------|----------|----------------|
| Development | `infra/env/development.env.example` | `development` |
| Testing / CI | `infra/env/testing.env.example` | `testing` |
| QA | `infra/env/qa.env.example` | `qa` |
| Staging | `infra/env/staging.env.example` | `staging` |
| Production | `infra/env/production.env.example` | `production` |

```bash
cp infra/env/production.env.example backend/.env
# Replace REPLACE_WITH_VAULT_SECRET placeholders via your secret manager
```

---

## Docker images

| Image | Registry path |
|-------|---------------|
| Backend | `ghcr.io/omnimind/omnimind-backend:latest` |
| Frontend | `ghcr.io/omnimind/omnimind-frontend:latest` |

Build locally:

```bash
docker build -f core_engine/Dockerfile -t omnimind-backend:local ./backend
docker build -f frontend/Dockerfile -t omnimind-frontend:local ./frontend
```

Publish via GitHub Actions: `.github/workflows/docker-publish.yml` (triggers on `master` / `main` tags).

---

## Docker Compose — production

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Services: frontend, backend (×uvicorn workers), worker, Redis, nginx.

| Endpoint | URL |
|----------|-----|
| App | `https://app.omnimind.app` |
| API | `https://api.omnimind.app` |
| Health | `/api/v1/platform/health` |
| Readiness | `/api/v1/platform/ready` |
| Metrics | `/api/v1/omnicore/infra/metrics/prometheus` |

---

## Kubernetes

Apply manifests:

```bash
kubectl apply -f infra/k8s/production.yaml
```

| Resource | Purpose |
|----------|---------|
| `omnimind-backend` | API Deployment (3 replicas, HPA 3–20) |
| `omnimind-frontend` | UI Deployment (2 replicas) |
| `omnimind-worker` | Background jobs (2 replicas) |
| `omnimind-redis` | Cache with PVC |
| `omnimind-ingress` | TLS termination |

### Canary (10% traffic)

```bash
kubectl apply -f infra/k8s/canary.yaml
```

Requires stable deployment healthy. Canary uses `omnimind-backend-canary` Service + NGINX canary annotations.

### Blue/green

```bash
kubectl apply -f infra/k8s/blue-green.yaml
# Switch Service selector when green is healthy
```

Detail: [KUBERNETES_GUIDE.md](KUBERNETES_GUIDE.md)

---

## CI/CD pipelines

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `ci.yml` | push/PR `master`, `main` | Lint, test, Docker smoke, K8s dry-run |
| `docker-publish.yml` | tags `v*.*.*` | Push GHCR images |
| `deploy-staging.yml` | manual | Staging rollout / rollback |
| `production-deploy.yml` | push `master`/`main` | Build verification |

---

## Health probes (Kubernetes)

| Probe | Path | Deployment |
|-------|------|------------|
| Liveness | `/api/v1/platform/live` or `/api/v1/health` | backend |
| Readiness | `/api/v1/platform/ready` | backend |
| Metrics | `/api/v1/omnicore/infra/metrics/prometheus` | Prometheus scrape |

---

## Backup & recovery

- MongoDB: `infra/backup/backup-mongodb.sh`
- Redis: `infra/backup/backup-redis.sh`
- Verify: `infra/backup/verify-backup.sh`

Runbook: [BACKUP_PLAN.md](BACKUP_PLAN.md)

---

## Observability

Optional stack: `docker-compose.observability.yml`

- Prometheus → `infra/observability/prometheus/`
- Grafana → `infra/observability/grafana/`
- OpenTelemetry → `infra/observability/otel/`

---

## Related

- [CONFIGURATION.md](CONFIGURATION.md)
- [SECURITY.md](SECURITY.md)
- [DEVOPS_GUIDE.md](DEVOPS_GUIDE.md)
