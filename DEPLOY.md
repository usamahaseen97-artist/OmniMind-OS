# OmniMind V11 — publish checklist

Use this before production deploy (Vercel, VPS, or container host).

## 1. Backend environment (`backend/.env`)

| Variable | Purpose |
|----------|---------|
| `MONGODB_URI` | Atlas SRV string **or** use `MONGODB_USER` + `MONGODB_PASSWORD` + `MONGODB_HOST` |
| `MONGODB_DB_NAME` | Default `omnimind_v11` |
| `OMNIMIND_ALLOWED_ORIGINS` or `ALLOWED_ORIGINS` | Comma list: your Next.js URL + API URL |
| `GEMINI_API_KEY` / `TAVILY_API_KEY` / etc. | Optional per feature |

**MongoDB:** Special characters in passwords must be URL-encoded once in `MONGODB_URI`, or use split env vars (see `backend/.env.example`).

## 2. Frontend environment (`frontend/.env.local`)

```
NEXT_PUBLIC_BACKEND_URL=https://your-api.example.com
```

Must match a host listed in backend CORS origins.

## 3. Health endpoints

- `GET /` — API alive  
- `GET /api/v1/platform/readiness` — MongoDB mode, Kafka/Spark hints, `publish_ready`  
- `GET /health/db` — DB diagnostics (no secrets)  
- `GET /api/streaming/health` — streaming engines (lazy mode does not auto-start Docker)

## 4. Kafka / Spark (optional)

- Requires **Docker** on the host. From **project root**:  
  `docker compose up -d kafka`  
  `docker compose up -d spark-master spark-worker`  
- With `STREAMING_LAZY_LOAD=true`, services start when you hit the streaming API routes.

## 5. In-memory fallback

If Atlas is misconfigured, the API still runs with **in-memory** chat storage. `publish_ready` in readiness JSON is **false** until a real Mongo connection is active.

## 6. Build commands

```bash
# Backend
cd backend && pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend
cd frontend && npm ci && npm run build
```

Verify `npm run lint` (TypeScript) passes before ship.
