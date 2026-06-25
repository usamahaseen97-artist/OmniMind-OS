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
import { usePathname, useRouter } from "next/navigation";
import {
  AgentManager,
  getAgentManager,
  type AgentLogEntry,
  type AgentTask,
  type AgentToolDefinition,
  type CopilotTabId,
  type IntentMatch,
} from "../core/agent";
import { getSovereignTool } from "./sovereign-tool-registry";
import { useOmniMindEcosystemOptional } from "./omnimind-ecosystem-context";
import { useOmniMindBrainOptional } from "./omnimind-brain-context";

type MasterAgentContextValue = {
  agent: AgentManager;
  tools: AgentToolDefinition[];
  tasks: AgentTask[];
  logs: AgentLogEntry[];
  copilotTab: CopilotTabId;
  setCopilotTab: (tab: CopilotTabId) => void;
  processMessage: (text: string) => Promise<{ intent: IntentMatch | null; navigated?: string }>;
  runWorkflow: (workflowId: string, prompt: string) => Promise<void>;
  pinContext: (text: string) => void;
  retryTask: (taskId: string) => void;
  resolveIntent: (text: string) => IntentMatch | null;
};

const MasterAgentContext = createContext<MasterAgentContextValue | null>(null);

export function OmniMindMasterAgentProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const ecosystem = useOmniMindEcosystemOptional();
  const brain = useOmniMindBrainOptional();
  const agent = useMemo(() => getAgentManager(), []);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);
  const [copilotTab, setCopilotTabState] = useState<CopilotTabId>("chat");

  useEffect(() => {
    agent.configure({
      onNavigate: (href) => router.push(href),
      onCopilotTab: setCopilotTabState,
    });
  }, [agent, router]);

  useEffect(() => {
    const unsub = agent.tasks.subscribe(setTasks);
    return () => {
      unsub();
    };
  }, [agent]);

  useEffect(() => {
    const onLog = (e: Event) => {
      const row = (e as CustomEvent<AgentLogEntry>).detail;
      if (row) setLogs((prev) => [row, ...prev].slice(0, 100));
    };
    window.addEventListener("omnimind:master-agent-log", onLog);
    return () => window.removeEventListener("omnimind:master-agent-log", onLog);
  }, []);

  useEffect(() => {
    const slug = pathname.split("/").filter(Boolean)[0];
    const tool = slug ? getSovereignTool(slug) : undefined;
    const activeTab = ecosystem?.projectTabs.find((t) => t.id === ecosystem.activeProjectTabId);

    agent.syncWorkspace({
      activeToolId: tool?.slug,
      activeToolName: tool?.name,
      routeId: tool?.omniRouteId ?? tool?.slug,
      pathname,
      currentProject: activeTab?.name,
      framework: ecosystem?.techStack.frontend[0],
      database: ecosystem?.techStack.database[0],
      deploymentTarget: brain?.brain.globalMemory.getBrainSlice().deploymentTargets[0],
      techStack: ecosystem?.techStack,
    });
  }, [agent, brain, pathname, ecosystem?.activeProjectTabId, ecosystem?.projectTabs, ecosystem?.techStack]);

  const setCopilotTab = useCallback(
    (tab: CopilotTabId) => {
      agent.setCopilotTab(tab);
      setCopilotTabState(tab);
    },
    [agent],
  );

  const processMessage = useCallback(
    async (text: string) => {
      const slug = pathname.split("/").filter(Boolean)[0];
      const tool = slug ? getSovereignTool(slug) : undefined;

      if (brain) {
        const result = await brain.processRequest(text, {
          activeToolId: tool?.slug,
          routeId: tool?.omniRouteId ?? tool?.slug,
          pathname,
        });
        if (result.intent && result.navigated) {
          ecosystem?.pushNotification?.(`OmniMind Brain → ${result.intent.reason}`, "info");
        }
        return { intent: result.intent, navigated: result.navigated };
      }

      const result = await agent.processUserMessage(
        text,
        tool?.slug,
        tool?.omniRouteId ?? tool?.slug,
      );
      if (result.intent && result.navigatedTo) {
        ecosystem?.pushNotification?.(`Master Agent → ${result.intent.reason}`, "info");
      }
      return { intent: result.intent, navigated: result.navigatedTo };
    },
    [agent, brain, pathname, ecosystem],
  );

  const runWorkflow = useCallback(
    async (workflowId: string, prompt: string) => {
      setCopilotTab("tasks");
      await agent.runWorkflow(workflowId, prompt);
    },
    [agent, setCopilotTab],
  );

  const value = useMemo<MasterAgentContextValue>(
    () => ({
      agent,
      tools: agent.registry.list(),
      tasks,
      logs,
      copilotTab,
      setCopilotTab,
      processMessage,
      runWorkflow,
      pinContext: (text) => agent.pinContext(text),
      retryTask: (id) => agent.tasks.retry(id),
      resolveIntent: (text) => agent.intentEngine.resolve(text),
    }),
    [agent, tasks, logs, copilotTab, setCopilotTab, processMessage, runWorkflow],
  );

  return <MasterAgentContext.Provider value={value}>{children}</MasterAgentContext.Provider>;
}

export function useOmniMindMasterAgent() {
  const ctx = useContext(MasterAgentContext);
  if (!ctx) throw new Error("useOmniMindMasterAgent must be used within OmniMindMasterAgentProvider");
  return ctx;
}

export function useOmniMindMasterAgentOptional() {
  return useContext(MasterAgentContext);
}
