# Engineering Review: `frontend/sdk`

**Review #14**

## Scores

| Dimension | Score |
|-----------|-------|
| Folder Health | 82/100 |
| Maintainability | 78/100 |
| Technical Debt | 28/100 |

## Fix

`sdk/automation/index.ts` delegates to `omniAutomationApiClient`.

## Structure

- `browser/` — canonical OmniMindSDK
- `node/` — CLI
- Deprecated: `api/`, `generators/`, `packages/`

## Adoption

2 production importers — expansion is post-freeze work.
