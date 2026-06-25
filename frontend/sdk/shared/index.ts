/**
 * OmniMind SDK — Shared Layer
 * Safe for browser and server. Types, constants, validation, API contracts.
 */
export { SDK_VERSION, SDK_MIN_PLATFORM } from "./types";
export type * from "./types";
export type * from "./events/types";
export { compareSemver, verifyManifest, deprecationWarning } from "./validation";
