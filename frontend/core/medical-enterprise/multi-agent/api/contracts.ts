import type {
  MultiAgentRequest,
  MultiAgentResponse,
  ClinicalConversationSession,
  DocumentationDraft,
  DocumentationType,
  PatientInterviewSession,
  KnowledgeQuery,
  VoiceDoctorConfig,
} from "../types";

export const MULTI_AGENT_API_BASE = "/api/v1/medical-enterprise/multi-agent";

export type ApiResponse<T> = { ok: boolean; data?: T; error?: string };

export type RunMultiAgentRequest = Omit<MultiAgentRequest, "requesterRole">;

export type RunMultiAgentResponse = ApiResponse<MultiAgentResponse>;

export type ListAgentsResponse = ApiResponse<{ id: string; name: string; description: string }[]>;

export type CreateConversationResponse = ApiResponse<ClinicalConversationSession>;

export type SendMessageRequest = { sessionId: string; content: string };

export type CreateDocumentationRequest = {
  patientId: string;
  sessionId: string;
  type: DocumentationType;
};

export type KnowledgeSearchResponse = ApiResponse<import("../types").KnowledgeCitation[]>;

export type StartInterviewResponse = ApiResponse<PatientInterviewSession>;

export type VoiceSessionResponse = ApiResponse<{ sessionId: string; status: string }>;

export const MULTI_AGENT_API_ROUTES = {
  agents: `${MULTI_AGENT_API_BASE}/agents`,
  run: `${MULTI_AGENT_API_BASE}/run`,
  stream: `${MULTI_AGENT_API_BASE}/stream`,
  replay: (token: string) => `${MULTI_AGENT_API_BASE}/replay/${token}`,
  conversations: `${MULTI_AGENT_API_BASE}/conversations`,
  conversation: (id: string) => `${MULTI_AGENT_API_BASE}/conversations/${id}`,
  messages: `${MULTI_AGENT_API_BASE}/messages`,
  documents: `${MULTI_AGENT_API_BASE}/documents`,
  document: (id: string) => `${MULTI_AGENT_API_BASE}/documents/${id}`,
  knowledge: `${MULTI_AGENT_API_BASE}/knowledge/search`,
  interview: `${MULTI_AGENT_API_BASE}/interview`,
  interviewSession: (id: string) => `${MULTI_AGENT_API_BASE}/interview/${id}`,
  voiceStart: `${MULTI_AGENT_API_BASE}/voice/start`,
  voiceTranscribe: `${MULTI_AGENT_API_BASE}/voice/transcribe`,
  voiceSpeak: `${MULTI_AGENT_API_BASE}/voice/speak`,
} as const;

export type { MultiAgentRequest, VoiceDoctorConfig, KnowledgeQuery };
