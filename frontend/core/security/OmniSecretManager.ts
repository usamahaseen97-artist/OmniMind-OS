/** OmniSecretManager — central secret manager architecture (server-side only). */

const CLIENT_BLOCKED_KEYS = new Set([
  "JWT_SECRET_KEY",
  "GEMINI_API_KEY",
  "GOOGLE_API_KEY",
  "DATABASE_URL",
  "REDIS_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OMNIMIND_BOOTSTRAP_PASSWORD",
]);

export type SecretReference = {
  key: string;
  scope: "auth" | "ai" | "database" | "integration" | "plugin";
  rotationDueAt: string | null;
  lastRotatedAt: string | null;
};

/** Client-side vault — stores references only, never secret values. */
export class OmniSecretManager {
  references: SecretReference[] = [
    { key: "JWT_SECRET_KEY", scope: "auth", rotationDueAt: null, lastRotatedAt: null },
    { key: "GEMINI_API_KEY", scope: "ai", rotationDueAt: null, lastRotatedAt: null },
  ];

  registerReference(ref: SecretReference) {
    if (CLIENT_BLOCKED_KEYS.has(ref.key) && typeof window !== "undefined") {
      throw new Error(`Secret ${ref.key} must not be registered on client`);
    }
    this.references.push(ref);
    return ref;
  }

  /** Placeholder — rotation schedule architecture. */
  scheduleRotation(key: string, daysUntilRotation: number) {
    const ref = this.references.find((r) => r.key === key);
    if (!ref) return null;
    ref.rotationDueAt = new Date(Date.now() + daysUntilRotation * 86_400_000).toISOString();
    return ref;
  }

  validateEnv(keys: string[]) {
    return keys.map((key) => ({
      key,
      allowedOnClient: !CLIENT_BLOCKED_KEYS.has(key),
      status: CLIENT_BLOCKED_KEYS.has(key) ? "server_only" : "configurable",
    }));
  }

  isClientSafe(key: string) {
    return !CLIENT_BLOCKED_KEYS.has(key);
  }
}

export const omniSecretManager = new OmniSecretManager();
