# Health Engine

**Module:** `omniCore.missionControl.health` (`OmniHealthEngine`)

## Scores (0–100)

| Score | Inputs |
|-------|--------|
| **Overall** | Mean of all dimensions |
| **Performance** | OmniQuality health status |
| **Security** | Compliance + threat dashboard |
| **Reliability** | Automation success rate |
| **AI** | Gateway activity |
| **Infrastructure** | Mongo/API availability |

## Usage

```typescript
const scores = await omniCore.missionControl.health.compute();
```

Displayed as pills in Mission Control header.

## Backend

`aggregator.health_scores()` in `backend/lib/mission_control/aggregator.py`
