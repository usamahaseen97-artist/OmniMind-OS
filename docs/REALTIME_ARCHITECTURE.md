# Real-Time Architecture

## Data flow

```
Mission Control UI (/mission-control)
        │
        ▼
omniCore.missionControl.dashboard()
        │
        ├── Local aggregation (quality, security, AI, ecosystem)
        │
        └── OmniMissionControlApiClient
                    │
                    ▼
        /api/v1/omnicore/mission-control/*
                    │
                    ▼
        lib/mission_control/aggregator.py
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
  omnicore_store  automation  infra metrics
```

## Polling

- Dashboard: 12s interval
- System status: on-demand + dashboard refresh
- Logs/terminals: on tab focus

## Event bus

| Event | Purpose |
|-------|---------|
| `mission:agent-control` | AI agent commands |
| `mission:log` | Log append notifications |

## Composition principle

Mission Control does not replace tool internals. It reads from:

- `omniCore.ecosystem` (background agents, system tasks)
- `omniCore.automation` (workflow executions)
- `omniCore.quality` (health probes)
- `omniCore.security` (events, compliance)
- `AgentManager` (task states)

OmniForge and Architectural Designer continue operating unchanged; Mission Control observes and controls at the platform layer.
