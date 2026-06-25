/**
 * Medical Multi-Agent Intelligence Platform — Phase 5
 */
export type * from "./types";
export { MULTI_AGENT_API_BASE, MULTI_AGENT_API_ROUTES } from "./api/contracts";
export type {
  RunMultiAgentRequest,
  RunMultiAgentResponse,
  ListAgentsResponse,
  CreateConversationResponse,
  SendMessageRequest,
  CreateDocumentationRequest,
  KnowledgeSearchResponse,
  StartInterviewResponse,
  VoiceSessionResponse,
  MultiAgentRequest,
  VoiceDoctorConfig,
  KnowledgeQuery,
} from "./api/contracts";
export * from "./agents/ExtendedAgentRegistry";
export * from "./models/schema";
export * from "./orchestration/AgentCollaborationEngine";
export * from "./orchestration/MultiAgentOrchestrator";
export * from "./conversation/ClinicalConversationEngine";
export * from "./interview/PatientInterviewEngine";
export * from "./knowledge/MedicalKnowledgeEngine";
export * from "./voice/VoiceDoctorService";
export * from "./decision-support/DecisionSupportEngine";
export * from "./performance/ConversationCache";
export * from "./security/MultiAgentAccessControl";
export * from "./bridge/MultiAgentBrainBridge";
export * from "./services/MultiAgentService";

import { getMultiAgentService } from "./services/MultiAgentService";

export const medicalMultiAgentPlatform = {
  service: getMultiAgentService,
  agents: (...args: Parameters<ReturnType<typeof getMultiAgentService>["listAgents"]>) => getMultiAgentService().listAgents(...args),
  run: (...args: Parameters<ReturnType<typeof getMultiAgentService>["run"]>) => getMultiAgentService().run(...args),
  stream: (...args: Parameters<ReturnType<typeof getMultiAgentService>["stream"]>) => getMultiAgentService().stream(...args),
  replay: (...args: Parameters<ReturnType<typeof getMultiAgentService>["replay"]>) => getMultiAgentService().replay(...args),
  createConversation: (...args: Parameters<ReturnType<typeof getMultiAgentService>["createConversation"]>) => getMultiAgentService().createConversation(...args),
  sendMessage: (...args: Parameters<ReturnType<typeof getMultiAgentService>["sendMessage"]>) => getMultiAgentService().sendMessage(...args),
  searchKnowledge: (...args: Parameters<ReturnType<typeof getMultiAgentService>["searchKnowledge"]>) => getMultiAgentService().searchKnowledge(...args),
  startInterview: (...args: Parameters<ReturnType<typeof getMultiAgentService>["startInterview"]>) => getMultiAgentService().startInterview(...args),
};
