# Architecture

OmniMind OS V12 enterprise architecture — presentation shell, OmniCore platform, and domain backends.

---

## High-level system

```mermaid
flowchart TB
  subgraph client [Client Layer]
    Browser[Next.js Workspace UI :3000]
    SDK[OmniMind SDK / CLI]
  end

  subgraph edge [Edge]
    Nginx[nginx Ingress / LB]
  end

  subgraph api [API Layer — FastAPI :8001]
    MW[Enterprise Middleware Stack]
    Auth[JWT Auth + Zero-Trust RBAC]
    Platform[OmniCore Platform — 30 routers]
    Tools[Domain Routers — OmniForge Science etc]
  end

  subgraph data [Data Layer]
    Mongo[(MongoDB)]
    Redis[(Redis Cache)]
    Files[Local / S3 Storage]
  end

  subgraph async [Async]
    Worker[Queue Workers]
  end

  Browser --> Nginx
  SDK --> Nginx
  Nginx --> MW
  MW --> Auth
  Auth --> Platform
  Auth --> Tools
  Platform --> Mongo
  Platform --> Redis
  Tools --> Mongo
  Tools --> Redis
  Worker --> Redis
  Worker --> Mongo
```

---

## OmniCore platform modules

```mermaid
flowchart LR
  subgraph core [OmniCore]
    OC[omnicore]
    AI[omnicore_ai]
    SEC[omnicore_security]
    AUTO[omnicore_automation]
    MC[omnicore_mission_control]
    CLOUD[omnicore_omnicloud]
  end

  subgraph verticals [Vertical Studios]
    MED[medical_enterprise_*]
    VIS[visionary_studio_*]
    MUS[omnimusic_studio_*]
  end

  subgraph ops [Operations]
    OPS[platform_ops]
    INF[omnicore_infra]
    QUA[omnicore_quality]
  end

  OC --> AI
  OC --> SEC
  OC --> AUTO
  OC --> MC
  OC --> CLOUD
```

| Module | Prefix | Endpoints | Purpose |
|--------|--------|-----------|---------|
| OmniCore | `/api/v1/omnicore` | 13+ | Projects, workspace, settings |
| OmniCore AI | `/api/v1/omnicore/ai` | 16 | Text completion gateway |
| Security | `/api/v1/omnicore/security` | 8 | Zero-trust, compliance |
| Automation | `/api/v1/omnicore/automation` | 14 | Workflows, templates |
| Mission Control | `/api/v1/omnicore/mission-control` | 9 | Dashboard, logs, analytics |
| OmniCloud | `/api/v1/omnicore/omnicloud` | 15 | Sync, devices, remote jobs |
| Medical Enterprise | `/api/v1/medical/enterprise/*` | 66 | HIS, imaging, lab, governance |
| Visionary Studio | `/api/v1/visionary/*` | 56 | Creative production pipeline |
| OmniMusic Studio | `/api/v1/omnimusic/studio/*` | 42 | Music production |
| Platform Ops | `/api/v1/platform` | 3 | Health, ready, live probes |

Full endpoint list: [API_REFERENCE.md](API_REFERENCE.md)

---

## Enterprise middleware stack

Request flow (outer → inner):

1. **RequestContext** — correlation ID, request metadata
2. **MetricsMiddleware** — Prometheus-compatible timing
3. **AuditMiddleware** — security audit trail
4. **ResponseEnvelope** — standardized JSON envelope
5. **SlowAPIMiddleware** — global + platform write rate limits

Implementation: `backend/middleware/`, `backend/lib/enterprise/`

---

## Authentication model

```mermaid
sequenceDiagram
  participant C as Client
  participant A as Auth Router
  participant P as Platform Router
  participant Z as Zero-Trust

  C->>A: POST /api/v1/auth/login
  A-->>C: access_token (JWT)
  C->>P: Bearer token
  P->>Z: RBAC check (writes)
  Z-->>P: allowed / denied
  P-->>C: api_ok response
```

- **Public paths:** `/api/v1/platform/{health,live,ready}` only
- **Reads:** authenticated bearer token
- **Writes:** `operator`, `root_operator`, or `owner` role

---

## Deployment topology

```mermaid
flowchart TB
  subgraph k8s [Kubernetes — omnimind namespace]
    Ing[Ingress]
    FE[frontend Deployment x2]
    BE[backend Deployment x3]
    WK[worker Deployment x2]
    RD[(Redis)]
    Canary[canary Deployment 10%]
  end

  Ing --> FE
  Ing --> BE
  Ing --> Canary
  BE --> RD
  WK --> RD
```

See [DEPLOYMENT.md](DEPLOYMENT.md) and [KUBERNETES_GUIDE.md](KUBERNETES_GUIDE.md).

---

## Protected systems

The following must not be redesigned without principal architect approval:

| System | Location |
|--------|----------|
| OmniForge Engine | `frontend/components/omniforge/` |
| OmniForge Code Generation | `frontend/lib/omniforge-*` |
| Architectural Designer Core | `frontend/app/api/architect/` |

---

## Related documents

- [SYSTEM_ARCHITECTURE.md](SYSTEM_ARCHITECTURE.md) — V1.0 layered view
- [OMNICLOUD_ARCHITECTURE.md](OMNICLOUD_ARCHITECTURE.md) — sync and remote execution
- [AUTOMATION_ENGINE.md](AUTOMATION_ENGINE.md) — workflow runtime
- [security/ENTERPRISE_SECURITY.md](security/ENTERPRISE_SECURITY.md) — security architecture
