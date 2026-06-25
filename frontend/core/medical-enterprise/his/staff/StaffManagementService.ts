import type { StaffMember, HospitalId, StaffRole } from "../types";
import { getHospitalManagementService } from "../hospital/HospitalManagementService";

export type ShiftRecord = {
  id: string;
  staffId: string;
  shift: "morning" | "afternoon" | "night";
  startedAt: string;
  endedAt?: string;
};

export type AttendanceRecord = {
  id: string;
  staffId: string;
  date: string;
  status: "present" | "absent" | "late" | "on-leave";
};

/** Staff management — roles, shifts, attendance */
export class StaffManagementService {
  private shifts: ShiftRecord[] = [];
  private attendance: AttendanceRecord[] = [];

  listByRole(hospitalId: HospitalId, role?: StaffRole): StaffMember[] {
    let staff = getHospitalManagementService().listStaff(hospitalId);
    if (role) staff = staff.filter((s) => s.role === role);
    return staff;
  }

  recordShift(staffId: string, shift: ShiftRecord["shift"]) {
    const record: ShiftRecord = {
      id: `shift-${Date.now()}`,
      staffId,
      shift,
      startedAt: new Date().toISOString(),
    };
    this.shifts.push(record);
    return record;
  }

  recordAttendance(staffId: string, status: AttendanceRecord["status"]) {
    const record: AttendanceRecord = {
      id: `att-${Date.now()}`,
      staffId,
      date: new Date().toISOString().slice(0, 10),
      status,
    };
    this.attendance.push(record);
    return record;
  }

  getOnDutyCount(hospitalId: HospitalId) {
    return getHospitalManagementService().listStaff(hospitalId, true).length;
  }
}

let service: StaffManagementService | null = null;

export function getStaffManagementService() {
  if (!service) service = new StaffManagementService();
  return service;
}
