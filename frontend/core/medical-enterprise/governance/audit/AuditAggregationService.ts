import type { UnifiedAuditEvent, AIDecisionAudit } from "../types";

/** Unified audit aggregation — federates phase audit logs without replacing them */
export class AuditAggregationService {
  private events: UnifiedAuditEvent[] = [];
  private aiDecisions: AIDecisionAudit[] = [];

  record(event: Omit<UnifiedAuditEvent, "id" | "immutable">) {
    const record: UnifiedAuditEvent = {
      ...event,
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      immutable: true,
    };
    this.events.unshift(record);
    return record;
  }

  recordLogin(actorId: string, actorRole: string, outcome: UnifiedAuditEvent["outcome"]) {
    return this.record({
      timestamp: new Date().toISOString(),
      actorId,
      actorRole,
      action: "user.login",
      category: "login",
      resourceType: "session",
      resourceId: actorId,
      outcome,
      source: "governance",
    });
  }

  recordPatientAccess(actorId: string, actorRole: string, patientId: string, resourceType: string) {
    return this.record({
      timestamp: new Date().toISOString(),
      actorId,
      actorRole,
      action: "patient.record.access",
      category: "patient-access",
      resourceType,
      resourceId: patientId,
      patientId,
      outcome: "success",
      source: "governance",
    });
  }

  recordAIDecision(audit: Omit<AIDecisionAudit, "id">) {
    const record: AIDecisionAudit = { ...audit, id: `ai-dec-${Date.now()}` };
    this.aiDecisions.unshift(record);
    this.record({
      timestamp: audit.decidedAt ?? audit.viewedAt,
      actorId: audit.decidedBy,
      actorRole: "clinician",
      action: audit.decision ? `ai.recommendation.${audit.decision}` : "ai.recommendation.viewed",
      category: audit.decision ? "ai-decision" : "ai-view",
      resourceType: "ai-recommendation",
      resourceId: audit.recommendationId,
      patientId: audit.patientId,
      outcome: "success",
      source: "clinical-ai",
    });
    return record;
  }

  async aggregateFromPhases(): Promise<UnifiedAuditEvent[]> {
    const aggregated = [...this.events];

    try {
      const { getImagingAccessControl } = await import("../../imaging/security/ImagingAccessControl");
      for (const e of getImagingAccessControl().getAuditLog()) {
        aggregated.push({
          id: e.id,
          timestamp: e.timestamp,
          actorId: e.actorId,
          actorRole: "clinician",
          action: e.action,
          category: "imaging",
          resourceType: e.resourceType,
          resourceId: e.resourceId,
          patientId: e.patientId,
          outcome: "success",
          source: "imaging",
          immutable: true,
        });
      }
    } catch { /* optional */ }

    try {
      const { getLaboratoryAccessControl } = await import("../../laboratory/security/LaboratoryAccessControl");
      for (const e of getLaboratoryAccessControl().getAuditLog()) {
        aggregated.push({
          id: e.id,
          timestamp: e.timestamp,
          actorId: e.actorId,
          actorRole: "clinician",
          action: e.action,
          category: "laboratory",
          resourceType: e.resourceType,
          resourceId: e.resourceId,
          patientId: e.patientId,
          outcome: "success",
          source: "laboratory",
          immutable: true,
        });
      }
    } catch { /* optional */ }

    try {
      const { getHISAccessControl } = await import("../../his/security/HISAccessControl");
      for (const e of getHISAccessControl().getAuditLog()) {
        aggregated.push({
          id: e.id,
          timestamp: e.timestamp,
          actorId: e.actorId,
          actorRole: "clinician",
          action: e.action,
          category: "patient-access",
          resourceType: e.resourceType,
          resourceId: e.resourceId,
          patientId: e.patientId,
          outcome: "success",
          source: "his",
          immutable: true,
        });
      }
    } catch { /* optional */ }

    try {
      const { getMultiAgentAccessControl } = await import("../../multi-agent/security/MultiAgentAccessControl");
      for (const e of getMultiAgentAccessControl().getAuditLog()) {
        aggregated.push({
          id: e.id,
          timestamp: e.timestamp,
          actorId: e.actorId,
          actorRole: "clinician",
          action: e.action,
          category: "ai-view",
          resourceType: e.resourceType,
          resourceId: e.resourceId,
          patientId: e.patientId,
          outcome: "success",
          source: "multi-agent",
          immutable: true,
        });
      }
    } catch { /* optional */ }

    return aggregated.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  query(filters: { patientId?: string; category?: UnifiedAuditEvent["category"]; since?: string }) {
    let list = this.events;
    if (filters.patientId) list = list.filter((e) => e.patientId === filters.patientId);
    if (filters.category) list = list.filter((e) => e.category === filters.category);
    if (filters.since) list = list.filter((e) => e.timestamp >= filters.since!);
    return list;
  }

  getAIDecisions(patientId?: string) {
    return patientId ? this.aiDecisions.filter((d) => d.patientId === patientId) : this.aiDecisions;
  }
}

let service: AuditAggregationService | null = null;

export function getAuditAggregationService() {
  if (!service) service = new AuditAggregationService();
  return service;
}
