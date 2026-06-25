import type { AgentManager } from "../agent/AgentManager";
import { getAgentManager } from "../agent/AgentManager";
import type { IntentMatch } from "../agent/types";
import { specialistForId } from "./agents/SpecialistAgents";
import {
  activateStage,
  completeStage,
  createPipelineStages,
  finishPipeline,
  pipelineConfidence,
  pipelineEtaMs,
} from "./execution/ExecutionPipeline";
import { ExecutionValidator } from "./execution/Validator";
import { GlobalMemory } from "./memory/GlobalMemory";
import { TaskPlanner } from "./planning/TaskPlanner";
import { ToolOrchestrator } from "./orchestrator/ToolOrchestrator";
import { WorkspaceIntelligence } from "./orchestrator/WorkspaceIntelligence";
import { PermissionGate } from "./permissions/PermissionGate";
import { ReasoningEngine } from "./reasoning/ReasoningEngine";
import { BackgroundScheduler } from "./scheduler/BackgroundScheduler";
import { VoiceBridge } from "./voice/VoiceBridge";
import { BrainPluginBridge } from "./plugins/BrainPluginBridge";
import { getBrain2Coordinator } from "./v2/Brain2Coordinator";
import type {
  BrainEventMap,
  BrainListener,
  BrainPipelineStage,
  BrainPlan,
  BrainProcessResult,
  BrainRequestContext,
  PermissionRequest,
} from "./types";
import type { BrainAction } from "./types";

export type BrainConfig = {
  onNavigate?: (href: string) => void;
};

/**
 * OmniMind Brain — central intelligence layer above every sovereign tool.
 * Wraps AgentManager; does not replace it.
 */
export class OmniMindBrain {
  readonly reasoning = new ReasoningEngine();
  readonly planner = new TaskPlanner();
  readonly orchestrator: ToolOrchestrator;
  readonly globalMemory: GlobalMemory;
  readonly workspace: WorkspaceIntelligence;
  readonly permissions = new PermissionGate();
  readonly scheduler = new BackgroundScheduler();
  readonly validator = new ExecutionValidator();
  readonly voice: VoiceBridge;
  readonly plugins: BrainPluginBridge;
  readonly brain2 = getBrain2Coordinator();

  private pipeline: BrainPipelineStage[] = createPipelineStages();
  private activePlan: BrainPlan | null = null;
  private thinking = false;
  private config: BrainConfig = {};
  private listeners = new Map<string, Set<(payload: unknown) => void>>();

  constructor(private agent: AgentManager) {
    this.orchestrator = new ToolOrchestrator(agent);
    this.globalMemory = new GlobalMemory(agent.memory);
    this.workspace = new WorkspaceIntelligence();
    this.voice = new VoiceBridge(agent.voice);
    this.plugins = new BrainPluginBridge(agent.plugins);
  }

  configure(config: BrainConfig) {
    this.config = { ...this.config, ...config };
  }

  on<K extends keyof BrainEventMap>(event: K, listener: BrainListener<K>) {
    const key = event as string;
    if (!this.listeners.has(key)) this.listeners.set(key, new Set());
    this.listeners.get(key)!.add(listener as (payload: unknown) => void);
    return () => this.listeners.get(key)?.delete(listener as (payload: unknown) => void);
  }

  private emit<K extends keyof BrainEventMap>(event: K, payload: BrainEventMap[K]) {
    this.listeners.get(event as string)?.forEach((l) => l(payload));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(`omnimind:brain-${event}`, { detail: payload }));
    }
  }

  getPipeline(): BrainPipelineStage[] {
    return this.pipeline;
  }

  getPlan(): BrainPlan | null {
    return this.activePlan;
  }

  getActions(): BrainAction[] {
    return this.scheduler.list();
  }

  isThinking(): boolean {
    return this.thinking;
  }

  private setStage(stageId: BrainPipelineStage["id"], message?: string, confidence?: number) {
    this.pipeline = activateStage(this.pipeline, stageId, message, confidence);
    this.emit("pipeline:update", this.pipeline);
    this.emit("thinking:status", {
      active: true,
      stage: stageId,
      confidence: pipelineConfidence(this.pipeline),
    });
  }

  private doneStage(stageId: BrainPipelineStage["id"], message?: string) {
    this.pipeline = completeStage(this.pipeline, stageId, message);
    this.emit("pipeline:update", this.pipeline);
  }

  async processRequest(text: string, ctx: BrainRequestContext = {}): Promise<BrainProcessResult> {
    const trimmed = text.trim();
    if (!trimmed) {
      return { intent: null, routed: false, pipeline: this.pipeline };
    }

    this.thinking = true;
    this.pipeline = createPipelineStages();
    this.emit("pipeline:update", this.pipeline);
    this.globalMemory.rememberConversation(trimmed);

    const brain2Session = this.brain2.startSession(trimmed);
    void brain2Session;
    const memoryNotes = this.globalMemory.getBrainSlice().pinnedNotes.slice(-4);
    await this.brain2.enhanceUnderstanding("Processing user request", memoryNotes);

    const approved = await this.permissions.guardText(trimmed, ctx.activeToolId);
    if (!approved) {
      this.thinking = false;
      this.pipeline = finishPipeline(this.pipeline);
      return { intent: null, routed: false, pipeline: this.pipeline, response: "Action cancelled by user." };
    }

    // 1. Understand
    this.setStage("understand", "Parsing intent and entities…");
    const understanding = this.reasoning.understand(trimmed);
    await this.delay(280);
    this.doneStage("understand", understanding.intent);

    // 2. Reason
    const intent = this.agent.intentEngine.resolve(trimmed, ctx.activeToolId) as IntentMatch | null;
    this.setStage("reason", "Evaluating goals and constraints…", intent?.confidence);
    const reasoning = this.reasoning.reason(trimmed, intent);
    await this.delay(320);
    this.doneStage("reason", reasoning.summary);

    // 3. Plan
    this.setStage("plan", "Decomposing into subtasks…", reasoning.confidence);
    const plan = this.planner.plan(trimmed, intent);
    this.activePlan = plan;
    this.emit("plan:update", plan);
    await this.brain2.onPlan(plan, intent);
    await this.delay(360);
    this.doneStage("plan", `${plan.subtasks.length} step(s) · ~${Math.round(plan.estimatedTotalMs / 1000)}s`);

    // 4. Choose tool
    const brain2Route = this.brain2.toolRouter.route(trimmed, ctx.activeToolId);
    const choice = this.orchestrator.chooseTool(intent, plan);
    const resolvedToolId = intent?.toolId ?? brain2Route.toolId ?? choice.toolId;
    this.setStage("choose_tool", `${choice.reason} · Brain2: ${brain2Route.reason}`, plan.confidence);
    const toolCtx = this.workspace.resolve(resolvedToolId, this.globalMemory.buildGlobalContext());
    this.workspace.injectEvent(resolvedToolId, toolCtx);
    this.globalMemory.rememberTool(resolvedToolId);
    await this.brain2.onExecute(resolvedToolId);
    await this.delay(240);
    this.doneStage("choose_tool", resolvedToolId);

    // 5. Execute
    const specialist = plan.subtasks[0]?.specialistId ? specialistForId(plan.subtasks[0].specialistId) : undefined;
    this.setStage("execute", specialist ? `${specialist.title} executing…` : "Launching tool…");
    this.scheduler.runPlanProgress(plan, (subtaskId) => {
      if (this.activePlan) {
        this.activePlan = this.planner.advanceSubtask(this.activePlan, subtaskId, "completed");
        this.emit("plan:update", this.activePlan);
      }
    });
    this.emit("action:update", this.scheduler.list());

    const orch = await this.orchestrator.executePlan(plan, trimmed, intent, (href) => {
      if (!ctx.skipNavigation) this.config.onNavigate?.(href);
    });
    await this.delay(400);
    this.doneStage("execute", orch.navigatedTo ?? resolvedToolId);

    // 6. Validate
    this.setStage("validate", "Checking route and plan integrity…");
    const validation = this.validator.validate({ intent, routed: true, plan, navigatedTo: orch.navigatedTo });
    await this.delay(260);
    this.doneStage("validate", validation.ok ? "Validated" : validation.issues.join("; "));

    // 7. Improve
    this.setStage("improve", validation.improvements[0] ?? "Optimizing context handoff…");
    this.agent.memory.pushConversation("assistant", `Orchestrated: ${plan.goal} → ${resolvedToolId}`);
    await this.delay(220);
    this.doneStage("improve");

    // 8. Return
    this.setStage("return_result", `ETA ${Math.round(pipelineEtaMs(this.pipeline) / 1000)}s remaining`);
    this.pipeline = finishPipeline(this.pipeline);
    this.emit("pipeline:update", this.pipeline);
    this.emit("thinking:status", { active: false, confidence: plan.confidence });
    this.thinking = false;

    const baseResponse = `OmniMind Brain: ${plan.goal}. Routed to ${resolvedToolId}. ${plan.subtasks.length} subtask(s) tracked.`;
    const response = await this.brain2.finalize(baseResponse, plan);

    return {
      intent,
      routed: true,
      navigatedTo: orch.navigatedTo,
      workflowStarted: orch.workflowStarted,
      plan,
      pipeline: this.pipeline,
      response,
    };
  }

  respondPermission(requestId: string, approved: boolean) {
    this.permissions.respond(requestId, approved);
  }

  pauseAction(id: string) {
    this.scheduler.pause(id);
    this.emit("action:update", this.scheduler.list());
  }

  cancelAction(id: string) {
    this.scheduler.cancel(id);
    this.emit("action:update", this.scheduler.list());
  }

  retryAction(id: string) {
    this.scheduler.retry(id);
    this.emit("action:update", this.scheduler.list());
  }

  subscribePermissions(listener: (req: PermissionRequest) => void) {
    return this.permissions.subscribe(listener);
  }

  private delay(ms: number) {
    return new Promise((r) => window.setTimeout(r, ms));
  }
}

let brainSingleton: OmniMindBrain | null = null;

export function getOmniMindBrain(agent?: AgentManager): OmniMindBrain {
  if (!brainSingleton) brainSingleton = new OmniMindBrain(agent ?? getAgentManager());
  return brainSingleton;
}
