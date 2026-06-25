import type { ComplianceFramework, SecurityEvent, ZeroTrustDecision } from "./types";
import { apiGet, apiPost } from "../shared/api-fetch";

const BASE = "/api/v1/omnicore/security";

export const omniSecurityApiClient = {
  threatDashboard() {
    return apiGet<{ ok: boolean; dashboard: unknown }>(`${BASE}/dashboard`);
  },
  listEvents(limit = 50) {
    return apiGet<{ ok: boolean; events: SecurityEvent[] }>(`${BASE}/events?limit=${limit}`);
  },
  authorize(body: { userId: string; permission: string; context?: Record<string, string> }) {
    return apiPost<{ ok: boolean; decision: ZeroTrustDecision }>(`${BASE}/authorize`, body);
  },
  complianceReport(framework?: ComplianceFramework) {
    const q = framework ? `?framework=${framework}` : "";
    return apiGet<{ ok: boolean; report: unknown }>(`${BASE}/compliance${q}`);
  },
  oauthProviders() {
    return apiGet<{ ok: boolean; providers: unknown[] }>(`${BASE}/auth/providers`);
  },
  passkeyChallenge() {
    return apiPost<{ ok: boolean; challenge: unknown }>(`${BASE}/auth/passkey/challenge`, {});
  },
};
