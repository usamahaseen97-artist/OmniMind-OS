import type { VoiceAuthorizationStatus, VoiceProfile } from "../vocal-types";

/** Legal safety — no third-party voice use without explicit authorization. */
export class VoiceAuthorizationEngine {
  private profiles = new Map<string, VoiceProfile>();

  register(profile: Omit<VoiceProfile, "authorizationStatus" | "consentRecordId" | "consentGrantedAt">): VoiceProfile {
    const full: VoiceProfile = {
      ...profile,
      authorizationStatus: profile.isThirdParty ? "pending" : "authorized",
      consentRecordId: null,
      consentGrantedAt: profile.isThirdParty ? null : new Date().toISOString(),
    };
    this.profiles.set(full.id, full);
    return full;
  }

  authorize(profileId: string, consentRecordId: string): VoiceProfile | null {
    const p = this.profiles.get(profileId);
    if (!p) return null;
    const updated: VoiceProfile = {
      ...p,
      authorizationStatus: "authorized",
      consentRecordId,
      consentGrantedAt: new Date().toISOString(),
    };
    this.profiles.set(profileId, updated);
    return updated;
  }

  revoke(profileId: string): VoiceProfile | null {
    const p = this.profiles.get(profileId);
    if (!p) return null;
    const updated: VoiceProfile = { ...p, authorizationStatus: "revoked", consentGrantedAt: null };
    this.profiles.set(profileId, updated);
    return updated;
  }

  canUse(profileId: string): { allowed: boolean; reason: string } {
    const p = this.profiles.get(profileId);
    if (!p) return { allowed: false, reason: "Profile not found" };
    if (p.isThirdParty && p.authorizationStatus !== "authorized") {
      return { allowed: false, reason: "Third-party voice requires explicit authorization" };
    }
    if (p.authorizationStatus === "revoked" || p.authorizationStatus === "denied") {
      return { allowed: false, reason: `Voice profile ${p.authorizationStatus}` };
    }
    return { allowed: true, reason: "Authorized" };
  }

  list(): VoiceProfile[] {
    return [...this.profiles.values()];
  }

  seedBuiltin(): VoiceProfile[] {
    const builtins: Omit<VoiceProfile, "authorizationStatus" | "consentRecordId" | "consentGrantedAt">[] = [
      { id: "voice-lead-f", name: "Studio Lead F", category: "lead", gender: "female", language: "English", isThirdParty: false, providerId: null, presetId: "vp-lead-pop" },
      { id: "voice-lead-m", name: "Studio Lead M", category: "lead", gender: "male", language: "English", isThirdParty: false, providerId: null, presetId: null },
      { id: "voice-choir", name: "Choir Ensemble", category: "choir", gender: "neutral", language: "English", isThirdParty: false, providerId: null, presetId: "vp-choir" },
      { id: "voice-ext-placeholder", name: "External Voice (placeholder)", category: "lead", gender: "neutral", language: "English", isThirdParty: true, providerId: "external", presetId: null },
    ];
    return builtins.map((b) => this.register(b));
  }
}

export const voiceAuthorizationEngine = new VoiceAuthorizationEngine();
