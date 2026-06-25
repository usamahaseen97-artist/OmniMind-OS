import type { SecurityEvent } from "./types";

/** OmniSecurityMonitor — security events, failed logins, anomalies, threat dashboard data. */
export class OmniSecurityMonitor {
  events: SecurityEvent[] = [];
  failedLoginCounts = new Map<string, number>();

  record(event: Omit<SecurityEvent, "id" | "timestamp">) {
    const evt: SecurityEvent = {
      ...event,
      id: `sec-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.events.unshift(evt);
    if (event.kind === "failed_login" && event.actorId) {
      const count = (this.failedLoginCounts.get(event.actorId) ?? 0) + 1;
      this.failedLoginCounts.set(event.actorId, count);
      if (count >= 5) {
        this.record({
          kind: "anomaly",
          severity: "high",
          actorId: event.actorId,
          resource: "auth",
          detail: "brute_force_suspected",
          ip: event.ip,
        });
      }
    }
    if (this.events.length > 5000) this.events.pop();
    return evt;
  }

  failedLogins(sinceMinutes = 60) {
    const cutoff = Date.now() - sinceMinutes * 60_000;
    return this.events.filter(
      (e) => e.kind === "failed_login" && new Date(e.timestamp).getTime() > cutoff,
    );
  }

  permissionViolations(limit = 50) {
    return this.events.filter((e) => e.kind === "permission_denied").slice(0, limit);
  }

  anomalies() {
    return this.events.filter((e) => e.kind === "anomaly");
  }

  dashboard() {
    return {
      totalEvents: this.events.length,
      failedLogins24h: this.failedLogins(24 * 60).length,
      permissionViolations: this.permissionViolations().length,
      anomalies: this.anomalies().length,
      critical: this.events.filter((e) => e.severity === "critical").length,
    };
  }
}

export const omniSecurityMonitor = new OmniSecurityMonitor();
