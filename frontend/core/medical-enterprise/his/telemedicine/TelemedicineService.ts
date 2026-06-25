import type { TelemedicineSession } from "../types";

/** Telemedicine architecture — video, chat, voice, screen share */
export class TelemedicineService {
  private sessions = new Map<string, TelemedicineSession>();

  createSession(appointmentId: string, patientId: string, providerId: string, mode: TelemedicineSession["mode"]) {
    const session: TelemedicineSession = {
      id: `tele-${Date.now()}`,
      appointmentId,
      patientId,
      providerId,
      mode,
      status: "scheduled",
      features: { screenShare: true, documentShare: true, remoteMonitoring: mode === "video" },
    };
    this.sessions.set(session.id, session);
    return session;
  }

  start(sessionId: string) {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error("Session not found");
    s.status = "active";
    s.startedAt = new Date().toISOString();
    return s;
  }

  end(sessionId: string) {
    const s = this.sessions.get(sessionId);
    if (!s) throw new Error("Session not found");
    s.status = "ended";
    s.endedAt = new Date().toISOString();
    return s;
  }

  getSession(id: string) {
    return this.sessions.get(id);
  }

  listActive() {
    return [...this.sessions.values()].filter((s) => s.status === "active");
  }
}

let service: TelemedicineService | null = null;

export function getTelemedicineService() {
  if (!service) service = new TelemedicineService();
  return service;
}
