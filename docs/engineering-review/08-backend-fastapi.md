# Engineering Review: `backend-fastapi`

**Review #8** | 25 files

## Scores

| Dimension | Score |
|-----------|-------|
| Folder Health | 72/100 |
| Architecture | 70/100 |
| Technical Debt | 45/100 |

## Role

Secondary FastAPI service — auth, chat, projects, terminal, files. **Not** registered in primary `backend/main.py`.

## Findings

- Has `.env.example` (good) — primary backend lacks root example
- `omniforge-api.ts` references real guest account on backend-fastapi
- Parallel auth/chat path vs primary `backend/auth`

## Changes

None — merging services is architectural; out of scope for safe auto-fix.

## Recommendation

- Mark as `legacy` or `auth-microservice` in docs
- Single canonical backend for new features: `backend/main.py` on :8001
