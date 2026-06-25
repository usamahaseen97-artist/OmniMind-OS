import type { IntentMatch } from "../../agent/types";
import type { BrainPlan, BrainRequestContext } from "../types";
import { AgentCollaboration } from "./AgentCollaboration";
import { DistributedTaskOrchestrator } from "./DistributedTaskOrchestrator";
import { AIGovernor } from "./Governor";
import { FailoverManager } from "./FailoverManager";
import { MasterAI } from "./MasterAI";
import {
  activateReasoningStage,
  completeReasoningStage,
  createReasoningStages,
  finishReasoningStages,
} from "./ReasoningPipeline";
import { getSelfImprovementEngine } from "./SelfImprovement";
import { getBrain2ToolRouter } from "./ToolRouter";
import type { Brain2LiveState, Brain2Session } from "./types";

export type Brain2Listener = (live: Brain2LiveState) => void;

/**
 * OmniMind Brain 2.0 coordinator — extends Brain 1.0 without replacing it.
 * Master AI · multi-agent · collaboration · governor · failover · metrics.
 */
export class Brain2Coordinator {
  readonly master = new MasterAI();
  readonly tasks = new DistributedTaskOrchestrator();
  readonly collaboration = new AgentCollaboration();
  readonly governor = new AIGovernor();
  readonly failover = new FailoverManager();
  readonly metrics = getSelfImprovementEngine();
  readonly toolRouter = getBrain2ToolRouter();

  private session: Brain2Session | null = null;
  private listeners = new Set<Brain2Listener>();
  private liveThinkingEnabled = true;

  subscribe(listener: Brain2Listener) {
    this.listeners.add(listener);
    if (this.session) listener(this.session.live);
    return () => this.listeners.delete(listener);
  }

  isLiveThinkingEnabled() {
    return this.liveThinkingEnabled;
  }

  setLiveThinkingEnabled(enabled: boolean) {
    this.liveThinkingEnabled = enabled;
    if (typeof window !== "undefined") {
      localStorage.setItem("omnimind_brain2_live_thinking", enabled ? "1" : "0");
    }
  }

  loadPreferences() {
    if (typeof window === "undefined") return;
    this.liveThinkingEnabled = localStorage.getItem("omnimind_brain2_live_thinking") !== "0";
  }

  getSession() {
    return this.session;
  }

  getMetrics() {
    return this.metrics.getMetrics();
  }

  private emit() {
    if (!this.session) return;
    for (const l of this.listeners) l(this.session.live);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("omnimind:brain2-live", { detail: this.session.live }));
    }
  }

  private tick(event: string) {
    if (!this.session) return;
    this.session.live.timeline.push({ at: new Date().toISOString(), event });
    this.emit();
  }

  startSession(text: string): Brain2Session {
    this.loadPreferences();
    const route = this.toolRouter.route(text);
    const session: Brain2Session = {
      id: `brain2-${Date.now()}`,
      text,
      startedAt: Date.now(),
      metrics: this.metrics.getMetrics(),
      live: {
        sessionId: `brain2-${Date.now()}`,
        intent: "",
        selectedAgents: [],
        subtasks: [],
        reasoningStages: createReasoningStages(),
        collaboration: [],
        memoryUsed: [],
        runningTools: [route.toolId],
        timeline: [],
        tokenUsage: Math.round(text.length * 1.2),
        toolRoute: route,
        mergedResponse: null,
        provider: this.failover.getActiveProvider(),
        failoverCount: 0,
      },
    };
    this.session = session;
    this.tick("Session started");
    return session;
  }

  async enhanceUnderstanding(intentSummary: string, memoryNotes: string[]) {
    if (!this.session) return;
    this.session.live.intent = intentSummary;
    this.session.live.memoryUsed = memoryNotes;
    this.session.live.reasoningStages = activateReasoningStage(this.session.live.reasoningStages, "understanding", intentSummary);
    this.emit();
    await this.delay(120);
    this.session.live.reasoningStages = completeReasoningStage(this.session.live.reasoningStages, "understanding");
    this.session.live.reasoningStages = activateReasoningStage(this.session.live.reasoningStages, "research", "Cross-agent research");
    await this.delay(80);
    this.session.live.reasoningStages = completeReasoningStage(this.session.live.reasoningStages, "research");
    this.tick("Understanding complete");
  }

  async onPlan(plan: BrainPlan, intent: IntentMatch | null) {
    if (!this.session) return null;
    const route = this.session.live.toolRoute!;
    this.session.live.reasoningStages = activateReasoningStage(this.session.live.reasoningStages, "planning", plan.goal);
    const master = this.master.process(this.session.text, plan, intent, route);
    this.session.live.selectedAgents = master.selectedAgents;
    this.session.live.subtasks = master.subtasks;
    this.session.live.intent = master.intent;
    this.session.live.collaboration = this.collaboration.run(this.session.text, master.selectedAgents);
    this.emit();
    await this.delay(100);
    this.session.live.reasoningStages = completeReasoningStage(this.session.live.reasoningStages, "planning", `${master.subtasks.length} subtasks`);
    this.tick(`Plan: ${master.selectedAgents.length} agents`);
    return master;
  }

  async onExecute(toolId: string) {
    if (!this.session) return;
    this.session.live.runningTools = [...new Set([...this.session.live.runningTools, toolId])];
    this.session.live.reasoningStages = activateReasoningStage(this.session.live.reasoningStages, "execution", toolId);
    this.emit();
    await this.delay(80);
  }

  async finalize(baseResponse: string, plan: BrainPlan): Promise<string> {
    if (!this.session) return baseResponse;

    const started = this.session.startedAt;
    return this.failover.execute(async () => {
      const taskResults = await this.tasks.executeParallel(this.session!.live.subtasks, async (task) => {
        return `${task.label} → ${task.toolId}`;
      });

      this.session!.live.reasoningStages = completeReasoningStage(this.session!.live.reasoningStages, "execution");
      this.session!.live.reasoningStages = activateReasoningStage(this.session!.live.reasoningStages, "validation");
      await this.delay(60);
      this.session!.live.reasoningStages = completeReasoningStage(this.session!.live.reasoningStages, "validation");
      this.session!.live.reasoningStages = activateReasoningStage(this.session!.live.reasoningStages, "review");
      await this.delay(60);
      this.session!.live.reasoningStages = completeReasoningStage(this.session!.live.reasoningStages, "review");
      this.session!.live.reasoningStages = activateReasoningStage(this.session!.live.reasoningStages, "optimization");
      await this.delay(40);
      this.session!.live.reasoningStages = completeReasoningStage(this.session!.live.reasoningStages, "optimization");

      const governed = this.governor.merge(
        baseResponse,
        taskResults,
        this.session!.live.collaboration.map((c) => c.answer ?? ""),
      );

      this.session!.live.reasoningStages = activateReasoningStage(this.session!.live.reasoningStages, "final_response", "Merged response");
      this.session!.live.reasoningStages = finishReasoningStages(this.session!.live.reasoningStages);
      this.session!.live.mergedResponse = governed.response;
      this.session!.live.tokenUsage += plan.subtasks.length * 120;
      this.tick("Final response ready");

      const latency = Date.now() - started;
      this.metrics.recordSuccess(latency, this.session!.live.toolRoute?.toolId ?? "unknown");
      this.metrics.recordMemoryUse(this.session!.live.memoryUsed.length > 0 ? 85 : 70);
      this.session!.metrics = this.metrics.getMetrics();
      this.emit();

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("omnimind:brain2-metrics", { detail: this.session!.metrics }));
      }

      return governed.safe
        ? governed.response
        : `${governed.response} [Governor: reviewed for safe execution]`;
    }).catch((err) => {
      this.metrics.recordFailure(true);
      this.session!.live.failoverCount += 1;
      this.tick(`Failover: ${err instanceof Error ? err.message : "retry"}`);
      return baseResponse;
    });
  }

  private delay(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }
}

let coordinator: Brain2Coordinator | null = null;

export function getBrain2Coordinator(): Brain2Coordinator {
  if (!coordinator) coordinator = new Brain2Coordinator();
  return coordinator;
}
