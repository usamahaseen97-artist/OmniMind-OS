# Developer Guide

Guide for engineers working on OmniMind OS V12.

---

## Repository map

```
omnimind/
├── backend/                 # Canonical FastAPI API (port 8001)
│   ├── main.py              # App entry, router registration, middleware
│   ├── auth/                # JWT authentication
│   ├── routers/             # 80+ API routers
│   ├── lib/enterprise/      # Platform auth, responses, DI
│   ├── lib/omnicore_store*  # Persistence layer
│   ├── middleware/          # Request context, audit, metrics
│   ├── schemas/             # Pydantic models
│   └── tests/               # 75 enterprise QA tests
├── frontend/                # Next.js 15 workspace
│   ├── app/                 # App router pages
│   ├── components/          # UI components
│   ├── core/                # OmniCore / OmniAI clients
│   ├── lib/                 # API bridges, registries
│   └── sdk/                 # OmniMind SDK
├── docs/                    # Documentation
├── infra/                   # K8s, nginx, observability
└── core_engine/Dockerfile   # Production backend image
```

> Use `backend/` as the primary API. `backend-fastapi/` (if present) is legacy.

---

## Local development

```bash
# Terminal 1 — API
cd backend
export REDIS_ENABLED=false JWT_SECRET_KEY=dev-secret-32-characters-minimum
python -m uvicorn main:app --reload --port 8001

# Terminal 2 — UI
cd frontend && npm run dev
```

Windows: `.\OMNIMIND-START.ps1` + `.\run-frontend.ps1`

---

## Adding a platform router

1. Create `backend/routers/my_module.py`
2. Use `APIRouter(..., dependencies=platform_router_dependencies())`
3. Use Pydantic models from `schemas/platform_enterprise.py`
4. Return `api_ok(...)` from `lib/enterprise/responses`
5. Register in `backend/main.py`
6. Add tests in `backend/tests/`
7. Regenerate API docs: `python docs/_gen_api_ref.py`

---

## Testing

```bash
# Backend — full suite
cd backend
pip install -r requirements.txt -r requirements-test.txt
pytest tests/ -v

# By marker
pytest -m smoke tests/
pytest -m security tests/
pytest -m e2e tests/

# Coverage
pytest tests/ --cov=lib --cov=routers --cov-report=term-missing

# Frontend
cd frontend
npm run test
npm run test:e2e    # requires Playwright
```

Test fixtures: `backend/tests/conftest.py` (operator JWT, guest JWT)

---

## API exploration

| URL | Environment |
|-----|-------------|
| `http://127.0.0.1:8001/docs` | development/testing only |
| `http://127.0.0.1:8001/redoc` | development/testing only |

Production disables OpenAPI UI when `OMNIMIND_ENV=production`.

---

## Frontend conventions

| Pattern | Location |
|---------|----------|
| Tool registry | `frontend/lib/sovereign-tool-registry.ts` |
| OmniCore client | `frontend/core/omnicore/OmniCoreApiClient.ts` |
| API bridges | `frontend/lib/omnicore/*-api.ts` |
| Providers | `frontend/app/providers.tsx` |

Prefer `core/omnicore/` clients over duplicate `lib/omnicore/` where consolidated.

---

## SDK & CLI

```bash
cd frontend
npm run sdk:doctor
npm run omnimind -- --help
```

Docs: [SDK_GUIDE.md](SDK_GUIDE.md), [platform/CLI.md](platform/CLI.md)

---

## CI parity

Local verify matches CI:

```bash
npm run verify          # root — lint, test, build, typecheck
python -m compileall -q backend
cd backend && pytest tests/ -q
```

Workflow: `.github/workflows/ci.yml`

---

## Related

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [API_REFERENCE.md](API_REFERENCE.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [engineering-review/00-INDEX.md](engineering-review/00-INDEX.md)
