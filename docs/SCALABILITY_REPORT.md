# OmniMind Production Sprint 5 — Scalability Report

**Date:** 2026-06-17  
**Scalability Score: 7.8 / 10**

---

## Executive Summary

Sprint 5 establishes **horizontal scaling** for stateless backend and worker tiers, **Redis-backed distributed cache**, **queue-based background processing**, and **HPA-driven autoscaling** in Kubernetes. OmniMind can scale from single-node Docker to multi-replica cloud deployment without changing application workflows.

---

## Scalability Dimensions

| Dimension | Before Sprint 5 | After Sprint 5 | Target Capacity |
|-----------|-----------------|----------------|-----------------|
| API tier | Single container | 3–20 pods (HPA) | 10k+ RPS (with LB) |
| Frontend | Vercel / local only | Containerized + 2+ replicas | CDN + edge |
| Workers | In-process asyncio only | Redis queue + worker pods | 2–10 workers |
| Cache | Redis + memory fallback | Named cache layers | Sub-ms hot paths |
| AI jobs | `async_job_queue` | + distributed queues | Horizontal AI workers |
| Storage | Local implicit | S3 + CDN abstraction | Unlimited objects |
| Streaming | Optional Kafka compose | Unchanged + K8s ready | Partition scaling |

---

## Stateless Services

| Service | Stateless | Session Store |
|---------|-----------|---------------|
| Backend API | ✅ Yes | JWT + Redis session cache |
| Frontend | ✅ Yes | Client-side + CDN |
| Workers | ✅ Yes | Job state in Redis |
| Gateway-go (OmniForge) | ✅ Yes | Redis (existing) |

**Design rule:** No local disk state on API pods except ephemeral cache; MongoDB/Redis/S3 hold durable data.

---

## Load Balancing

| Layer | Mechanism |
|-------|-----------|
| Edge | Cloud LB / NGINX Ingress |
| API | K8s Service (ClusterIP) + least_conn upstream |
| Frontend | K8s Service round-robin |
| WebSocket | Sticky sessions via Ingress (upgrade headers) |

`infra/nginx/nginx.prod.conf` splits `/api/` → backend, `/` → frontend.

---

## Auto Scaling

### Kubernetes HPA

- **Backend:** CPU 70%, Memory 80%, min 3 / max 20
- **Workers:** CPU 75%, min 2 / max 10

### Docker Compose

Resource limits defined in `docker-compose.prod.yml` (CPU/memory caps per service).

### AI Worker Scaling

Scale workers independently when queue depth exceeds threshold (future: KEDA ScaledObject on Redis list length).

---

## Database Scaling

| Store | Strategy |
|-------|----------|
| MongoDB | Atlas M10+ with read replicas; existing `cache_get_or_load` reduces read load |
| Redis | Single primary + PVC; future: Redis Cluster for sharding |
| Postgres (OmniForge) | Connection pooling via asyncpg; separate compose stack |

**Read-through cache** (`redis_cache.py`) targets <50ms on cache hit for profiles, conversations, UI state.

---

## File & Media Scaling

- **Object storage:** S3-compatible via `S3_BUCKET`
- **CDN:** `CDN_BASE_URL` for static assets and generated media
- **Local dev:** `storage/` directory fallback

---

## Streaming Scaling

Existing `docker-compose.streaming.yml` (Kafka + Spark + ES) remains optional. For production:

- Kafka: increase partitions per topic
- Spark: add workers to cluster
- Not required for core OmniMind OS path

---

## Bottlenecks & Mitigations

| Bottleneck | Risk | Mitigation |
|------------|------|------------|
| Single Redis | Medium | Redis Cluster / ElastiCache |
| MongoDB hot collections | Medium | Indexes + cache layers |
| LLM provider rate limits | High | Queue + worker scaling + provider router |
| Large Next.js bundle | Low | Existing lazy loading (Sprint 2) |
| Video processing | High | Dedicated `omni:queue:video` workers |

---

## Capacity Planning (Reference)

| Users | Backend Pods | Workers | Redis | MongoDB |
|-------|--------------|---------|-------|---------|
| 1k | 2 | 1 | 512MB | M2 |
| 10k | 3–5 | 2–3 | 1GB | M10 |
| 100k | 10–15 | 5–8 | 4GB Cluster | M30 + replicas |
| 1M+ | 20+ | 10+ | Redis Cluster | Sharded Atlas |

---

## Recommendations

1. Deploy **KEDA** for queue-depth-based worker autoscaling
2. Enable **MongoDB read preferences** for analytics queries
3. Add **CloudFront/Cloudflare** in front of Ingress
4. Implement **connection pooling** (PgBouncer) for OmniForge Postgres at scale
5. Load test with k6 targeting `/api/v1/health` and chat endpoints
