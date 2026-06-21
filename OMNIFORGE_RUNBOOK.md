# OmniForge Runbook (Working Baseline)

## Service Graph
- `gateway-go` : edge routing, JWT middleware, `/ws/stream-preview`
- `backend-fastapi` : auth, projects/files/chat/log APIs with PostgreSQL
- `backend-node` : terminal execution API + websocket terminal stream
- `postgres` : persistent relational store
- `redis` : session/cache/pubsub layer

## Start Full Stack
```powershell
docker compose -f docker-compose.omniforge.yml up --build
```

## Ports
- Gateway: `8080`
- FastAPI core: `8003`
- Node terminal: `8090`
- Postgres: `5432`
- Redis: `6379`

## Smoke Tests
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\omnimind\smoke-test.ps1
```

## Current Scope
- Real auth + JWT issuance
- Real CRUD for projects and files (PostgreSQL)
- Real chat persistence table + API
- Real terminal command execution endpoint (sandboxed allowlist)
- Realtime websocket hubs (gateway + terminal)

## Next Hardening TODOs
- Add refresh token rotation + OAuth GitHub callback persistence
- Wire frontend OmniForge panels directly to `gateway-go` endpoints
- Add alembic migration runner and seed scripts
- Integrate AI provider router into `backend-fastapi` chat endpoint
- Add RBAC/audit tables and request-level tracing
