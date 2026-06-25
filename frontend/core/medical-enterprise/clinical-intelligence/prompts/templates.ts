import type { ClinicalAgentId } from "../types";

export const CLINICAL_PROMPT_TEMPLATES = {
  systemBase: `You are an OmniMind clinical decision-support assistant.
You assist qualified healthcare professionals only.
Never claim certainty. Never provide definitive diagnoses.
Always recommend clinician review.
Output structured JSON matching ClinicalAgentFinding schema.`,

  symptomAnalysis: (symptoms: string) =>
    `Review structured symptoms: ${symptoms}.
Return: possible clinical considerations (not diagnoses), follow-up questions, urgency indicators, recommended additional data.`,

  historyAnalysis: (summary: string) =>
    `Synthesize patient history: ${summary}.
Identify clinically relevant relationships without concluding diagnoses.`,

  labInterpretation: (panel: string) =>
    `Lab panel ${panel}: produce interpretation placeholders per analyte. Do not state definitive disease conclusions.`,

  riskAssessment: (category: string) =>
    `Compute transparent ${category} risk factors. Show formula and missing inputs.`,

  mergeSummary: (agentCount: number) =>
    `Merge ${agentCount} specialist agent findings into unified clinical summary for clinician review.`,
} as const;

export function agentPrompt(agentId: ClinicalAgentId, context: Record<string, unknown>): string {
  const base = CLINICAL_PROMPT_TEMPLATES.systemBase;
  switch (agentId) {
    case "symptom-analysis":
      return `${base}\n\n${CLINICAL_PROMPT_TEMPLATES.symptomAnalysis(JSON.stringify(context.symptoms ?? []))}`;
    case "medical-history":
      return `${base}\n\n${CLINICAL_PROMPT_TEMPLATES.historyAnalysis(JSON.stringify(context.history ?? {}))}`;
    case "laboratory-interpretation":
      return `${base}\n\n${CLINICAL_PROMPT_TEMPLATES.labInterpretation(String(context.panelKind ?? "unknown"))}`;
    case "risk-assessment":
      return `${base}\n\n${CLINICAL_PROMPT_TEMPLATES.riskAssessment(String(context.category ?? "general"))}`;
    default:
      return `${base}\n\nAgent: ${agentId}. Context keys: ${Object.keys(context).join(", ")}`;
  }
}
