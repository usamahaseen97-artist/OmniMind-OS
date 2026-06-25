import type { InteropConnector, InteropSystem } from "../types";

/** Interoperability hub — FHIR, HL7, hospital APIs */
export class InteropHub {
  private connectors = new Map<string, InteropConnector>();

  constructor() {
    const defaults: Omit<InteropConnector, "id">[] = [
      { system: "fhir", name: "FHIR R4 Connector", enabled: true },
      { system: "hl7", name: "HL7 v2.x Connector", enabled: true },
      { system: "hospital-api", name: "Hospital REST API", enabled: false },
      { system: "lab-system", name: "Laboratory LIS", enabled: true },
      { system: "radiology", name: "Radiology PACS/RIS", enabled: true },
      { system: "pharmacy", name: "Pharmacy System", enabled: true },
      { system: "insurance", name: "Insurance Clearinghouse", enabled: false },
      { system: "government-health", name: "Government Health Registry", enabled: false },
    ];
    for (const d of defaults) {
      const c: InteropConnector = { ...d, id: `interop-${d.system}` };
      this.connectors.set(c.id, c);
    }
  }

  list() {
    return [...this.connectors.values()];
  }

  get(system: InteropSystem) {
    return [...this.connectors.values()].find((c) => c.system === system);
  }

  register(connector: InteropConnector) {
    this.connectors.set(connector.id, connector);
    return connector;
  }

  async sync(connectorId: string) {
    const c = this.connectors.get(connectorId);
    if (!c) throw new Error("Connector not found");
    c.lastSyncAt = new Date().toISOString();
    return { connector: c, recordsProcessed: 0 };
  }

  /** FHIR Patient export stub */
  exportFHIRPatient(patientId: string) {
    return { resourceType: "Patient", id: patientId, meta: { versionId: "1" } };
  }

  /** HL7 ADT message stub */
  exportHL7ADT(patientId: string, event: string) {
    return `MSH|^~\\&|OmniMind|HIS|External|System|${new Date().toISOString()}||ADT^${event}|${Date.now()}|P|2.5\rPID|1||${patientId}`;
  }
}

let hub: InteropHub | null = null;

export function getInteropHub() {
  if (!hub) hub = new InteropHub();
  return hub;
}
