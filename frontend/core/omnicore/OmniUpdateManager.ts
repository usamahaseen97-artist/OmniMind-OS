import type { UpdateChannel, UpdateInfo } from "./types";
import { OMNICORE_VERSION } from "./constants";

/** Platform update channel and version checks. */
export class OmniUpdateManager {
  channel: UpdateChannel = "stable";

  check(): UpdateInfo {
    return {
      currentVersion: OMNICORE_VERSION,
      latestVersion: OMNICORE_VERSION,
      channel: this.channel,
      available: false,
      releaseNotes: "OmniCore Phase 1 — unified OS foundation.",
    };
  }

  setChannel(channel: UpdateChannel) {
    this.channel = channel;
    return this.check();
  }
}

export const omniUpdateManager = new OmniUpdateManager();
