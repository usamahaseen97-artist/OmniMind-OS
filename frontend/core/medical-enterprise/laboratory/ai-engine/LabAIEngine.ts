import type { LabReport, LabResultValue, LabAIObservation, LaboratoryPanelKind } from "../types";
import { LABORATORY_AI_DISCLAIMER } from "../types";
import { getPanelRegistry } from "../panels/registry";
import { getLabAnalyzerRegistry } from "../../clinical-intelligence/labs/LabAnalyzerRegistry";
import type { LabPanelKind, LabPanelInput } from "../../clinical-intelligence/types";

/** Maps Phase 4 panel kinds to Phase 2 LabPanelKind where supported */
function toPhase2Panel(kind: LaboratoryPanelKind): LabPanelKind | null {
  const map: Partial<Record<LaboratoryPanelKind, LabPanelKind>> = {
    cbc: "cbc", cmp: "cmp", lipid: "lipid", "liver-function": "liver-function",
    "kidney-function": "kidney-function", "blood-glucose": "blood-glucose", hba1c: "hba1c",
    thyroid: "thyroid", "inflammatory-markers": "inflammatory-markers", urinalysis: "urinalysis",
  };
  return map[kind] ?? null;
}

/** Modular lab AI engine — normalizes, flags, observes; never diagnoses */
export class LabAIEngine {
  private observations = new Map<string, LabAIObservation[]>();

  normalizeValue(value: LabResultValue): LabResultValue {
    const num = typeof value.value === "number" ? value.value : parseFloat(String(value.value));
    const range = getPanelRegistry().getReferenceRange(value.analyte);
    const normalized = { ...value, normalizedValue: isNaN(num) ? undefined : num };

    if (range && !isNaN(num)) {
      if (range.criticalLow !== undefined && num < range.criticalLow) normalized.flag = "critical-low";
      else if (range.criticalHigh !== undefined && num > range.criticalHigh) normalized.flag = "critical-high";
      else if (range.low !== undefined && num < range.low) normalized.flag = "low";
      else if (range.high !== undefined && num > range.high) normalized.flag = "high";
      else normalized.flag = "normal";
      normalized.referenceRange = `${range.low ?? "—"} – ${range.high ?? "—"} ${range.unit ?? ""}`.trim();
      normalized.confidence = 0.85;
    }
    return normalized;
  }

  normalizeReport(report: LabReport): LabReport {
    return { ...report, values: report.values.map((v) => this.normalizeValue(v)) };
  }

  detectCriticalValues(values: LabResultValue[]) {
    return values.filter((v) => v.flag === "critical-low" || v.flag === "critical-high").map((v) => v.analyte);
  }

  async analyze(report: LabReport): Promise<LabAIObservation> {
    const normalized = this.normalizeReport(report);
    const critical = this.detectCriticalValues(normalized.values);
    const flagged = normalized.values.filter((v) => v.flag && v.flag !== "normal" && v.flag !== "unknown").map((v) => v.analyte);

    const phase2Kind = toPhase2Panel(report.panelKind);
    let summary = `Panel ${report.panelKind}: ${flagged.length} value(s) outside reference range for clinician review.`;
    let missingInformation = ["Clinical context", "Prior results for trend comparison"];
    let confidence = { level: "moderate", score: 0.6, rationale: "Reference range comparison only" };

    if (phase2Kind) {
      const panelInput: LabPanelInput = {
        kind: phase2Kind,
        collectedAt: report.collectedAt,
        values: normalized.values.map((v) => ({
          analyte: v.analyte,
          value: v.value,
          unit: v.unit,
          referenceRange: v.referenceRange,
          flag: v.flag === "critical-low" || v.flag === "critical-high" ? "critical" : v.flag === "low" ? "low" : v.flag === "high" ? "high" : v.flag === "normal" ? "normal" : "unknown",
        })),
      };
      const placeholder = getLabAnalyzerRegistry().analyze(panelInput);
      summary = placeholder.summary;
      missingInformation = placeholder.missingContext;
      confidence = placeholder.confidence;
    }

    const observation: LabAIObservation = {
      id: `lab-ai-${Date.now()}`,
      reportId: report.id,
      patientId: report.patientId,
      panelKind: report.panelKind,
      summary,
      flaggedAnalytes: flagged,
      criticalValues: critical,
      trendNotes: [],
      missingInformation,
      suggestedDataCollection: ["Repeat test if clinically indicated", "Correlate with symptoms and medications"],
      confidence,
      clinicianReviewRequired: true,
      createdAt: new Date().toISOString(),
    };

    const existing = this.observations.get(report.id) ?? [];
    existing.unshift(observation);
    this.observations.set(report.id, existing);
    return observation;
  }

  getObservations(reportId: string) {
    return this.observations.get(reportId) ?? [];
  }

  getObservationsByPatient(patientId: string) {
    const all: LabAIObservation[] = [];
    for (const obs of this.observations.values()) {
      all.push(...obs.filter((o) => o.patientId === patientId));
    }
    return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getDisclaimer() {
    return LABORATORY_AI_DISCLAIMER;
  }
}

let engine: LabAIEngine | null = null;

export function getLabAIEngine() {
  if (!engine) engine = new LabAIEngine();
  return engine;
}
