import type {
  ClinicalConversationSession,
  ConversationMessage,
  DocumentationDraft,
  MultiAgentSession,
  PatientInterviewSession,
  VoiceTranscript,
} from "../types";

export type DbConversationSession = ClinicalConversationSession & { encryptedAtRest: boolean };

export type DbConversationMessage = ConversationMessage;

export type DbMultiAgentSession = MultiAgentSession & {
  encryptedAtRest: boolean;
  auditLogId: string;
};

export type DbDocumentationDraft = DocumentationDraft & { encrypted: boolean };

export type DbInterviewSession = PatientInterviewSession;

export type DbVoiceTranscript = VoiceTranscript;

export type DbMultiAgentAuditEntry = {
  id: string;
  actorId: string;
  action: string;
  resourceType: "session" | "conversation" | "document" | "voice" | "interview" | "replay";
  resourceId: string;
  sessionId?: string;
  patientId?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
};
