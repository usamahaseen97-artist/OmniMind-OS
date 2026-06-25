import { omniCloudApiClient } from "./OmniCloudApiClient";
import { omniCloudAccount } from "./OmniCloudAccount";
import { omniCloudStorage } from "./OmniCloudStorage";
import type { CloudAdminDashboard } from "./types";

/** Admin Panel — cloud dashboard, usage, devices, security, organizations. */
export class OmniCloudAdmin {
  dashboard: CloudAdminDashboard | null = null;

  async load() {
    const remote = await omniCloudApiClient.getAdminDashboard();
    if (remote?.ok) {
      this.dashboard = remote.dashboard;
      return this.dashboard;
    }
    await omniCloudAccount.load();
    await omniCloudStorage.load();
    this.dashboard = {
      usage: {
        storageBytes: omniCloudStorage.totalUsed(),
        bandwidthBytes: 0,
        apiCalls: 0,
      },
      devices: omniCloudAccount.account?.devices.length ?? 0,
      organizations: 1,
      subscriptions: [{ plan: omniCloudAccount.account?.plan ?? "pro", active: true }],
      securityEvents: 0,
    };
    return this.dashboard;
  }

  snapshot() {
    return { dashboard: this.dashboard };
  }
}

export const omniCloudAdmin = new OmniCloudAdmin();
