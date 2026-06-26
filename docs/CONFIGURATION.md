# Configuration

Environment variables and configuration for OmniMind OS.

**Primary files:**

| File | Purpose |
|------|---------|
| `backend/.env` | Backend secrets and feature flags |
| `frontend/.env.local` | Client-side backend URL |
| `.env` (root) | Docker Compose production overrides |
| `infra/env/*.env.example` | Per-environment templates |

Never commit real secrets. Use vault / CI secrets for production.

---

## Core backend settings

| Variable | Default | Description |
|----------|---------|-------------|
| `OMNIMIND_ENV` | `development` | `development`, `testing`, `qa`, `staging`, `production` |
| `JWT_SECRET_KEY` | — | **Required in production.** HS256 signing key (32+ chars recommended) |
| `JWT_ACCESS_EXPIRE_MINUTES` | `60` | Access token TTL |
| `JWT_REFRESH_EXPIRE_DAYS` | `7` | Refresh token TTL |
| `REDIS_ENABLED` | `true` | Set `false` for local dev without Redis |
| `REDIS_HOST` | `localhost` | Redis hostname |
| `REDIS_PORT` | `6379` | Redis port |
| `MONGODB_URI` | — | MongoDB connection string |
| `ALLOWED_ORIGINS` | `localhost:3000` | CORS origins (comma-separated) |
| `RATE_LIMIT` | `30/minute` | Global SlowAPI default |
| `platform_write_rate_limit` | `120/minute` | Platform mutation rate limit (via Settings) |

Settings class: `backend/config.py` (`pydantic-settings`).

---

## AI provider chain

Configure at least one provider for live completions:

| Priority | Variable | Provider |
|----------|----------|----------|
| 1 | `GEMINI_API_KEY` | Google Gemini |
| 2 | `GROK_API_KEY` / Groq | Groq |
| 3 | `OPENAI_API_KEY` | OpenAI |
| 4 | `LOCAL_LLM_BASE_URL` | LM Studio (default `http://localhost:1234/v1`) |

Inspect active routing: `GET /api/v1/gateway/providers`

Full template: `backend/.env.example`

---

## Frontend

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | Browser-facing API URL |
| `OMNIMIND_BACKEND_URL` | Server-side API URL (SSR) |
| `NEXT_PUBLIC_USE_API_PROXY` | Route API via Next.js proxy |

---

## Production checklist

```bash
# Validate from running API
curl -H "Authorization: Bearer $TOKEN" \
  https://api.omnimind.app/api/v1/omnicore/security/env/validate
```

| Check | Production requirement |
|-------|---------------------|
| `JWT_SECRET_KEY` | Set, 32+ characters |
| `OMNIMIND_ENV` | `production` |
| `ALLOWED_ORIGINS` | Explicit allowlist only |
| `REDIS_ENABLED` | `true` |
| Auth bypass | Disabled automatically in production |
| Metrics public | `metrics_public=false` unless behind auth |

---

## Docker Compose

Root `.env.example` and `infra/env/production.env.example` document compose-level variables:

- `UVICORN_WORKERS` — backend worker processes (default `4`)
- `OTEL_EXPORTER_OTLP_ENDPOINT` — tracing endpoint

---

## Configuration by module

| Module | Doc |
|--------|-----|
| OmniCloud sync | [OMNICLOUD_ARCHITECTURE.md](OMNICLOUD_ARCHITECTURE.md) |
| Automation | [AUTOMATION_API.md](AUTOMATION_API.md) |
| Security / RBAC | [security/RBAC.md](security/RBAC.md) |
| Elasticsearch / Music | `backend/.env.example` (Music section) |

---

## Related

- [INSTALLATION.md](INSTALLATION.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [SECURITY.md](SECURITY.md)
