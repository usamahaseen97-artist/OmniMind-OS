/**
 * Enterprise Hospital Information System — type contracts (Phase 6)
 * Architecture scaffolding — integrates with Medical Phases 1–5.
 */

export const HIS_DISCLAIMER =
  "Hospital information system for qualified healthcare organizations. " +
  "Clinical AI outputs require clinician review. Not a substitute for licensed medical judgment.";

export type HospitalId = string;
export type DepartmentType =
  | "emergency"
  | "icu"
  | "radiology"
  | "laboratory"
  | "pharmacy"
  | "surgery"
  | "reception"
  | "billing"
  | "administration"
  | "general-ward"
  | "outpatient";

export type BedStatus = "available" | "occupied" | "reserved" | "maintenance" | "cleaning";

export type StaffRole = "doctor" | "nurse" | "technician" | "receptionist" | "admin" | "pharmacist";

export type Hospital = {
  id: HospitalId;
  name: string;
  type: "hospital" | "clinic" | "diagnostic-center" | "telemedicine-network";
  address?: string;
  timezone: string;
  currency: string;
  departments: Department[];
  createdAt: string;
};

export type Department = {
  id: string;
  hospitalId: HospitalId;
  name: string;
  type: DepartmentType;
  headOfDepartment?: string;
  wardIds: string[];
  active: boolean;
};

export type Ward = {
  id: string;
  departmentId: string;
  name: string;
  floor?: number;
  roomIds: string[];
};

export type Room = {
  id: string;
  wardId: string;
  number: string;
  type: "single" | "double" | "icu" | "or" | "emergency";
  bedIds: string[];
};

export type Bed = {
  id: string;
  roomId: string;
  label: string;
  status: BedStatus;
  patientId?: string;
  assignedAt?: string;
};

export type StaffMember = {
  id: string;
  hospitalId: HospitalId;
  name: string;
  role: StaffRole;
  departmentId?: string;
  specialty?: string;
  licenseNumber?: string;
  email?: string;
  onDuty: boolean;
  shift?: string;
};

export type PatientDemographics = {
  patientId: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  sex: "male" | "female" | "other" | "unknown";
  phone?: string;
  email?: string;
  address?: string;
  insuranceId?: string;
  emergencyContact?: string;
  consentScope?: string;
};

export type Encounter = {
  id: string;
  patientId: string;
  type: "inpatient" | "outpatient" | "emergency" | "telemedicine";
  departmentId: string;
  admittingProvider?: string;
  startedAt: string;
  endedAt?: string;
  status: "active" | "completed" | "cancelled";
  bedId?: string;
};

export type DiagnosisRecord = {
  id: string;
  patientId: string;
  encounterId: string;
  code?: string;
  description: string;
  type: "primary" | "secondary" | "provisional";
  recordedAt: string;
  recordedBy: string;
};

export type ProcedureRecord = {
  id: string;
  patientId: string;
  encounterId: string;
  code?: string;
  description: string;
  performedAt: string;
  performedBy: string;
};

export type AllergyRecord = {
  id: string;
  patientId: string;
  allergen: string;
  reaction?: string;
  severity?: "mild" | "moderate" | "severe";
  recordedAt: string;
};

export type VaccinationRecord = {
  id: string;
  patientId: string;
  vaccine: string;
  dose?: string;
  administeredAt: string;
  administeredBy: string;
};

export type EMRTimelineEntry = {
  id: string;
  patientId: string;
  timestamp: string;
  category: "encounter" | "diagnosis" | "procedure" | "prescription" | "note" | "lab" | "imaging" | "vital" | "ai-finding" | "allergy" | "vaccination";
  title: string;
  summary: string;
  sourceRef?: string;
  version?: number;
};

export type EMRRecord = {
  demographics: PatientDemographics;
  encounters: Encounter[];
  diagnoses: DiagnosisRecord[];
  procedures: ProcedureRecord[];
  allergies: AllergyRecord[];
  vaccinations: VaccinationRecord[];
  timeline: EMRTimelineEntry[];
  version: number;
  updatedAt: string;
};

export type AppointmentType = "online" | "walk-in" | "telemedicine" | "follow-up";

export type Appointment = {
  id: string;
  patientId: string;
  providerId: string;
  departmentId: string;
  scheduledAt: string;
  durationMinutes: number;
  type: AppointmentType;
  status: "scheduled" | "checked-in" | "in-progress" | "completed" | "cancelled" | "no-show";
  queuePosition?: number;
  telemedicineSessionId?: string;
  reminderSent?: boolean;
};

export type QueueEntry = {
  id: string;
  appointmentId: string;
  patientId: string;
  departmentId: string;
  position: number;
  checkedInAt: string;
  estimatedWaitMinutes?: number;
};

export type MedicineStock = {
  id: string;
  name: string;
  genericName?: string;
  sku: string;
  quantity: number;
  unit: string;
  expiryDate?: string;
  reorderLevel: number;
  supplierId?: string;
};

export type PrescriptionQueueItem = {
  id: string;
  patientId: string;
  prescriptionId: string;
  medications: string[];
  status: "pending" | "dispensing" | "dispensed" | "unavailable";
  queuedAt: string;
};

export type InventoryItem = {
  id: string;
  hospitalId: HospitalId;
  category: "equipment" | "consumable" | "surgical" | "lab-supply" | "medicine";
  name: string;
  sku: string;
  quantity: number;
  location?: string;
  maintenanceDue?: string;
  assetTag?: string;
};

export type Invoice = {
  id: string;
  patientId: string;
  encounterId?: string;
  items: { description: string; amount: number; currency: string }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
  status: "draft" | "issued" | "paid" | "partial" | "refunded";
  insuranceClaimId?: string;
  createdAt: string;
  paidAt?: string;
};

export type InsuranceClaim = {
  id: string;
  patientId: string;
  invoiceId: string;
  insurer: string;
  policyNumber: string;
  amount: number;
  status: "submitted" | "approved" | "denied" | "pending";
  submittedAt: string;
};

export type TelemedicineSession = {
  id: string;
  appointmentId: string;
  patientId: string;
  providerId: string;
  mode: "video" | "chat" | "voice";
  status: "scheduled" | "active" | "ended";
  startedAt?: string;
  endedAt?: string;
  features: { screenShare: boolean; documentShare: boolean; remoteMonitoring: boolean };
};

export type InteropSystem = "fhir" | "hl7" | "hospital-api" | "lab-system" | "radiology" | "pharmacy" | "insurance" | "government-health";

export type InteropConnector = {
  id: string;
  system: InteropSystem;
  name: string;
  endpoint?: string;
  enabled: boolean;
  lastSyncAt?: string;
};

export type HospitalDashboardMetrics = {
  hospitalId: HospitalId;
  activePatients: number;
  admissionsToday: number;
  dischargesToday: number;
  emergencyCases: number;
  icuOccupancy: { occupied: number; total: number; percent: number };
  operationTheaters: { active: number; total: number };
  appointmentsToday: number;
  staffOnDuty: number;
  beds: { available: number; occupied: number; total: number };
  aiAlerts: number;
  systemHealth: "healthy" | "degraded" | "critical";
  lastUpdated: string;
};

export type AnalyticsKPI = {
  id: string;
  label: string;
  value: number | string;
  unit?: string;
  trend?: "up" | "down" | "stable";
  category: "clinical" | "operational" | "financial";
};

export type Admission = {
  id: string;
  patientId: string;
  encounterId: string;
  admittedAt: string;
  departmentId: string;
  bedId?: string;
  admittingDiagnosis?: string;
};

export type Discharge = {
  id: string;
  patientId: string;
  encounterId: string;
  dischargedAt: string;
  summary?: string;
};

export type HISAuditEntry = {
  id: string;
  actorId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  departmentId?: string;
  patientId?: string;
  timestamp: string;
};
