/**
 * Enterprise Hospital Information System — Phase 6
 */
export { HIS_DISCLAIMER } from "./types";
export type {
  HospitalId,
  Hospital,
  Department,
  Ward,
  Room,
  Bed,
  StaffMember,
  PatientDemographics,
  Encounter,
  EMRRecord,
  EMRTimelineEntry,
  HospitalDashboardMetrics,
  AnalyticsKPI,
  TelemedicineSession,
  InteropConnector,
  Admission,
  Discharge,
  Invoice,
  InsuranceClaim,
} from "./types";
export type { Appointment as HISAppointment } from "./types";
export { HIS_API_BASE, HIS_API_ROUTES } from "./api/contracts";
export type {
  DashboardResponse,
  EMRResponse,
  AppointmentsResponse,
  InvoiceResponse,
  AnalyticsResponse,
  InteropResponse,
  TelemedicineResponse,
} from "./api/contracts";
export * from "./models/schema";
export * from "./dashboard/HospitalDashboardEngine";
export * from "./emr/EMRService";
export * from "./hospital/HospitalManagementService";
export * from "./appointments/AppointmentSystem";
export * from "./pharmacy/PharmacyService";
export * from "./inventory/InventoryService";
export * from "./staff/StaffManagementService";
export * from "./billing/BillingService";
export * from "./telemedicine/TelemedicineService";
export * from "./interoperability/InteropHub";
export * from "./analytics/HospitalAnalytics";
export * from "./security/HISAccessControl";
export * from "./bridge/HISBrainBridge";
export * from "./services/HISService";

import { getHISService } from "./services/HISService";

export const medicalHISPlatform = {
  service: getHISService,
  dashboard: (...args: Parameters<ReturnType<typeof getHISService>["getDashboard"]>) => getHISService().getDashboard(...args),
  emr: (...args: Parameters<ReturnType<typeof getHISService>["getEMR"]>) => getHISService().getEMR(...args),
  analytics: (...args: Parameters<ReturnType<typeof getHISService>["getAnalytics"]>) => getHISService().getAnalytics(...args),
  departments: (...args: Parameters<ReturnType<typeof getHISService>["listDepartments"]>) => getHISService().listDepartments(...args),
};
