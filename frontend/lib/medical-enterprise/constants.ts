import type {
  BottomPanelTab,
  ClinicalWorkflowStep,
  MedicalNavSection,
  MedicalRecordKind,
  RightPanelSection,
} from "./types";

export const MEDICAL_SUITE_ID = "medical-diagnostic-suite";
export const MEDICAL_SUITE_NAME = "Medical Diagnostic Enterprise Suite";
export const MEDICAL_DISCLAIMER =
  "Clinical decision-support for qualified healthcare professionals. Does not replace licensed medical judgment.";

export const LEFT_NAV_ITEMS: { id: MedicalNavSection; label: string }[] = [
  { id: "patient-dashboard", label: "Patient Dashboard" },
  { id: "patient-list", label: "Patient List" },
  { id: "appointments", label: "Appointments" },
  { id: "medical-history", label: "Medical History" },
  { id: "lab-reports", label: "Lab Reports" },
  { id: "radiology", label: "Radiology" },
  { id: "vital-signs", label: "Vital Signs" },
  { id: "clinical-notes", label: "Clinical Notes" },
  { id: "prescriptions", label: "Prescriptions" },
  { id: "medications", label: "Medications" },
  { id: "imaging", label: "Imaging" },
  { id: "ai-assistant", label: "AI Assistant" },
  { id: "knowledge-base", label: "Knowledge Base" },
  { id: "medical-tasks", label: "Medical Tasks" },
  { id: "settings", label: "Settings" },
];

export const RIGHT_PANEL_SECTIONS: { id: RightPanelSection; label: string }[] = [
  { id: "ai-findings", label: "AI Findings" },
  { id: "differential", label: "Differential Diagnosis" },
  { id: "risk", label: "Risk Indicators" },
  { id: "follow-up", label: "Follow-up Questions" },
  { id: "guidelines", label: "Clinical Guidelines" },
  { id: "lab-interpretation", label: "Lab Interpretation" },
  { id: "medication-warnings", label: "Medication Warnings" },
  { id: "alerts", label: "Alerts" },
  { id: "tasks", label: "Task List" },
];

export const BOTTOM_PANEL_TABS: { id: BottomPanelTab; label: string }[] = [
  { id: "activity-log", label: "Activity Log" },
  { id: "ai-reasoning", label: "AI Reasoning Timeline" },
  { id: "device-logs", label: "Device Logs" },
  { id: "imaging-queue", label: "Imaging Queue" },
  { id: "lab-queue", label: "Lab Queue" },
  { id: "system-events", label: "System Events" },
];

export const WORKFLOW_STEPS: { id: ClinicalWorkflowStep; label: string }[] = [
  { id: "registration", label: "Registration" },
  { id: "history-review", label: "History Review" },
  { id: "symptom-collection", label: "Symptoms" },
  { id: "examination-notes", label: "Examination" },
  { id: "lab-upload", label: "Lab Upload" },
  { id: "imaging-upload", label: "Imaging Upload" },
  { id: "ai-analysis", label: "AI Analysis" },
  { id: "clinical-review", label: "Clinical Review" },
  { id: "treatment-planning", label: "Treatment Plan" },
  { id: "report-generation", label: "Report" },
  { id: "follow-up", label: "Follow-up" },
];

export const RECORD_KIND_LABELS: Record<MedicalRecordKind, string> = {
  "blood-test": "Blood Tests",
  "urine-test": "Urine Tests",
  mri: "MRI",
  ct: "CT",
  xray: "X-Ray",
  ultrasound: "Ultrasound",
  ecg: "ECG",
  eeg: "EEG",
  spirometry: "Spirometry",
  pathology: "Pathology",
  dermatology: "Dermatology Images",
  dental: "Dental Images",
  ophthalmology: "Ophthalmology",
  wearable: "Wearable Data",
  "manual-note": "Manual Notes",
};

export const SAMPLE_PATIENTS = [
  {
    id: "pt-001",
    mrn: "MRN-2024-001",
    firstName: "Elena",
    lastName: "Vasquez",
    dateOfBirth: "1978-03-14",
    sex: "F",
    bloodType: "O+",
    department: "Cardiology",
    attendingPhysician: "Dr. Chen",
    status: "active" as const,
    lastVisit: "2026-06-15",
  },
  {
    id: "pt-002",
    mrn: "MRN-2024-002",
    firstName: "James",
    lastName: "Okonkwo",
    dateOfBirth: "1965-11-02",
    sex: "M",
    bloodType: "A-",
    department: "Radiology",
    attendingPhysician: "Dr. Patel",
    status: "pending" as const,
    lastVisit: "2026-06-16",
  },
  {
    id: "pt-003",
    mrn: "MRN-2024-003",
    firstName: "Sofia",
    lastName: "Andersen",
    dateOfBirth: "1992-07-28",
    sex: "F",
    department: "Internal Medicine",
    status: "active" as const,
    lastVisit: "2026-06-17",
  },
];
