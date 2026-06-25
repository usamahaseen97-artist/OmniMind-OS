/** OmniMind Medical Diagnostic Enterprise Suite — domain types (no diagnosis logic) */

export type ClinicalRole =
  | "physician"
  | "nurse"
  | "radiologist"
  | "pathologist"
  | "admin"
  | "researcher"
  | "viewer";

export type ThemeMode = "dark" | "light" | "high-contrast";

export type WorkspaceViewMode = "single" | "split" | "comparison" | "timeline";

export type MedicalNavSection =
  | "patient-dashboard"
  | "patient-list"
  | "appointments"
  | "medical-history"
  | "lab-reports"
  | "radiology"
  | "vital-signs"
  | "clinical-notes"
  | "prescriptions"
  | "medications"
  | "imaging"
  | "ai-assistant"
  | "knowledge-base"
  | "medical-tasks"
  | "settings";

export type BottomPanelTab =
  | "activity-log"
  | "ai-reasoning"
  | "device-logs"
  | "imaging-queue"
  | "lab-queue"
  | "system-events";

export type RightPanelSection =
  | "ai-findings"
  | "differential"
  | "risk"
  | "follow-up"
  | "guidelines"
  | "lab-interpretation"
  | "medication-warnings"
  | "alerts"
  | "tasks";

export type MedicalRecordKind =
  | "blood-test"
  | "urine-test"
  | "mri"
  | "ct"
  | "xray"
  | "ultrasound"
  | "ecg"
  | "eeg"
  | "spirometry"
  | "pathology"
  | "dermatology"
  | "dental"
  | "ophthalmology"
  | "wearable"
  | "manual-note";

export type ClinicalWorkflowStep =
  | "registration"
  | "history-review"
  | "symptom-collection"
  | "examination-notes"
  | "lab-upload"
  | "imaging-upload"
  | "ai-analysis"
  | "clinical-review"
  | "treatment-planning"
  | "report-generation"
  | "follow-up";

export type PatientSummary = {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: string;
  bloodType?: string;
  department: string;
  attendingPhysician?: string;
  status: "active" | "discharged" | "pending" | "critical";
  lastVisit?: string;
};

export type PatientProfile = PatientSummary & {
  personalInfo: Record<string, string>;
  familyHistory: string[];
  allergies: string[];
  currentMedications: string[];
  previousDiagnoses: string[];
  previousSurgeries: string[];
  vaccinations: string[];
  insurance: Record<string, string>;
  emergencyContacts: { name: string; relation: string; phone: string }[];
};

export type ClinicalTimelineEvent = {
  id: string;
  patientId: string;
  timestamp: string;
  category: MedicalRecordKind | "appointment" | "note" | "prescription";
  title: string;
  summary: string;
  provider?: string;
};

export type MedicalRecordRef = {
  id: string;
  patientId: string;
  kind: MedicalRecordKind;
  title: string;
  capturedAt: string;
  status: "pending" | "processing" | "ready" | "reviewed";
  source: "upload" | "device" | "lab" | "manual";
};

export type AuditLogEntry = {
  id: string;
  timestamp: string;
  actorId: string;
  actorRole: ClinicalRole;
  action: string;
  resource: string;
  patientId?: string;
};

export type ConsentRecord = {
  id: string;
  patientId: string;
  scope: string;
  grantedAt: string;
  expiresAt?: string;
  status: "active" | "revoked" | "expired";
};

export type DeviceConnection = {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "syncing";
  lastSync?: string;
};

export type MedicalWorkspaceTab = {
  id: string;
  patientId?: string;
  label: string;
  recordId?: string;
  viewMode: WorkspaceViewMode;
};

export type AIEngineSlot = {
  id: string;
  name: string;
  status: "idle" | "ready" | "processing" | "disabled";
  description: string;
};
