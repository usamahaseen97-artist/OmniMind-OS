import type { AssetKind, ProjectTemplate, UniversalProject } from "./types";

export const OMNICORE_ASSETS_VERSION = "3.0.0-phase3";

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  { id: "tpl-blank", name: "Blank Project", description: "Empty universal project", toolSlugs: [], defaultMetadata: {} },
  { id: "tpl-cross-media", name: "Cross-Media Campaign", description: "Visionary + Music + Analytics", toolSlugs: ["visionary-studio", "omnimusic", "business-analytics"], defaultMetadata: { type: "campaign" } },
  { id: "tpl-dev", name: "Software Project", description: "OmniForge engineering", toolSlugs: ["omniforge-engine"], defaultMetadata: { stack: "typescript" } },
];

export const PROJECT_SEED: UniversalProject[] = [
  {
    id: "uproj-001",
    name: "OmniMind Launch",
    description: "Cross-tool launch assets",
    kind: "cross-tool",
    toolSlugs: ["visionary-studio", "omnimusic"],
    templateId: "tpl-cross-media",
    archived: false,
    metadata: { client: "OmniMind" },
    assetIds: ["asset-1", "asset-2"],
    version: 2,
    snapshotIds: ["snap-1"],
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
  },
];

export const ASSET_SEED = [
  { id: "asset-1", name: "hero-banner.png", kind: "image" as AssetKind, mimeType: "image/png", sizeBytes: 245000, projectId: "uproj-001", toolSlug: "visionary-studio", tags: ["brand", "hero"], favorite: true, pinned: true },
  { id: "asset-2", name: "launch-track.wav", kind: "audio" as AssetKind, mimeType: "audio/wav", sizeBytes: 12000000, projectId: "uproj-001", toolSlug: "omnimusic", tags: ["music"], favorite: false, pinned: false },
  { id: "asset-3", name: "report-q4.pdf", kind: "business-report" as AssetKind, mimeType: "application/pdf", sizeBytes: 890000, projectId: null, toolSlug: "business-analytics", tags: ["report"], favorite: false, pinned: false },
];

export const SMART_FOLDERS = [
  { id: "sf-recent", name: "Recent", filter: {} },
  { id: "sf-favorites", name: "Favorites", filter: {} },
  { id: "sf-ai", name: "AI Outputs", filter: { kind: "ai-output" as AssetKind } },
];
