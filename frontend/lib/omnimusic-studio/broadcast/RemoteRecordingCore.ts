import type { RemoteGuest } from "../broadcast-types";

export class RemoteRecordingCore {
  guests: RemoteGuest[] = [
    { id: "rg-1", name: "Remote Guest", email: "guest@example.com", status: "invited", latencyMs: 0 },
  ];

  list() {
    return this.guests;
  }

  invite(name: string, email: string): RemoteGuest {
    const guest: RemoteGuest = {
      id: `rg-${Date.now()}`,
      name,
      email,
      status: "invited",
      latencyMs: 0,
    };
    this.guests.push(guest);
    return guest;
  }

  connect(id: string) {
    const g = this.guests.find((x) => x.id === id);
    if (g) {
      g.status = "connected";
      g.latencyMs = 45 + Math.floor(Math.random() * 80);
    }
    return g ?? null;
  }

  disconnect(id: string) {
    const g = this.guests.find((x) => x.id === id);
    if (g) g.status = "disconnected";
    return g ?? null;
  }
}

export const remoteRecordingCore = new RemoteRecordingCore();
