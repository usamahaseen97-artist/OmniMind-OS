import type { Appointment, QueueEntry, AppointmentType } from "../types";

/** Appointment system — booking, queue, telemedicine hooks */
export class AppointmentSystem {
  private appointments = new Map<string, Appointment>();
  private queues = new Map<string, QueueEntry[]>();

  schedule(input: Omit<Appointment, "id" | "status">): Appointment {
    const appt: Appointment = {
      ...input,
      id: `appt-${Date.now()}`,
      status: "scheduled",
    };
    this.appointments.set(appt.id, appt);
    return appt;
  }

  checkIn(appointmentId: string) {
    const appt = this.appointments.get(appointmentId);
    if (!appt) throw new Error("Appointment not found");
    appt.status = "checked-in";
    const queue = this.queues.get(appt.departmentId) ?? [];
    const entry: QueueEntry = {
      id: `q-${Date.now()}`,
      appointmentId,
      patientId: appt.patientId,
      departmentId: appt.departmentId,
      position: queue.length + 1,
      checkedInAt: new Date().toISOString(),
      estimatedWaitMinutes: queue.length * 15,
    };
    queue.push(entry);
    appt.queuePosition = entry.position;
    this.queues.set(appt.departmentId, queue);
    return { appointment: appt, queueEntry: entry };
  }

  getQueue(departmentId: string) {
    return this.queues.get(departmentId) ?? [];
  }

  listAppointments(filters: { patientId?: string; providerId?: string; date?: string }) {
    let list = [...this.appointments.values()];
    if (filters.patientId) list = list.filter((a) => a.patientId === filters.patientId);
    if (filters.providerId) list = list.filter((a) => a.providerId === filters.providerId);
    if (filters.date) list = list.filter((a) => a.scheduledAt.startsWith(filters.date!));
    return list.sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }

  getTodayCount() {
    const today = new Date().toISOString().slice(0, 10);
    return this.listAppointments({ date: today }).length;
  }

  bookTelemedicine(patientId: string, providerId: string, departmentId: string, scheduledAt: string) {
    return this.schedule({
      patientId,
      providerId,
      departmentId,
      scheduledAt,
      durationMinutes: 30,
      type: "telemedicine" as AppointmentType,
    });
  }

  sendReminder(appointmentId: string) {
    const appt = this.appointments.get(appointmentId);
    if (!appt) throw new Error("Appointment not found");
    appt.reminderSent = true;
    return appt;
  }
}

let system: AppointmentSystem | null = null;

export function getAppointmentSystem() {
  if (!system) system = new AppointmentSystem();
  return system;
}
