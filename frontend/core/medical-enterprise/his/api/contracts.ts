import type {
  HospitalDashboardMetrics,
  EMRRecord,
  Appointment,
  Invoice,
  AnalyticsKPI,
  InteropConnector,
  TelemedicineSession,
} from "../types";

export const HIS_API_BASE = "/api/v1/medical-enterprise/his";

export type ApiResponse<T> = { ok: boolean; data?: T; error?: string };

export type DashboardResponse = ApiResponse<HospitalDashboardMetrics>;
export type EMRResponse = ApiResponse<EMRRecord>;
export type AppointmentsResponse = ApiResponse<Appointment[]>;
export type InvoiceResponse = ApiResponse<Invoice>;
export type AnalyticsResponse = ApiResponse<AnalyticsKPI[]>;
export type InteropResponse = ApiResponse<InteropConnector[]>;
export type TelemedicineResponse = ApiResponse<TelemedicineSession>;

export const HIS_API_ROUTES = {
  dashboard: (hospitalId: string) => `${HIS_API_BASE}/dashboard/${hospitalId}`,
  emr: (patientId: string) => `${HIS_API_BASE}/emr/${patientId}`,
  appointments: `${HIS_API_BASE}/appointments`,
  appointment: (id: string) => `${HIS_API_BASE}/appointments/${id}`,
  queue: (departmentId: string) => `${HIS_API_BASE}/queue/${departmentId}`,
  beds: `${HIS_API_BASE}/beds`,
  staff: `${HIS_API_BASE}/staff`,
  pharmacy: `${HIS_API_BASE}/pharmacy`,
  inventory: `${HIS_API_BASE}/inventory`,
  billing: `${HIS_API_BASE}/billing`,
  invoice: (id: string) => `${HIS_API_BASE}/billing/invoices/${id}`,
  telemedicine: `${HIS_API_BASE}/telemedicine`,
  analytics: (hospitalId: string) => `${HIS_API_BASE}/analytics/${hospitalId}`,
  interop: `${HIS_API_BASE}/interop/connectors`,
  admissions: `${HIS_API_BASE}/admissions`,
  discharges: `${HIS_API_BASE}/discharges`,
} as const;
