# Audit: Root & Configuration

## Files Reviewed

- `.gitignore`
- `package.json` (root + frontend + backend)
- `docker-compose*.yml`
- `frontend/next.config.ts`
- `.cursor/rules/`

## Issues Found

| Issue | Severity | Type |
|-------|----------|------|
| `*.tsbuildinfo` not gitignored | Low | Repo hygiene |
| `frontend/coverage/` not gitignored | Low | Repo bloat |
| No root `.env.example` | Medium | Onboarding (documented in TECHNICAL_DEBT) |

## Fixes Applied

**`.gitignore`** — Added:
```
*.tsbuildinfo
frontend/coverage/
frontend/.next/
coverage/
```

## Verified OK

- `next.config.ts` `/dashboard` → `/` redirect preserves legacy links
- `/omni-api` rewrite to backend :8001
- Root `package.json` verify script chains lint + test + build
- Production integrity rule in `.cursor/rules/`

## No Changes

- Docker compose files (ops config — no runtime bugs found)
- OmniForge protection rules
