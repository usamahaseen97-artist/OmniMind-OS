# Engineering Review: `frontend/types`

**Review #6** | 1 file (`speech.d.ts`)

## Scores

| Dimension | Score |
|-----------|-------|
| Folder Health | 95/100 |
| Architecture | 95/100 |
| All dimensions | 95/100 |

## Findings

- `speech.d.ts` extends Web Speech API types for translator/voice features.
- Domain types live in `frontend/core/*/types.ts` (correct pattern).
- **No changes required.**

## Recommendation

Keep global ambient types minimal; prefer `core/` type modules.
