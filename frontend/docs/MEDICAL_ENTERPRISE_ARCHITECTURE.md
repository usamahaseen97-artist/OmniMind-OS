# OmniMind Medical Diagnostic Enterprise Suite

**Slug:** `medical-diagnostic-suite`  
**Route:** `/medical-diagnostic-suite`  
**Version:** 1.0.0 (architecture phase)

> Clinical decision-support for qualified healthcare professionals. Does not replace licensed medical judgment.

This document describes the enterprise architecture for the flagship medical workspace inside OmniMind V12. **No diagnosis logic or AI interpretation is implemented** in this phase — the module provides hospital-grade UI, data contracts, service stubs, and integration hooks for future medical AI engines.

---

## 1. Workspace Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ MedicalTopHeader — Global search · Patient search · Emergency · AI · Devices │
├──────────┬──────────────────────────────────────────────────────┬───────────┤
│          │ ClinicalWorkflowStrip (11-step encounter workflow)      │           │
│ Medical  ├──────────────────────────────────────────────────────┤  Medical  │
│ Left     │ Tab bar · View modes (single/split/compare/timeline)  │  Right    │
│ Sidebar  ├──────────────────────────────────────────────────────┤  Sidebar  │
│ (15 nav) │ MedicalCenterWorkspace — patient charts, imaging,     │ (AI slots)│
│          │ records grid, report editor placeholders              │           │
├──────────┴──────────────────────────────────────────────────────┴───────────┤
│ MedicalBottomPanel — Activity · AI timeline · Devices · Queues · Events    │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Layout engine:** `TriplePanelResizeShell` (resizable left / center / right) + fixed header and bottom panel.

**Provider:** `MedicalEnterpriseProvider` (`lib/medical-enterprise/context.tsx`) holds UI state, sample patients, audit log, theme, emergency mode, tabs, and workflow step.

**Boot:** `MedicalEnterpriseWorkspace` registers with OmniMind SDK on mount via `MEDICAL_ENTERPRISE_SDK_MANIFEST`.

---

## 2. Navigation System

### Left sidebar (15 sections)

| ID | Label |
|----|-------|
| `patient-dashboard` | Patient Dashboard |
| `patient-list` | Patient List |
| `appointments` | Appointments |
| `medical-history` | Medical History |
| `lab-reports` | Lab Reports |
| `radiology` | Radiology |
| `vital-signs` | Vital Signs |
| `clinical-notes` | Clinical Notes |
| `prescriptions` | Prescriptions |
| `medications` | Medications |
| `imaging` | Imaging |
| `ai-assistant` | AI Assistant |
| `knowledge-base` | Knowledge Base |
| `medical-tasks` | Medical Tasks |
| `settings` | Settings |

### Right sidebar (9 clinical-assist sections)

AI Findings, Differential Diagnosis, Risk Indicators, Follow-up Questions, Clinical Guidelines, Lab Interpretation, Medication Warnings, Alerts, Task List — all **placeholder panels** for future engines.

### Bottom panel (6 tabs)

Activity Log, AI Reasoning Timeline, Device Logs, Imaging Queue, Lab Queue, System Events.

### Command palette

`⌘K` / `Ctrl+K` — navigation shortcuts and theme switching.

### OS integration

- Sovereign tool registry: `lib/sovereign-tool-registry.ts`
- OS sidebar category **Medical**: both `medical-diagnostic` and `medical-diagnostic-suite`
- Zone router: dedicated shell bypasses `MedicalStudioShell`

---

## 3. Folder Structure

```
frontend/
├── app/(shell)/medical-diagnostic-suite/
│   └── page.tsx
├── components/medical-enterprise/
│   ├── MedicalEnterpriseWorkspace.tsx
│   ├── layout/
│   │   ├── MedicalWorkspaceLayout.tsx
│   │   ├── MedicalLeftSidebar.tsx
│   │   ├── MedicalTopHeader.tsx
│   │   ├── MedicalCenterWorkspace.tsx
│   │   ├── MedicalRightSidebar.tsx
│   │   ├── MedicalBottomPanel.tsx
│   │   └── MedicalCommandPalette.tsx
│   ├── patient/
│   │   └── PatientProfilePanel.tsx
│   └── workflow/
│       └── ClinicalWorkflowStrip.tsx
├── lib/medical-enterprise/
│   ├── types.ts
│   ├── constants.ts
│   ├── context.tsx
│   ├── api-contracts.ts
│   └── permissions.ts
├── core/medical-enterprise/
│   ├── sdk-manifest.ts
│   ├── models/index.ts
│   └── services/index.ts
└── docs/MEDICAL_ENTERPRISE_ARCHITECTURE.md
```

**Isolation:** Does not modify `components/medical/*` or `medical-diagnostic` agent — parallel sovereign tool.

---

## 4. UI Components

| Component | Responsibility |
|-----------|----------------|
| `MedicalEnterpriseWorkspace` | Entry, SDK registration, provider wrap |
| `MedicalWorkspaceLayout` | Header + triple panel + bottom + command palette |
| `MedicalLeftSidebar` | 15-section clinical navigation |
| `MedicalTopHeader` | Search, emergency mode, AI status, devices, user |
| `MedicalCenterWorkspace` | Tabs, view modes, virtual patient list, imaging placeholder |
| `MedicalRightSidebar` | Future AI / CDS panel slots |
| `MedicalBottomPanel` | Audit log and processing queues |
| `PatientProfilePanel` | Profile sections, timeline, report editor |
| `ClinicalWorkflowStrip` | 11-step encounter workflow UI |

**Design system:** CSS tokens (`--omni-ds-*`, `--medical-*`), responsive breakpoints in `globals.css`. Themes: dark (default), light, high contrast.

**Performance:** `@tanstack/react-virtual` for patient list; incremental patient/timeline loading via service stubs.

---

## 5. Backend Services (stubs)

Located in `core/medical-enterprise/services/`:

| Service | Purpose |
|---------|---------|
| `patientService` | List/get patient profiles |
| `recordsService` | Medical record references by patient |
| `timelineService` | Clinical timeline events |
| `auditService` | Audit log append |
| `aiEngineRegistry` | Engine slots + queue API (no interpretation) |

**Future FastAPI routes** (contracts in `lib/medical-enterprise/api-contracts.ts`):

- `GET /api/v1/medical-enterprise/patients`
- `GET /api/v1/medical-enterprise/patients/:id`
- `GET /api/v1/medical-enterprise/patients/:id/timeline`
- `GET /api/v1/medical-enterprise/patients/:id/records`
- `POST /api/v1/medical-enterprise/ai/analyze` (queued, clinician-reviewed)

---

## 6. Database Models

TypeScript interfaces in `core/medical-enterprise/models/`:

- `PatientRecord`, `ImagingStudy`, `LabResult`, `Prescription`, `ClinicalNote`, `Appointment`

Domain types in `lib/medical-enterprise/types.ts`:

- `PatientProfile`, `MedicalRecordRef`, `ClinicalTimelineEvent`, `ConsentRecord`, `AuditLogEntry`

**Encryption / consent:** architecture flags on models; implementation deferred to backend phase.

---

## 7. API Contracts

See `lib/medical-enterprise/api-contracts.ts` for request/response shapes and `MEDICAL_API_ROUTES` constants.

All AI responses include `disclaimer` field requiring clinician review.

---

## 8. Security Model

**RBAC** (`lib/medical-enterprise/permissions.ts`):

Roles: `physician`, `nurse`, `radiologist`, `pathologist`, `admin`, `researcher`, `viewer`

Permissions: `patient:read/write`, `records:*`, `imaging:*`, `prescriptions:*`, `ai:request/approve`, `audit:read`, `admin:settings`, `emergency:override`

**Audit:** `appendAudit` in context; `auditService` stub; bottom panel activity log.

**Session:** Uses OmniMind `AuthSDK` path when backend connected.

**Consent:** `ConsentRecord` type; API contract `GET /consent/:patientId`.

---

## 9. OmniMind Integration

| System | Integration |
|--------|-------------|
| **Brain** | SDK `autoRegister` → `globalMemory.rememberTool`, `pinNote` |
| **Memory** | Tool history via AutoRegistration |
| **Plugins** | `sovereign-plugins.ts` capabilities + actions |
| **Marketplace** | Analytics download event on register |
| **SDK** | `MEDICAL_ENTERPRISE_SDK_MANIFEST`, `@omnimind/sdk/browser` |
| **Design System** | Shared tokens, enterprise panel styling |
| **Multi-Agent** | Action commands in plugin manifest (future agent routing) |

---

## 10. Scalability Strategy

- **Modular services** — swap stubs for real API clients without UI changes
- **Virtual scrolling** — patient lists scale to large cohorts
- **Event-driven queues** — imaging/lab bottom panels ready for WebSocket workers
- **GPU-ready imaging** — 3D viewer placeholder separated from 2D PACS slot
- **Multi-tab workspace** — multiple patients/reports simultaneously
- **Plugin actions** — `uploadImaging`, `clinicalWorkflow` for Action Engine

---

## 11. Future Expansion Plan

| Phase | Deliverable |
|-------|-------------|
| **Phase 1** (current) | Workspace architecture, navigation, stubs, SDK registration |
| **Phase 2** | FastAPI backend + PostgreSQL models + HL7/FHIR adapters |
| **Phase 3** | DICOM/PACS viewer integration, wearable ingest |
| **Phase 4** | Medical AI engines (imaging copilot, lab interpreter, clinical reasoner) |
| **Phase 5** | FHIR export, institutional SSO, full audit/compliance |
| **Phase 6** | Multi-site deployment, marketplace clinical extensions |

**AI engine slots** (registered, not implemented):

- `imaging-copilot` — radiology assist
- `lab-interpreter` — lab trend analysis
- `clinical-reasoner` — differential assist (clinician-reviewed only)

---

## 12. Clinical Workflow

1. Patient Registration  
2. History Review  
3. Symptom Collection  
4. Clinical Examination Notes  
5. Lab Upload  
6. Imaging Upload  
7. AI Analysis *(future)*  
8. Clinical Review  
9. Treatment Planning  
10. Report Generation  
11. Follow-up  

UI: `ClinicalWorkflowStrip` — step navigation only, no automated clinical decisions.

---

## 13. Medical Record Types Supported (architecture)

Blood, urine, MRI, CT, X-Ray, ultrasound, ECG, EEG, spirometry, pathology, dermatology, dental, ophthalmology, wearable data, manual notes — grid UI in center workspace; ingest pipelines deferred.

---

*OmniMind V12 — Medical Diagnostic Enterprise Suite — architecture foundation for clinical AI.*
