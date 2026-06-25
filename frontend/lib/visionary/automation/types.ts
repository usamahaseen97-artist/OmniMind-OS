/** Visionary Studio — Omni Creator Engine & Automation types (Phase 7). */

export type AutomationWorkspaceMode =
  | "dashboard"
  | "workflows"
  | "pipeline"
  | "publishing"
  | "tasks"
  | "approvals"
  | "planner"
  | "brand"
  | "cloud"
  | "plugins";

export type WorkflowNodeType =
  | "trigger"
  | "action"
  | "condition"
  | "loop"
  | "variable"
  | "output";

export type WorkflowTrigger =
  | "manual"
  | "schedule"
  | "asset-upload"
  | "project-save"
  | "approval-complete"
  | "webhook";

export type AutomationAction =
  | "generate-assets"
  | "generate-videos"
  | "generate-product-photos"
  | "generate-marketing-campaigns"
  | "generate-website-graphics"
  | "generate-app-mockups"
  | "generate-presentations"
  | "generate-documents"
  | "generate-storyboards"
  | "generate-social-packages";

export type PipelineStage =
  | "project"
  | "images"
  | "videos"
  | "vfx"
  | "animation"
  | "marketing"
  | "brand-assets"
  | "music"
  | "publishing";

export type PublishPlatform =
  | "youtube"
  | "instagram"
  | "facebook"
  | "tiktok"
  | "linkedin"
  | "pinterest"
  | "x"
  | "threads"
  | "shopify"
  | "wordpress"
  | "custom-website";

export type WorkflowNode = {
  id: string;
  type: WorkflowNodeType;
  label: string;
  x: number;
  y: number;
  config: Record<string, string | number | boolean>;
  groupId: string | null;
};

export type WorkflowConnection = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label: string | null;
};

export type Workflow = {
  id: string;
  name: string;
  description: string;
  trigger: WorkflowTrigger;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  variables: WorkflowVariable[];
  template: boolean;
  enabled: boolean;
};

export type WorkflowVariable = {
  id: string;
  key: string;
  value: string;
  type: "string" | "number" | "boolean";
};

export type AutomationJob = {
  id: string;
  workflowId: string;
  action: AutomationAction;
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  startedAt: string | null;
};

export type PipelineRun = {
  id: string;
  projectId: string;
  currentStage: PipelineStage;
  stages: { stage: PipelineStage; status: "pending" | "active" | "done" }[];
  progress: number;
};

export type AutomationPublishJob = {
  id: string;
  platform: PublishPlatform;
  title: string;
  status: "draft" | "scheduled" | "queued" | "published" | "failed";
  scheduledAt: string | null;
  approvalStatus: "none" | "pending" | "approved" | "rejected";
};

export type AutomationTeamRole = "owner" | "admin" | "editor" | "reviewer" | "viewer";

export type AutomationTeamMember = {
  id: string;
  name: string;
  email: string;
  role: AutomationTeamRole;
  avatarColor: string;
};

export type TeamTask = {
  id: string;
  title: string;
  assigneeId: string | null;
  status: "todo" | "in-progress" | "review" | "done";
  dueDate: string | null;
  mentions: string[];
};

export type ApprovalItem = {
  id: string;
  title: string;
  type: "asset" | "workflow" | "publish";
  status: "pending" | "approved" | "rejected";
  requestedBy: string;
  reviewerId: string | null;
};

export type ActivityEvent = {
  id: string;
  label: string;
  actor: string;
  timestamp: string;
  kind: "create" | "edit" | "publish" | "approve" | "automate";
};

export type ProjectHealth = {
  score: number;
  storageUsedMb: number;
  storageTotalMb: number;
  assetCount: number;
  renderQueue: number;
  publishQueue: number;
  openTasks: number;
};

export type CopilotSuggestion = {
  id: string;
  category: "improvement" | "missing-asset" | "workflow" | "publishing" | "summary";
  message: string;
  actionLabel: string | null;
};

export type AutomationPlugin = {
  id: string;
  name: string;
  version: string;
  category: "community" | "premium" | "official";
  installed: boolean;
  sdkReady: boolean;
};

export type AutomationNotification = {
  id: string;
  title: string;
  body: string;
  read: boolean;
  timestamp: string;
  kind: "task" | "approval" | "publish" | "workflow" | "system";
};

export type IndexedAsset = {
  id: string;
  name: string;
  kind: string;
  projectId: string;
  tags: string[];
  indexedAt: string;
};

export type AutomationProject = {
  id: string;
  name: string;
  workflows: Workflow[];
  activeWorkflowId: string | null;
  modifiedAt: string;
  version: number;
};
