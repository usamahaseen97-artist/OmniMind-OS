import { omniSecurity } from "../security/OmniSecurity";
import { omniMissionControlApiClient } from "./OmniMissionControlApiClient";
import type { SecurityCenterSnapshot } from "./types";

/** Security Center — threats, permissions, audit. */
export class OmniSecurityCenter {
  async snapshot(): Promise<SecurityCenterSnapshot> {
    const remote = await omniMissionControlApiClient.fetchSecurity();
    if (remote?.ok) return remote.security;

    const sec = omniSecurity.snapshot();
    const dash = sec.threatDashboard as {
      anomalies?: number;
      critical?: number;
      failedLogins24h?: number;
    };
    return {
      threats: (dash.anomalies ?? 0) + (dash.critical ?? 0),
      permissionRequests: sec.securityEvents,
      pluginAccessEvents: 0,
      apiUsageCount: sec.activeSessions,
      failedLogins: dash.failedLogins24h ?? 0,
      events: omniSecurity.monitor.events.slice(0, 20).map((e) => ({
        id: e.id,
        severity: e.severity,
        detail: e.detail,
        at: e.timestamp,
      })),
      auditLogs: [],
    };
  }
}

export const omniSecurityCenter = new OmniSecurityCenter();
