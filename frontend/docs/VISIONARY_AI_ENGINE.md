# Visionary Studio — AI Creative Engine (Phase 2)

## Overview

Phase 2 adds a provider-independent **AI Creative Engine** to Visionary Studio. No real inference is performed — the architecture is production-ready for future model adapter wiring.

## Frontend layout

```
frontend/lib/visionary/ai/          # Engine layer (no UI)
frontend/lib/visionary/ai-context.tsx
frontend/components/visionary/ai/   # Production UI panels
```

### Engine modules

| Module | Role |
|--------|------|
| `VisionaryAIEngine` | Facade — submit, queue, history, assets |
| `PromptProcessor` | Validate, resolve variables, multi-prompt weights |
| `ModelRouter` | Provider-independent routing via adapters |
| `GenerationQueue` | Priority queue, pause/resume/cancel, simulated progress |
| `GenerationHistory` | Reopen, duplicate, remix records |
| `PromptOptimizer` | Score + suggestions (local + API) |
| `PromptTemplates` | Built-in + saved templates |
| `AssetManager` | Generated / brand / stock assets |
| `JobScheduler` | Scheduled cloud/local jobs |
| `InferenceManager` | GPU slot allocation stubs |
| `CloudAssetSync` | Sync state orchestration |

### Workflows (20)

All `text-to-*` and `image-to-*` workflows from Phase 2 spec are registered in `AI_WORKFLOWS`. Sidebar modules map to default workflows via `MODULE_WORKFLOW_MAP`.

### UI integration

- **Center**: `VisionaryCenterWorkspace` → `VisionaryAIEngine` for studio modules
- **Bottom**: `VisionaryBottomWorkspace` → Timeline / Queue / History tabs
- **Inspector**: Optimizer, Model Router, Inference, Scheduler, Cloud Sync

## Model Router

Adapters implement `ModelProviderAdapter`. Built-in stubs: OpenAI, Google, Runway, Stability, Flux, ComfyUI, Local, Omni Future.

Register custom adapters:

```ts
visionaryAIEngine.modelRouter.register(myAdapter);
```

## Backend API (`/api/v1/visionary/ai`)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/queue` | GET/POST | List / enqueue jobs |
| `/queue/{id}/pause` | POST | Pause job |
| `/queue/{id}/resume` | POST | Resume job |
| `/queue/{id}/cancel` | POST | Cancel job |
| `/history` | GET/POST | Generation history |
| `/prompts/optimize` | POST | Prompt optimization stub |
| `/templates` | GET | Template catalog |
| `/assets` | GET | Asset listing |
| `/brand-kit/{id}` | GET | Brand kit |
| `/brand-kit` | POST | Save brand kit |
| `/projects` | GET/POST | AI project system |
| `/cloud/sync` | POST | Cloud sync stub |

## Phase 3 (future)

- Wire real `ModelProviderAdapter.generate()` implementations
- Persist queue/history to database
- Reference image upload + storage
- OmniMind Brain bridge for copilot actions
