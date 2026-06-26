# Execution Engine

**Module:** `backend/lib/automation/executor.py`

## Responsibilities

1. Persist workflow definitions (`automation_workflows`)
2. Create execution records (`automation_executions`)
3. Traverse node graph (sequential + parallel)
4. Invoke actions via `superapp_ai.complete_text`
5. Enqueue background AI jobs (`omni:queue:ai`)
6. Compute monitoring metrics

## Action routing

Each `actionId` maps to an AI prompt template in `ACTION_PROMPTS`. Results are logged with `level: "ai"` for dashboard **AI Decisions** metric.

## Background mode

When `background: true`:

- Frontend `OmniAutomationQueue` schedules run with priority
- Backend enqueues Redis job before synchronous AI completion
- User can continue working in any tool

## Control plane

| Action | Effect |
|--------|--------|
| `pause` | Status → `paused` |
| `resume` | Status → `running` |
| `retry` | Status → `queued` |
| `rollback` | Status → `rolled-back` |
| `cancel` | Status → `cancelled` |

## Error recovery

- Failed nodes set `execution.error` and `status: failed`
- Logs retain stack context
- `retry` re-queues execution for operator review

## Parallel execution

`parallel` nodes collect `childIds` and run matching action nodes via `asyncio.gather` with `return_exceptions=True` so one branch failure does not crash the gather.

## Metrics

```python
executor.compute_metrics()
# → totalExecutions, successRate, failureRate, avgExecutionMs, aiDecisions
```

## Worker integration

Production deployments should run `backend/worker_main.py` to drain `omni:queue:ai` for long-running generate/render/deploy actions.
