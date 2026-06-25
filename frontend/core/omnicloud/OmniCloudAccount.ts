import { omniSecurity } from "../security/OmniSecurity";
import { omniCloudApiClient } from "./OmniCloudApiClient";
import type { CloudAccount, CloudDevice, CloudDeviceKind } from "./types";

function detectDeviceKind(): CloudDeviceKind {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad/.test(ua)) return "iphone";
  if (/android/.test(ua)) return "android";
  if (/mobile/.test(ua)) return "tablet";
  return "web";
}

/** Single OmniMind account — multi-device login, sessions, trusted devices. */
export class OmniCloudAccount {
  account: CloudAccount | null = null;

  async load() {
    const remote = await omniCloudApiClient.getAccount();
    if (remote?.ok) {
      this.account = remote.account;
      return this.account;
    }
    const userId = "omnimind-user";
    this.account = {
      id: userId,
      email: "user@omnimind.cloud",
      displayName: "OmniMind User",
      plan: "pro",
      devices: omniSecurity.devices.devices.map((d) => ({
        id: d.id,
        name: d.name,
        kind: detectDeviceKind(),
        trusted: Boolean(d.trustedAt),
        lastSeenAt: d.lastSeenAt,
        fingerprint: d.fingerprint,
      })),
      sessions: omniSecurity.sessions.list(userId).map((s) => ({
        id: s.id,
        deviceId: s.deviceId ?? "unknown",
        userId: s.userId,
        createdAt: s.createdAt,
        lastActiveAt: s.lastActiveAt,
        expiresAt: s.expiresAt,
      })),
    };
    return this.account;
  }

  async registerCurrentDevice(name?: string) {
    const fingerprint = `fp-${typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 32) : "server"}`;
    omniSecurity.devices.register("omnimind-user", name ?? "This device", fingerprint);
    await omniCloudApiClient.registerDevice({
      name: name ?? "This device",
      kind: detectDeviceKind(),
      trusted: true,
      fingerprint,
    });
    return this.load();
  }

  revokeSession(sessionId: string) {
    omniSecurity.sessions.revoke(sessionId);
    return omniCloudApiClient.getAccount();
  }

  snapshot() {
    return { account: this.account, deviceCount: this.account?.devices.length ?? 0 };
  }
}

export const omniCloudAccount = new OmniCloudAccount();
