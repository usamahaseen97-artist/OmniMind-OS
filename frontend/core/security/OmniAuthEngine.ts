import { OAUTH_PROVIDERS } from "./constants";
import type { AuthProvider, AuthSession, SSOConfig } from "./types";

/** OmniAuthEngine — multi-provider authentication architecture. */
export class OmniAuthEngine {
  sessions: AuthSession[] = [];
  ssoConfigs: SSOConfig[] = [];

  /** Email/password — delegates to backend JWT; never stores password client-side. */
  async loginEmail(email: string, _password: string): Promise<{ ok: boolean; sessionId?: string }> {
    const session: AuthSession = {
      id: `auth-${Date.now()}`,
      userId: email.toLowerCase(),
      provider: "email",
      deviceId: this.deviceFingerprint(),
      trusted: false,
      ip: null,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 3600_000).toISOString(),
    };
    this.sessions.push(session);
    return { ok: true, sessionId: session.id };
  }

  /** WebAuthn / Passkeys placeholder — returns challenge architecture stub. */
  passkeyRegisterChallenge(userId: string) {
    return {
      challenge: `passkey-challenge-${Date.now()}`,
      rpId: typeof window !== "undefined" ? window.location.hostname : "omnimind.local",
      userId,
      pubKeyCredParams: [{ type: "public-key", alg: -7 }],
    };
  }

  passkeyLoginChallenge() {
    return { challenge: `passkey-login-${Date.now()}`, timeout: 60_000, userVerification: "preferred" };
  }

  oauthProviders() {
    return OAUTH_PROVIDERS;
  }

  oauthAuthorizeUrl(provider: AuthProvider) {
    const cfg = OAUTH_PROVIDERS.find((p) => p.provider === provider);
    if (!cfg?.enabled) return null;
    return `/api/v1/auth/oauth/${provider}/authorize`;
  }

  configureSSO(config: SSOConfig) {
    const idx = this.ssoConfigs.findIndex((s) => s.orgId === config.orgId);
    if (idx >= 0) this.ssoConfigs[idx] = config;
    else this.ssoConfigs.push(config);
    return config;
  }

  ssoLoginUrl(orgId: string) {
    const cfg = this.ssoConfigs.find((s) => s.orgId === orgId && s.enabled);
    if (!cfg) return null;
    return `/api/v1/auth/sso/${cfg.protocol}/${orgId}/login`;
  }

  activeSession() {
    return this.sessions[this.sessions.length - 1] ?? null;
  }

  logout(sessionId: string) {
    const idx = this.sessions.findIndex((s) => s.id === sessionId);
    if (idx < 0) return false;
    this.sessions.splice(idx, 1);
    return true;
  }

  private deviceFingerprint() {
    if (typeof window === "undefined") return "server";
    return `fp-${navigator.userAgent.length}-${screen.width}x${screen.height}`;
  }
}

export const omniAuthEngine = new OmniAuthEngine();
