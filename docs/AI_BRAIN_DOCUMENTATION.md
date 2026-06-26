# OmniMind Unified Brain — Documentation

**Version:** 1.0.0-rc1  
**Entry:** `omniCore.brain` → `frontend/core/brain/OmniMindUnifiedBrain.ts`

---

## Purpose

One **OmniMind Brain** shared across every tool:

| Tool | Integration |
|------|-------------|
| Medical Diagnostic | `omniCore.brain.complete()` + memory |
| OmniForge Engine | Existing workflows + brain context injection |
| Visionary Studio | AI via `omniCore.ai` |
| Marketing / VFX | Prompt cache + memory |
| Business Analytics | Project context |
| Quantum Trading | Tool history tracking |
| OmniMusic | Conversation + asset memory |
| OmniCharge | Permissions via `omniCore.security` |
| SDK | `DeploymentSDK` + brain snapshot |
| Future tools | `omniCore.brain.recordToolUse()` |

---

## Shared State

| Domain | Source |
|--------|--------|
| Memory | `omniCore.ai.memory` |
| Context | `buildContext()` |
| Projects | `omniCore.projects` |
| Assets | `omniCore.assets` |
| AI Knowledge | Conversations + prompt library |
| History | `toolHistoryList()` |
| Permissions | `omniCore.security.snapshot()` |
| Preferences | `omniCore.settings` |

---

## API

```typescript
import { omniCore } from "@/core/omnicore";

// Boot (called by OmniCore.boot())
omniCore.brain.boot();

// Shared context for any tool
const ctx = omniCore.brain.buildContext("visionary-studio");

// Remember user style / brand / preferences
omniCore.brain.remember("long-term", "brandColors", "#00FF87", "visionary-studio");

// Unified AI completion
const result = await omniCore.brain.complete("Generate storyboard", {
  toolSlug: "visionary-studio",
  agentId: "creative-agent",
});

// Track cross-tool navigation
omniCore.brain.recordToolUse("omniforge-engine");

// Snapshot for dashboards
const snap = omniCore.brain.snapshot();
```

---

## Memory Scopes

| Scope | Use |
|-------|-----|
| `session` | Current session preferences |
| `project` | Per-project coding style, architecture |
| `long-term` | Brand colors, frameworks, templates |

---

## Relationship to Legacy Brain

| Layer | Role | RC1 Status |
|-------|------|------------|
| `OmniMindUnifiedBrain` | **Primary gateway** | ✅ Active |
| `OmniMindBrain` | Agent orchestration | Coexists — routes through OmniAI |
| `AgentManager` | Master agent UI | Coexists — fill-prompt bridge |
| `GlobalMemory` | Brain prefs localStorage | Migrating to `omniCore.ai.memory` |

---

## Events

| Event | Payload |
|-------|---------|
| `brain:context` | `{ toolSlug }` |
| `brain:sync` | `{ source }` |

Subscribe via `omniCore.eventBus.subscribe()`.
