import type { MultiAgentRequest, MultiAgentId, DocumentationType, KnowledgeQuery } from "../types";
import { getMultiAgentOrchestrator } from "../orchestration/MultiAgentOrchestrator";
import { listMultiAgents } from "../agents/ExtendedAgentRegistry";
import { getClinicalConversationEngine, getClinicalDocumentationEngine } from "../conversation/ClinicalConversationEngine";
import { getPatientInterviewEngine } from "../interview/PatientInterviewEngine";
import { getMedicalKnowledgeEngine } from "../knowledge/MedicalKnowledgeEngine";
import { getVoiceDoctorService } from "../voice/VoiceDoctorService";
import { getMultiAgentAccessControl } from "../security/MultiAgentAccessControl";
import { getMultiAgentBrainBridge } from "../bridge/MultiAgentBrainBridge";
import { getConversationCache } from "../performance/ConversationCache";
import type { ClinicalRole } from "../../../../lib/medical-enterprise/types";

/** Unified multi-agent intelligence service facade */
export class MultiAgentService {
  private orchestrator = getMultiAgentOrchestrator();
  private conversation = getClinicalConversationEngine();
  private documentation = getClinicalDocumentationEngine();
  private interview = getPatientInterviewEngine();
  private knowledge = getMedicalKnowledgeEngine();
  private voice = getVoiceDoctorService();
  private ac = getMultiAgentAccessControl();
  private brain = getMultiAgentBrainBridge();

  listAgents(role: ClinicalRole) {
    this.ac.assert(role, "multi-agent:read");
    return listMultiAgents();
  }

  async run(req: Omit<MultiAgentRequest, "requesterRole">, role: ClinicalRole) {
    this.ac.assert(role, "multi-agent:run");
    const result = await this.orchestrator.run({ ...req, requesterRole: role });
    this.ac.audit({
      actorId: "current-user",
      action: "multi-agent.run",
      resourceType: "session",
      resourceId: result.session.id,
      sessionId: result.session.id,
      patientId: req.patientId,
    });
    return result;
  }

  stream(req: Omit<MultiAgentRequest, "requesterRole">, role: ClinicalRole) {
    this.ac.assert(role, "multi-agent:run");
    return this.orchestrator.stream({ ...req, requesterRole: role });
  }

  async replay(token: string, role: ClinicalRole) {
    this.ac.assert(role, "multi-agent:replay");
    const { clinicalIntelligenceService } = await import("../../clinical-intelligence");
    return clinicalIntelligenceService.replay(token);
  }

  createConversation(patientId: string, clinicianId: string, role: ClinicalRole) {
    this.ac.assert(role, "multi-agent:conversation");
    return this.conversation.createSession(patientId, clinicianId);
  }

  sendMessage(sessionId: string, content: string, role: ClinicalRole) {
    this.ac.assert(role, "multi-agent:conversation");
    const msg = this.conversation.addMessage(sessionId, "clinician", content);
    void this.brain.rememberConversation(sessionId, "clinician", content);
    return msg;
  }

  getConversation(sessionId: string, role: ClinicalRole) {
    this.ac.assert(role, "multi-agent:conversation");
    return this.conversation.getSession(sessionId);
  }

  createDocumentation(
    patientId: string,
    sessionId: string,
    type: DocumentationType,
    clinicalResponse: import("../../clinical-intelligence/types").ClinicalAIResponse,
    role: ClinicalRole,
  ) {
    this.ac.assert(role, "multi-agent:document");
    const draft = this.documentation.createDraft(patientId, sessionId, type, clinicalResponse, role);
    this.ac.audit({
      actorId: role,
      action: "document.create",
      resourceType: "document",
      resourceId: draft.id,
      sessionId,
      patientId,
    });
    return draft;
  }

  approveDocument(draftId: string, approvedBy: string, role: ClinicalRole) {
    this.ac.assert(role, "multi-agent:document");
    return this.documentation.approve(draftId, approvedBy);
  }

  startInterview(patientId: string, role: ClinicalRole) {
    this.ac.assert(role, "multi-agent:conversation");
    return this.interview.startInterview(patientId);
  }

  recordInterviewResponse(sessionId: string, sectionId: import("../types").InterviewSectionId, question: string, answer: string, role: ClinicalRole) {
    this.ac.assert(role, "multi-agent:conversation");
    return this.interview.recordResponse(sessionId, sectionId, question, answer);
  }

  searchKnowledge(query: KnowledgeQuery, role: ClinicalRole) {
    this.ac.assert(role, "multi-agent:read");
    return this.knowledge.search(query);
  }

  async startVoiceSession(sessionId: string, role: ClinicalRole, config?: Partial<import("../types").VoiceDoctorConfig>) {
    this.ac.assert(role, "multi-agent:voice");
    return this.voice.startSession(sessionId, config);
  }

  async transcribe(audio: ArrayBuffer, role: ClinicalRole) {
    this.ac.assert(role, "multi-agent:voice");
    return this.voice.processAudio(audio);
  }

  parseVoiceCommand(transcript: string) {
    return this.voice.parseVoiceCommand(transcript);
  }

  invalidateCache(patientId: string, role: ClinicalRole) {
    this.ac.assert(role, "multi-agent:run");
    getConversationCache().invalidate(patientId);
  }
}

let service: MultiAgentService | null = null;

export function getMultiAgentService() {
  if (!service) service = new MultiAgentService();
  return service;
}
