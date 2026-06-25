export const OMNICLOUD_VERSION = "2.0.0";

export const SYNC_DOMAINS = [
  "projects",
  "ai-chats",
  "ai-memory",
  "settings",
  "themes",
  "plugins",
  "sdk",
  "templates",
  "assets",
  "images",
  "videos",
  "music",
  "documents",
  "workspaces",
  "shortcuts",
  "preferences",
] as const;

export const REMOTE_JOB_KINDS = [
  "render-image",
  "render-video",
  "generate-code",
  "deploy-website",
  "train-model",
  "marketing",
  "medical-analysis",
  "music-production",
  "large-file",
] as const;
