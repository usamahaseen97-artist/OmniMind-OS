import { DistributedTaskOrchestrator } from "../../../brain/v2/DistributedTaskOrchestrator";
import type { Brain2Subtask } from "../../../brain/v2/types";
import type {
  ClinicalAIResponse,
  ClinicalIntelligenceRequest,
  ClinicalIntelligenceStreamEvent,
  ReasoningStep,
} from "../types";
import { runMedicalAgent, resolveAgentsForRequest } from "../agents/MedicalAgentRunner";
import { getClinicalResultMerger } from "../orchestration/ClinicalResultMerger";
import { getClinicalBrainBridge } from "../orchestration/ClinicalBrainBridge";
import { getReasoningAuditStore } from "../audit/ReasoningAuditStore";
import { getInferenceCache } from "./InferenceCache";
import { hasMedicalPermission } from "../../../../lib/medical-enterprise/permissions";
import type { ClinicalRole } from "../../../../lib/medical-enterprise/types";
import type { ClinicalAgentId } from "../types";

function sessionId(req: ClinicalIntelligenceRequest): string {
  return req.sessionId ?? `clinical-${req.patientId}-${Date.now()}`;
}

function assertAuthorized(role: string) {
  if (!hasMedicalPermission(role as ClinicalRole, "ai:request")) {
    throw new Error("Unauthorized: ai:request permission required");
  }
}

/** Main clinical reasoning pipeline — parallel agents, streaming, audit */
export class ClinicalReasoningPipeline {
  private orchestrator = new DistributedTaskOrchestrator();
  private merger = getClinicalResultMerger();
  private audit = getReasoningAuditStore();
  private cache = getInferenceCache();
  private brain = getClinicalBrainBridge();

  async run(req: ClinicalIntelligenceRequest): Promise<ClinicalAIResponse> {
    assertAuthorized(req.requesterRole);

    const cached = this.cache.get<ClinicalAIResponse>(req);
    if (cached) return cached;

    const sid = sessionId(req);
    const agents = resolveAgentsForRequest(req);
    const agentIds = agents.map((a) => a.id);

    this.audit.create({
      sessionId: sid,
      patientId: req.patientId,
      createdAt: new Date().toISOString(),
      requestHash: JSON.stringify(req).slice(0, 64),
      reasoningSteps: [],
      contributingAgents: agentIds,
      requesterId: "current-user",
      requesterRole: req.requesterRole,
    });

    this.brain.pinSessionNote(req.patientId, sid);
    await this.brain.notifyBrainProcessing(req, agentIds);

    const parallelAgents = agents.filter((a) => a.parallelSafe);
    const sequentialAgents = agents.filter((a) => !a.parallelSafe);

    const findings: import("../types").ClinicalAgentFinding[] = [];
    const steps: ReasoningStep[] = [];

    const toSubtask = (id: ClinicalAgentId, parallel: boolean): Brain2Subtask => ({
      id: `med-${id}`,
      label: id,
      agentId: "medical_specialist",
      toolId: "medical-diagnostic-suite",
      status: "queued",
      parallel,
    });

    const executeAgent = async (task: Brain2Subtask) => {
      const agentId = task.label as ClinicalAgentId;
      const result = await runMedicalAgent(agentId, { ...req, sessionId: sid });
      findings.push(result.finding);
      steps.push(result.step);
      this.audit.appendStep(sid, result.step);
      return result.finding.summary;
    };

    const subtasks = [
      ...parallelAgents.map((a) => toSubtask(a.id, true)),
      ...sequentialAgents.map((a) => toSubtask(a.id, false)),
    ];

    if (subtasks.length) {
      await this.orchestrator.executeParallel(subtasks, executeAgent);
    }

    const response = this.merger.merge(sid, req.patientId, findings, steps);
    response.summary = await this.brain.finalizeBrainResponse(response.summary);

    this.audit.complete(sid, response);
    this.cache.set(req, response);

    return response;
  }

  async *stream(req: ClinicalIntelligenceRequest): AsyncGenerator<ClinicalIntelligenceStreamEvent> {
    assertAuthorized(req.requesterRole);
    const sid = sessionId(req);
    const agents = resolveAgentsForRequest(req);

    for (const agent of agents) {
      yield { type: "agent-start", agentId: agent.id, timestamp: new Date().toISOString() };
      const result = await runMedicalAgent(agent.id, { ...req, sessionId: sid });
      yield { type: "reasoning-step", step: result.step };
      yield { type: "agent-finding", finding: result.finding };
      yield { type: "partial-summary", text: result.finding.summary };
    }

    const response = await this.run({ ...req, sessionId: sid });
    yield { type: "complete", response };
  }

  replay(replayToken: string) {
    const sessionId = replayToken.replace(/^replay-/, "");
    return this.audit.replay(sessionId);
  }
}

let pipeline: ClinicalReasoningPipeline | null = null;

export function getClinicalReasoningPipeline(): ClinicalReasoningPipeline {
  if (!pipeline) pipeline = new ClinicalReasoningPipeline();
  return pipeline;
}
