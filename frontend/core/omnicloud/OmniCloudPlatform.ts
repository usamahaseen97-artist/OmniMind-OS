import { OMNICLOUD_VERSION } from "./constants";
import { omniCloudAccount } from "./OmniCloudAccount";
import { omniCloudSyncEngine } from "./OmniCloudSyncEngine";
import { omniCloudProjectCloud } from "./OmniCloudProjectCloud";
import { omniCloudMemoryCloud } from "./OmniCloudMemoryCloud";
import { omniCloudBackground } from "./OmniCloudBackground";
import { omniCloudRemoteExecution } from "./OmniCloudRemoteExecution";
import { omniCloudStorage } from "./OmniCloudStorage";
import { omniCloudSecurity } from "./OmniCloudSecurity";
import { omniCloudOffline } from "./OmniCloudOffline";
import { omniCloudDeveloper } from "./OmniCloudDeveloper";
import { omniCloudAdmin } from "./OmniCloudAdmin";

/** OmniCloudPlatform — V2.0 cloud-native AI platform facade. */
export class OmniCloudPlatform {
  readonly version = OMNICLOUD_VERSION;

  readonly account = omniCloudAccount;
  readonly sync = omniCloudSyncEngine;
  readonly projects = omniCloudProjectCloud;
  readonly memory = omniCloudMemoryCloud;
  readonly background = omniCloudBackground;
  readonly remote = omniCloudRemoteExecution;
  readonly storage = omniCloudStorage;
  readonly security = omniCloudSecurity;
  readonly offline = omniCloudOffline;
  readonly developer = omniCloudDeveloper;
  readonly admin = omniCloudAdmin;

  private booted = false;

  async boot() {
    if (this.booted) return this;
    await Promise.all([
      this.account.load(),
      this.storage.load(),
      this.memory.load(),
      this.remote.list(),
      this.admin.load(),
    ]);
    await this.account.registerCurrentDevice();
    this.booted = true;
    return this;
  }

  async syncAll() {
    return this.sync.syncAll();
  }

  snapshot() {
    return {
      version: this.version,
      account: this.account.snapshot(),
      sync: this.sync.snapshot(),
      projects: this.projects.snapshot(),
      memory: this.memory.snapshot(),
      background: this.background.snapshot(),
      remote: this.remote.snapshot(),
      storage: this.storage.snapshot(),
      security: this.security.snapshot(),
      offline: this.offline.snapshot(),
      developer: this.developer.snapshot(),
      admin: this.admin.snapshot(),
    };
  }
}

export const omniCloudPlatform = new OmniCloudPlatform();
