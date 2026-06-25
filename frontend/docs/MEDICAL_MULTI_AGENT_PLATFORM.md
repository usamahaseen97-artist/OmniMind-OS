# Medical Multi-Agent Intelligence Platform — Phase 5

**Module:** `core/medical-enterprise/multi-agent/`  
**UI:** `components/medical-enterprise/multi-agent/` (standalone — does not modify Phase 1 workspace)  
**Backend:** `backend/routers/medical_enterprise_multi_agent.py`

> Coordinates specialized medical AI agents via OmniMind Brain. Clinical decision-support only — not an autonomous doctor.

---

## 1. Architecture

```
Clinician Request → MultiAgentOrchestrator → Phase 2 Clinical Intelligence Pipeline
                              ↓
              AgentCollaborationEngine (voting, conflicts, consensus)
                              ↓
    DecisionSupport · Conversation · Voice · Interview · Documentation
                              ↓
         Brain Memory + Phase 3 Imaging + Phase 4 Laboratory context
```

---

## 2. Medical Agents (15)

| Agent | Phase 2 Delegate |
|-------|------------------|
| Chief Medical Coordinator | Orchestrator (meta) |
| Symptom Analysis | `symptom-analysis` |
| Medical History | `medical-history` |
| Vital Signs | `vital-signs` |
| Laboratory | `laboratory-interpretation` |
| Radiology | `radiology-assistant` |
| Medication Safety | `medication-safety` |
| Drug Interaction | `drug-interaction` |
| Clinical Guideline | `clinical-guideline` |
| Risk Assessment | `risk-assessment` |
| Emergency Triage | Phase 5 scaffold |
| Follow-up Planning | `follow-up-recommendation` |
| Medical Documentation | `medical-documentation` |
| Medical Literature | `medical-literature` |
| Hospital Workflow | Phase 5 scaffold |

Registry: `multi-agent/agents/ExtendedAgentRegistry.ts`

---

## 3. Multi-Agent Collaboration

**Engine:** `orchestration/AgentCollaborationEngine.ts`

| Capability | Support |
|------------|---------|
| Parallel reasoning | Via Phase 2 pipeline |
| Sequential reasoning | Risk agent + coordinator |
| Agent voting | `collectVotes()` |
| Conflict detection | `detectConflicts()` |
| Evidence comparison | `compareEvidence()` |
| Confidence aggregation | `buildConsensus()` |
| Clinician escalation | `clinicianEscalationRequired` flag |

---

## 4. Voice Doctor

**File:** `voice/VoiceDoctorService.ts`

- Speech-to-Text / Text-to-Speech provider hooks
- Medical terminology boost
- Multi-language config
- Clinical dictation modes
- Voice commands (`navigate`, `summarize`, `dictate`, `analyze`)
- Noise reduction hook
- Speaker identification flag

---

## 5. Clinical Conversation

**File:** `conversation/ClinicalConversationEngine.ts`

- Follow-up questions
- Finding explanations
- Evidence comparison
- Visit summaries
- Encrypted message storage hooks

---

## 6. Patient Interview

**File:** `interview/PatientInterviewEngine.ts`

Chief complaint, HPI, PMH, family/social history, medications, allergies, ROS, risk factors.

---

## 7. Medical Knowledge Engine

**File:** `knowledge/MedicalKnowledgeEngine.ts`

Guidelines, textbooks, hospital protocols, research papers, institution-specific knowledge, versioned updates, citations.

---

## 8. Decision Support

**File:** `decision-support/DecisionSupportEngine.ts`

Suggested questions, missing information, investigations, monitoring, referrals, risk indicators. **No definitive diagnoses.**

---

## 9. Documentation

**File:** `conversation/ClinicalDocumentationEngine.ts`

SOAP notes, clinical notes, consultation notes, referral letters, discharge summaries, follow-up plans, progress notes, medical reports. **Clinician approval required.**

---

## 10. Database Models

`DbMultiAgentSession`, `DbConversationSession`, `DbDocumentationDraft`, `DbInterviewSession`, `DbVoiceTranscript`, `DbMultiAgentAuditEntry`

---

## 11. API

**Base:** `/api/v1/medical-enterprise/multi-agent`

| Endpoint | Method |
|----------|--------|
| `/agents` | GET |
| `/run` | POST |
| `/conversations` | POST |
| `/messages` | POST |
| `/documents` | POST |
| `/knowledge/search` | POST |
| `/interview` | POST |
| `/voice/start` | POST |
| `/replay/:token` | GET |

---

## 12. Integration

| System | Integration |
|--------|-------------|
| Phase 2 Clinical AI | `clinicalIntelligenceService.analyze()` — not duplicated |
| Phase 3 Imaging | `MultiAgentBrainBridge.enrichContextFromPhases()` |
| Phase 4 Laboratory | Lab report context in Brain memory |
| OmniMind Brain | `pinMultiAgentSession`, `finalize` |
| Memory Engine | Conversation + session notes |

---

## 13. Usage

```typescript
import { medicalMultiAgentPlatform } from "@/core/medical-enterprise/multi-agent";
import { MultiAgentWorkspace } from "@/components/medical-enterprise/multi-agent";
import { useMedicalMultiAgent } from "@/lib/medical-enterprise/use-medical-multi-agent";
```

```tsx
<MultiAgentWorkspace patientId="patient-001" role="physician" />
```

---

## Related Docs

| Phase | Document |
|-------|----------|
| Phase 1 | `MEDICAL_ENTERPRISE_ARCHITECTURE.md` |
| Phase 2 | `MEDICAL_CLINICAL_INTELLIGENCE.md` |
| Phase 3 | `MEDICAL_IMAGING_PLATFORM.md` |
| Phase 4 | `MEDICAL_LABORATORY_PLATFORM.md` |
