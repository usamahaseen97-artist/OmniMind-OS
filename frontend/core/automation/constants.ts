import type { ActionDescriptor, TriggerDescriptor, WorkflowTemplate } from "./types";

export const AUTOMATION_ENGINE_VERSION = "2.0.0";

export const TRIGGER_CATALOG: TriggerDescriptor[] = [
  { id: "manual", label: "Manual", category: "General", description: "Run on demand" },
  { id: "ai-trigger", label: "AI Trigger", category: "AI", description: "When AI detects intent" },
  { id: "schedule", label: "Schedule", category: "Time", description: "Cron or interval" },
  { id: "project-created", label: "Project Created", category: "Project", description: "New OmniMind project" },
  { id: "file-added", label: "File Added", category: "Files", description: "Asset uploaded" },
  { id: "file-modified", label: "File Modified", category: "Files", description: "Asset changed" },
  { id: "folder-changed", label: "Folder Changed", category: "Files", description: "Directory update" },
  { id: "chat-message", label: "Chat Message", category: "AI", description: "Neural chat event" },
  { id: "voice-command", label: "Voice Command", category: "AI", description: "Spoken trigger" },
  { id: "image-uploaded", label: "Image Uploaded", category: "Media", description: "Visionary / assets" },
  { id: "video-uploaded", label: "Video Uploaded", category: "Media", description: "VFX / video pipeline" },
  { id: "audio-uploaded", label: "Audio Uploaded", category: "Media", description: "OmniMusic pipeline" },
  { id: "document-uploaded", label: "Document Uploaded", category: "Files", description: "PDF / docs" },
  { id: "deployment-completed", label: "Deployment Completed", category: "DevOps", description: "Deploy success" },
  { id: "build-failed", label: "Build Failed", category: "DevOps", description: "CI failure" },
  { id: "api-response", label: "API Response", category: "Integration", description: "HTTP callback" },
  { id: "webhook", label: "Webhook", category: "Integration", description: "External POST" },
  { id: "plugin-event", label: "Plugin Event", category: "Plugins", description: "Extension hook" },
  { id: "system-event", label: "System Event", category: "Platform", description: "OmniCore bus" },
];

export const ACTION_CATALOG: ActionDescriptor[] = [
  { id: "generate-code", label: "Generate Code", category: "Development", description: "AI code generation", toolSlug: "omniforge-engine" },
  { id: "generate-ui", label: "Generate UI", category: "Development", description: "UI components", toolSlug: "omniforge-engine" },
  { id: "generate-backend", label: "Generate Backend", category: "Development", description: "API & services" },
  { id: "generate-database", label: "Generate Database", category: "Development", description: "Schema & migrations" },
  { id: "generate-api", label: "Generate API", category: "Development", description: "REST / GraphQL" },
  { id: "generate-images", label: "Generate Images", category: "Creative", description: "Visionary Studio", toolSlug: "visionary-studio" },
  { id: "generate-videos", label: "Generate Videos", category: "Creative", description: "VFX pipeline", toolSlug: "vfx-master" },
  { id: "generate-music", label: "Generate Music", category: "Creative", description: "OmniMusic", toolSlug: "omnimusic" },
  { id: "generate-marketing", label: "Marketing Content", category: "Business", description: "Campaign copy", toolSlug: "digital-marketing-hub" },
  { id: "run-medical-analysis", label: "Medical Analysis", category: "Medical", description: "Clinical AI", toolSlug: "medical-diagnostic-suite" },
  { id: "run-business-analytics", label: "Business Analytics", category: "Business", description: "Reports", toolSlug: "business-analytics" },
  { id: "deploy-project", label: "Deploy Project", category: "DevOps", description: "Staging / production" },
  { id: "send-email", label: "Send Email", category: "Notify", description: "Email delivery" },
  { id: "push-notification", label: "Push Notification", category: "Notify", description: "Live notifications" },
  { id: "export-files", label: "Export Files", category: "Files", description: "Bundle export" },
  { id: "convert-files", label: "Convert Files", category: "Files", description: "Format conversion" },
  { id: "sync-cloud", label: "Sync Cloud", category: "Platform", description: "OmniCore cloud sync" },
  { id: "execute-sdk", label: "Execute SDK", category: "Platform", description: "SDK command" },
  { id: "execute-cli", label: "Execute CLI", category: "Platform", description: "Shell command" },
];

function node(
  id: string,
  kind: WorkflowTemplate["nodes"][number]["kind"],
  label: string,
  extra: Partial<WorkflowTemplate["nodes"][number]> = {},
): WorkflowTemplate["nodes"][number] {
  return {
    id,
    kind,
    label,
    config: {},
    position: { x: 0, y: 0 },
    ...extra,
  };
}

export const WORKFLOW_LIBRARY: WorkflowTemplate[] = [
  {
    id: "tpl-website-launch",
    name: "Website Launch",
    description: "Generate UI, backend, deploy staging",
    category: "Development",
    tags: ["web", "deploy"],
    nodes: [
      node("t1", "trigger", "Manual", { triggerId: "manual", position: { x: 40, y: 80 } }),
      node("a1", "action", "Generate UI", { actionId: "generate-ui", position: { x: 240, y: 40 }, nextIds: ["a2"] }),
      node("a2", "action", "Generate Backend", { actionId: "generate-backend", position: { x: 440, y: 80 }, nextIds: ["a3"] }),
      node("a3", "action", "Deploy Project", { actionId: "deploy-project", position: { x: 640, y: 80 } }),
    ],
  },
  {
    id: "tpl-game-build",
    name: "Game Build",
    description: "Code, assets, build pipeline",
    category: "Development",
    tags: ["game"],
    nodes: [
      node("t1", "trigger", "Manual", { triggerId: "manual", position: { x: 40, y: 80 } }),
      node("a1", "action", "Generate Code", { actionId: "generate-code", position: { x: 240, y: 80 }, nextIds: ["a2"] }),
      node("a2", "action", "Execute CLI", { actionId: "execute-cli", config: { command: "npm run build" }, position: { x: 440, y: 80 } }),
    ],
  },
  {
    id: "tpl-app-deploy",
    name: "App Deployment",
    description: "Build, test, deploy with notifications",
    category: "DevOps",
    tags: ["deploy", "ci"],
    nodes: [
      node("t1", "trigger", "Deployment Completed", { triggerId: "deployment-completed", position: { x: 40, y: 80 } }),
      node("a1", "action", "Push Notification", { actionId: "push-notification", position: { x: 280, y: 80 } }),
    ],
  },
  {
    id: "tpl-marketing-campaign",
    name: "Marketing Campaign",
    description: "Content, images, email blast",
    category: "Business",
    tags: ["marketing"],
    nodes: [
      node("t1", "trigger", "Schedule", { triggerId: "schedule", config: { cron: "0 9 * * 1" }, position: { x: 40, y: 80 } }),
      node("a1", "action", "Marketing Content", { actionId: "generate-marketing", position: { x: 260, y: 40 }, nextIds: ["a2"] }),
      node("a2", "action", "Generate Images", { actionId: "generate-images", position: { x: 460, y: 80 }, nextIds: ["a3"] }),
      node("a3", "action", "Send Email", { actionId: "send-email", position: { x: 660, y: 80 } }),
    ],
  },
  {
    id: "tpl-medical-analysis",
    name: "Medical Analysis",
    description: "Document upload → clinical AI",
    category: "Medical",
    tags: ["health"],
    nodes: [
      node("t1", "trigger", "Document Uploaded", { triggerId: "document-uploaded", position: { x: 40, y: 80 } }),
      node("a1", "action", "Medical Analysis", { actionId: "run-medical-analysis", position: { x: 280, y: 80 } }),
    ],
  },
  {
    id: "tpl-brand-creation",
    name: "Brand Creation",
    description: "Visual identity workflow",
    category: "Creative",
    tags: ["brand", "design"],
    nodes: [
      node("t1", "trigger", "Manual", { triggerId: "manual", position: { x: 40, y: 80 } }),
      node("p1", "parallel", "Parallel Assets", { position: { x: 200, y: 80 }, childIds: ["a1", "a2"] }),
      node("a1", "action", "Generate Images", { actionId: "generate-images", position: { x: 400, y: 40 } }),
      node("a2", "action", "Marketing Content", { actionId: "generate-marketing", position: { x: 400, y: 120 } }),
    ],
  },
  {
    id: "tpl-video-production",
    name: "Video Production",
    description: "Upload → render → notify",
    category: "Creative",
    tags: ["video"],
    nodes: [
      node("t1", "trigger", "Video Uploaded", { triggerId: "video-uploaded", position: { x: 40, y: 80 } }),
      node("a1", "action", "Generate Videos", { actionId: "generate-videos", position: { x: 260, y: 80 }, nextIds: ["a2"] }),
      node("a2", "action", "Push Notification", { actionId: "push-notification", position: { x: 480, y: 80 } }),
    ],
  },
  {
    id: "tpl-music-production",
    name: "Music Production",
    description: "Audio pipeline automation",
    category: "Creative",
    tags: ["music"],
    nodes: [
      node("t1", "trigger", "Audio Uploaded", { triggerId: "audio-uploaded", position: { x: 40, y: 80 } }),
      node("a1", "action", "Generate Music", { actionId: "generate-music", position: { x: 280, y: 80 } }),
    ],
  },
  {
    id: "tpl-business-reports",
    name: "Business Reports",
    description: "Scheduled analytics export",
    category: "Business",
    tags: ["analytics"],
    nodes: [
      node("t1", "trigger", "Schedule", { triggerId: "schedule", config: { cron: "0 8 * * *" }, position: { x: 40, y: 80 } }),
      node("a1", "action", "Business Analytics", { actionId: "run-business-analytics", position: { x: 260, y: 80 }, nextIds: ["a2"] }),
      node("a2", "action", "Export Files", { actionId: "export-files", position: { x: 480, y: 80 } }),
    ],
  },
  {
    id: "tpl-ai-research",
    name: "AI Research",
    description: "Chat-triggered research loop",
    category: "AI",
    tags: ["research"],
    nodes: [
      node("t1", "trigger", "Chat Message", { triggerId: "chat-message", position: { x: 40, y: 80 } }),
      node("c1", "condition", "Needs research?", { position: { x: 220, y: 80 }, config: { expression: "intent==research" }, nextIds: ["a1"], elseIds: [] }),
      node("a1", "action", "Execute SDK", { actionId: "execute-sdk", position: { x: 440, y: 80 } }),
    ],
  },
];
