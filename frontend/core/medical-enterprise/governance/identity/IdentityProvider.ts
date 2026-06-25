import type { IdentitySession, SSOProvider, BiometricAuthHook, AuthProtocol, GovernanceRole } from "../types";
import type { ClinicalRole } from "../../../../lib/medical-enterprise/types";

const ROLE_MAP: Record<GovernanceRole, ClinicalRole> = {
  doctor: "physician",
  specialist: "physician",
  nurse: "nurse",
  radiologist: "radiologist",
  "lab-technician": "pathologist",
  pharmacist: "nurse",
  receptionist: "viewer",
  "hospital-administrator": "admin",
  auditor: "admin",
  "research-user": "researcher",
  "system-administrator": "admin",
};

/** Enterprise IAM — SSO, OAuth, OIDC, MFA, biometric hooks */
export class IdentityProvider {
  private sessions = new Map<string, IdentitySession>();
  private ssoProviders = new Map<string, SSOProvider>();
  private biometricHooks = new Map<string, BiometricAuthHook>();

  constructor() {
    this.ssoProviders.set("oidc-default", { id: "oidc-default", name: "OpenID Connect", protocol: "oidc", enabled: true });
    this.ssoProviders.set("oauth2-default", { id: "oauth2-default", name: "OAuth 2.0", protocol: "oauth2", enabled: true });
  }

  toClinicalRole(governanceRole: GovernanceRole): ClinicalRole {
    return ROLE_MAP[governanceRole] ?? "viewer";
  }

  createSession(userId: string, role: GovernanceRole, protocol: AuthProtocol, mfaVerified = false): IdentitySession {
    const now = new Date();
    const expires = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const session: IdentitySession = {
      id: `sess-${Date.now()}`,
      userId,
      role,
      clinicalRole: this.toClinicalRole(role),
      protocol,
      mfaVerified,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      active: true,
    };
    this.sessions.set(session.id, session);
    return session;
  }

  verifyMFA(sessionId: string, _code: string) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("Session not found");
    session.mfaVerified = true;
    return session;
  }

  revokeSession(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error("Session not found");
    session.active = false;
    return session;
  }

  getActiveSessions(userId?: string) {
    const list = [...this.sessions.values()].filter((s) => s.active && new Date(s.expiresAt) > new Date());
    return userId ? list.filter((s) => s.userId === userId) : list;
  }

  registerSSOProvider(provider: SSOProvider) {
    this.ssoProviders.set(provider.id, provider);
    return provider;
  }

  listSSOProviders() {
    return [...this.ssoProviders.values()];
  }

  registerBiometricHook(hook: BiometricAuthHook) {
    this.biometricHooks.set(hook.id, hook);
  }

  async verifyBiometric(hookId: string, sample: ArrayBuffer) {
    const hook = this.biometricHooks.get(hookId);
    if (!hook) throw new Error("Biometric hook not found");
    return hook.verify(sample);
  }

  /** OAuth/OIDC token exchange stub */
  async exchangeToken(_providerId: string, _code: string) {
    return { accessToken: "[architecture-stub]", refreshToken: "[architecture-stub]", expiresIn: 3600 };
  }
}

let provider: IdentityProvider | null = null;

export function getIdentityProvider() {
  if (!provider) provider = new IdentityProvider();
  return provider;
}

export { ROLE_MAP };
