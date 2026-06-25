# OmniMind Medical Clinical Intelligence Engine (Phase 2)

**Module:** `core/medical-enterprise/clinical-intelligence/`  
**Tool:** `medical-diagnostic-suite`  
**Integration:** OmniMind Brain 2.0, Distributed Task Orchestrator, Medical Enterprise Suite

> AI-assisted clinical decision support for qualified healthcare professionals. Does not replace licensed medical judgment. No definitive diagnoses are generated.

---

## 1. Architecture Overview

```
ClinicalIntelligenceRequest
        ↓
ClinicalReasoningPipeline
   ├─ RBAC (ai:request permission)
   ├─ InferenceCache (TTL)
   ├─ ReasoningAuditStore (replay)
   ├─ ClinicalBrainBridge → OmniMind Brain / Memory
   └─ DistributedTaskOrchestrator (parallel agents)
        ↓
MedicalAgentRunner (12 specialist agents)
   ├─ Symptom / History / Vitals
   ├─ Lab Analyzer Registry (10 panel types)
   ├─ Risk Engine (5 transparent scorers)
   ├─ Guideline Engine (plugin registry)
   └─ Radiology / Med Safety / Documentation / Literature
        ↓
ClinicalResultMerger → ClinicalAIResponse
```

---

## 2. Medical AI Agents (12)

| Agent ID | Name | Required Inputs |
|----------|------|-----------------|
| `symptom-analysis` | Symptom Analysis Agent | symptoms |
| `medical-history` | Medical History Agent | history |
| `vital-signs` | Vital Signs Agent | vitals |
| `laboratory-interpretation` | Laboratory Interpretation Agent | labs |
| `radiology-assistant` | Radiology Assistant | imaging |
| `medication-safety` | Medication Safety Agent | medications, history |
| `drug-interaction` | Drug Interaction Agent | medications |
| `clinical-guideline` | Clinical Guideline Agent | symptoms, history |
| `risk-assessment` | Risk Assessment Agent | history, vitals, labs |
| `follow-up-recommendation` | Follow-up Recommendation Agent | symptoms |
| `medical-documentation` | Medical Documentation Agent | history, symptoms |
| `medical-literature` | Medical Literature Agent | symptoms, history |

Registry: `agents/MedicalAgentRegistry.ts`

---

## 3. Standard AI Output Format

Every merged response (`ClinicalAIResponse`) includes:

| Field | Description |
|-------|-------------|
| `summary` | Unified clinical summary |
| `supportingEvidence` | Deduplicated evidence sources |
| `confidence` | Aggregated confidence estimate |
| `missingInformation` | Gaps in available data |
| `suggestedNextQuestions` | Follow-up questions |
| `differentialConsiderations` | Considerations (not diagnoses) |
| `clinicianReviewRequired` | Always `true` |
| `disclaimer` | Legal/clinical disclaimer |
| `agentFindings` | Per-agent structured findings |
| `reasoningSteps` | Auditable step log |
| `contributingAgents` | Agent IDs |
| `replayToken` | Replay audit trail |

Per-agent finding (`ClinicalAgentFinding`) adds: `urgencyIndicators`, `recommendedDataCollection`, `structuredData`.

---

## 4. Multi-Agent Orchestration

- **Selection:** `selectAgentsForRequest()` based on available inputs
- **Parallel execution:** Agents with `parallelSafe: true` via `DistributedTaskOrchestrator`
- **Sequential:** `risk-assessment` runs after parallel batch when configured
- **Merge:** `ClinicalResultMerger` deduplicates evidence and aggregates confidence
- **Brain:** `ClinicalBrainBridge` pins session to global memory, notifies Brain 2.0, finalizes summary

---

## 5. Symptom Analysis

**Catalog:** `symptoms/symptom-catalog.ts` — Pain, Fever, Cough, Fatigue, SOB, Weight loss, Headache, Dizziness, Nausea, Skin changes

**Input:** `StructuredSymptomReport` with severity, duration, onset, aggravating/relieving factors

**Output scaffolding:**
- Possible clinical considerations (non-diagnostic)
- Suggested follow-up questions
- Urgency indicators (e.g. severe symptoms flagged for clinician assessment)
- Recommended additional data collection

---

## 6. Lab Interpretation Architecture

**Registry:** `labs/LabAnalyzerRegistry.ts`

| Panel | Analytes (template) |
|-------|---------------------|
| CBC | WBC, RBC, Hgb, Hct, Platelets |
| CMP | Na, K, Cl, CO2, BUN, Cr, Glucose |
| Lipid | TC, LDL, HDL, TG |
| Liver function | ALT, AST, ALP, Bilirubin, Albumin |
| Kidney function | Cr, BUN, eGFR, Cystatin C |
| Blood glucose | Fasting glucose |
| HbA1c | HbA1c |
| Thyroid | TSH, Free T4, Free T3 |
| Inflammatory | CRP, ESR, Procalcitonin |
| Urinalysis | Color, Protein, Glucose, etc. |

Each analyte returns `interpretationSlots` with status `pending-review | requires-context | within-reference` — **no hardcoded disease conclusions**.

Register custom analyzers: `getLabAnalyzerRegistry().register(kind, fn)`

---

## 7. Risk Engine

**File:** `risk/RiskEngine.ts`

Transparent weighted scoring (not predictive diagnosis):

| Category | Factors |
|----------|---------|
| Cardiovascular | HTN history, HR, smoking, family CVD |
| Diabetes | Family DM, glucose/HbA1c flags |
| Infection | Fever symptom, temperature, CRP |
| Respiratory | SOB, SpO2, cough |
| Neurological | Headache, dizziness, severe headache |

Each result includes: `score`, `maxScore`, `level`, `factors[]`, `transparentFormula`, `missingInputs[]`

---

## 8. Clinical Guidelines

**File:** `guidelines/GuidelineEngine.ts`

Plugin interface (`GuidelinePlugin`):
- `applicableWhen(context)` — predicate
- `retrieve(context)` — async guideline references

Built-in templates: hypertension screening, respiratory symptoms

Register updates without core changes: `getGuidelineEngine().register(plugin)`

---

## 9. Auditability

**Store:** `audit/ReasoningAuditStore.ts`

- Records every `ReasoningStep` with agent ID, timestamp, duration
- Stores full `ClinicalAIResponse` on completion
- **Replay:** `clinicalIntelligenceService.replay(replayToken)`

---

## 10. Performance

| Feature | Implementation |
|---------|----------------|
| Streaming | `pipeline.stream()` async generator |
| Parallel agents | Brain `DistributedTaskOrchestrator` |
| Caching | `InferenceCache` (5 min TTL) |
| Background | `aiEngineRegistry.queueAnalysis()` fire-and-forget |

---

## 11. Security

- **RBAC:** `hasMedicalPermission(role, 'ai:request')` before pipeline runs
- **PHI:** In-memory audit store — replace with encrypted backend in production
- **Audit:** Session records with requester role; integrates with enterprise `auditService`

---

## 12. API Contracts

Extended in `lib/medical-enterprise/api-contracts.ts`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/medical-enterprise/clinical-intelligence/analyze` | POST | Full analysis |
| `/api/v1/medical-enterprise/clinical-intelligence/replay/:token` | GET | Replay reasoning |
| `/api/v1/medical-enterprise/clinical-intelligence/agents` | GET | List agents |

---

## 13. Database Models

`core/medical-enterprise/models/clinical-ai.ts`:

- `ClinicalAISessionRecord`
- `ClinicalAIJobRecord`
- `ClinicalReasoningReplayRecord`

---

## 14. Developer Usage

```typescript
import { clinicalIntelligenceService } from "@/core/medical-enterprise/clinical-intelligence";

const response = await clinicalIntelligenceService.analyze({
  patientId: "pt-001",
  requesterRole: "physician",
  symptoms: {
    symptoms: [{ id: "fever", label: "Fever", severity: "moderate" }],
  },
  history: {
    pastDiagnoses: ["Essential hypertension"],
    familyHistory: ["Diabetes (father)"],
    surgeries: [],
    allergies: ["Penicillin"],
    currentMedications: ["Lisinopril 10mg"],
    lifestyleFactors: [],
  },
});

// Streaming
for await (const event of clinicalIntelligenceService.stream({ ... })) {
  if (event.type === "agent-finding") console.log(event.finding.summary);
}

// React hook (no UI changes required)
import { useClinicalIntelligence } from "@/lib/medical-enterprise/use-clinical-intelligence";
```

---

## 15. Prompt Templates

`prompts/templates.ts` — system prompts enforcing:
- No certainty claims
- No definitive diagnoses
- Clinician review required
- Structured JSON output contract

---

## 16. Future Phases

| Phase | Work |
|-------|------|
| Phase 3 | Wire right sidebar UI to `useClinicalIntelligence` |
| Phase 4 | FastAPI backend + encrypted audit persistence |
| Phase 5 | LLM-backed agents with same output schema |
| Phase 6 | DICOM/PACS + pharmacy interaction DB |

---

*OmniMind V12 — Clinical Intelligence Engine — enterprise architecture for clinician-supervised AI.*
