import type {
  Hospital,
  Department,
  Ward,
  Room,
  Bed,
  StaffMember,
  PatientDemographics,
  Encounter,
  EMRRecord,
  Appointment,
  Invoice,
  InsuranceClaim,
  MedicineStock,
  InventoryItem,
  TelemedicineSession,
  Admission,
  Discharge,
} from "../types";

export type DbHospital = Hospital & { encryptedAtRest: boolean };
export type DbDepartment = Department;
export type DbWard = Ward;
export type DbRoom = Room;
export type DbBed = Bed;
export type DbStaffMember = StaffMember & { encrypted: boolean };
export type DbPatientDemographics = PatientDemographics & { encrypted: boolean };
export type DbEncounter = Encounter;
export type DbEMRRecord = EMRRecord & { storageKey: string; auditLogId: string };
export type DbAppointment = Appointment;
export type DbAdmission = Admission;
export type DbDischarge = Discharge;
export type DbInvoice = Invoice & { encrypted: boolean };
export type DbInsuranceClaim = InsuranceClaim;
export type DbMedicineStock = MedicineStock;
export type DbInventoryItem = InventoryItem;
export type DbTelemedicineSession = TelemedicineSession;
export type DbHISAuditEntry = import("../types").HISAuditEntry;
