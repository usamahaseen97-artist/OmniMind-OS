/** Canonical symptom catalog for structured intake */
export const SYMPTOM_CATALOG = [
  { id: "pain", label: "Pain" },
  { id: "fever", label: "Fever" },
  { id: "cough", label: "Cough" },
  { id: "fatigue", label: "Fatigue" },
  { id: "shortness-of-breath", label: "Shortness of breath" },
  { id: "weight-loss", label: "Weight loss" },
  { id: "headache", label: "Headache" },
  { id: "dizziness", label: "Dizziness" },
  { id: "nausea", label: "Nausea" },
  { id: "skin-changes", label: "Skin changes" },
] as const;

export type CatalogSymptomId = (typeof SYMPTOM_CATALOG)[number]["id"];
