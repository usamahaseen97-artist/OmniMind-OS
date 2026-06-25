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
import { useRouter } from "next/navigation";
import {
  getOmniMindBrain,
  pipelineConfidence,
  pipelineEtaMs,
  type BrainAction,
  type BrainPipelineStage,
  type BrainPlan,
  type PermissionRequest,
} from "../core/brain";
import { getAgentManager } from "../core/agent";
import type { IntentMatch } from "../core/agent";

type BrainContextValue = {
  brain: ReturnType<typeof getOmniMindBrain>;
  pipeline: BrainPipelineStage[];
  plan: BrainPlan | null;
  actions: BrainAction[];
  thinking: boolean;
  confidence: number;
  etaMs: number;
  permission: PermissionRequest | null;
  processRequest: (text: string, ctx?: { activeToolId?: string; routeId?: string; pathname?: string }) => Promise<{
    intent: IntentMatch | null;
    navigated?: string;
    response?: string;
  }>;
  respondPermission: (approved: boolean) => void;
  pauseAction: (id: string) => void;
  cancelAction: (id: string) => void;
  retryAction: (id: string) => void;
  pinNote: (text: string) => void;
  brain2Live: import("../core/brain/v2").Brain2LiveState | null;
  brain2Metrics: import("../core/brain/v2").Brain2PerformanceMetrics;
  liveThinkingEnabled: boolean;
  setLiveThinkingEnabled: (v: boolean) => void;
};

const BrainContext = createContext<BrainContextValue | null>(null);

export function OmniMindBrainProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const agent = useMemo(() => getAgentManager(), []);
  const brain = useMemo(() => getOmniMindBrain(agent), [agent]);

  const [pipeline, setPipeline] = useState<BrainPipelineStage[]>(brain.getPipeline());
  const [plan, setPlan] = useState<BrainPlan | null>(brain.getPlan());
  const [actions, setActions] = useState<BrainAction[]>(brain.getActions());
  const [thinking, setThinking] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [etaMs, setEtaMs] = useState(0);
  const [permission, setPermission] = useState<PermissionRequest | null>(null);
  const [brain2Live, setBrain2Live] = useState(brain.brain2.getSession()?.live ?? null);
  const [brain2Metrics, setBrain2Metrics] = useState(brain.brain2.getMetrics());
  const [liveThinkingEnabled, setLiveThinkingEnabled] = useState(brain.brain2.isLiveThinkingEnabled());

  useEffect(() => {
    brain.configure({ onNavigate: (href) => router.push(href) });
  }, [brain, router]);

  useEffect(() => {
    const cleanups: (() => void)[] = [];
    cleanups.push(
      brain.on("pipeline:update", (stages) => {
        setPipeline([...stages]);
        setConfidence(pipelineConfidence(stages));
        setEtaMs(pipelineEtaMs(stages));
      }),
    );
    cleanups.push(brain.on("plan:update", (p) => setPlan(p ? { ...p } : null)));
    cleanups.push(brain.on("action:update", (a) => setActions([...a])));
    cleanups.push(brain.on("thinking:status", (s) => setThinking(s.active)));
    cleanups.push(brain.subscribePermissions((req) => setPermission(req)));
    cleanups.push(brain.scheduler.subscribe(setActions));
    cleanups.push(brain.brain2.subscribe((live) => setBrain2Live({ ...live })));
    const onMetrics = (e: Event) => setBrain2Metrics((e as CustomEvent).detail);
    window.addEventListener("omnimind:brain2-metrics", onMetrics);
    cleanups.push(() => window.removeEventListener("omnimind:brain2-metrics", onMetrics));
    return () => cleanups.forEach((fn) => fn());
  }, [brain]);

  const processRequest = useCallback(
    async (text: string, ctx?: { activeToolId?: string; routeId?: string; pathname?: string }) => {
      const result = await brain.processRequest(text, ctx);
      return {
        intent: result.intent,
        navigated: result.navigatedTo,
        response: result.response,
      };
    },
    [brain],
  );

  const respondPermission = useCallback(
    (approved: boolean) => {
      if (!permission) return;
      brain.respondPermission(permission.id, approved);
      setPermission(null);
    },
    [brain, permission],
  );

  const value = useMemo<BrainContextValue>(
    () => ({
      brain,
      pipeline,
      plan,
      actions,
      thinking,
      confidence,
      etaMs,
      permission,
      processRequest,
      respondPermission,
      pauseAction: (id) => brain.pauseAction(id),
      cancelAction: (id) => brain.cancelAction(id),
      retryAction: (id) => brain.retryAction(id),
      pinNote: (text) => brain.globalMemory.pinNote(text),
      brain2Live,
      brain2Metrics,
      liveThinkingEnabled,
      setLiveThinkingEnabled: (v) => {
        brain.brain2.setLiveThinkingEnabled(v);
        setLiveThinkingEnabled(v);
      },
    }),
    [brain, pipeline, plan, actions, thinking, confidence, etaMs, permission, processRequest, respondPermission, brain2Live, brain2Metrics, liveThinkingEnabled],
  );

  return <BrainContext.Provider value={value}>{children}</BrainContext.Provider>;
}

export function useOmniMindBrain() {
  const ctx = useContext(BrainContext);
  if (!ctx) throw new Error("useOmniMindBrain must be used within OmniMindBrainProvider");
  return ctx;
}

export function useOmniMindBrainOptional() {
  return useContext(BrainContext);
}
