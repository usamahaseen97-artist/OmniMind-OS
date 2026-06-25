import type {
  PodcastEpisode,
  RestorationProfile,
  SpatialMixState,
  StreamingSession,
  TranscriptDocument,
} from "../broadcast-types";

export type EpisodeState = { episodes: PodcastEpisode[]; activeEpisodeId: string | null };

const BASE = "/api/v1/omnimusic/studio/broadcast";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  if (!res.ok) throw new Error(`OmniMusic Broadcast API ${res.status}`);
  return res.json() as Promise<T>;
}

export const omnimusicBroadcastApi = {
  saveEpisodes(projectId: string, state: EpisodeState) {
    return request<{ ok: boolean }>(`/episodes/${projectId}`, { method: "PUT", body: JSON.stringify(state) });
  },
  listEpisodes(projectId: string) {
    return request<{ ok: boolean; episodes: PodcastEpisode[] }>(`/episodes/${projectId}`);
  },
  saveTranscript(projectId: string, doc: TranscriptDocument) {
    return request<{ ok: boolean }>(`/transcripts/${projectId}`, { method: "PUT", body: JSON.stringify(doc) });
  },
  saveStreaming(projectId: string, session: StreamingSession) {
    return request<{ ok: boolean }>(`/streaming/${projectId}`, { method: "PUT", body: JSON.stringify(session) });
  },
  saveSpatial(projectId: string, state: SpatialMixState) {
    return request<{ ok: boolean }>(`/spatial/${projectId}`, { method: "PUT", body: JSON.stringify(state) });
  },
  saveRestorationProfile(profile: RestorationProfile) {
    return request<{ ok: boolean }>("/restoration-profiles", { method: "POST", body: JSON.stringify(profile) });
  },
  listBroadcastPresets() {
    return request<{ ok: boolean; presets: unknown[] }>("/presets");
  },
};
