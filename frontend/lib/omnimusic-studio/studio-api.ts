import type { OmniMusicProject } from "./types";
import type { ExtendedTransportState, RecordingTake, WaveformData } from "./audio-types";

const BASE = "/api/v1/omnimusic/studio";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`OmniMusic Studio API ${res.status}`);
  return res.json() as Promise<T>;
}

export const omnimusicStudioApi = {
  loadProject(id: string) {
    return request<{ ok: boolean; project: OmniMusicProject }>(`/projects/${id}`);
  },

  saveProject(project: OmniMusicProject) {
    return request<{ ok: boolean; project: OmniMusicProject }>(`/projects/${project.id}`, {
      method: "PUT",
      body: JSON.stringify(project),
    });
  },

  serializeTracks(tracks: unknown) {
    return request<{ ok: boolean; serialized: string }>("/tracks/serialize", {
      method: "POST",
      body: JSON.stringify(tracks),
    });
  },

  serializeMixer(mixer: unknown) {
    return request<{ ok: boolean; serialized: string }>("/mixer/serialize", {
      method: "POST",
      body: JSON.stringify(mixer),
    });
  },

  listPlugins() {
    return request<{ ok: boolean; plugins: unknown[] }>("/plugins");
  },

  loadTransport(projectId: string) {
    return request<{ ok: boolean; transport: ExtendedTransportState }>(`/transport/${projectId}`);
  },

  saveTransport(projectId: string, transport: ExtendedTransportState) {
    return request<{ ok: boolean }>(`/transport/${projectId}`, {
      method: "PUT",
      body: JSON.stringify({ transport }),
    });
  },

  saveRecordingSession(projectId: string, takes: RecordingTake[]) {
    return request<{ ok: boolean }>(`/recording/sessions/${projectId}`, {
      method: "POST",
      body: JSON.stringify({ takes }),
    });
  },

  cacheWaveform(waveformId: string, data: WaveformData) {
    return request<{ ok: boolean }>("/waveform/cache", {
      method: "POST",
      body: JSON.stringify({ waveformId, data }),
    });
  },

  getAudioMetadata(clipId: string) {
    return request<{ ok: boolean; metadata: unknown }>(`/audio/metadata/${clipId}`);
  },

  saveRecoverySnapshot(project: OmniMusicProject, reason: string) {
    return request<{ ok: boolean }>("/recovery/snapshot", {
      method: "POST",
      body: JSON.stringify({ project, reason }),
    });
  },

  listRecoverySnapshots(projectId: string) {
    return request<{ ok: boolean; snapshots: unknown[] }>(`/recovery/snapshots/${projectId}`);
  },
};
