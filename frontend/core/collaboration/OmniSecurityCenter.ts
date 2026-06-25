import type { SecurityPolicy } from "./types";

/** OmniSecurityCenter — session, device trust, IP restrictions, encryption hooks. */
export class OmniSecurityCenter {
  policies: SecurityPolicy[] = [
    {
      id: "sec-1",
      orgId: "org-1",
      mfaRequired: true,
      ipAllowlist: [],
      sessionTimeoutMin: 480,
      deviceTrustRequired: false,
    },
  ];

  sessions: Array<{ id: string; userId: string; device: string; ip: string; lastActive: string }> = [];

  getPolicy(orgId: string) {
    return this.policies.find((p) => p.orgId === orgId) ?? null;
  }

  updatePolicy(orgId: string, patch: Partial<Omit<SecurityPolicy, "id" | "orgId">>) {
    let policy = this.getPolicy(orgId);
    if (!policy) {
      policy = {
        id: `sec-${Date.now()}`,
        orgId,
        mfaRequired: false,
        ipAllowlist: [],
        sessionTimeoutMin: 480,
        deviceTrustRequired: false,
      };
      this.policies.push(policy);
    }
    Object.assign(policy, patch);
    return policy;
  }

  registerSession(userId: string, device: string, ip: string) {
    const session = {
      id: `sess-${Date.now()}`,
      userId,
      device,
      ip,
      lastActive: new Date().toISOString(),
    };
    this.sessions.push(session);
    return session;
  }

  revokeSession(sessionId: string) {
    const idx = this.sessions.findIndex((s) => s.id === sessionId);
    if (idx < 0) return false;
    this.sessions.splice(idx, 1);
    return true;
  }

  /** Placeholder — IP restriction check. */
  isIpAllowed(orgId: string, ip: string) {
    const policy = this.getPolicy(orgId);
    if (!policy || policy.ipAllowlist.length === 0) return true;
    return policy.ipAllowlist.includes(ip);
  }

  /** Encryption hook placeholder for at-rest / in-transit policies. */
  encryptionHooks() {
    return {
      encrypt: (data: string) => data,
      decrypt: (data: string) => data,
    };
  }
}

export const omniSecurityCenter = new OmniSecurityCenter();
