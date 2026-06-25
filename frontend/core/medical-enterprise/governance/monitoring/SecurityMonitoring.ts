import type { SecurityAlert, SecurityDashboardMetrics } from "../types";
import { getIdentityProvider } from "../identity/IdentityProvider";
import { getAuditAggregationService } from "../audit/AuditAggregationService";

/** Security monitoring dashboard engine */
export class SecurityMonitoring {
  private alerts: SecurityAlert[] = [];

  raise(alert: Omit<SecurityAlert, "id" | "timestamp" | "acknowledged">) {
    const record: SecurityAlert = {
      ...alert,
      id: `sec-${Date.now()}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };
    this.alerts.unshift(record);
    return record;
  }

  acknowledge(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) throw new Error("Alert not found");
    alert.acknowledged = true;
    return alert;
  }

  getDashboard(): SecurityDashboardMetrics {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const audit = getAuditAggregationService();
    const failedLogins = audit.query({ category: "login", since }).filter((e) => e.outcome === "failure").length;
    const denied = audit.query({ since }).filter((e) => e.outcome === "denied").length;

    return {
      failedLogins24h: failedLogins,
      permissionViolations24h: denied,
      suspiciousActivity: this.alerts.filter((a) => a.category === "suspicious-activity" && !a.acknowledged).length,
      apiAnomalies: this.alerts.filter((a) => a.category === "api-anomaly" && !a.acknowledged).length,
      dataAccessAlerts: this.alerts.filter((a) => a.category === "data-access" && !a.acknowledged).length,
      deviceStatus: "healthy",
      systemIntegrity: "verified",
      activeSessions: getIdentityProvider().getActiveSessions().length,
      lastUpdated: new Date().toISOString(),
    };
  }

  getActiveAlerts() {
    return this.alerts.filter((a) => !a.acknowledged);
  }

  recordFailedLogin(userId: string) {
    getAuditAggregationService().recordLogin(userId, "unknown", "failure");
    return this.raise({
      severity: "warning",
      category: "failed-login",
      title: "Failed login attempt",
      message: `Failed login for user ${userId}`,
    });
  }

  recordPermissionViolation(actorId: string, action: string) {
    return this.raise({
      severity: "critical",
      category: "permission-violation",
      title: "Permission violation",
      message: `${actorId} denied: ${action}`,
    });
  }
}

let monitoring: SecurityMonitoring | null = null;

export function getSecurityMonitoring() {
  if (!monitoring) monitoring = new SecurityMonitoring();
  return monitoring;
}
