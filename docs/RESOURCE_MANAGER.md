# Resource Manager

**Module:** `omniCore.missionControl.resources` (`OmniResourceManager`)

## Tracks

| Resource | Source |
|----------|--------|
| CPU / GPU | Backend system snapshot |
| Memory | Browser heap + server disk |
| Bandwidth | Infra metrics (when available) |
| Model usage | AI monitoring counters |
| Token usage | `omniAI.monitoring().totalTokens` |
| AI cost | `totalCostUsd` |
| Cache hit rate | Infra cache layers |
| Workers | Process count + Redis queues |

## Usage

```typescript
const resources = await omniCore.missionControl.resources.refresh();
```

Displayed in Mission Control → Resources tab.
