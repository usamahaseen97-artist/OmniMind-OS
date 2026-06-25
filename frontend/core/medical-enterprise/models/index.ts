export type {
  ClinicalRole,
  ThemeMode,
  WorkspaceViewMode,
  MedicalNavSection,
  BottomPanelTab,
  RightPanelSection,
  MedicalRecordKind,
  ClinicalWorkflowStep,
  PatientSummary,
  PatientProfile,
  ClinicalTimelineEvent,
  MedicalRecordRef,
  AuditLogEntry,
  ConsentRecord,
  DeviceConnection,
  MedicalWorkspaceTab,
  AIEngineSlot,
} from "../../../lib/medical-enterprise/types";

export type PatientRecord = {
  id: string;
  patientId: string;
  mrn: string;
  createdAt: string;
  updatedAt: string;
  encrypted: boolean;
};

export type LegacyImagingStudyRef = {
  id: string;
  patientId: string;
  modality: "MRI" | "CT" | "XR" | "US" | "MG";
  studyDate: string;
  seriesCount: number;
  status: "scheduled" | "acquired" | "reported";
  pacsRef?: string;
};

export type LabResult = {
  id: string;
  patientId: string;
  panel: string;
  collectedAt: string;
  resultedAt?: string;
  status: "ordered" | "in-progress" | "final";
  loincCode?: string;
};

export type Prescription = {
  id: string;
  patientId: string;
  medication: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  endDate?: string;
};

export type ClinicalNote = {
  id: string;
  patientId: string;
  author: string;
  noteType: "progress" | "admission" | "discharge" | "consult";
  body: string;
  signedAt?: string;
};

export type Appointment = {
  id: string;
  patientId: string;
  scheduledAt: string;
  provider: string;
  department: string;
  status: "scheduled" | "checked-in" | "completed" | "cancelled";
};

export type * from "./clinical-ai";
