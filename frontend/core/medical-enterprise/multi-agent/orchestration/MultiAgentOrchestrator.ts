import type {
  MultiAgentRequest,
  MultiAgentResponse,
  MultiAgentSession,
  MultiAgentStreamEvent,
  ReasoningMode,
} from "../types";
import { MULTI_AGENT_DISCLAIMER } from "../types";
import { resolveAgentsForMultiRequest, toPhase2AgentIds } from "../agents/ExtendedAgentRegistry";
import { getAgentCollaborationEngine } from "./AgentCollaborationEngine";
import { getDecisionSupportEngine } from "../decision-support/DecisionSupportEngine";
import { getMultiAgentBrainBridge } from "../bridge/MultiAgentBrainBridge";
import { getConversationCache } from "../performance/ConversationCache";
import { hasMedicalPermission } from "../../../../lib/medical-enterprise/permissions";
import type { ClinicalRole } from "../../../../lib/medical-enterprise/types";
import type { ClinicalIntelligenceRequest } from "../../clinical-intelligence/types";

function sessionId(req: MultiAgentRequest) {
  return req.sessionId ?? `multi-agent-${req.patientId}-${Date.now()}`;
}

/** OmniMind Brain-orchestrated multi-agent reasoning pipeline */
export class MultiAgentOrchestrator {
  private collaboration = getAgentCollaborationEngine();
  private decisionSupport = getDecisionSupportEngine();
  private brain = getMultiAgentBrainBridge();
  private cache = getConversationCache();

  private assertAuthorized(role: string) {
    if (!hasMedicalPermission(role as ClinicalRole, "ai:request")) {
      throw new Error("Unauthorized: ai:request permission required");
    }
  }

  private toClinicalRequest(req: MultiAgentRequest, sid: string, phase2Ids: string[]): ClinicalIntelligenceRequest {
    return {
      patientId: req.patientId,
      sessionId: sid,
      symptoms: req.symptoms,
      history: req.history,
      vitals: req.vitals,
      labPanels: req.labPanels,
      imagingStudyIds: req.imagingStudyIds,
      medications: req.medications,
      agentIds: phase2Ids as ClinicalIntelligenceRequest["agentIds"],
      requesterRole: req.requesterRole,
      stream: req.stream,
    };
  }

  async run(req: MultiAgentRequest): Promise<MultiAgentResponse> {
    this.assertAuthorized(req.requesterRole);
    const cached = this.cache.getSession<MultiAgentResponse>(req.patientId, req.agentIds);
    if (cached) return cached;

    const sid = sessionId(req);
    const agents = resolveAgentsForMultiRequest(req.agentIds);
    const mode: ReasoningMode = req.reasoningMode ?? "hybrid";
    const phase2Ids = toPhase2AgentIds(agents.map((a) => a.id));

    await this.brain.pinMultiAgentSession(req.patientId, sid, agents.map((a) => a.id));
    await this.brain.enrichContextFromPhases(req.patientId);

    const { clinicalIntelligenceService } = await import("../../clinical-intelligence");
    const clinicalResponse = await clinicalIntelligenceService.analyze(
      this.toClinicalRequest(req, sid, phase2Ids),
    );

    const consensus = this.collaboration.buildConsensus(clinicalResponse.agentFindings);
    const ds = this.decisionSupport.generate(clinicalResponse, consensus);

    const session: MultiAgentSession = {
      id: sid,
      patientId: req.patientId,
      reasoningMode: mode,
      activeAgents: agents.map((a) => a.id),
      consensus,
      decisionSupport: ds,
      replayToken: clinicalResponse.replayToken,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    await this.brain.finalizeSession(sid, consensus.summary);

    const response: MultiAgentResponse = {
      session,
      clinicalResponse,
      consensus,
      decisionSupport: ds,
      disclaimer: MULTI_AGENT_DISCLAIMER,
    };

    this.cache.setSession(req.patientId, req.agentIds, response);
    return response;
  }

  async *stream(req: MultiAgentRequest): AsyncGenerator<MultiAgentStreamEvent> {
    this.assertAuthorized(req.requesterRole);
    const sid = sessionId(req);
    const agents = resolveAgentsForMultiRequest(req.agentIds);

    for (const agent of agents.filter((a) => a.parallelSafe)) {
      yield { type: "agent-start", agentId: agent.id, timestamp: new Date().toISOString() };
    }

    const result = await this.run(req);

    for (const conflict of result.consensus.conflicts) {
      yield { type: "conflict-detected", conflict };
    }

    yield {
      type: "consensus-partial",
      result: { summary: result.consensus.summary, agreementLevel: result.consensus.agreementLevel },
    };

    yield { type: "complete", session: result.session, clinicalResponse: result.clinicalResponse };
  }
}

let orchestrator: MultiAgentOrchestrator | null = null;

export function getMultiAgentOrchestrator() {
  if (!orchestrator) orchestrator = new MultiAgentOrchestrator();
  return orchestrator;
}
