# AI Control Center

**Module:** `omniCore.missionControl.aiCenter` (`OmniAIControlCenter`)

## Agent states

`idle` · `thinking` · `planning` · `executing` · `reviewing` · `waiting` · `completed` · `failed` · `retrying`

Mapped from `AgentManager.tasks` and `OmniAI.agents`.

## Controls

| Action | Method |
|--------|--------|
| Pause | `aiCenter.pause(agentId)` |
| Resume | `aiCenter.resume(agentId)` |
| Cancel | `aiCenter.cancel(agentId)` |
| Retry | `aiCenter.retry(agentId)` |
| Duplicate | `aiCenter.duplicate(agentId)` |
| Priority | `aiCenter.setPriority(agentId, n)` |

## API

`POST /api/v1/omnicore/mission-control/agents/{id}/{action}`

Events: `mission:agent-control`
