import type { Hospital, Department, Ward, Room, Bed, StaffMember, Admission, Discharge, HospitalId, DepartmentType } from "../types";

const DEFAULT_DEPARTMENTS: { type: DepartmentType; name: string }[] = [
  { type: "emergency", name: "Emergency" },
  { type: "icu", name: "ICU" },
  { type: "radiology", name: "Radiology" },
  { type: "laboratory", name: "Laboratory" },
  { type: "pharmacy", name: "Pharmacy" },
  { type: "surgery", name: "Operating Rooms" },
  { type: "reception", name: "Reception" },
  { type: "billing", name: "Billing" },
  { type: "administration", name: "Administration" },
  { type: "general-ward", name: "General Ward" },
  { type: "outpatient", name: "Outpatient" },
];

/** Hospital management — departments, wards, rooms, beds, staff */
export class HospitalManagementService {
  private hospitals = new Map<HospitalId, Hospital>();
  private departments = new Map<string, Department>();
  private wards = new Map<string, Ward>();
  private rooms = new Map<string, Room>();
  private beds = new Map<string, Bed>();
  private staff = new Map<string, StaffMember>();
  private admissions: Admission[] = [];
  private discharges: Discharge[] = [];

  constructor() {
    this.seedDefaultHospital();
  }

  private seedDefaultHospital() {
    const hospitalId = "hospital-default";
    const depts = DEFAULT_DEPARTMENTS.map((d, i) => ({
      id: `dept-${i}`,
      hospitalId,
      name: d.name,
      type: d.type,
      wardIds: [] as string[],
      active: true,
    }));
    const hospital: Hospital = {
      id: hospitalId,
      name: "OmniMind General Hospital",
      type: "hospital",
      timezone: "UTC",
      currency: "USD",
      departments: depts,
      createdAt: new Date().toISOString(),
    };
    this.hospitals.set(hospitalId, hospital);
    for (const d of depts) {
      this.departments.set(d.id, d);
      const ward: Ward = { id: `ward-${d.id}`, departmentId: d.id, name: `${d.name} Ward`, roomIds: [] };
      this.wards.set(ward.id, ward);
      d.wardIds.push(ward.id);
      for (let r = 1; r <= 3; r++) {
        const room: Room = { id: `room-${ward.id}-${r}`, wardId: ward.id, number: `${r}`, type: d.type === "icu" ? "icu" : "single", bedIds: [] };
        this.rooms.set(room.id, room);
        ward.roomIds.push(room.id);
        const bed: Bed = { id: `bed-${room.id}`, roomId: room.id, label: `${r}A`, status: "available" };
        this.beds.set(bed.id, bed);
        room.bedIds.push(bed.id);
      }
    }
  }

  getHospital(id: HospitalId) {
    return this.hospitals.get(id);
  }

  listDepartments(hospitalId: HospitalId) {
    return [...this.departments.values()].filter((d) => d.hospitalId === hospitalId);
  }

  listBeds(departmentId?: string) {
    let beds = [...this.beds.values()];
    if (departmentId) {
      const wardIds = [...this.wards.values()].filter((w) => w.departmentId === departmentId).map((w) => w.id);
      const roomIds = [...this.rooms.values()].filter((r) => wardIds.includes(r.wardId)).map((r) => r.id);
      beds = beds.filter((b) => roomIds.includes(b.roomId));
    }
    return beds;
  }

  assignBed(bedId: string, patientId: string) {
    const bed = this.beds.get(bedId);
    if (!bed) throw new Error("Bed not found");
    bed.status = "occupied";
    bed.patientId = patientId;
    bed.assignedAt = new Date().toISOString();
    return bed;
  }

  releaseBed(bedId: string) {
    const bed = this.beds.get(bedId);
    if (!bed) throw new Error("Bed not found");
    bed.status = "available";
    bed.patientId = undefined;
    bed.assignedAt = undefined;
    return bed;
  }

  registerStaff(member: StaffMember) {
    this.staff.set(member.id, member);
    return member;
  }

  listStaff(hospitalId: HospitalId, onDutyOnly = false) {
    return [...this.staff.values()].filter((s) => s.hospitalId === hospitalId && (!onDutyOnly || s.onDuty));
  }

  admit(admission: Admission) {
    this.admissions.push(admission);
    if (admission.bedId) this.assignBed(admission.bedId, admission.patientId);
    return admission;
  }

  discharge(record: Discharge) {
    this.discharges.push(record);
    return record;
  }

  getAdmissionsToday() {
    const today = new Date().toISOString().slice(0, 10);
    return this.admissions.filter((a) => a.admittedAt.startsWith(today));
  }

  getDischargesToday() {
    const today = new Date().toISOString().slice(0, 10);
    return this.discharges.filter((d) => d.dischargedAt.startsWith(today));
  }

  getBedSummary() {
    const all = [...this.beds.values()];
    return {
      total: all.length,
      occupied: all.filter((b) => b.status === "occupied").length,
      available: all.filter((b) => b.status === "available").length,
    };
  }

  getICUOccupancy() {
    const icuDept = [...this.departments.values()].find((d) => d.type === "icu");
    if (!icuDept) return { occupied: 0, total: 0, percent: 0 };
    const beds = this.listBeds(icuDept.id);
    const occupied = beds.filter((b) => b.status === "occupied").length;
    return { occupied, total: beds.length, percent: beds.length ? Math.round((occupied / beds.length) * 100) : 0 };
  }
}

let service: HospitalManagementService | null = null;

export function getHospitalManagementService() {
  if (!service) service = new HospitalManagementService();
  return service;
}
