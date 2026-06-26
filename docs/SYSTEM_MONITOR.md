# System Monitor

**Module:** `omniCore.missionControl.system` (`OmniLiveSystemStatus`)

## Metrics

- CPU / GPU / RAM / Storage / Network
- Background tasks & running processes
- Service status: SDK, API, Database, Gateway, Cloud
- AI provider health
- Plugin enablement

## Refresh

```typescript
await omniCore.missionControl.system.refresh();
```

Poll interval in UI: 12 seconds.

## Backend

`GET /api/v1/omnicore/mission-control/system` aggregates infra metrics, Mongo store status, and queue depth.

## Integration

Wires `OmniQuality.health`, `OmniAI.monitoring()`, `OmniPlatformSync`, and browser `performance.memory`.
