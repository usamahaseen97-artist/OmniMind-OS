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
import { INTERNAL_AGENTS } from "./omniforge-engineering/multi-agents";
import {
  analyzeProject,
  architectureMermaid,
  computeProjectHealth,
  emitLiveDev,
  generateDeploymentPipeline,
  generateEnterpriseDocs,
  generateTestSuites,
  getPerformanceEngine,
  getWorkspaceManager,
  scanAndFixWorkspace,
  type AutoFixItem,
  type DeploymentPipeline,
  type GeneratedDoc,
  type GeneratedTestSuite,
  type OmniForgeWorkspace,
  type ProjectBlueprint,
  type ProjectHealthReport,
} from "./omniforge-enterprise";
import { useOmniForgeEngineering } from "./omniforge-engineering-context";
import { useOmniMindBrainOptional } from "./omnimind-brain-context";
import { getOmniPluginManager } from "../core/plugins";

type EnterpriseContextValue = {
  workspaces: OmniForgeWorkspace[];
  activeWorkspace: OmniForgeWorkspace | undefined;
  blueprint: ProjectBlueprint | null;
  health: ProjectHealthReport | null;
  autoFixItems: AutoFixItem[];
  testSuites: GeneratedTestSuite[];
  docs: GeneratedDoc[];
  deployment: DeploymentPipeline | null;
  architectureDiagram: string;
  agents: typeof INTERNAL_AGENTS;
  dashboardOpen: boolean;
  openDashboard: () => void;
  closeDashboard: () => void;
  createWorkspace: (name: string) => void;
  switchWorkspace: (id: string) => void;
  runProjectAnalyzer: () => void;
  refreshHealth: (files: { path: string; content: string }[]) => void;
  runAutoFixScan: (files: { path: string; content: string }[]) => void;
  generateTests: (files: { path: string; content: string }[], projectName: string) => void;
  generateDocs: (files: { path: string; content: string }[], projectName: string) => void;
  planDeployment: (target: DeploymentPipeline["target"], projectName: string) => void;
};

const EnterpriseContext = createContext<EnterpriseContextValue | null>(null);

export function OmniForgeEnterpriseProvider({ children }: { children: ReactNode }) {
  const engineering = useOmniForgeEngineering();
  const brain = useOmniMindBrainOptional();
  const perf = useMemo(() => getPerformanceEngine(), []);
  const wsManager = useMemo(() => getWorkspaceManager(), []);

  const [workspaces, setWorkspaces] = useState<OmniForgeWorkspace[]>([]);
  const [blueprint, setBlueprint] = useState<ProjectBlueprint | null>(null);
  const [health, setHealth] = useState<ProjectHealthReport | null>(null);
  const [autoFixItems, setAutoFixItems] = useState<AutoFixItem[]>([]);
  const [testSuites, setTestSuites] = useState<GeneratedTestSuite[]>([]);
  const [docs, setDocs] = useState<GeneratedDoc[]>([]);
  const [deployment, setDeployment] = useState<DeploymentPipeline | null>(null);
  const [architectureDiagram, setArchitectureDiagram] = useState("");
  const [dashboardOpen, setDashboardOpen] = useState(false);

  useEffect(() => {
    setWorkspaces(wsManager.list());
    if (!wsManager.list().length) {
      const ws = wsManager.create("Main Workspace");
      wsManager.activate(ws.id);
      setWorkspaces(wsManager.list());
    }
  }, [wsManager]);

  const runProjectAnalyzer = useCallback(() => {
    const w = engineering.wizard;
    if (!w.projectType) return;
    const bp = analyzeProject({
      projectName: w.projectName,
      projectType: w.projectType,
      description: w.description,
      stack: w.stack,
      features: w.features,
    });
    setBlueprint(bp);
    setArchitectureDiagram(
      architectureMermaid(w.projectName || "Project", [w.stack.frontend, w.stack.backend, w.stack.database]),
    );
    emitLiveDev({ type: "architecture_diagram", mermaid: architectureMermaid(w.projectName, [w.stack.frontend, w.stack.backend]) });
    brain?.pinNote(`Blueprint: ${w.projectName} · ${w.projectType}`);
    getOmniPluginManager().events.publish("AnalysisCompleted", {
      pluginId: "sovereign-omniforge-engine",
      summary: `${bp.requirements.length} requirements analyzed`,
    });
  }, [engineering.wizard, brain]);

  const refreshHealth = useCallback((files: { path: string; content: string }[]) => {
    setHealth(computeProjectHealth(files));
  }, []);

  const runAutoFixScan = useCallback((files: { path: string; content: string }[]) => {
    setAutoFixItems(scanAndFixWorkspace(files));
    emitLiveDev({ type: "terminal_log", line: "▸ auto-fix scan complete" });
  }, []);

  const generateTests = useCallback((files: { path: string; content: string }[], projectName: string) => {
    setTestSuites(generateTestSuites(files, projectName));
  }, []);

  const generateDocs = useCallback(
    (files: { path: string; content: string }[], projectName: string) => {
      const bp = blueprint ?? analyzeProject({
        projectName: engineering.wizard.projectName || projectName,
        projectType: engineering.wizard.projectType ?? "web_app",
        description: engineering.wizard.description,
        stack: engineering.wizard.stack,
        features: engineering.wizard.features,
      });
      setDocs(generateEnterpriseDocs(projectName, bp, files));
    },
    [blueprint, engineering.wizard],
  );

  const planDeployment = useCallback((target: DeploymentPipeline["target"], projectName: string) => {
    const pipe = generateDeploymentPipeline(target, projectName);
    setDeployment(pipe);
    getOmniPluginManager().events.publish("DeploymentSucceeded", {
      pluginId: "sovereign-omniforge-engine",
      target,
    });
  }, []);

  const value = useMemo(
    () => ({
      workspaces,
      activeWorkspace: workspaces.find((w) => w.active),
      blueprint,
      health,
      autoFixItems,
      testSuites,
      docs,
      deployment,
      architectureDiagram,
      agents: INTERNAL_AGENTS,
      dashboardOpen,
      openDashboard: () => setDashboardOpen(true),
      closeDashboard: () => setDashboardOpen(false),
      createWorkspace: (name: string) => {
        wsManager.create(name);
        setWorkspaces(wsManager.list());
      },
      switchWorkspace: (id: string) => {
        wsManager.activate(id);
        setWorkspaces(wsManager.list());
      },
      runProjectAnalyzer,
      refreshHealth,
      runAutoFixScan,
      generateTests,
      generateDocs,
      planDeployment,
    }),
    [
      workspaces,
      blueprint,
      health,
      autoFixItems,
      testSuites,
      docs,
      deployment,
      architectureDiagram,
      dashboardOpen,
      runProjectAnalyzer,
      refreshHealth,
      runAutoFixScan,
      generateTests,
      generateDocs,
      planDeployment,
      wsManager,
    ],
  );

  useEffect(() => {
    if (engineering.architectOpen && engineering.wizard.projectType) {
      runProjectAnalyzer();
    }
  }, [engineering.architectOpen, engineering.wizard.projectType, runProjectAnalyzer]);

  return <EnterpriseContext.Provider value={value}>{children}</EnterpriseContext.Provider>;
}

export function useOmniForgeEnterprise() {
  const ctx = useContext(EnterpriseContext);
  if (!ctx) throw new Error("useOmniForgeEnterprise must be used within OmniForgeEnterpriseProvider");
  return ctx;
}

export function useOmniForgeEnterpriseOptional() {
  return useContext(EnterpriseContext);
}
