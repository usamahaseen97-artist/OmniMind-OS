# Workflow Architecture

## Layer model

```
┌─────────────────────────────────────────────────────────┐
│  UI: OmniAutomationWorkspace / Builder / Dashboard      │
├─────────────────────────────────────────────────────────┤
│  omniCore.automation (OmniUniversalAutomationEngine)    │
│    ├── builder   OmniWorkflowBuilder                    │
│    ├── executor  OmniWorkflowExecutor                   │
│    ├── library   OmniWorkflowLibrary                    │
│    ├── ai        OmniAutomationAI                       │
│    ├── queue     OmniAutomationQueue                    │
│    └── monitor   OmniAutomationMonitor                  │
├─────────────────────────────────────────────────────────┤
│  OmniAutomationApiClient → REST                         │
├─────────────────────────────────────────────────────────┤
│  backend/lib/automation/executor.py                     │
│    ├── superapp_ai (actions)                          │
│    ├── queue_worker (background AI jobs)                │
│    └── omnicore_store (workflows + executions)          │
└─────────────────────────────────────────────────────────┘
```

## Node graph

| Node kind | Purpose |
|-----------|---------|
| `trigger` | Starts workflow (manual, webhook, schedule, …) |
| `action` | Executes tool-backed operation |
| `condition` | Branch on expression (`nextIds` / `elseIds`) |
| `parallel` | Run `childIds` concurrently |
| `loop` | Iteration block (extensible) |
| `nested` | Embeds another workflow by ID |

## Execution lifecycle

1. **Trigger** fires → execution record created (`queued` → `running`)
2. **Executor** walks actionable nodes sequentially (parallel nodes use `asyncio.gather`)
3. Each **action** enqueues Redis AI job + calls `superapp_ai.complete_text`
4. **Logs** appended per node (`info`, `ai`, `error`)
5. Terminal states: `completed`, `failed`, `paused`, `cancelled`, `rolled-back`

## Cross-tool integration

Actions map to sovereign tools via `toolSlug` (OmniForge, Visionary, OmniMusic, Medical, etc.) without modifying their internal shells. Navigation and agent tasks use existing `AgentManager` / ecosystem event bus.

## Event bus

| Event | Payload |
|-------|---------|
| `automation:workflow-created` | `{ workflowId }` |
| `automation:execution-started` | `{ executionId, workflowId }` |
| `automation:execution-control` | `{ executionId, action }` |
| `automation:ai-generated` | `{ workflowId }` |

## Persistence keys (Mongo / memory fallback)

- `automation_workflows` — workflow definitions
- `automation_executions` — execution history + logs
