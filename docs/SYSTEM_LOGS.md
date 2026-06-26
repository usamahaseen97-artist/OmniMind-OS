# System Logs

**Module:** `omniCore.missionControl.logs` (`OmniSystemLogs`)

## Sources

`frontend` · `backend` · `gateway` · `sdk` · `ai` · `automation` · `plugins` · `cloud`

## API

| Method | Path |
|--------|------|
| GET | `/mission-control/logs?source=` |
| POST | `/mission-control/logs` |

## Persistence

Mongo key: `mission_control_logs` (via `omnicore_store`)

## Client API

```typescript
omniCore.missionControl.logs.log("automation", "Workflow completed", "info");
await omniCore.missionControl.logs.refresh("backend");
```

Terminal lines are mirrored to `mission_control_terminals`.
