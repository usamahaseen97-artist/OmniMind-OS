# Workflow Library

Pre-built templates ship in `frontend/core/automation/constants.ts` (`WORKFLOW_LIBRARY`).

| Template ID | Name | Category | Triggers → Actions |
|-------------|------|----------|-------------------|
| `tpl-website-launch` | Website Launch | Development | Manual → UI → Backend → Deploy |
| `tpl-game-build` | Game Build | Development | Manual → Code → CLI build |
| `tpl-app-deploy` | App Deployment | DevOps | Deploy complete → Notify |
| `tpl-marketing-campaign` | Marketing Campaign | Business | Schedule → Content → Images → Email |
| `tpl-medical-analysis` | Medical Analysis | Medical | Document upload → Clinical AI |
| `tpl-brand-creation` | Brand Creation | Creative | Manual → Parallel images + copy |
| `tpl-video-production` | Video Production | Creative | Video upload → Render → Notify |
| `tpl-music-production` | Music Production | Creative | Audio upload → Generate music |
| `tpl-business-reports` | Business Reports | Business | Schedule → Analytics → Export |
| `tpl-ai-research` | AI Research | AI | Chat → Condition → SDK |

## Instantiate

```typescript
const wf = omniCore.automation.library.instantiate("tpl-marketing-campaign");
await omniCore.automation.executor.run(wf.id);
```

## One-click AI automate

```typescript
omniCore.automation.ai.oneClickAutomate("tpl-website-launch");
```

## Custom templates

Save workflows with `templateId: null` and `tags: ["custom"]`. Promote to library by copying node graph into `WORKFLOW_LIBRARY` or persisting via API.

## Reusable components

- **Triggers** — `TRIGGER_CATALOG` (19 entries)
- **Actions** — `ACTION_CATALOG` (19 entries, tool-mapped)
- **Nested workflows** — `builder.nestWorkflow(parentId, childId)`
