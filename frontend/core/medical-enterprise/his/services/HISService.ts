import type { HospitalId, Appointment, PatientDemographics, Admission, Invoice, TelemedicineSession } from "../types";
import { getHospitalDashboardEngine } from "../dashboard/HospitalDashboardEngine";
import { getEMRService } from "../emr/EMRService";
import { getHospitalManagementService } from "../hospital/HospitalManagementService";
import { getAppointmentSystem } from "../appointments/AppointmentSystem";
import { getPharmacyService } from "../pharmacy/PharmacyService";
import { getInventoryService } from "../inventory/InventoryService";
import { getStaffManagementService } from "../staff/StaffManagementService";
import { getBillingService } from "../billing/BillingService";
import { getTelemedicineService } from "../telemedicine/TelemedicineService";
import { getInteropHub } from "../interoperability/InteropHub";
import { getHospitalAnalytics } from "../analytics/HospitalAnalytics";
import { getHISAccessControl } from "../security/HISAccessControl";
import { getHISBrainBridge } from "../bridge/HISBrainBridge";
import type { ClinicalRole } from "../../../../lib/medical-enterprise/types";

/** Unified Hospital Information System facade */
export class HISService {
  private ac = getHISAccessControl();
  private brain = getHISBrainBridge();

  async getDashboard(hospitalId: HospitalId, role: ClinicalRole) {
    this.ac.assert(role, "his:read");
    const hms = getHospitalManagementService();
    const beds = hms.getBedSummary();
    const icu = hms.getICUOccupancy();
    let aiAlerts = 0;
    try {
      const { getAlertEngine } = await import("../../laboratory/alerts/AlertEngine");
      aiAlerts = getAlertEngine().getActiveAlerts().length;
    } catch { /* optional */ }

    return getHospitalDashboardEngine().compute(hospitalId, {
      admissionsToday: hms.getAdmissionsToday().length,
      dischargesToday: hms.getDischargesToday().length,
      appointmentsToday: getAppointmentSystem().getTodayCount(),
      staffOnDuty: getStaffManagementService().getOnDutyCount(hospitalId),
      beds: { available: beds.available, occupied: beds.occupied, total: beds.total },
      icuOccupancy: icu,
      aiAlerts,
    });
  }

  getHospital(hospitalId: HospitalId, role: ClinicalRole) {
    this.ac.assert(role, "his:read");
    return getHospitalManagementService().getHospital(hospitalId);
  }

  listDepartments(hospitalId: HospitalId, role: ClinicalRole) {
    this.ac.assert(role, "his:read");
    return getHospitalManagementService().listDepartments(hospitalId);
  }

  async getEMR(patientId: string, role: ClinicalRole) {
    this.ac.assert(role, "his:emr");
    await this.brain.enrichPatientContext(patientId);
    return getEMRService().enrichFromPhases(patientId);
  }

  scheduleAppointment(input: Omit<Appointment, "id" | "status">, role: ClinicalRole) {
    this.ac.assert(role, "his:appointments");
    return getAppointmentSystem().schedule(input);
  }

  checkInAppointment(appointmentId: string, role: ClinicalRole) {
    this.ac.assert(role, "his:appointments");
    return getAppointmentSystem().checkIn(appointmentId);
  }

  listAppointments(filters: Parameters<ReturnType<typeof getAppointmentSystem>["listAppointments"]>[0], role: ClinicalRole) {
    this.ac.assert(role, "his:appointments");
    return getAppointmentSystem().listAppointments(filters);
  }

  admit(admission: Admission, role: ClinicalRole) {
    this.ac.assert(role, "his:emr");
    const result = getHospitalManagementService().admit(admission);
    void this.brain.notifyAdmission(admission.patientId, admission.departmentId);
    this.ac.audit({ actorId: role, action: "his.admit", resourceType: "admission", resourceId: admission.id, patientId: admission.patientId, departmentId: admission.departmentId });
    return result;
  }

  registerPatient(demo: PatientDemographics, role: ClinicalRole) {
    this.ac.assert(role, "his:emr");
    return getEMRService().registerDemographics(demo);
  }

  getPharmacyStock(role: ClinicalRole) {
    this.ac.assert(role, "his:pharmacy");
    return getPharmacyService().getStock();
  }

  getInventory(hospitalId: HospitalId, role: ClinicalRole) {
    this.ac.assert(role, "his:read");
    return getInventoryService().list(hospitalId);
  }

  createInvoice(input: Parameters<ReturnType<typeof getBillingService>["createInvoice"]>[0], role: ClinicalRole) {
    this.ac.assert(role, "his:billing");
    return getBillingService().createInvoice(input);
  }

  getInvoice(id: string, role: ClinicalRole) {
    this.ac.assert(role, "his:billing");
    return getBillingService().getInvoice(id);
  }

  startTelemedicine(appointmentId: string, patientId: string, providerId: string, mode: TelemedicineSession["mode"], role: ClinicalRole) {
    this.ac.assert(role, "his:appointments");
    return getTelemedicineService().createSession(appointmentId, patientId, providerId, mode);
  }

  getAnalytics(hospitalId: HospitalId, role: ClinicalRole) {
    this.ac.assert(role, "his:analytics");
    return getHospitalAnalytics().computeKPIs(hospitalId);
  }

  listInteropConnectors(role: ClinicalRole) {
    this.ac.assert(role, "his:read");
    return getInteropHub().list();
  }

  listBeds(departmentId: string | undefined, role: ClinicalRole) {
    this.ac.assert(role, "his:read");
    return getHospitalManagementService().listBeds(departmentId);
  }

  listStaff(hospitalId: HospitalId, role: ClinicalRole) {
    this.ac.assert(role, "his:staff");
    return getHospitalManagementService().listStaff(hospitalId);
  }
}

let service: HISService | null = null;

export function getHISService() {
  if (!service) service = new HISService();
  return service;
}
