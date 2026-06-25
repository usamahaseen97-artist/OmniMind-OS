import type {
  LyricsSyncDocument,
  PerformanceMonitorState,
  SmartRecordingState,
  VocalAssistantSuggestion,
  VocalProcessingChain,
  VoiceAnalysisReport,
  VoiceProfile,
  VocalPreset,
  VocalTake,
} from "../vocal-types";

const BASE = "/api/v1/omnimusic/studio/vocal";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!res.ok) throw new Error(`OmniMusic Vocal API ${res.status}`);
  return res.json() as Promise<T>;
}

export const omnimusicVocalApi = {
  saveSession(projectId: string, state: SmartRecordingState) {
    return request<{ ok: boolean }>(`/sessions/${projectId}`, { method: "PUT", body: JSON.stringify(state) });
  },
  listTakes(projectId: string) {
    return request<{ ok: boolean; takes: VocalTake[] }>(`/takes/${projectId}`);
  },
  saveTake(projectId: string, take: VocalTake) {
    return request<{ ok: boolean; take: VocalTake }>(`/takes/${projectId}`, { method: "POST", body: JSON.stringify(take) });
  },
  listVoiceProfiles() {
    return request<{ ok: boolean; profiles: VoiceProfile[] }>("/voice-profiles");
  },
  authorizeProfile(profileId: string, consentRecordId: string) {
    return request<{ ok: boolean; profile: VoiceProfile }>(`/voice-profiles/${profileId}/authorize`, {
      method: "POST",
      body: JSON.stringify({ consentRecordId }),
    });
  },
  saveLyricsTiming(doc: LyricsSyncDocument) {
    return request<{ ok: boolean; document: LyricsSyncDocument }>("/lyrics-timing", { method: "POST", body: JSON.stringify(doc) });
  },
  saveAnalysis(report: VoiceAnalysisReport) {
    return request<{ ok: boolean; report: VoiceAnalysisReport }>("/performance-analysis", { method: "POST", body: JSON.stringify(report) });
  },
  savePreset(preset: VocalPreset) {
    return request<{ ok: boolean; preset: VocalPreset }>("/presets", { method: "POST", body: JSON.stringify(preset) });
  },
  listPresets() {
    return request<{ ok: boolean; presets: VocalPreset[] }>("/presets");
  },
};
