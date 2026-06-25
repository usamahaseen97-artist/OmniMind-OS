import type { AutomationLane, MasteringChain, MixBus, MixChannelStrip, MixPreset } from "../mixing-types";

const BASE = "/api/v1/omnimusic/studio/mixing";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!res.ok) throw new Error(`OmniMusic Mixing API ${res.status}`);
  return res.json() as Promise<T>;
}

export const omnimusicMixingApi = {
  saveMixerState(projectId: string, state: { channels: MixChannelStrip[]; buses: MixBus[] }) {
    return request<{ ok: boolean }>(`/mixer/${projectId}`, { method: "PUT", body: JSON.stringify(state) });
  },
  saveRouting(projectId: string, routes: unknown[]) {
    return request<{ ok: boolean }>(`/routing/${projectId}`, { method: "PUT", body: JSON.stringify({ routes }) });
  },
  saveMastering(projectId: string, chain: MasteringChain) {
    return request<{ ok: boolean }>(`/mastering/${projectId}`, { method: "PUT", body: JSON.stringify(chain) });
  },
  saveAutomation(projectId: string, lanes: AutomationLane[]) {
    return request<{ ok: boolean }>(`/automation/${projectId}`, { method: "PUT", body: JSON.stringify({ lanes }) });
  },
  listPresets() {
    return request<{ ok: boolean; presets: MixPreset[] }>("/presets");
  },
  savePreset(preset: MixPreset) {
    return request<{ ok: boolean }>("/presets", { method: "POST", body: JSON.stringify(preset) });
  },
  listReferences() {
    return request<{ ok: boolean; references: unknown[] }>("/references");
  },
};
