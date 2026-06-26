# Audit: backend/

## Scope

- `main.py` (83 routers)
- `routers/` (90+ files)
- `lib/` (omnicore, omnicloud, automation, mission_control)
- `services/`
- `tests/` (36 tests)

## Critical Fix

### Router prefix collision — `tools_status` vs `omni_tools`

**Problem:** Both routers used `prefix="/api/v1/tools"`. FastAPI registers `/{slug}/status` on `tools_status` which could intercept paths like `/api/v1/tools/image/status` intended for `omni_tools`.

**Fix:** Changed `tools_status` prefix to `/api/v1/sovereign-tools`.

| Before | After |
|--------|-------|
| `GET /api/v1/tools/{slug}/status` | `GET /api/v1/sovereign-tools/{slug}/status` |
| `GET /api/v1/tools/registry` | `GET /api/v1/sovereign-tools/registry` |

No frontend consumers referenced old paths (verified grep).

## Verified OK

| Module | Tests | API |
|--------|-------|-----|
| omnicore | test_omnicore_production | ✅ |
| automation | test_omnicore_automation | ✅ |
| mission-control | test_omnicore_mission_control | ✅ |
| omnicloud | test_omnicore_omnicloud | ✅ |

## Architecture Notes (No Change — Documented)

- `spatial_engine` + `spatial_hybrid` share `/api/spatial` but routes are non-overlapping (`execute-directive` vs `process-directive`)
- Phase stub docstrings on omnicore_assets, plugins, collaboration, security, quality
- Mock fallbacks in `gemini_stream`, `integration_gateway`, `ccxt_market` — degraded mode only
- `backend-fastapi/` parallel service — not primary

## Security

- Auth router WebAuthn stubs documented in BUG_TRACKER LIM-005
- Secrets in `.env` — correctly gitignored
- OmniCore security router responds to contract checks

## Performance

- `omnicore_store` memory fallback when Mongo unavailable
- OmniCloud `BackgroundTasks` for async job execution
