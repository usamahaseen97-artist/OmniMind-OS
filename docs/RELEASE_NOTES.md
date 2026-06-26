# Release Notes — OmniMind OS

## v1.0.0 — Enterprise Production Release (2026-06-17)

**Tag:** `v1.0.0`  
**Status:** Release Candidate → Production  
**Decision:** **GO**

### Release highlights

- 84 API routers, 487 OpenAPI paths, 545 operations
- 30 OmniCore platform modules with enterprise middleware
- 75 automated backend tests passing
- OpenAPI `/docs` generation fixed (EnterpriseDocument import)
- Full enterprise documentation and Apache 2.0 license
- Production Docker + Kubernetes deployment paths

See [RELEASE_CANDIDATE_v1.0.0.md](RELEASE_CANDIDATE_v1.0.0.md) for verification evidence.

---

## V12 Enterprise Platform (development track)

**Release date:** 2026-06-17  
**Codename:** Enterprise Platform  
**Branch:** `master`

---

## Overview

V12 delivers enterprise-grade OmniCore platform modules, production infrastructure, comprehensive QA validation, and open-source documentation for production release.

---

## Highlights

### OmniCore Platform (Commit 4)

- 30 platform routers, 293 REST endpoints
- Enterprise middleware: request context, metrics, audit, response envelope
- JWT + zero-trust RBAC on all platform mutations
- SlowAPI rate limiting on platform writes (120/min)
- Async persistence via `omnicore_store_async`
- Public probes: `/api/v1/platform/{health,live,ready}`

### Infrastructure (Commits 2–3)

- Production Docker Compose and Kubernetes manifests
- GitHub Actions CI/CD (`master` + `main` branch support)
- Canary deployment with dedicated Service
- GHCR image registry: `ghcr.io/omnimind/omnimind-backend`

### Quality Assurance (Commit 5)

- **75 automated tests** — unit, integration, contract, auth, security, smoke, e2e, performance
- 53% combined coverage on `lib/` + `routers/`
- Auth fixtures and enterprise test markers

### Documentation (Commit 6)

- Enterprise documentation suite (12 core guides)
- Auto-generated API reference (293 platform endpoints)
- Apache 2.0 open-source license

---

## Breaking changes

| Change | Migration |
|--------|-----------|
| Platform routes require JWT | Add `Authorization: Bearer` header; use `/api/v1/auth/login` |
| K8s image path updated | `omnimind-backend` not `backend` |
| CI triggers on `master` | No action if already on `master` |

---

## Known limitations

| Item | Status |
|------|--------|
| Visionary / OmniMusic / Medical vertical APIs | Stub backends — UI may show features ahead of full backend |
| 27 routers still on sync `omnicore_store` | Migration to async store ongoing |
| `/creative-visionary` vs `/visionary-studio` | Duplicate routes — consolidation planned |
| OpenAPI single export | Per-module docs; use `API_REFERENCE.md` |

---

## Upgrade path

```bash
git pull origin master
cd backend && pip install -r requirements.txt -r requirements-test.txt
pytest tests/ -q
cd ../frontend && npm ci && npm run build
```

Production: rolling deploy via `kubectl rollout restart deployment/omnimind-backend -n omnimind`

---

## Test summary (V12)

| Suite | Count | Status |
|-------|-------|--------|
| Backend QA | 75 | ✅ Pass |
| Frontend unit | 42 | ✅ Pass |
| CI smoke | Docker health | ✅ Pass |

---

## Contributors

OmniMind Engineering — enterprise git strategy commits 1–6.

---

## Previous releases

- [OMNIMIND_RELEASE_NOTES.md](OMNIMIND_RELEASE_NOTES.md) — historical notes
- [VERSION_1.0.md](VERSION_1.0.md) — V1.0 RC documentation

---

## Related

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [SECURITY.md](SECURITY.md)
