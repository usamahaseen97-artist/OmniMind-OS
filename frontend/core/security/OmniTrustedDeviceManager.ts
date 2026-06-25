import type { TrustedDevice } from "./types";

/** OmniTrustedDeviceManager — device trust for zero-trust decisions. */
export class OmniTrustedDeviceManager {
  devices: TrustedDevice[] = [];

  register(userId: string, name: string, fingerprint: string) {
    const device: TrustedDevice = {
      id: `dev-${Date.now()}`,
      userId,
      name,
      fingerprint,
      trustedAt: new Date().toISOString(),
      lastSeenAt: new Date().toISOString(),
    };
    this.devices.push(device);
    return device;
  }

  isTrusted(userId: string, fingerprint: string) {
    return this.devices.some((d) => d.userId === userId && d.fingerprint === fingerprint);
  }

  list(userId: string) {
    return this.devices.filter((d) => d.userId === userId);
  }

  revoke(deviceId: string) {
    const idx = this.devices.findIndex((d) => d.id === deviceId);
    if (idx < 0) return false;
    this.devices.splice(idx, 1);
    return true;
  }

  touch(userId: string, fingerprint: string) {
    const d = this.devices.find((x) => x.userId === userId && x.fingerprint === fingerprint);
    if (!d) return null;
    d.lastSeenAt = new Date().toISOString();
    return d;
  }
}

export const omniTrustedDeviceManager = new OmniTrustedDeviceManager();
