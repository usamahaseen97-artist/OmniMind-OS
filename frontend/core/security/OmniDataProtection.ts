import { RETENTION_POLICIES } from "./constants";
import type { DataRetentionPolicy, PIClassification } from "./types";

/** OmniDataProtection — encryption hooks, PII classification, retention. */
export class OmniDataProtection {
  policies: DataRetentionPolicy[] = [...RETENTION_POLICIES];

  classifyField(fieldName: string, sample?: string): PIClassification {
    const lower = fieldName.toLowerCase();
    if (/ssn|social|passport|national.?id/.test(lower)) return "pii";
    if (/email|phone|address|name|dob|birth/.test(lower)) return "pii";
    if (/diagnosis|patient|mrn|phi|medical/.test(lower)) return "phi";
    if (/password|secret|token|key|credential/.test(lower)) return "secret";
    if (/api.?key|private/.test(lower)) return "secret";
    if (sample && /@/.test(sample)) return "pii";
    return "internal";
  }

  retentionFor(classification: PIClassification) {
    return this.policies.find((p) => p.classification === classification) ?? null;
  }

  /** TLS in transit assumed; at-rest encryption hook placeholder. */
  encryptionHooks() {
    return {
      encryptAtRest: (data: string, _classification: PIClassification) => data,
      decryptAtRest: (data: string) => data,
      maskPii: (value: string) => (value.length > 4 ? `${value.slice(0, 2)}***${value.slice(-2)}` : "***"),
    };
  }

  secureBackupMetadata(resourceId: string) {
    return {
      resourceId,
      encrypted: true,
      algorithm: "AES-256-GCM",
      keyRef: "vault://omnimind/backup-keys",
      createdAt: new Date().toISOString(),
    };
  }
}

export const omniDataProtection = new OmniDataProtection();
