# Bug Tracker

**Quality Gate:** V2.0  
**Date:** 2026-06-17  
**Status:** Platform layer clear; vertical stubs tracked as known limitations

---

## Severity Legend

| Level | Definition |
|-------|------------|
| **S1 Critical** | Data loss, security breach, crash on boot |
| **S2 Major** | Feature broken, wrong data shown |
| **S3 Minor** | UX issue, workaround exists |
| **S4 Known limitation** | Documented stub / beta |

---

## Open Bugs

### S2 — Major

| ID | Bug | Repro | Workaround | Owner |
|----|-----|-------|------------|-------|
| BUG-001 | `lib/omnicore/*-api` may diverge from `core/*ApiClient` | Call same endpoint via both clients | Use `omniCore.*` facades only | Platform |
| BUG-002 | Multiple music API paths return different shapes | `/api/music` vs `/api/v1/music` vs entertainment inline | Use documented primary router | Entertainment |

### S3 — Minor

| ID | Bug | Repro | Workaround | Owner |
|----|-----|-------|------------|-------|
| BUG-003 | `/dashboard` redirect loses query params in edge cases | `next.config.ts` redirect `/:path*` | Use `/` directly (fixed in registry) | Platform |
| BUG-004 | webpack critical dependency warning on build | `npm run build` | None — build succeeds | OmniTV |
| BUG-005 | `ecosystemToolByPath` defaults to OmniForge for unknown paths | Navigate to `/omnicloud` before fix | Fixed paths work | Platform |
| BUG-006 | Mission Control security panel name collision | Import wrong `OmniSecurityCenter` | Use mission-control module | Platform |

### S4 — Known Limitations (Not bugs — tracked)

| ID | Limitation | Location | Label in UI |
|----|------------|----------|-------------|
| LIM-001 | OmniMusic no real DSP | `EQStudio.tsx` | "Architecture stub — no DSP" |
| LIM-002 | OmniMusic stub inference | `StubMusicAdapter` | Internal |
| LIM-003 | Visionary particle system stub | `ParticleSystem.ts` | Code comment |
| LIM-004 | Medical FHIR/HL7 parsers stub | `LabImportPipeline.ts` | Code comment |
| LIM-005 | Auth passkey stubs | `auth/router.py` | Backend |
| LIM-006 | Trading mock exchange | `quantum-trading` registry | "mock exchange hooks" |
| LIM-007 | Collaboration SSO placeholder | `OmniEnterpriseSettings.ts` | `sso.placeholder.omnimind.io` |
| LIM-008 | OmniAI model router stub metadata | `OmniModelRouter.ts` | Not used in `complete()` path |

---

## Closed / Fixed

| ID | Bug | Fix | Date |
|----|-----|-----|------|
| FIX-001 | Ecosystem links to `/dashboard` caused redirect hop | Registry → `/` | 2026-06-17 |
| FIX-002 | Duplicate automation HTTP in SDK | SDK delegates to core client | 2026-06-17 |
| FIX-003 | OmniCloud not on OS dock | Added `/omnicloud` dock item | Prior sprint |
| FIX-004 | `OmniPlatformSync` type mismatch | Fixed export bundle | Prior sprint |
| FIX-005 | Activity center invalid event | Added `activity:new` to event map | Prior sprint |
| FIX-006 | OmniAI local stub in production path | Returns `null`; gateway only | Prior sprint |

---

## Verification Checklist

| Check | Result |
|-------|--------|
| Every shell route loads | Manual — 24 routes exist |
| OmniCore boot | Pass (test) |
| Platform APIs respond | 8/8 GET contracts pass |
| AI complete (POST) | Requires runtime provider keys |
| Automation workflow run | Pass (backend test) |
| OmniCloud sync | Pass (integration test) |
| Plugin registry load | Pass (boot chain) |
| Keyboard shortcuts | Documented in `KEYBOARD_SHORTCUTS.md` — spot-check needed |
| Search | `OmniGlobalSearch` + ecosystem quick search wired |
| Notifications | `OmniNotificationCenter` on boot |

---

## Regression Watch

Run before each release:

```bash
cd frontend && npm run verify
cd backend && python -m pytest tests/ -q
```

Add contract probe when backend is up:

```powershell
# Probe script in MASTER_AUDIT.md API table
```

---

## Bug Count Summary

| Severity | Open | Closed |
|----------|------|--------|
| S1 | 0 | — |
| S2 | 2 | — |
| S3 | 4 | 6 |
| S4 (limitations) | 8 | — |

**Platform release status:** No S1/S2 blockers if consumers use `omniCore` facades and labeled beta tools.
