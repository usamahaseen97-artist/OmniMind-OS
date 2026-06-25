import type {
  BroadcastTemplate,
  PodcastEpisode,
  PodcastSeries,
  RestorationProfile,
  SoundLibraryItem,
  SpatialMixState,
  StreamingSession,
  VoiceOverProject,
} from "../broadcast-types";

export const PODCAST_SERIES_SEED: PodcastSeries[] = [
  { id: "ser-1", name: "OmniMind Tech Talk", description: "Weekly AI & product insights", episodeIds: ["ep-1"], category: "Technology" },
];

export const EPISODE_SEED: PodcastEpisode = {
  id: "ep-1",
  seriesId: "ser-1",
  title: "Episode 1 — Welcome to OmniMusic Broadcast",
  description: "Introduction to podcast production in OmniMind OS.",
  status: "draft",
  durationSec: 0,
  notes: "Record host intro, invite guest for segment 2.",
  keywords: ["podcast", "omnimind", "ai"],
  createdAt: new Date().toISOString(),
  chapters: [
    { id: "ch-1", title: "Intro", startSec: 0, endSec: 60, notes: "Cold open" },
    { id: "ch-2", title: "Main Discussion", startSec: 60, endSec: null, notes: "" },
  ],
  segments: [
    { id: "seg-intro", kind: "intro", title: "Show Intro", startSec: 0, durationSec: 15 },
    { id: "seg-main", kind: "main", title: "Interview", startSec: 15, durationSec: 1800 },
    { id: "seg-outro", kind: "outro", title: "Outro", startSec: 1815, durationSec: 30 },
  ],
  tracks: [
    { id: "pt-host", episodeId: "ep-1", name: "Host", role: "host", muted: false, gain: 0.85, remote: false, guestId: null },
    { id: "pt-guest", episodeId: "ep-1", name: "Guest", role: "guest", muted: false, gain: 0.8, remote: false, guestId: null },
    { id: "pt-remote", episodeId: "ep-1", name: "Remote Guest", role: "remote-guest", muted: false, gain: 0.75, remote: true, guestId: "rg-1" },
  ],
};

export const VOICEOVER_SEED: VoiceOverProject[] = [
  { id: "vo-1", title: "Product Launch Spot", category: "commercial", script: "Introducing the future of audio.", durationSec: 30, status: "draft" },
  { id: "vo-2", title: "Training Module 1", category: "training", script: "Welcome to module one.", durationSec: 120, status: "draft" },
];

export const DEFAULT_SPATIAL: SpatialMixState = {
  format: "stereo",
  objects: [
    { id: "obj-vox", label: "Dialogue", x: 0, y: 0, z: 0, width: 1, height: 0, gain: 1 },
    { id: "obj-music", label: "Music Bed", x: -0.5, y: 0, z: -1, width: 1.2, height: 0, gain: 0.6 },
  ],
  roomSimulation: false,
  binauralMonitor: true,
  heightChannels: 0,
};

export const STREAMING_PLATFORMS = [
  { id: "youtube" as const, label: "YouTube Live", rtmp: "rtmp://a.rtmp.youtube.com/live2" },
  { id: "twitch" as const, label: "Twitch", rtmp: "rtmp://live.twitch.tv/app" },
  { id: "kick" as const, label: "Kick", rtmp: "rtmp://fa723fc1b171.global-contribute.live-video.net/live" },
  { id: "facebook" as const, label: "Facebook Live", rtmp: "rtmps://live-api-s.facebook.com:443/rtmp" },
  { id: "instagram" as const, label: "Instagram Live", rtmp: "rtmps://live-upload.instagram.com:443/rtmp" },
];

export const RESTORATION_PRESETS: RestorationProfile[] = [
  { id: "rp-clean", name: "Podcast Clean", noiseReduction: 40, humRemoval: 60, clickRemoval: 30, popRemoval: 50, windReduction: 20, echoReduction: 35, roomCorrection: 25 },
  { id: "rp-broadcast", name: "Broadcast Polish", noiseReduction: 25, humRemoval: 70, clickRemoval: 40, popRemoval: 45, windReduction: 15, echoReduction: 50, roomCorrection: 40 },
];

export const SOUND_LIBRARY_SEED: SoundLibraryItem[] = [
  { id: "sl-1", name: "Podcast Intro Sting", category: "podcast", tags: ["intro", "sting"], durationSec: 8, favorite: true, collectionId: "col-podcast" },
  { id: "sl-2", name: "News Bed Loop", category: "broadcast", tags: ["news", "bed"], durationSec: 60, favorite: false, collectionId: "col-broadcast" },
  { id: "sl-3", name: "Room Tone", category: "ambience", tags: ["room", "ambience"], durationSec: 120, favorite: false, collectionId: null },
  { id: "sl-4", name: "Whoosh FX", category: "fx", tags: ["transition"], durationSec: 2, favorite: true, collectionId: null },
];

export const BROADCAST_TEMPLATES: BroadcastTemplate[] = [
  { id: "bt-interview", name: "Interview Podcast", category: "podcast", description: "Host + guest + remote guest layout" },
  { id: "bt-solo", name: "Solo Show", category: "podcast", description: "Single host with intro/outro segments" },
  { id: "bt-live", name: "Live Stream", category: "stream", description: "RTMP streaming with scene switching" },
  { id: "bt-atmos", name: "Atmos Immersive", category: "spatial", description: "Object-based spatial mix template" },
];

export const DEFAULT_STREAMING_SESSION: StreamingSession = {
  id: "stream-1",
  platform: "youtube",
  title: "OmniMusic Live Session",
  rtmpUrl: "rtmp://a.rtmp.youtube.com/live2",
  streamKey: "",
  status: "idle",
  scenes: [
    { id: "sc-1", name: "Main Mix", audioRouteId: "route-main", active: true },
    { id: "sc-2", name: "Talk Only", audioRouteId: "route-talk", active: false },
  ],
  viewerCount: 0,
  recordingEnabled: true,
};
