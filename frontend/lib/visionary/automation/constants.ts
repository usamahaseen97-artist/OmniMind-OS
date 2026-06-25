import type {
  AutomationAction,
  AutomationWorkspaceMode,
  PipelineStage,
  PublishPlatform,
  WorkflowTrigger,
} from "./types";

export const AUTOMATION_MODULES = new Set([
  "omni-creator",
  "templates",
  "plugins",
  "export-center",
]);

export const AUTOMATION_MODULE_DEFAULT_MODE: Record<string, AutomationWorkspaceMode> = {
  "omni-creator": "dashboard",
  templates: "workflows",
  plugins: "plugins",
  "export-center": "publishing",
};

export const AUTOMATION_WORKSPACE_MODES: { id: AutomationWorkspaceMode; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "workflows", label: "Workflows" },
  { id: "pipeline", label: "Pipeline" },
  { id: "publishing", label: "Publishing" },
  { id: "tasks", label: "Tasks" },
  { id: "approvals", label: "Approvals" },
  { id: "planner", label: "Planner" },
  { id: "brand", label: "Brand" },
  { id: "cloud", label: "Cloud" },
  { id: "plugins", label: "Plugins" },
];

export const AUTOMATION_ACTIONS: { id: AutomationAction; label: string }[] = [
  { id: "generate-assets", label: "Generate Assets" },
  { id: "generate-videos", label: "Generate Videos" },
  { id: "generate-product-photos", label: "Generate Product Photos" },
  { id: "generate-marketing-campaigns", label: "Generate Marketing Campaigns" },
  { id: "generate-website-graphics", label: "Generate Website Graphics" },
  { id: "generate-app-mockups", label: "Generate App Mockups" },
  { id: "generate-presentations", label: "Generate Presentations" },
  { id: "generate-documents", label: "Generate Documents" },
  { id: "generate-storyboards", label: "Generate Storyboards" },
  { id: "generate-social-packages", label: "Generate Social Media Packages" },
];

export const PIPELINE_STAGES: { id: PipelineStage; label: string }[] = [
  { id: "project", label: "Project" },
  { id: "images", label: "Images" },
  { id: "videos", label: "Videos" },
  { id: "vfx", label: "VFX" },
  { id: "animation", label: "Animation" },
  { id: "marketing", label: "Marketing" },
  { id: "brand-assets", label: "Brand Assets" },
  { id: "music", label: "Music" },
  { id: "publishing", label: "Publishing" },
];

export const PUBLISH_PLATFORMS: { id: PublishPlatform; label: string }[] = [
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "pinterest", label: "Pinterest" },
  { id: "x", label: "X" },
  { id: "threads", label: "Threads" },
  { id: "shopify", label: "Shopify" },
  { id: "wordpress", label: "WordPress" },
  { id: "custom-website", label: "Custom Website" },
];

export const WORKFLOW_TRIGGERS: { id: WorkflowTrigger; label: string }[] = [
  { id: "manual", label: "Manual" },
  { id: "schedule", label: "Schedule" },
  { id: "asset-upload", label: "Asset Upload" },
  { id: "project-save", label: "Project Save" },
  { id: "approval-complete", label: "Approval Complete" },
  { id: "webhook", label: "Webhook" },
];

export const WORKFLOW_NODE_TEMPLATES = [
  { type: "trigger" as const, label: "Trigger" },
  { type: "action" as const, label: "Action" },
  { type: "condition" as const, label: "Condition" },
  { type: "loop" as const, label: "Loop" },
  { type: "variable" as const, label: "Variable" },
  { type: "output" as const, label: "Output" },
];

export const SEED_WORKFLOW_NODES = [
  { id: "wn-trig", type: "trigger" as const, label: "On Project Save", x: 80, y: 100, config: {}, groupId: null },
  { id: "wn-gen", type: "action" as const, label: "Generate Assets", x: 280, y: 80, config: {}, groupId: null },
  { id: "wn-cond", type: "condition" as const, label: "If Approved", x: 480, y: 100, config: {}, groupId: null },
  { id: "wn-pub", type: "output" as const, label: "Publish", x: 680, y: 80, config: {}, groupId: null },
];

export const AUTOMATION_SEED_CONNECTIONS = [
  { from: "wn-trig", to: "wn-gen" },
  { from: "wn-gen", to: "wn-cond" },
  { from: "wn-cond", to: "wn-pub" },
];
