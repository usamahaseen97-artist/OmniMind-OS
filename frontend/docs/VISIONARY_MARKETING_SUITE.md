# Visionary Studio — AI Marketing Suite (Phase 5)

Phase 5 extends Visionary Studio with an enterprise AI Marketing & Brand Creation platform — architecture and API stubs only; no external API integrations yet.

## Route

- `/visionary-studio` → **Marketing Studio**, **Brand Studio**, **Product Studio**, **Social Media Studio**

## Frontend layout

```
VisionaryStudioProvider
  VisionaryAIProvider
    VisionaryEditorProvider
      VisionaryVFXProvider
        VisionaryMarketingProvider
          VisionaryStudioLayout
            MarketingWorkspace (when MARKETING_MODULES active)
```

Module routing priority: **Marketing** → **VFX** → **Video Editor** → **Phase 1/2 default**.

## Library (`frontend/lib/visionary/marketing/`)

| Module | Role |
|--------|------|
| `types.ts` | Campaigns, brand, product, social, content, ads, calendar, analytics, team |
| `constants.ts` | `MARKETING_MODULES`, platforms, formats, presets |
| `CampaignManager.ts` | Campaign CRUD |
| `BrandStudioEngine.ts` | Identity, colors, logos, typography |
| `ProductStudioEngine.ts` | Catalog, variants, product tools |
| `ContentFactoryEngine.ts` | Content generation queue |
| `SchedulingEngine.ts` | Calendar and post scheduling |
| `PublishingEngine.ts` | Publishing queue |
| `AnalyticsEngine.ts` | Metrics aggregation |
| `TeamWorkspaceEngine.ts` | Roles, comments, approvals, versions |
| `PluginManager.ts` | Marketplace plugins |
| `marketing-api.ts` | Client for `/api/v1/visionary/marketing` |
| `marketing-context.tsx` | `VisionaryMarketingProvider` / `useVisionaryMarketing` |

## UI (`frontend/components/visionary/marketing/`)

`MarketingWorkspace`, `CampaignManager`, `BrandStudio`, `ProductStudio`, `CreativeStudio`, `SocialMediaStudio`, `ContentFactory`, `CalendarPlanner`, `Scheduler`, `PublishingCenter`, `AnalyticsDashboard`, `TemplateMarketplace`, `AssetMarketplace`, `PromptLibrary`, `BrandGuidelines`

## Backend (`/api/v1/visionary/marketing`)

- `GET/PUT /projects/{id}` — campaign project save/load
- `GET/POST /assets` — marketing asset library
- `POST/GET /publishing/queue` — publishing queue
- `GET /analytics/{campaign_id}` — analytics snapshots
- `GET /presets` — templates and prompts

## Workspace modes

Campaigns · Brand · Product · Creative · Social · Content Factory · Calendar · Publishing · Analytics · Marketplace · Team

## Constraints

- Does not modify OmniForge Engine, Medical Diagnostic, or SDK
- Extends Visionary Studio only; backward compatible with Phases 1–4
