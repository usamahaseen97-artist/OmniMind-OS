# OmniMind Universal Automation Engine

**Version:** 2.0.0  
**Facade:** `omniCore.automation` (`OmniUniversalAutomationEngine`)

## Overview

The Universal Automation Engine turns OmniMind into an AI-native automation platform comparable to Zapier, Make, n8n, GitHub Actions, and Apple Shortcuts—while preserving all existing tool workflows.

## Capabilities

- **Visual Workflow Builder** — drag-and-drop nodes, branches, loops, parallel blocks, nested workflows
- **19 trigger types** — manual, AI, schedule, file events, webhooks, plugin/system events
- **19 action types** — code/UI/backend generation, creative pipelines, deploy, notify, SDK/CLI
- **AI automation** — natural-language workflow generation, suggestions, one-click templates, optimization
- **Background execution** — priority queue, parallel slots, dependency-ready architecture
- **Monitoring** — success/failure rates, execution time, AI decision logs

## Entry points

| Surface | Path |
|---------|------|
| Automation Workspace | `/automation-engine` |
| OmniCore API | `omniCore.automation.*` |
| REST API | `/api/v1/omnicore/automation/*` |
| TypeScript SDK | `frontend/sdk/automation` |
| Python SDK | `backend/sdk/automation_client.py` |

## Design constraints

- OmniForge Engine and Architectural Designer are **not redesigned**
- Automation composes via OmniCore, ecosystem chrome, and sovereign routes
- All executions route through real backend (`superapp_ai`, Redis queue, Mongo persistence)

## Quick start

```typescript
import { omniCore } from "@/core/omnicore/OmniCore";

await omniCore.boot();
const wf = omniCore.automation.library.instantiate("tpl-website-launch");
await omniCore.automation.executor.run(wf.id, { background: true });
```

See also: `WORKFLOW_ARCHITECTURE.md`, `AUTOMATION_API.md`, `SDK_AUTOMATION.md`.
