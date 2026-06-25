/**
 * OmniMind SDK — Browser Layer
 * React, providers, client APIs. Never imports Node modules.
 */
export { SDK_VERSION, SDK_MIN_PLATFORM } from "../shared/types";
export type * from "../shared/types";
export type * from "../shared/events/types";
export { compareSemver, verifyManifest, deprecationWarning } from "../shared/validation";

export { OmniMindSDK, getOmniMindSDK, createOmniMindSDK } from "./OmniMindSDK";
export { UniversalAPI, getUniversalAPI } from "./api";
export { getSDKEventBus, SDKEventBus } from "./events";
export { ModuleLifecycle } from "./lifecycle";
export { AutoRegistration, getAutoRegistration } from "./registration";
export { createMockSDK, mockAI, mockDatabase, mockMemory, mockPlugins, mockUsers } from "./testing";

export {
  CoreSDK,
  UISDK,
  AISDK,
  MemorySDK,
  BrainSDK,
  PluginSDKPackage,
  VoiceSDK,
  AuthSDK,
  StorageSDK,
  DatabaseSDK,
  NetworkingSDK,
  DeploymentSDK,
  SecuritySDK,
  AnalyticsSDK,
  DevToolsSDK,
  TestingSDK,
} from "./packages";

import { getOmniMindSDK } from "./OmniMindSDK";
export default getOmniMindSDK;
