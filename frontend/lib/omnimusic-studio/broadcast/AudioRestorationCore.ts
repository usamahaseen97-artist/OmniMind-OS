import type { NoiseProfile, RestorationProfile } from "../broadcast-types";
import { RESTORATION_PRESETS } from "./constants";

export class AudioRestorationCore {
  profiles: RestorationProfile[] = [...RESTORATION_PRESETS];
  activeProfileId = RESTORATION_PRESETS[0]!.id;
  noiseProfiles: NoiseProfile[] = [];

  listProfiles() {
    return this.profiles;
  }

  active() {
    return this.profiles.find((p) => p.id === this.activeProfileId) ?? this.profiles[0]!;
  }

  selectProfile(id: string) {
    this.activeProfileId = id;
    return this.active();
  }

  updateProfile(id: string, patch: Partial<RestorationProfile>) {
    const p = this.profiles.find((x) => x.id === id);
    if (p) Object.assign(p, patch);
    return p ?? null;
  }

  captureNoiseProfile(name: string, sampleSec: number): NoiseProfile {
    const profile: NoiseProfile = {
      id: `np-${Date.now()}`,
      name,
      sampleSec,
      fingerprint: Array.from({ length: 32 }, () => Math.random()),
      capturedAt: new Date().toISOString(),
    };
    this.noiseProfiles.push(profile);
    return profile;
  }

  repairSuggestions() {
    const p = this.active();
    return [
      { id: "rs-1", tool: "Noise Removal", level: p.noiseReduction },
      { id: "rs-2", tool: "Hum Removal", level: p.humRemoval },
      { id: "rs-3", tool: "Click Removal", level: p.clickRemoval },
      { id: "rs-4", tool: "Room Correction", level: p.roomCorrection },
    ];
  }
}

export const audioRestorationCore = new AudioRestorationCore();
