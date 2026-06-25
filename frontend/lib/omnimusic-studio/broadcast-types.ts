/** OmniMusic Studio — Podcast, Broadcast & Spatial Audio types (Phase 6). */

export type BroadcastPanel =
  | "podcast"
  | "voiceover"
  | "spatial"
  | "streaming"
  | "transcripts"
  | "restoration"
  | "library"
  | "assistant";

export type PodcastTrackRole = "host" | "guest" | "remote-guest" | "music" | "sfx";

export type PodcastTrack = {
  id: string;
  episodeId: string;
  name: string;
  role: PodcastTrackRole;
  muted: boolean;
  gain: number;
  remote: boolean;
  guestId: string | null;
};

export type EpisodeChapter = {
  id: string;
  title: string;
  startSec: number;
  endSec: number | null;
  notes: string;
};

export type EpisodeSegment = {
  id: string;
  kind: "intro" | "outro" | "sponsor" | "main" | "ad-read";
  title: string;
  startSec: number;
  durationSec: number;
};

export type PodcastEpisode = {
  id: string;
  seriesId: string;
  title: string;
  description: string;
  status: "draft" | "recording" | "editing" | "published";
  durationSec: number;
  notes: string;
  chapters: EpisodeChapter[];
  segments: EpisodeSegment[];
  tracks: PodcastTrack[];
  keywords: string[];
  createdAt: string;
};

export type PodcastSeries = {
  id: string;
  name: string;
  description: string;
  episodeIds: string[];
  category: string;
};

export type RemoteGuest = {
  id: string;
  name: string;
  email: string;
  status: "invited" | "connected" | "disconnected";
  latencyMs: number;
};

export type VoiceOverCategory =
  | "commercial"
  | "narration"
  | "audiobook"
  | "documentary"
  | "youtube"
  | "training"
  | "presentation"
  | "corporate";

export type VoiceOverProject = {
  id: string;
  title: string;
  category: VoiceOverCategory;
  script: string;
  durationSec: number;
  status: "draft" | "recording" | "complete";
};

export type TranscriptWord = {
  id: string;
  text: string;
  startSec: number;
  endSec: number;
  speakerId: string;
  confidence: number;
};

export type TranscriptSpeaker = {
  id: string;
  label: string;
  color: string;
};

export type TranscriptDocument = {
  id: string;
  episodeId: string;
  language: string;
  words: TranscriptWord[];
  speakers: TranscriptSpeaker[];
  bookmarks: { id: string; sec: number; label: string }[];
  searchable: boolean;
};

export type SubtitleFormat = "srt" | "vtt" | "ass";

export type SpatialFormat = "stereo" | "5.1" | "7.1" | "atmos" | "binaural";

export type SpatialObject = {
  id: string;
  label: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  gain: number;
};

export type SpatialMixState = {
  format: SpatialFormat;
  objects: SpatialObject[];
  roomSimulation: boolean;
  binauralMonitor: boolean;
  heightChannels: number;
};

export type StreamingPlatform = "youtube" | "twitch" | "kick" | "facebook" | "instagram";

export type StreamingScene = {
  id: string;
  name: string;
  audioRouteId: string;
  active: boolean;
};

export type StreamingSession = {
  id: string;
  platform: StreamingPlatform;
  title: string;
  rtmpUrl: string;
  streamKey: string;
  status: "idle" | "live" | "recording" | "ended";
  scenes: StreamingScene[];
  viewerCount: number;
  recordingEnabled: boolean;
};

export type RestorationProfile = {
  id: string;
  name: string;
  noiseReduction: number;
  humRemoval: number;
  clickRemoval: number;
  popRemoval: number;
  windReduction: number;
  echoReduction: number;
  roomCorrection: number;
};

export type SoundLibraryItem = {
  id: string;
  name: string;
  category: "music" | "loops" | "fx" | "ambience" | "podcast" | "broadcast";
  tags: string[];
  durationSec: number;
  favorite: boolean;
  collectionId: string | null;
};

export type SoundCollection = {
  id: string;
  name: string;
  itemIds: string[];
};

export type BroadcastTemplate = {
  id: string;
  name: string;
  category: "podcast" | "voiceover" | "stream" | "spatial";
  description: string;
  episodeDefaults?: Partial<PodcastEpisode>;
};

export type BroadcastAssistantSuggestion = {
  id: string;
  category: "summary" | "chapter" | "title" | "description" | "keywords" | "seo" | "highlights" | "clips" | "social";
  title: string;
  detail: string;
};

export type NoiseProfile = {
  id: string;
  name: string;
  sampleSec: number;
  fingerprint: number[];
  capturedAt: string;
};
