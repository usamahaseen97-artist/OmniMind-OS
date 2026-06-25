import type {
  ClinicalConversationSession,
  ConversationMessage,
  DocumentationDraft,
  DocumentationType,
  MultiAgentId,
} from "../types";
import type { ClinicalAIResponse } from "../../clinical-intelligence/types";
import { MULTI_AGENT_DISCLAIMER } from "../types";

/** Clinical conversation engine — follow-ups, explanations, summaries */
export class ClinicalConversationEngine {
  private sessions = new Map<string, ClinicalConversationSession>();

  createSession(patientId: string, clinicianId: string, title = "Clinical consultation") {
    const session: ClinicalConversationSession = {
      id: `conv-${Date.now()}`,
      patientId,
      clinicianId,
      title,
      messages: [],
      activeAgents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.sessions.set(session.id, session);
    return session;
  }

  addMessage(sessionId: string, role: ConversationMessage["role"], content: string, agentId?: MultiAgentId) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("Conversation session not found");
    const msg: ConversationMessage = {
      id: `msg-${Date.now()}`,
      sessionId,
      role,
      agentId,
      content,
      timestamp: new Date().toISOString(),
      encrypted: true,
    };
    session.messages.push(msg);
    session.updatedAt = new Date().toISOString();
    return msg;
  }

  askFollowUp(sessionId: string, question: string) {
    return this.addMessage(sessionId, "clinician", question);
  }

  explainFinding(sessionId: string, agentId: MultiAgentId, finding: string) {
    return this.addMessage(
      sessionId,
      "agent",
      `Explanation scaffold for clinician review: ${finding}. Supporting evidence requires verification.`,
      agentId,
    );
  }

  compareFindings(sessionId: string, summaries: string[]) {
    const content = `Comparison of ${summaries.length} agent finding(s):\n${summaries.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nClinician review required.`;
    return this.addMessage(sessionId, "assistant", content);
  }

  generateSummary(sessionId: string, clinical: ClinicalAIResponse) {
    return this.addMessage(sessionId, "assistant", clinical.summary);
  }

  getSession(sessionId: string) {
    return this.sessions.get(sessionId);
  }

  listSessions(patientId: string) {
    return [...this.sessions.values()].filter((s) => s.patientId === patientId);
  }
}

/** Structured clinical documentation drafts — clinician approval required */
export class ClinicalDocumentationEngine {
  private drafts = new Map<string, DocumentationDraft>();

  private templates: Record<DocumentationType, string[]> = {
    "soap-note": ["Subjective", "Objective", "Assessment", "Plan"],
    "clinical-note": ["Chief Complaint", "History", "Examination", "Plan"],
    "consultation-note": ["Reason for Consult", "Findings", "Recommendations"],
    "referral-letter": ["Patient Summary", "Clinical Question", "Relevant History"],
    "discharge-summary": ["Admission Summary", "Hospital Course", "Discharge Plan", "Follow-up"],
    "follow-up-plan": ["Goals", "Monitoring", "Next Appointment"],
    "progress-note": ["Interval History", "Current Status", "Plan"],
    "medical-report": ["Indication", "Findings", "Impression", "Recommendations"],
  };

  createDraft(
    patientId: string,
    sessionId: string,
    type: DocumentationType,
    clinical: ClinicalAIResponse,
    authoredBy: string,
  ): DocumentationDraft {
    const headings = this.templates[type];
    const draft: DocumentationDraft = {
      id: `doc-${Date.now()}`,
      patientId,
      sessionId,
      type,
      title: `${type.replace(/-/g, " ")} — draft`,
      sections: headings.map((heading) => ({
        heading,
        content: this.sectionContent(heading, clinical),
      })),
      status: "draft",
      authoredBy,
      createdAt: new Date().toISOString(),
      clinicianReviewRequired: true,
    };
    this.drafts.set(draft.id, draft);
    return draft;
  }

  private sectionContent(heading: string, clinical: ClinicalAIResponse): string {
    if (heading === "Assessment" || heading === "Impression") {
      return `[Draft — clinician review required] ${clinical.differentialConsiderations.join("; ") || "Pending clinician assessment."}`;
    }
    if (heading === "Plan" || heading === "Recommendations" || heading === "Follow-up") {
      return clinical.suggestedNextQuestions.join("\n") || "Follow-up per clinician judgment.";
    }
    return clinical.summary;
  }

  approve(draftId: string, approvedBy: string) {
    const draft = this.drafts.get(draftId);
    if (!draft) throw new Error("Draft not found");
    draft.status = "approved";
    draft.approvedBy = approvedBy;
    draft.approvedAt = new Date().toISOString();
    return draft;
  }

  getDraft(draftId: string) {
    return this.drafts.get(draftId);
  }

  listDrafts(patientId: string) {
    return [...this.drafts.values()].filter((d) => d.patientId === patientId);
  }

  getDisclaimer() {
    return MULTI_AGENT_DISCLAIMER;
  }
}

let conversation: ClinicalConversationEngine | null = null;
let documentation: ClinicalDocumentationEngine | null = null;

export function getClinicalConversationEngine() {
  if (!conversation) conversation = new ClinicalConversationEngine();
  return conversation;
}

export function getClinicalDocumentationEngine() {
  if (!documentation) documentation = new ClinicalDocumentationEngine();
  return documentation;
}
