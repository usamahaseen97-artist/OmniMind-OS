# Engineering Review: `core_engine` + `core-python`

**Review #11–12**

## `core_engine/`

Only `Dockerfile` — Docker build context for engine image. Score: 70/100.

## `core-python/` (15 files)

| Component | Role |
|-----------|------|
| `app/routes/orchestrator.py` | AI orchestration |
| `app/services/provider_router.py` | Provider routing |
| `community_api_sync.py` | Community API registry |

Score: 78/100 — functional sidecar; integrated via `backend-fastapi` `core_python_providers.py`.

## Changes

None.

## Recommendation

Keep as provider sidecar; route all new AI through `superapp_ai` in primary backend.
