import type { APIKeyRecord, RateLimitPolicy, WebhookConfig } from "../types";

function simpleHash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) h = ((h << 5) - h + input.charCodeAt(i)) | 0;
  return `sha256-stub-${Math.abs(h).toString(16)}`;
}

/** API security gateway — keys, JWT, rate limiting, webhooks */
export class APISecurityGateway {
  private apiKeys = new Map<string, APIKeyRecord & { hashedKey: string }>();
  private rateLimits = new Map<string, RateLimitPolicy>();
  private requestCounts = new Map<string, { count: number; resetAt: number }>();
  private webhooks = new Map<string, WebhookConfig>();

  constructor() {
    this.rateLimits.set("default", { id: "rl-default", endpoint: "*", requestsPerMinute: 120, burst: 20 });
    this.rateLimits.set("ai", { id: "rl-ai", endpoint: "/ai/*", requestsPerMinute: 30, burst: 5 });
  }

  issueAPIKey(name: string, scopes: string[], rateLimitPerMinute = 60): { record: APIKeyRecord; rawKey: string } {
    const rawKey = `omni_${Date.now()}_${Math.random().toString(36).slice(2, 16)}`;
    const hashedKey = simpleHash(rawKey);
    const record: APIKeyRecord & { hashedKey: string } = {
      id: `key-${Date.now()}`,
      name,
      prefix: rawKey.slice(0, 12),
      scopes,
      rateLimitPerMinute,
      createdAt: new Date().toISOString(),
      revoked: false,
      hashedKey,
    };
    this.apiKeys.set(record.id, record);
    return { record, rawKey };
  }

  validateAPIKey(rawKey: string) {
    const hash = simpleHash(rawKey);
    const key = [...this.apiKeys.values()].find((k) => k.hashedKey === hash && !k.revoked);
    return key ?? null;
  }

  checkRateLimit(clientId: string, endpoint: string): { allowed: boolean; remaining: number } {
    const policy = [...this.rateLimits.values()].find((p) => endpoint.startsWith(p.endpoint.replace("*", ""))) ?? this.rateLimits.get("default")!;
    const now = Date.now();
    let bucket = this.requestCounts.get(clientId);
    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 0, resetAt: now + 60_000 };
      this.requestCounts.set(clientId, bucket);
    }
    bucket.count += 1;
    const allowed = bucket.count <= policy.requestsPerMinute;
    return { allowed, remaining: Math.max(0, policy.requestsPerMinute - bucket.count) };
  }

  validateJWT(token: string) {
    if (!token || token.length < 10) return null;
    return { sub: "user-stub", roles: ["doctor"], exp: Date.now() + 3600000 };
  }

  signRequest(payload: string, secret: string) {
    return simpleHash(`${payload}:${secret}`);
  }

  registerWebhook(config: WebhookConfig) {
    this.webhooks.set(config.id, config);
    return config;
  }

  getAuditHeaders() {
    return { "X-OmniMind-Audit": "true", "X-Request-Id": `req-${Date.now()}` };
  }
}

let gateway: APISecurityGateway | null = null;

export function getAPISecurityGateway() {
  if (!gateway) gateway = new APISecurityGateway();
  return gateway;
}
