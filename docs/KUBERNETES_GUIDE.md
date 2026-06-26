# OmniMind Production Sprint 5 — Kubernetes Guide

**Date:** 2026-06-17

---

## Architecture

OmniMind runs in namespace `omnimind` with stateless application pods, persistent Redis, and NGINX Ingress.

```
                    ┌─────────────────┐
                    │  Ingress (TLS)  │
                    └────────┬────────┘
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
      ┌──────────────┐ ┌──────────┐ ┌──────────────┐
      │   Frontend   │ │  Backend │ │   Workers    │
      │  Deployment  │ │ Deployment│ │  Deployment  │
      │  replicas: 2 │ │ replicas:3│ │  replicas: 2 │
      └──────────────┘ └─────┬────┘ └──────┬───────┘
                             │              │
                             └──────┬───────┘
                                    ▼
                            ┌──────────────┐
                            │    Redis     │
                            │  PVC 10Gi    │
                            └──────────────┘
```

---

## Manifests

| File | Contents |
|------|----------|
| `infra/k8s/production.yaml` | Namespace, ConfigMap, Secret template, Redis, Backend, Frontend, Worker, Ingress, HPA |
| `infra/k8s/canary.yaml` | Canary deployment + 10% ingress weight |
| `infra/k8s/blue-green.yaml` | Green deployment + switchable Service |

---

## Apply Order

```bash
# 1. Core production stack
kubectl apply -f infra/k8s/production.yaml

# 2. Wait for rollout
kubectl rollout status deployment/omnimind-backend -n omnimind --timeout=300s

# 3. Optional progressive delivery
kubectl apply -f infra/k8s/canary.yaml
```

---

## Configuration

### ConfigMap (`omnimind-config`)

Non-secret environment: `OMNIMIND_ENV`, Redis host, CORS origins, OTel endpoint, worker count.

### Secrets (`omnimind-secrets`)

Replace placeholders before production:

- `JWT_SECRET_KEY`
- `WEBHOOK_SIGNING_SECRET`
- `MONGODB_URI`

**Recommended:** External Secrets Operator syncing from Vault/AWS SM.

---

## Horizontal Pod Autoscaling

### Backend HPA

- **Min:** 3 replicas
- **Max:** 20 replicas
- **Metrics:** CPU 70%, Memory 80%

### Worker HPA

- **Min:** 2 replicas
- **Max:** 10 replicas
- **Metrics:** CPU 75%

### Vertical Pod Autoscaling (optional)

Enable VPA for recommendation mode:

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: omnimind-backend-vpa
  namespace: omnimind
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: omnimind-backend
  updatePolicy:
    updateMode: "Off"  # recommendation only
```

---

## Rolling Updates

Backend Deployment uses:

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

Zero-downtime: new pod must pass readiness before old pod terminates.

---

## Canary Deployment

`infra/k8s/canary.yaml` uses NGINX Ingress annotations:

```yaml
nginx.ingress.kubernetes.io/canary: "true"
nginx.ingress.kubernetes.io/canary-weight: "10"
```

**Flow:**
1. Deploy canary image tag to `omnimind-backend-canary`
2. Monitor error rate / latency in Grafana
3. Increase weight to 50%, then 100%
4. Promote canary tag to stable Deployment

---

## Blue/Green Deployment

1. Deploy `omnimind-backend-green` with new image (`:green` tag)
2. Run smoke tests against `omnimind-backend-green` Service
3. Switch `omnimind-backend` Service selector from `version: stable` to `version: green`
4. Keep blue deployment for instant rollback

```bash
kubectl patch service omnimind-backend -n omnimind \
  -p '{"spec":{"selector":{"version":"green"}}}'
```

---

## Ingress & TLS

- **cert-manager** annotation: `cert-manager.io/cluster-issuer: letsencrypt-prod`
- **Hosts:** `app.omnimind.app`, `api.omnimind.app`
- **WebSocket:** Supported via backend proxy (long timeouts)

---

## Resource Limits

| Pod | CPU Request | CPU Limit | Memory Request | Memory Limit |
|-----|-------------|-----------|----------------|--------------|
| Backend | 500m | 4 | 1Gi | 4Gi |
| Frontend | 250m | 2 | 512Mi | 2Gi |
| Worker | 250m | 2 | 512Mi | 2Gi |
| Redis | 100m | 1 | 256Mi | 1Gi |

---

## Prometheus Scraping

Backend pods annotated for autodiscovery:

```yaml
prometheus.io/scrape: "true"
prometheus.io/path: "/api/v1/omnicore/infra/metrics/prometheus"
prometheus.io/port: "8001"
```

---

## Disaster Recovery

1. Redis: PVC snapshots via cloud provider
2. MongoDB: external Atlas backups + `infra/backup/backup-mongodb.sh`
3. Redeploy from GHCR images: `kubectl set image ... :<last-known-good-tag>`

---

## Validation

CI runs on every PR:

```bash
kubectl apply --dry-run=client -f infra/k8s/production.yaml
```
