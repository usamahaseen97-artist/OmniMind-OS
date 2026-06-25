import type { RiskCategory, RiskScoreResult, ClinicalIntelligenceRequest } from "../types";

export type RiskScorer = {
  category: RiskCategory;
  maxScore: number;
  formula: string;
  score: (req: ClinicalIntelligenceRequest) => RiskScoreResult;
};

function tier(score: number, max: number): RiskScoreResult["level"] {
  const pct = score / max;
  if (pct >= 0.75) return "high";
  if (pct >= 0.5) return "elevated";
  if (pct >= 0.25) return "moderate";
  return "low";
}

const cardiovascularScorer: RiskScorer = {
  category: "cardiovascular",
  maxScore: 10,
  formula: "sum(factor.weight * present) / maxScore",
  score(req) {
    const factors = [
      { id: "htn", label: "Hypertension history", weight: 2, present: req.history?.pastDiagnoses.some((d) => /hypertension/i.test(d)) ?? false },
      { id: "hr-elevated", label: "Elevated heart rate", weight: 1, present: (req.vitals?.heartRate ?? 0) > 100 },
      { id: "smoking", label: "Smoking (lifestyle)", weight: 2, present: req.history?.lifestyleFactors.some((f) => /smok/i.test(f)) ?? false },
      { id: "family-cvd", label: "Family CVD", weight: 2, present: req.history?.familyHistory.some((f) => /heart|cardiac|stroke/i.test(f)) ?? false },
    ];
    const score = factors.reduce((s, f) => s + (f.present ? f.weight : 0), 0);
    return {
      category: "cardiovascular",
      score,
      maxScore: 10,
      level: tier(score, 10),
      factors,
      transparentFormula: "cardiovascular: weighted factor sum (transparent, not Framingham)",
      missingInputs: !req.vitals?.heartRate ? ["Resting heart rate"] : [],
    };
  },
};

const diabetesScorer: RiskScorer = {
  category: "diabetes",
  maxScore: 8,
  formula: "sum(factor.weight * present) / maxScore",
  score(req) {
    const factors = [
      { id: "family-dm", label: "Family diabetes", weight: 2, present: req.history?.familyHistory.some((f) => /diabetes/i.test(f)) ?? false },
      { id: "glucose-flag", label: "Glucose lab flag", weight: 3, present: req.labPanels?.some((p) => p.values.some((v) => v.analyte.toLowerCase().includes("glucose") && v.flag === "high")) ?? false },
      { id: "hba1c-flag", label: "HbA1c flag", weight: 3, present: req.labPanels?.some((p) => p.kind === "hba1c" && p.values.some((v) => v.flag === "high")) ?? false },
    ];
    const score = factors.reduce((s, f) => s + (f.present ? f.weight : 0), 0);
    return {
      category: "diabetes",
      score,
      maxScore: 8,
      level: tier(score, 8),
      factors,
      transparentFormula: "diabetes: weighted lifestyle and lab flags",
      missingInputs: !req.labPanels?.length ? ["Fasting glucose or HbA1c"] : [],
    };
  },
};

const infectionScorer: RiskScorer = {
  category: "infection",
  maxScore: 6,
  formula: "symptom + vital flags",
  score(req) {
    const fever = req.symptoms?.symptoms.some((s) => /fever/i.test(s.label)) ?? false;
    const elevatedTemp = (req.vitals?.temperatureC ?? 36) >= 38;
    const factors = [
      { id: "fever-symptom", label: "Fever reported", weight: 2, present: fever },
      { id: "temp-elevated", label: "Elevated temperature", weight: 2, present: elevatedTemp },
      { id: "crp-high", label: "CRP elevated", weight: 2, present: req.labPanels?.some((p) => p.values.some((v) => v.analyte === "CRP" && v.flag === "high")) ?? false },
    ];
    const score = factors.reduce((s, f) => s + (f.present ? f.weight : 0), 0);
    return {
      category: "infection",
      score,
      maxScore: 6,
      level: tier(score, 6),
      factors,
      transparentFormula: "infection: symptom and inflammatory marker flags",
      missingInputs: [],
    };
  },
};

const respiratoryScorer: RiskScorer = {
  category: "respiratory",
  maxScore: 6,
  formula: "respiratory symptom + SpO2 flags",
  score(req) {
    const sob = req.symptoms?.symptoms.some((s) => /breath|dyspnea/i.test(s.label)) ?? false;
    const lowSpO2 = (req.vitals?.spO2 ?? 100) < 94;
    const factors = [
      { id: "sob", label: "Shortness of breath", weight: 2, present: sob },
      { id: "spo2", label: "Low SpO2", weight: 3, present: lowSpO2 },
      { id: "cough", label: "Cough", weight: 1, present: req.symptoms?.symptoms.some((s) => /cough/i.test(s.label)) ?? false },
    ];
    const score = factors.reduce((s, f) => s + (f.present ? f.weight : 0), 0);
    return {
      category: "respiratory",
      score,
      maxScore: 6,
      level: tier(score, 6),
      factors,
      transparentFormula: "respiratory: symptom and oxygenation flags",
      missingInputs: !req.vitals?.spO2 ? ["Pulse oximetry"] : [],
    };
  },
};

const neurologicalScorer: RiskScorer = {
  category: "neurological",
  maxScore: 6,
  formula: "neuro warning symptom flags",
  score(req) {
    const factors = [
      { id: "headache", label: "Headache", weight: 1, present: req.symptoms?.symptoms.some((s) => /headache/i.test(s.label)) ?? false },
      { id: "dizziness", label: "Dizziness", weight: 2, present: req.symptoms?.symptoms.some((s) => /dizz/i.test(s.label)) ?? false },
      { id: "severe-headache", label: "Severe headache", weight: 3, present: req.symptoms?.symptoms.some((s) => /headache/i.test(s.label) && s.severity === "severe") ?? false },
    ];
    const score = factors.reduce((s, f) => s + (f.present ? f.weight : 0), 0);
    return {
      category: "neurological",
      score,
      maxScore: 6,
      level: tier(score, 6),
      factors,
      transparentFormula: "neurological: warning sign scaffolding only",
      missingInputs: ["Neurological examination findings"],
    };
  },
};

/** Transparent configurable risk engine */
export class ClinicalRiskEngine {
  private scorers: RiskScorer[] = [
    cardiovascularScorer,
    diabetesScorer,
    infectionScorer,
    respiratoryScorer,
    neurologicalScorer,
  ];

  registerScorer(scorer: RiskScorer) {
    this.scorers.push(scorer);
  }

  evaluate(req: ClinicalIntelligenceRequest, categories?: RiskCategory[]): RiskScoreResult[] {
    const pool = categories?.length
      ? this.scorers.filter((s) => categories.includes(s.category))
      : this.scorers;
    return pool.map((s) => s.score(req));
  }
}

let engine: ClinicalRiskEngine | null = null;

export function getClinicalRiskEngine(): ClinicalRiskEngine {
  if (!engine) engine = new ClinicalRiskEngine();
  return engine;
}
