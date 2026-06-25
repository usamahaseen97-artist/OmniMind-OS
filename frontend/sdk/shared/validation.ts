import type { SDKModuleManifest, SDKVerifyReport } from "./types";
import { SDK_VERSION, SDK_MIN_PLATFORM } from "./types";

function parseSemver(v: string): [number, number, number] {
  const parts = v.replace(/^v/, "").split(".").map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

export function compareSemver(a: string, b: string): number {
  const [am, an, ap] = parseSemver(a);
  const [bm, bn, bp] = parseSemver(b);
  if (am !== bm) return am - bm;
  if (an !== bn) return an - bn;
  return ap - bp;
}

export function verifyManifest(manifest: SDKModuleManifest): SDKVerifyReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!manifest.id) errors.push("id required");
  if (!manifest.version) errors.push("version required");
  if (!manifest.name) errors.push("name required");
  if (!manifest.capabilities?.length) warnings.push("no capabilities declared");
  if (compareSemver(manifest.minOmniVersion, SDK_MIN_PLATFORM) > 0) {
    errors.push(`requires OmniMind ${manifest.minOmniVersion} but SDK is ${SDK_VERSION}`);
  }
  if (!manifest.designSystem) warnings.push("designSystem disabled — tool will not inherit theme");
  if (!manifest.autoRegister) warnings.push("autoRegister disabled — manual integration required");

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    compatibility: manifest.minOmniVersion,
  };
}

export function deprecationWarning(feature: string, since: string, replacement?: string) {
  const msg = `[OmniMind SDK] ${feature} deprecated since ${since}${replacement ? ` — use ${replacement}` : ""}`;
  if (typeof console !== "undefined") console.warn(msg);
  return msg;
}
