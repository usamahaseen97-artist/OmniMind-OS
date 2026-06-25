import type { LaboratoryPanelKind, ReferenceRange } from "../types";

export type PanelDefinition = {
  kind: LaboratoryPanelKind;
  label: string;
  category: "blood" | "urine" | "microbiology" | "pathology" | "genetics" | "custom";
  defaultAnalytes: string[];
  fhirProfile?: string;
  hl7Segment?: string;
};

const PANELS: PanelDefinition[] = [
  { kind: "cbc", label: "Complete Blood Count (CBC)", category: "blood", defaultAnalytes: ["WBC", "RBC", "Hemoglobin", "Hematocrit", "Platelets"] },
  { kind: "cmp", label: "Comprehensive Metabolic Panel (CMP)", category: "blood", defaultAnalytes: ["Sodium", "Potassium", "Chloride", "CO2", "BUN", "Creatinine", "Glucose"] },
  { kind: "lipid", label: "Lipid Profile", category: "blood", defaultAnalytes: ["Total Cholesterol", "LDL", "HDL", "Triglycerides"] },
  { kind: "hba1c", label: "HbA1c", category: "blood", defaultAnalytes: ["HbA1c"] },
  { kind: "blood-glucose", label: "Blood Glucose", category: "blood", defaultAnalytes: ["Glucose (fasting)", "Glucose (random)"] },
  { kind: "liver-function", label: "Liver Function", category: "blood", defaultAnalytes: ["ALT", "AST", "ALP", "Bilirubin", "Albumin"] },
  { kind: "kidney-function", label: "Kidney Function", category: "blood", defaultAnalytes: ["Creatinine", "BUN", "eGFR", "Cystatin C"] },
  { kind: "electrolytes", label: "Electrolytes", category: "blood", defaultAnalytes: ["Sodium", "Potassium", "Chloride", "Bicarbonate", "Calcium", "Magnesium"] },
  { kind: "inflammatory-markers", label: "Inflammatory Markers", category: "blood", defaultAnalytes: ["CRP", "ESR", "Procalcitonin", "Ferritin"] },
  { kind: "coagulation", label: "Coagulation Panel", category: "blood", defaultAnalytes: ["PT", "INR", "aPTT", "Fibrinogen", "D-Dimer"] },
  { kind: "hormones", label: "Hormone Panel", category: "blood", defaultAnalytes: ["Cortisol", "Testosterone", "Estradiol", "FSH", "LH"] },
  { kind: "thyroid", label: "Thyroid Panel", category: "blood", defaultAnalytes: ["TSH", "Free T4", "Free T3"] },
  { kind: "urinalysis", label: "Urinalysis", category: "urine", defaultAnalytes: ["Color", "Protein", "Glucose", "Ketones", "Blood", "Leukocytes"] },
  { kind: "microbiology", label: "Microbiology", category: "microbiology", defaultAnalytes: ["Organism", "Sensitivity", "Culture Result"] },
  { kind: "pathology", label: "Pathology", category: "pathology", defaultAnalytes: ["Specimen", "Diagnosis Slot", "Margins", "Grade"] },
  { kind: "genetics", label: "Genetics", category: "genetics", defaultAnalytes: ["Variant", "Zygosity", "Classification"] },
  { kind: "molecular-diagnostics", label: "Molecular Diagnostics", category: "genetics", defaultAnalytes: ["Target", "Ct Value", "Result"] },
  { kind: "custom-panel", label: "Custom Lab Panel", category: "custom", defaultAnalytes: [] },
];

const DEFAULT_RANGES: ReferenceRange[] = [
  { id: "rr-wbc", analyte: "WBC", panelKind: "cbc", low: 4.5, high: 11.0, criticalLow: 2.0, criticalHigh: 30.0, unit: "10³/µL" },
  { id: "rr-hgb", analyte: "Hemoglobin", panelKind: "cbc", low: 12.0, high: 17.5, criticalLow: 7.0, criticalHigh: 20.0, unit: "g/dL" },
  { id: "rr-glucose", analyte: "Glucose (fasting)", panelKind: "blood-glucose", low: 70, high: 99, criticalLow: 40, criticalHigh: 400, unit: "mg/dL" },
  { id: "rr-potassium", analyte: "Potassium", panelKind: "electrolytes", low: 3.5, high: 5.0, criticalLow: 2.5, criticalHigh: 6.5, unit: "mEq/L" },
  { id: "rr-creatinine", analyte: "Creatinine", panelKind: "kidney-function", low: 0.6, high: 1.2, criticalHigh: 5.0, unit: "mg/dL" },
];

/** Modular laboratory panel registry */
export class PanelRegistry {
  private panels = new Map<LaboratoryPanelKind, PanelDefinition>();
  private ranges = new Map<string, ReferenceRange>();

  constructor() {
    for (const p of PANELS) this.panels.set(p.kind, p);
    for (const r of DEFAULT_RANGES) this.ranges.set(r.analyte.toLowerCase(), r);
  }

  get(kind: LaboratoryPanelKind) {
    return this.panels.get(kind);
  }

  list() {
    return [...this.panels.values()];
  }

  getReferenceRange(analyte: string) {
    return this.ranges.get(analyte.toLowerCase());
  }

  registerRange(range: ReferenceRange) {
    this.ranges.set(range.analyte.toLowerCase(), range);
  }

  registerCustomPanel(def: PanelDefinition) {
    this.panels.set(def.kind, def);
  }
}

let registry: PanelRegistry | null = null;

export function getPanelRegistry() {
  if (!registry) registry = new PanelRegistry();
  return registry;
}
