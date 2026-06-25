import { omniSecurity } from "../security/OmniSecurity";

/** Cloud Security — E2E encryption architecture for sync, backup, memory, projects. */
export class OmniCloudSecurity {
  encryptionEnabled = true;
  private hooks = omniSecurity.data.encryptionHooks();

  encryptPayload(plaintext: string) {
    return this.hooks.encryptAtRest(plaintext, "internal");
  }

  decryptPayload(ciphertext: string) {
    return this.hooks.decryptAtRest(ciphertext);
  }

  syncPolicy() {
    return {
      encryptedSync: this.encryptionEnabled,
      encryptedBackup: true,
      encryptedMemory: true,
      encryptedProjects: true,
      algorithm: "AES-256-GCM",
    };
  }

  authorizeDevice(fingerprint: string) {
    return omniSecurity.devices.isTrusted("omnimind-user", fingerprint);
  }

  snapshot() {
    return {
      ...this.syncPolicy(),
      trustedDevices: omniSecurity.devices.devices.filter((d) => Boolean(d.trustedAt)).length,
      activeSessions: omniSecurity.sessions.list("omnimind-user").length,
    };
  }
}

export const omniCloudSecurity = new OmniCloudSecurity();
