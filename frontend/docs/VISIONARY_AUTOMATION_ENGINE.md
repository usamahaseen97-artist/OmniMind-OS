# Visionary Studio — Omni Creator Engine & Automation (Phase 7)

Phase 7 adds the central automation brain of Visionary Studio — workflow builder, content pipelines, publishing hub, team collaboration, and AI copilot. Architecture and API stubs only.

## Routes

- `/visionary-studio` → **Omni Creator** (`omni-creator`), **Templates**, **Plugins**, **Export Center**

## Frontend layout

```
VisionaryStudioProvider
  …
    VisionaryAutomationProvider
      VisionaryStudioLayout
        AutomationWorkspace (when AUTOMATION_MODULES active)
```

Module routing priority: **Automation** → **3D** → **Marketing** → **VFX** → **Video Editor** → **default**.

## Library (`frontend/lib/visionary/automation/`)

| Module | Role |
|--------|------|
| `types.ts` | Workflows, pipelines, publishing, team, copilot, plugins |
| `constants.ts` | `AUTOMATION_MODULES`, actions, platforms, pipeline stages |
| `WorkflowBuilderEngine.ts` | Visual workflow nodes and connections |
| `AutomationExecutor.ts` | Automation job queue |
| `AssetPipelineEngine.ts` | Connected content pipeline |
| `PublishingHubEngine.ts` | Multi-platform publish queue |
| `PluginRegistry.ts` | Plugin SDK and marketplace |
| `CopilotEngine.ts` | AI workflow suggestions |
| `automation-api.ts` | Client for `/api/v1/visionary/automation` |
| `automation-context.tsx` | `VisionaryAutomationProvider` / `useVisionaryAutomation` |

## UI (`frontend/components/visionary/automation/`)

`AutomationWorkspace`, `CreatorEngine`, `WorkflowBuilder`, `NodeEditor`, `AutomationCenter`, `PublishingHub`, `AssetPipeline`, `ProjectDashboard`, `TaskManager`, `ApprovalCenter`, `ReviewWorkspace`, `ContentPlanner`, `BrandManager`, `AIWorkflowCopilot`, `NotificationCenter`, `CloudWorkspace`

## Backend (`/api/v1/visionary/automation`)

- `GET/PUT /projects/{id}` — automation project save/load
- `POST /workflows/serialize` — workflow database
- `POST/GET /publishing/queue` — publishing queue
- `GET /assets/search` — asset indexing / search
- `GET /plugins` — plugin registry

## Workspace modes

Dashboard · Workflows · Pipeline · Publishing · Tasks · Approvals · Planner · Brand · Cloud · Plugins

## Constraints

- Does not modify OmniForge Engine, Medical Diagnostic, SDK, or Business Analytics
- Extends Visionary Studio only; backward compatible with Phases 1–6
