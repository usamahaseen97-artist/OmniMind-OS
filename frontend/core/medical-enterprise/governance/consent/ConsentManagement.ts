import type { PatientConsent, ConsentType, ConsentHistoryEntry } from "../types";

/** Patient consent management architecture */
export class ConsentManagement {
  private consents = new Map<string, PatientConsent>();
  private history: ConsentHistoryEntry[] = [];

  grant(input: Omit<PatientConsent, "id" | "status" | "version" | "grantedAt"> & { grantedBy?: string }) {
    const consent: PatientConsent = {
      ...input,
      id: `consent-${Date.now()}`,
      status: "active",
      version: 1,
      grantedAt: new Date().toISOString(),
    };
    this.consents.set(consent.id, consent);
    this.history.push({
      consentId: consent.id,
      patientId: consent.patientId,
      action: "granted",
      timestamp: consent.grantedAt,
      actorId: input.grantedBy ?? "system",
    });
    return consent;
  }

  withdraw(consentId: string, actorId: string) {
    const consent = this.consents.get(consentId);
    if (!consent) throw new Error("Consent not found");
    consent.status = "withdrawn";
    consent.withdrawnAt = new Date().toISOString();
    this.history.push({
      consentId,
      patientId: consent.patientId,
      action: "withdrawn",
      timestamp: consent.withdrawnAt,
      actorId,
    });
    return consent;
  }

  isConsented(patientId: string, type: ConsentType): boolean {
    return [...this.consents.values()].some(
      (c) => c.patientId === patientId && c.type === type && c.status === "active" && (!c.expiresAt || new Date(c.expiresAt) > new Date()),
    );
  }

  getPatientConsents(patientId: string) {
    return [...this.consents.values()].filter((c) => c.patientId === patientId);
  }

  getHistory(patientId: string) {
    return this.history.filter((h) => h.patientId === patientId);
  }

  checkAccess(patientId: string, type: ConsentType, action: string) {
    const consented = this.isConsented(patientId, type);
    return { allowed: consented, reason: consented ? undefined : `Missing active ${type} consent for ${action}` };
  }
}

let cm: ConsentManagement | null = null;

export function getConsentManagement() {
  if (!cm) cm = new ConsentManagement();
  return cm;
}
