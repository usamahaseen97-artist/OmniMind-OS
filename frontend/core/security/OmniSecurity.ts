import { OMNICORE_SECURITY_VERSION } from "./constants";
import { omniABACEngine } from "./OmniABACEngine";
import { omniAPIProtection } from "./OmniAPIProtection";
import { omniAuthEngine } from "./OmniAuthEngine";
import { omniAuthorizationEngine } from "./OmniAuthorizationEngine";
import { omniComplianceCenter } from "./OmniComplianceCenter";
import { omniDataProtection } from "./OmniDataProtection";
import { omniPluginSecurityGate } from "./OmniPluginSecurityGate";
import { omniSecretManager } from "./OmniSecretManager";
import { omniSecurityMonitor } from "./OmniSecurityMonitor";
import { omniSessionRegistry } from "./OmniSessionRegistry";
import { omniTrustedDeviceManager } from "./OmniTrustedDeviceManager";
import { omniZeroTrustEngine } from "./OmniZeroTrustEngine";
import type { ABACContext, SecurityPermission } from "./types";

/** OmniSecurity — enterprise security platform facade. */
export class OmniSecurity {
  readonly version = OMNICORE_SECURITY_VERSION;

  readonly auth = omniAuthEngine;
  readonly sessions = omniSessionRegistry;
  readonly devices = omniTrustedDeviceManager;
  readonly rbac = omniAuthorizationEngine;
  readonly abac = omniABACEngine;
  readonly zeroTrust = omniZeroTrustEngine;
  readonly secrets = omniSecretManager;
  readonly api = omniAPIProtection;
  readonly data = omniDataProtection;
  readonly plugins = omniPluginSecurityGate;
  readonly monitor = omniSecurityMonitor;
  readonly compliance = omniComplianceCenter;

  private booted = false;

  boot() {
    if (this.booted) return this;
    this.booted = true;
    this.rbac.assignRole("system", "platform:owner");
    return this;
  }

  authorize(ctx: ABACContext, permission: SecurityPermission) {
    const decision = this.zeroTrust.validateRequest(ctx, permission);
    if (!decision.allowed) {
      this.monitor.record({
        kind: "permission_denied",
        severity: "medium",
        actorId: ctx.userId,
        resource: permission,
        detail: decision.reason,
        ip: ctx.ip ?? null,
      });
    }
    return decision;
  }

  snapshot() {
    return {
      version: this.version,
      activeSessions: this.sessions.sessions.length,
      trustedDevices: this.devices.devices.length,
      securityEvents: this.monitor.events.length,
      threatDashboard: this.monitor.dashboard(),
      complianceScores: this.compliance.readinessReport().map((r) => ({
        framework: r.framework,
        score: r.score,
      })),
    };
  }
}

export const omniSecurity = new OmniSecurity();
