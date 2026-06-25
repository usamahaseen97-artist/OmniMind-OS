import type { IdempotencyRecord } from "./types";

/** OmniAPIProtection — CSRF, rate limits, idempotency, request signing architecture. */
export class OmniAPIProtection {
  private idempotencyStore = new Map<string, IdempotencyRecord>();
  private rateBuckets = new Map<string, { count: number; resetAt: number }>();

  /** CSRF token generation — double-submit cookie pattern placeholder. */
  generateCsrfToken() {
    return `csrf-${Math.random().toString(36).slice(2)}-${Date.now()}`;
  }

  validateCsrf(headerToken: string | null, cookieToken: string | null) {
    if (!headerToken || !cookieToken) return false;
    return headerToken === cookieToken;
  }

  /** Token bucket rate limit per client key. */
  checkRateLimit(clientKey: string, limit = 100, windowMs = 60_000) {
    const now = Date.now();
    const bucket = this.rateBuckets.get(clientKey);
    if (!bucket || now > bucket.resetAt) {
      this.rateBuckets.set(clientKey, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1 };
    }
    bucket.count += 1;
    return { allowed: bucket.count <= limit, remaining: Math.max(0, limit - bucket.count) };
  }

  /** Idempotency key support for safe retries. */
  recordIdempotency(key: string, method: string, path: string, responseHash: string, ttlMs = 86_400_000) {
    const record: IdempotencyRecord = {
      key,
      method,
      path,
      responseHash,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ttlMs).toISOString(),
    };
    this.idempotencyStore.set(key, record);
    if (this.idempotencyStore.size > 1000) {
      const oldest = this.idempotencyStore.keys().next().value;
      if (oldest) this.idempotencyStore.delete(oldest);
    }
    return record;
  }

  getIdempotency(key: string) {
    const record = this.idempotencyStore.get(key);
    if (!record) return null;
    if (Date.now() > new Date(record.expiresAt).getTime()) {
      this.idempotencyStore.delete(key);
      return null;
    }
    return record;
  }

  /** HMAC request signing placeholder — server validates signature. */
  signRequest(payload: string, _secretRef: string) {
    return `sig-${btoa(payload).slice(0, 32)}`;
  }
}

export const omniAPIProtection = new OmniAPIProtection();
