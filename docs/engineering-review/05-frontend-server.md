# Engineering Review: `frontend/server`

**Review #5** | 1 file (`channel-api.js`)

## Scores

| Dimension | Score |
|-----------|-------|
| Folder Health | 80/100 |
| Architecture | 75/100 |
| Security | 70/100 |
| Performance | 82/100 |
| Maintainability | 78/100 |
| Technical Debt | 25/100 |

## Findings

- Express server for legal live TV channel API (port 4001).
- CORS: `CHANNEL_API_ORIGIN` env or `*` default — **recommend** tightening in production.
- Overlaps with Next.js `app/api/omnitv/*` routes — dual path documented.

## Changes

None — modifying CORS default could break local dev workflows.

## Recommendation

- Document `CHANNEL_API_PORT` and `CHANNEL_API_ORIGIN` in root `.env.example`.
- Prefer Next.js omnitv API routes for new work.
