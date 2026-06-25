import type { UniversalAPI } from "./api/UniversalAPI";
import type { SDKModuleManifest, SDKRegistrationResult } from "../shared/types";
import { getAutoRegistration } from "./registration";
import { getUniversalAPI } from "./api";
import { verifyManifest } from "../shared/validation";
import { SDK_VERSION } from "../shared/types";

/**
 * OmniMind Browser SDK — runtime entry for React, providers, and client tools.
 * Does not import Node modules (fs, path, child_process).
 */
export class OmniMindSDK {
  readonly version = SDK_VERSION;
  readonly api: UniversalAPI;

  constructor() {
    this.api = getUniversalAPI();
  }

  /** Register module with full auto-registration across OmniMind OS */
  async register(manifest: SDKModuleManifest): Promise<SDKRegistrationResult> {
    const verify = verifyManifest(manifest);
    if (!verify.valid) {
      return {
        moduleId: manifest.id,
        targets: {} as SDKRegistrationResult["targets"],
        errors: verify.errors,
      };
    }
    return getAutoRegistration().register(manifest);
  }

  verify(manifest: SDKModuleManifest) {
    return verifyManifest(manifest);
  }
}

let sdk: OmniMindSDK | null = null;

export function getOmniMindSDK(): OmniMindSDK {
  if (!sdk) sdk = new OmniMindSDK();
  return sdk;
}

export function createOmniMindSDK() {
  return new OmniMindSDK();
}
