import type { ApiKey } from "./types";

/** OmniAPIKeyManager — scoped API key lifecycle for enterprise integrations. */
export class OmniAPIKeyManager {
  keys: ApiKey[] = [];

  list(orgId: string) {
    return this.keys.filter((k) => k.orgId === orgId && !k.revoked);
  }

  create(orgId: string, name: string, scopes: string[]) {
    const prefix = `omni_${Math.random().toString(36).slice(2, 8)}`;
    const key: ApiKey = {
      id: `key-${Date.now()}`,
      orgId,
      name,
      prefix,
      scopes,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      revoked: false,
    };
    this.keys.push(key);
    return { key, secret: `${prefix}_${Math.random().toString(36).slice(2, 20)}` };
  }

  revoke(keyId: string) {
    const key = this.keys.find((k) => k.id === keyId);
    if (!key) return false;
    key.revoked = true;
    return true;
  }

  validate(prefix: string, requiredScope: string) {
    const key = this.keys.find((k) => k.prefix === prefix && !k.revoked);
    if (!key) return false;
    key.lastUsedAt = new Date().toISOString();
    return key.scopes.includes(requiredScope) || key.scopes.includes("*");
  }
}

export const omniAPIKeyManager = new OmniAPIKeyManager();
