# Troubleshooting

Common issues and resolutions for OmniMind OS development and deployment.

---

## Installation

### `ModuleNotFoundError` on backend start

```bash
cd backend
python -m pip install -r requirements.txt
```

Ensure Python 3.11+ and use the same interpreter for `pip` and `uvicorn`.

### Port 8001 already in use

```powershell
# Windows
netstat -ano | findstr :8001
taskkill /PID <pid> /F
```

```bash
# Linux / macOS
lsof -i :8001
kill <pid>
```

Or start on another port: `uvicorn main:app --port 8002` and update `frontend/.env.local`.

### Frontend cannot reach API

1. Verify backend: `curl http://127.0.0.1:8001/api/v1/platform/health`
2. Check `NEXT_PUBLIC_BACKEND_URL` in `frontend/.env.local`
3. Ensure CORS: `ALLOWED_ORIGINS` includes `http://localhost:3000`

---

## Authentication

### 401 Bearer token required

Platform routes require JWT. In tests:

```python
# Use conftest operator_headers fixture
# Or login:
POST /api/v1/auth/login {"email":"...","password":"..."}
```

### 403 Insufficient permissions for write

Guest role cannot mutate. Use `operator` role token for writes.

### JWT secret warnings

Use 32+ character `JWT_SECRET_KEY`:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

---

## Runtime errors

### `RuntimeError: cannot reuse already awaited coroutine` on `/omnicore/projects`

Fixed in V12 — ensure `lib/response_cache.py` has async-aware `cached_response`. Pull latest `master`.

### MongoDB connection errors

MongoDB is optional for many platform stubs (in-memory fallback). For persistence:

```bash
# Set in backend/.env
MONGODB_URI=mongodb+srv://...
```

Or run without Mongo for local dev — platform store uses file fallback.

### Redis connection errors

```bash
export REDIS_ENABLED=false
```

Or start Redis: `docker compose up -d omnimind-cache`

---

## Build

### Next.js build fails with ENOENT

See [BUILD_ENOENT_ROOT_CAUSE.md](BUILD_ENOENT_ROOT_CAUSE.md). Stop `npm run dev` before `npm run build`.

### TypeScript errors

```bash
cd frontend && npm run typecheck
```

### Circular dependency warnings

Known cycles documented in [AUDITING_REPORT_CURRENT_PHASE.md](AUDITING_REPORT_CURRENT_PHASE.md). Run `npx madge --circular frontend/`.

---

## Docker / Kubernetes

### CI smoke test fails

```bash
docker build -f core_engine/Dockerfile -t omnimind-backend:local ./backend
docker run -d -e REDIS_ENABLED=false -e JWT_SECRET_KEY=ci-test-secret-32-chars-min -p 8001:8001 omnimind-backend:local
curl http://127.0.0.1:8001/api/v1/platform/health
```

### K8s pod not ready

```bash
kubectl logs deployment/omnimind-backend -n omnimind
kubectl describe pod -l app=omnimind-backend -n omnimind
```

Check `/api/v1/platform/ready` response for dependency failures.

### Image pull errors

Verify image path: `ghcr.io/omnimind/omnimind-backend:latest` (not `ghcr.io/omnimind/backend`).

---

## Performance

### Slow dashboard endpoints

Mission control aggregates multiple subsystems. First request after cold start may exceed 500ms locally. CI Linux runners are faster.

### Rate limit 429

Platform write limit: 120/min per IP. Wait or reduce mutation frequency in tests.

---

## Getting help

1. Search [docs/](README.md) and [BUG_TRACKER.md](BUG_TRACKER.md)
2. Run diagnostics: `cd frontend && npm run sdk:doctor`
3. Open issue with: OS, Python/Node versions, error log, steps to reproduce

---

## Related

- [INSTALLATION.md](INSTALLATION.md)
- [CONFIGURATION.md](CONFIGURATION.md)
- [SECURITY.md](SECURITY.md)
