# Audit: frontend/sdk/

## Structure

| Path | Role | Status |
|------|------|--------|
| `sdk/browser/` | Canonical OmniMindSDK | Active |
| `sdk/node/` | CLI + server extension | Active |
| `sdk/automation/` | Automation SDK | **Consolidated** |
| `sdk/api/`, `generators/`, `packages/` | Deprecated re-exports | Marked deprecated |

## Fix (Prior Sprint + Verified)

`frontend/sdk/automation/index.ts` delegates HTTP to `omniAutomationApiClient` — no duplicate fetch logic.

Plugin trigger hooks (`onTrigger`, `emitTrigger`) preserved.

## Adoption

Only 2 production components import SDK directly:
- `components/sdk/SDKBoot.tsx`
- `components/medical-enterprise/MedicalEnterpriseWorkspace.tsx`

## Name Collision (Documented)

`OmniAutomationSDK` in `sdk/automation` vs `core/plugins/omnicore-platform/OmniAutomationSDK.ts` — different purposes (HTTP vs in-memory plugin workflows).

## No Further Changes

SDK tree is stable; expanding adoption is post-freeze work (TD-006).
