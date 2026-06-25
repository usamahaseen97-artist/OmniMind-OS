import type { LabPanelInput, LabPanelKind, LabInterpretationPlaceholder } from "../types";
import { createLabPlaceholder } from "../agents/MedicalAgentHandlers";

export type LabAnalyzerFn = (panel: LabPanelInput) => LabInterpretationPlaceholder;

const PANEL_ANALYTES: Record<LabPanelKind, string[]> = {
  cbc: ["WBC", "RBC", "Hemoglobin", "Hematocrit", "Platelets"],
  cmp: ["Sodium", "Potassium", "Chloride", "CO2", "BUN", "Creatinine", "Glucose"],
  lipid: ["Total Cholesterol", "LDL", "HDL", "Triglycerides"],
  "liver-function": ["ALT", "AST", "ALP", "Bilirubin", "Albumin"],
  "kidney-function": ["Creatinine", "BUN", "eGFR", "Cystatin C"],
  "blood-glucose": ["Glucose (fasting)"],
  hba1c: ["HbA1c"],
  thyroid: ["TSH", "Free T4", "Free T3"],
  "inflammatory-markers": ["CRP", "ESR", "Procalcitonin"],
  urinalysis: ["Color", "Protein", "Glucose", "Ketones", "Blood", "Leukocytes"],
};

/** Reusable lab analyzer registry — plug-in analyzers without hardcoded conclusions */
export class LabAnalyzerRegistry {
  private analyzers = new Map<LabPanelKind, LabAnalyzerFn>();

  constructor() {
    for (const kind of Object.keys(PANEL_ANALYTES) as LabPanelKind[]) {
      this.register(kind, (panel) => createLabPlaceholder(panel));
    }
  }

  register(kind: LabPanelKind, analyzer: LabAnalyzerFn) {
    this.analyzers.set(kind, analyzer);
  }

  analyze(panel: LabPanelInput) {
    const fn = this.analyzers.get(panel.kind);
    if (!fn) return createLabPlaceholder(panel);
    return fn(panel);
  }

  supportedPanels(): LabPanelKind[] {
    return [...this.analyzers.keys()];
  }

  analyteTemplate(kind: LabPanelKind): string[] {
    return PANEL_ANALYTES[kind] ?? [];
  }
}

let registry: LabAnalyzerRegistry | null = null;

export function getLabAnalyzerRegistry(): LabAnalyzerRegistry {
  if (!registry) registry = new LabAnalyzerRegistry();
  return registry;
}
