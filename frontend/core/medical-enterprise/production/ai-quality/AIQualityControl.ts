import type { AIFeedbackRecord, AIFeedbackAction, AIQualityMetrics } from "../types";

/** Clinician AI feedback and quality control */
export class AIQualityControl {
  private feedback: AIFeedbackRecord[] = [];

  async submitFeedback(input: Omit<AIFeedbackRecord, "id" | "timestamp">) {
    const record: AIFeedbackRecord = {
      ...input,
      id: `fb-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.feedback.unshift(record);

    try {
      const { getGovernanceService } = await import("../../governance/services/GovernanceService");
      getGovernanceService().recordAIDecision({
        patientId: input.patientId,
        recommendationId: input.recommendationId,
        agentId: input.agentId,
        viewedAt: record.timestamp,
        decision: input.action === "approve" ? "accepted" : input.action === "reject" ? "rejected" : undefined,
        decidedAt: record.timestamp,
        decidedBy: input.clinicianId,
      });
    } catch { /* optional */ }

    return record;
  }

  approve(patientId: string, recommendationId: string, clinicianId: string, agentId?: string) {
    return this.submitFeedback({ patientId, recommendationId, agentId, action: "approve", clinicianId });
  }

  reject(patientId: string, recommendationId: string, clinicianId: string, agentId?: string) {
    return this.submitFeedback({ patientId, recommendationId, agentId, action: "reject", clinicianId });
  }

  correct(patientId: string, recommendationId: string, clinicianId: string, correction: string, agentId?: string) {
    return this.submitFeedback({ patientId, recommendationId, agentId, action: "correct", correction, clinicianId });
  }

  getMetrics(): AIQualityMetrics {
    const total = this.feedback.length;
    const approved = this.feedback.filter((f) => f.action === "approve").length;
    const rejected = this.feedback.filter((f) => f.action === "reject").length;
    const corrected = this.feedback.filter((f) => f.action === "correct").length;
    return {
      totalRecommendations: total,
      approved,
      rejected,
      corrected,
      approvalRate: total ? Math.round((approved / total) * 100) : 0,
      avgConfidence: 0.65,
    };
  }

  getFeedback(patientId?: string) {
    return patientId ? this.feedback.filter((f) => f.patientId === patientId) : this.feedback;
  }
}

let qc: AIQualityControl | null = null;

export function getAIQualityControl() {
  if (!qc) qc = new AIQualityControl();
  return qc;
}

export type { AIFeedbackAction };
