import type { AnalyticsKPI, HospitalId } from "../types";
import { getHospitalManagementService } from "../hospital/HospitalManagementService";
import { getAppointmentSystem } from "../appointments/AppointmentSystem";
import { getBillingService } from "../billing/BillingService";

/** Hospital analytics — performance, flow, revenue KPIs */
export class HospitalAnalytics {
  computeKPIs(hospitalId: HospitalId): AnalyticsKPI[] {
    const hms = getHospitalManagementService();
    const beds = hms.getBedSummary();
    const icu = hms.getICUOccupancy();
    const appts = getAppointmentSystem().getTodayCount();
    const invoices = getBillingService().listInvoices();
    const revenue = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total, 0);

    return [
      { id: "kpi-beds", label: "Bed Occupancy", value: beds.total ? Math.round((beds.occupied / beds.total) * 100) : 0, unit: "%", trend: "stable", category: "operational" },
      { id: "kpi-icu", label: "ICU Occupancy", value: icu.percent, unit: "%", trend: icu.percent > 80 ? "up" : "stable", category: "clinical" },
      { id: "kpi-appts", label: "Appointments Today", value: appts, category: "operational" },
      { id: "kpi-admissions", label: "Admissions Today", value: hms.getAdmissionsToday().length, category: "operational" },
      { id: "kpi-revenue", label: "Revenue (Paid)", value: revenue, unit: "USD", trend: "up", category: "financial" },
      { id: "kpi-discharge", label: "Discharges Today", value: hms.getDischargesToday().length, category: "operational" },
    ];
  }

  patientFlow(hospitalId: HospitalId) {
    void hospitalId;
    return {
      emergency: getHospitalManagementService().listDepartments(hospitalId).find((d) => d.type === "emergency")?.name ?? "ER",
      avgWaitMinutes: 22,
      throughput: getAppointmentSystem().getTodayCount(),
    };
  }
}

let analytics: HospitalAnalytics | null = null;

export function getHospitalAnalytics() {
  if (!analytics) analytics = new HospitalAnalytics();
  return analytics;
}
