# Automation REST API

**Base URL:** `/api/v1/omnicore/automation`

## Workflows

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/workflows` | List all workflows |
| `PUT` | `/workflows/{id}` | Create/update workflow |
| `DELETE` | `/workflows/{id}` | Delete workflow |
| `PUT` | `/workflows/{id}/nodes` | Update node graph |
| `POST` | `/workflows/{id}/run` | Execute workflow |
| `POST` | `/workflows/{id}/clone` | Clone workflow |

### Run body

```json
{
  "background": true,
  "priority": 5,
  "input": { "projectId": "proj-001" }
}
```

## Executions

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/executions?workflowId=` | List executions |
| `POST` | `/executions/{id}/pause` | Pause |
| `POST` | `/executions/{id}/resume` | Resume |
| `POST` | `/executions/{id}/retry` | Retry |
| `POST` | `/executions/{id}/rollback` | Rollback |
| `POST` | `/executions/{id}/cancel` | Cancel |

## AI

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/generate` | NL → workflow JSON |
| `POST` | `/suggestions` | Context-aware suggestions |

## Catalog

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/templates` | Workflow library templates |
| `GET` | `/triggers` | Trigger catalog |
| `GET` | `/actions` | Action catalog |
| `GET` | `/metrics` | Dashboard metrics |

## Response shape

```json
{
  "ok": true,
  "workflow": { "id": "wf-...", "name": "...", "nodes": [] },
  "execution": { "id": "ex-...", "status": "running", "logs": [] }
}
```

## Errors

- `400` — invalid prompt or action
- `404` — workflow/execution not found
- `503` — AI provider unavailable
