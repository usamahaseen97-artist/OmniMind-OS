import type {
  BroadcastAssistantSuggestion,
  BroadcastPanel,
  BroadcastTemplate,
  NoiseProfile,
  PodcastEpisode,
  PodcastSeries,
  RemoteGuest,
  RestorationProfile,
  SoundCollection,
  SoundLibraryItem,
  SpatialMixState,
  StreamingSession,
  TranscriptDocument,
  VoiceOverCategory,
  VoiceOverProject,
} from "./broadcast-types";

export type OmniMusicBroadcastContextSlice = {
  broadcastPanel: BroadcastPanel;
  setBroadcastPanel: (p: BroadcastPanel) => void;
  podcastSeries: PodcastSeries[];
  podcastEpisodes: PodcastEpisode[];
  activeEpisodeId: string | null;
  setActiveEpisodeId: (id: string | null) => void;
  activeEpisode: PodcastEpisode | null;
  createEpisode: (seriesId: string, title: string) => void;
  updateEpisode: (id: string, patch: Partial<PodcastEpisode>) => void;
  addPodcastTrack: (episodeId: string, name: string, role: PodcastEpisode["tracks"][0]["role"]) => void;
  addChapter: (episodeId: string, title: string, startSec: number) => void;
  remoteGuests: RemoteGuest[];
  inviteRemoteGuest: (name: string, email: string) => void;
  connectRemoteGuest: (id: string) => void;
  voiceOverProjects: VoiceOverProject[];
  createVoiceOver: (title: string, category: VoiceOverCategory, script: string) => void;
  spatialMix: SpatialMixState;
  setSpatialFormat: (format: SpatialMixState["format"]) => void;
  updateSpatialObject: (id: string, patch: Partial<SpatialMixState["objects"][0]>) => void;
  streamingSession: StreamingSession;
  streamingPlatforms: { id: StreamingSession["platform"]; label: string; rtmp: string }[];
  setStreamingPlatform: (platform: StreamingSession["platform"]) => void;
  goLive: () => void;
  stopStream: () => void;
  switchStreamScene: (sceneId: string) => void;
  transcript: TranscriptDocument | null;
  generateTranscript: (episodeId: string) => void;
  exportSubtitles: (format: "srt" | "vtt") => string;
  restorationProfiles: RestorationProfile[];
  activeRestorationProfile: RestorationProfile;
  selectRestorationProfile: (id: string) => void;
  noiseProfiles: NoiseProfile[];
  captureNoiseProfile: (name: string, sampleSec: number) => void;
  soundLibrary: SoundLibraryItem[];
  soundCollections: SoundCollection[];
  searchSoundLibrary: (query: string) => SoundLibraryItem[];
  toggleSoundFavorite: (id: string) => void;
  broadcastTemplates: BroadcastTemplate[];
  broadcastSuggestions: BroadcastAssistantSuggestion[];
};
