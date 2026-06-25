"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useVisionaryStudio } from "./context";
import {
  assetPipelineEngine,
  automationExecutorEngine,
  copilotEngine,
  pluginRegistryEngine,
  publishingHubEngine,
  workflowBuilderEngine,
  visionaryAutomationApi,
  SEED_WORKFLOW_NODES,
  AUTOMATION_SEED_CONNECTIONS,
  AUTOMATION_MODULE_DEFAULT_MODE,
} from "./automation";
import type {
  ApprovalItem,
  ActivityEvent,
  AutomationAction,
  AutomationJob,
  AutomationNotification,
  AutomationPlugin,
  AutomationProject,
  AutomationPublishJob,
  AutomationTeamMember,
  AutomationWorkspaceMode,
  CopilotSuggestion,
  IndexedAsset,
  PipelineRun,
  ProjectHealth,
  PublishPlatform,
  TeamTask,
  Workflow,
  WorkflowNode,
  WorkflowNodeType,
  WorkflowTrigger,
} from "./automation/types";

function buildSeedProject(): AutomationProject {
  const wf: Workflow = {
    id: "wf-main",
    name: "Full Creative Pipeline",
    description: "Project → Images → Videos → Marketing → Publishing",
    trigger: "project-save",
    nodes: SEED_WORKFLOW_NODES.map((n) => ({ ...n, config: {} })),
    connections: AUTOMATION_SEED_CONNECTIONS.map((c, i) => ({
      id: `wc-${i}`,
      fromNodeId: c.from,
      toNodeId: c.to,
      label: null,
    })),
    variables: [{ id: "v1", key: "brand", value: "OmniMind", type: "string" }],
    template: true,
    enabled: true,
  };
  return {
    id: "auto-proj-001",
    name: "Omni Creator HQ",
    workflows: [wf],
    activeWorkflowId: "wf-main",
    modifiedAt: new Date().toISOString(),
    version: 1,
  };
}

export type VisionaryAutomationContextValue = {
  project: AutomationProject;
  workspaceMode: AutomationWorkspaceMode;
  setWorkspaceMode: (m: AutomationWorkspaceMode) => void;
  activeWorkflow: Workflow | null;
  setActiveWorkflowId: (id: string) => void;
  addWorkflow: (name: string, trigger: WorkflowTrigger) => void;
  workflowNodes: WorkflowNode[];
  workflowConnections: Workflow["connections"];
  selectedNodeId: string | null;
  setSelectedNodeId: (id: string | null) => void;
  addWorkflowNode: (type: WorkflowNodeType, label: string, x: number, y: number) => void;
  moveWorkflowNode: (id: string, x: number, y: number) => void;
  connectWorkflowNodes: (fromId: string, toId: string) => void;
  automationJobs: AutomationJob[];
  runAutomation: (action: AutomationAction) => void;
  pipelineRun: PipelineRun | null;
  startPipeline: () => void;
  advancePipeline: () => void;
  publishJobs: AutomationPublishJob[];
  schedulePublish: (platform: PublishPlatform, title: string) => void;
  queuePublish: (jobId: string) => void;
  teamMembers: AutomationTeamMember[];
  tasks: TeamTask[];
  addTask: (title: string) => void;
  approvals: ApprovalItem[];
  requestApproval: (title: string, type: ApprovalItem["type"]) => void;
  activity: ActivityEvent[];
  projectHealth: ProjectHealth;
  copilotSuggestions: CopilotSuggestion[];
  refreshCopilot: () => void;
  plugins: AutomationPlugin[];
  installPlugin: (id: string) => void;
  notifications: AutomationNotification[];
  markNotificationRead: (id: string) => void;
  indexedAssets: IndexedAsset[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  saveProject: () => void;
};

const VisionaryAutomationContext = createContext<VisionaryAutomationContextValue | null>(null);

export function VisionaryAutomationProvider({ children }: { children: ReactNode }) {
  const { activeModule } = useVisionaryStudio();
  const [project, setProject] = useState<AutomationProject>(buildSeedProject);
  const [workspaceMode, setWorkspaceMode] = useState<AutomationWorkspaceMode>("dashboard");

  useEffect(() => {
    const mode = AUTOMATION_MODULE_DEFAULT_MODE[activeModule];
    if (mode) setWorkspaceMode(mode);
  }, [activeModule]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [automationJobs, setAutomationJobs] = useState<AutomationJob[]>([]);
  const [pipelineRun, setPipelineRun] = useState<PipelineRun | null>(null);
  const [publishJobs, setPublishJobs] = useState<AutomationPublishJob[]>([]);
  const [teamMembers] = useState<AutomationTeamMember[]>([
    { id: "tm-1", name: "Alex Chen", email: "alex@omnimind.io", role: "owner", avatarColor: "#818cf8" },
    { id: "tm-2", name: "Jordan Lee", email: "jordan@omnimind.io", role: "editor", avatarColor: "#38bdf8" },
  ]);
  const [tasks, setTasks] = useState<TeamTask[]>([
    { id: "t1", title: "Review hero assets", assigneeId: "tm-2", status: "in-progress", dueDate: "2026-06-20", mentions: [] },
  ]);
  const [approvals, setApprovals] = useState<ApprovalItem[]>([
    { id: "a1", title: "Q2 Campaign Publish", type: "publish", status: "pending", requestedBy: "tm-1", reviewerId: null },
  ]);
  const [activity] = useState<ActivityEvent[]>([
    { id: "ev1", label: "Workflow executed: Generate Assets", actor: "Alex", timestamp: new Date().toISOString(), kind: "automate" },
    { id: "ev2", label: "Asset indexed: hero_banner.png", actor: "System", timestamp: new Date().toISOString(), kind: "create" },
  ]);
  const [copilotSuggestions, setCopilotSuggestions] = useState<CopilotSuggestion[]>(copilotEngine.analyze("Omni Creator HQ"));
  const [plugins, setPlugins] = useState<AutomationPlugin[]>([
    { id: "plug-core", name: "Omni Creator Core", version: "1.0", category: "official", installed: true, sdkReady: true },
    ...pluginRegistryEngine.listMarketplace(),
  ]);
  const [notifications, setNotifications] = useState<AutomationNotification[]>([
    { id: "n1", title: "Approval needed", body: "Q2 Campaign Publish awaits review", read: false, timestamp: new Date().toISOString(), kind: "approval" },
  ]);
  const [indexedAssets] = useState<IndexedAsset[]>([
    { id: "ix1", name: "hero_banner.png", kind: "image", projectId: "auto-proj-001", tags: ["marketing"], indexedAt: new Date().toISOString() },
  ]);
  const [searchQuery, setSearchQuery] = useState("");

  const activeWorkflow = useMemo(
    () => project.workflows.find((w) => w.id === project.activeWorkflowId) ?? null,
    [project.workflows, project.activeWorkflowId],
  );

  const projectHealth = useMemo<ProjectHealth>(
    () => ({
      score: pipelineRun ? pipelineRun.progress : 72,
      storageUsedMb: 4200,
      storageTotalMb: 10000,
      assetCount: indexedAssets.length,
      renderQueue: automationJobs.filter((j) => j.status === "running").length,
      publishQueue: publishJobs.filter((j) => j.status === "queued" || j.status === "scheduled").length,
      openTasks: tasks.filter((t) => t.status !== "done").length,
    }),
    [pipelineRun, indexedAssets.length, automationJobs, publishJobs, tasks],
  );

  const commitProject = useCallback((updater: (p: AutomationProject) => AutomationProject) => {
    setProject((prev) => {
      const next = { ...updater(prev), version: prev.version + 1, modifiedAt: new Date().toISOString() };
      void visionaryAutomationApi.saveProject(next).catch(() => undefined);
      return next;
    });
  }, []);

  const updateActiveWorkflow = useCallback(
    (updater: (w: Workflow) => Workflow) => {
      commitProject((p) => ({
        ...p,
        workflows: p.workflows.map((w) => (w.id === p.activeWorkflowId ? updater(w) : w)),
      }));
    },
    [commitProject],
  );

  const addWorkflow = useCallback(
    (name: string, trigger: WorkflowTrigger) => {
      commitProject((p) => ({
        ...p,
        workflows: workflowBuilderEngine.create(p.workflows, name, trigger),
      }));
    },
    [commitProject],
  );

  const addWorkflowNode = useCallback(
    (type: WorkflowNodeType, label: string, x: number, y: number) => {
      updateActiveWorkflow((w) => ({ ...w, nodes: workflowBuilderEngine.addNode(w.nodes, type, label, x, y) }));
    },
    [updateActiveWorkflow],
  );

  const moveWorkflowNode = useCallback(
    (id: string, x: number, y: number) => {
      updateActiveWorkflow((w) => ({ ...w, nodes: workflowBuilderEngine.moveNode(w.nodes, id, x, y) }));
    },
    [updateActiveWorkflow],
  );

  const connectWorkflowNodes = useCallback(
    (fromId: string, toId: string) => {
      updateActiveWorkflow((w) => ({ ...w, connections: workflowBuilderEngine.connect(w.connections, fromId, toId) }));
    },
    [updateActiveWorkflow],
  );

  const runAutomation = useCallback(
    (action: AutomationAction) => {
      const wfId = project.activeWorkflowId ?? "wf-main";
      setAutomationJobs((prev) => automationExecutorEngine.queue(prev, wfId, action));
      const job = automationExecutorEngine.queue([], wfId, action)[0]!;
      let p = 0;
      const iv = setInterval(() => {
        p += 20;
        setAutomationJobs((prev) =>
          prev.map((j) =>
            j.id === job.id
              ? { ...j, status: p >= 100 ? "completed" : "running", progress: Math.min(100, p), startedAt: j.startedAt ?? new Date().toISOString() }
              : j,
          ),
        );
        if (p >= 100) clearInterval(iv);
      }, 400);
    },
    [project.activeWorkflowId],
  );

  const startPipeline = useCallback(() => {
    setPipelineRun(assetPipelineEngine.start(project.id));
  }, [project.id]);

  const advancePipeline = useCallback(() => {
    setPipelineRun((prev) => (prev ? assetPipelineEngine.advance(prev) : null));
  }, []);

  const schedulePublish = useCallback((platform: PublishPlatform, title: string) => {
    const at = new Date(Date.now() + 86400000).toISOString();
    setPublishJobs((prev) => publishingHubEngine.schedule(prev, platform, title, at));
  }, []);

  const queuePublish = useCallback((jobId: string) => {
    setPublishJobs((prev) => publishingHubEngine.queue(prev, jobId));
    void visionaryAutomationApi.queuePublish({ jobId });
  }, []);

  const addTask = useCallback((title: string) => {
    setTasks((prev) => [...prev, { id: `task-${Date.now()}`, title, assigneeId: null, status: "todo", dueDate: null, mentions: [] }]);
  }, []);

  const requestApproval = useCallback((title: string, type: ApprovalItem["type"]) => {
    setApprovals((prev) => [...prev, { id: `apr-${Date.now()}`, title, type, status: "pending", requestedBy: "tm-1", reviewerId: null }]);
  }, []);

  const refreshCopilot = useCallback(() => {
    setCopilotSuggestions(copilotEngine.analyze(project.name));
  }, [project.name]);

  const installPlugin = useCallback((id: string) => {
    setPlugins((prev) => pluginRegistryEngine.install(prev, id));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const saveProject = useCallback(() => {
    void visionaryAutomationApi.saveProject(project);
  }, [project]);

  useEffect(() => {
    void visionaryAutomationApi.loadProject(project.id).catch(() => undefined);
  }, [project.id]);

  const value = useMemo<VisionaryAutomationContextValue>(
    () => ({
      project,
      workspaceMode,
      setWorkspaceMode,
      activeWorkflow,
      setActiveWorkflowId: (id) => commitProject((p) => ({ ...p, activeWorkflowId: id })),
      addWorkflow,
      workflowNodes: activeWorkflow?.nodes ?? [],
      workflowConnections: activeWorkflow?.connections ?? [],
      selectedNodeId,
      setSelectedNodeId,
      addWorkflowNode,
      moveWorkflowNode,
      connectWorkflowNodes,
      automationJobs,
      runAutomation,
      pipelineRun,
      startPipeline,
      advancePipeline,
      publishJobs,
      schedulePublish,
      queuePublish,
      teamMembers,
      tasks,
      addTask,
      approvals,
      requestApproval,
      activity,
      projectHealth,
      copilotSuggestions,
      refreshCopilot,
      plugins,
      installPlugin,
      notifications,
      markNotificationRead,
      indexedAssets,
      searchQuery,
      setSearchQuery,
      saveProject,
    }),
    [
      project,
      workspaceMode,
      activeWorkflow,
      commitProject,
      addWorkflow,
      selectedNodeId,
      addWorkflowNode,
      moveWorkflowNode,
      connectWorkflowNodes,
      automationJobs,
      runAutomation,
      pipelineRun,
      startPipeline,
      advancePipeline,
      publishJobs,
      schedulePublish,
      queuePublish,
      teamMembers,
      tasks,
      addTask,
      approvals,
      requestApproval,
      activity,
      projectHealth,
      copilotSuggestions,
      refreshCopilot,
      plugins,
      installPlugin,
      notifications,
      markNotificationRead,
      indexedAssets,
      searchQuery,
      saveProject,
    ],
  );

  return <VisionaryAutomationContext.Provider value={value}>{children}</VisionaryAutomationContext.Provider>;
}

export function useVisionaryAutomation() {
  const ctx = useContext(VisionaryAutomationContext);
  if (!ctx) throw new Error("useVisionaryAutomation must be used within VisionaryAutomationProvider");
  return ctx;
}
