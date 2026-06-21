/** Client-side catalog for macro-engine search filtering (no Sovereign chat DB). */

export type MusicTrack = {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  durationSec: number;
  playlist: string;
  category?: string;
  thumbnailUrl?: string;
  tags: string[];
  /** Public stream URL — plays in browser */
  audioUrl: string;
  /** audius = real stream; omnimusic = catalog metadata */
  source?: string;
};

export type StreamTitle = {
  id: string;
  title: string;
  row: "hollywood" | "bollywood" | "pakistani" | "kdrama";
  year: string;
  tags: string[];
  audioOptions: string[];
  previewVideoUrl: string;
};

export type TvRegion = "pakistan" | "international";

export type LiveChannel = {
  id: string;
  name: string;
  category: string;
  m3u8Url?: string;
  embedUrl?: string;
  sourceType?: "youtube" | "hls";
  officialUrl?: string;
  streamUrls?: string[];
  sourceCount?: number;
  sourceRef?: string;
  tags: string[];
  region: TvRegion;
  trendingKarachi?: boolean;
};

export const MUSIC_PLAYLISTS = [
  "Pakistani Latest",
  "Pakistani Classics",
  "Bollywood Latest",
  "Bollywood Classics",
  "Hollywood Pop",
  "Hollywood Classics",
  "Punjabi Hits",
  "Turkish Drama",
  "Coke Studio",
  "Neural Focus",
  "Emerald Beats",
] as const;

const DEMO_MP3 = (n: number) =>
  `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${n}.mp3`;

const DEMO_MP4 =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export const MUSIC_CATALOG: MusicTrack[] = [
  { id: "m1", title: "Neon Horizon", artist: "OmniMind Synth", album: "V11 Sessions", duration: "6:12", durationSec: 372, playlist: "Emerald Beats", tags: ["synth", "focus", "neon"], audioUrl: DEMO_MP3(1) },
  { id: "m2", title: "Quantum Drift", artist: "Aural Labs", album: "Orbital", duration: "8:38", durationSec: 518, playlist: "Neural Focus", tags: ["ambient", "quantum"], audioUrl: DEMO_MP3(2) },
  { id: "m3", title: "Emerald Pulse", artist: "Sovereign Beats", album: "Matte Black", duration: "5:28", durationSec: 328, playlist: "Emerald Beats", tags: ["pulse", "bass"], audioUrl: DEMO_MP3(3) },
  { id: "m4", title: "Deep Matte", artist: "Night Grid", album: "After Hours", duration: "7:44", durationSec: 464, playlist: "Night Architecture", tags: ["deep", "lofi"], audioUrl: DEMO_MP3(4) },
  { id: "m5", title: "Glass Architecture", artist: "Studio V11", album: "Blueprints", duration: "9:09", durationSec: 549, playlist: "Sovereign Synthwave", tags: ["architect", "glass"], audioUrl: DEMO_MP3(5) },
  { id: "m6", title: "Urdu Velvet Tone", artist: "Lahore Wave", album: "South Mix", duration: "8:02", durationSec: 482, playlist: "Emerald Beats", tags: ["urdu", "tone", "vocal"], audioUrl: DEMO_MP3(6) },
  { id: "m7", title: "Autotune Prism", artist: "Tone Forge", album: "Custom Gen", duration: "6:50", durationSec: 410, playlist: "Neural Focus", tags: ["autotune", "custom", "generation"], audioUrl: DEMO_MP3(7) },
  { id: "m8", title: "Bollywood Strings", artist: "Mumbai Pulse", album: "Drama OST", duration: "10:12", durationSec: 612, playlist: "Night Architecture", tags: ["bollywood", "strings"], audioUrl: DEMO_MP3(8) },
  { id: "m9", title: "Karachi Nights", artist: "Sindh Wave", album: "Coastal", duration: "7:15", durationSec: 435, playlist: "Emerald Beats", tags: ["karachi", "night"], audioUrl: DEMO_MP3(9) },
  { id: "m10", title: "PSL Anthem Mix", artist: "Stadium FX", album: "Live", duration: "5:40", durationSec: 340, playlist: "Neural Focus", tags: ["sports", "cricket"], audioUrl: DEMO_MP3(10) },
];

const SAMPLES = {
  bunny: DEMO_MP4,
  elephants: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  sintel: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
};

export const STREAM_CATALOG: StreamTitle[] = [
  { id: "s1", title: "Neon Heist", row: "hollywood", year: "2025", tags: ["action", "sci-fi"], audioOptions: ["English Original", "Urdu/Hindi Dubbing", "Spanish"], previewVideoUrl: SAMPLES.bunny },
  { id: "s2", title: "Orbital Dawn", row: "hollywood", year: "2024", tags: ["space", "thriller"], audioOptions: ["English Original", "French"], previewVideoUrl: SAMPLES.elephants },
  { id: "s3", title: "Silent Vector", row: "hollywood", year: "2023", tags: ["noir"], audioOptions: ["English Original"], previewVideoUrl: SAMPLES.sintel },
  { id: "s4", title: "Monsoon Lines", row: "bollywood", year: "2025", tags: ["romance", "drama"], audioOptions: ["Hindi Original", "Urdu/Hindi Dubbing", "English"], previewVideoUrl: SAMPLES.bunny },
  { id: "s5", title: "Mumbai Pulse", row: "bollywood", year: "2024", tags: ["crime"], audioOptions: ["Hindi Original", "English"], previewVideoUrl: SAMPLES.elephants },
  { id: "s6", title: "Lahore Nights", row: "pakistani", year: "2025", tags: ["family", "drama"], audioOptions: ["Urdu Original", "Urdu/Hindi Dubbing"], previewVideoUrl: SAMPLES.sintel },
  { id: "s7", title: "Karachi Skies", row: "pakistani", year: "2024", tags: ["urban", "karachi"], audioOptions: ["Urdu Original", "English"], previewVideoUrl: SAMPLES.bunny },
  { id: "s8", title: "Glass Seoul", row: "kdrama", year: "2025", tags: ["k-drama", "romance"], audioOptions: ["Korean Original", "English", "Urdu/Hindi Dubbing"], previewVideoUrl: SAMPLES.elephants },
  { id: "s9", title: "Echo Harbor", row: "kdrama", year: "2024", tags: ["mystery"], audioOptions: ["Korean Original", "Japanese"], previewVideoUrl: SAMPLES.sintel },
  { id: "s10", title: "Busan Tide", row: "kdrama", year: "2023", tags: ["south korean", "sports"], audioOptions: ["Korean Original", "English"], previewVideoUrl: SAMPLES.bunny },
  { id: "s11", title: "DHA Chronicles", row: "pakistani", year: "2025", tags: ["dha", "karachi"], audioOptions: ["Urdu Original"], previewVideoUrl: SAMPLES.elephants },
  { id: "s12", title: "Clifton Bay", row: "pakistani", year: "2024", tags: ["clifton", "karachi"], audioOptions: ["Urdu Original", "English"], previewVideoUrl: SAMPLES.sintel },
];

export const TV_CHANNELS: LiveChannel[] = [
  {
    id: "geo-news",
    name: "Geo News",
    category: "Live News",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UC_vt34wimdCzdkrzVejwX9g",
    sourceType: "youtube",
    officialUrl: "https://www.youtube.com/channel/UC_vt34wimdCzdkrzVejwX9g",
    tags: ["geo", "news", "pakistan", "urdu", "official"],
    region: "pakistan",
    trendingKarachi: true,
  },
  {
    id: "ary-news",
    name: "ARY News",
    category: "Live News",
    embedUrl: "https://www.youtube.com/embed/live_stream?channel=UCMmpLL2ucRHAXbNHiCPyIyg",
    sourceType: "youtube",
    officialUrl: "https://www.youtube.com/channel/UCMmpLL2ucRHAXbNHiCPyIyg",
    tags: ["ary", "news", "pakistan", "urdu", "official"],
    region: "pakistan",
    trendingKarachi: true,
  },
  {
    id: "nasa-tv-public",
    name: "NASA TV Public",
    category: "Live News",
    m3u8Url: "https://nasa-i.akamaihd.net/hls/live/253565/NASA-NTV1-Public/master.m3u8",
    sourceType: "hls",
    officialUrl: "https://www.nasa.gov/nasatv/",
    tags: ["nasa", "space", "public", "hls", "official"],
    region: "international",
  },
];

export const STREAM_ROW_LABELS: Record<StreamTitle["row"], string> = {
  hollywood: "Hollywood",
  bollywood: "Bollywood",
  pakistani: "Pakistani Dramas",
  kdrama: "K-Dramas / South Korean",
};

export function filterMusicCatalog(query: string, playlist?: string): MusicTrack[] {
  const q = query.trim().toLowerCase();
  return MUSIC_CATALOG.filter((t) => {
    if (playlist && t.playlist !== playlist) return false;
    if (!q) return true;
    return [t.title, t.artist, t.album, t.playlist, ...t.tags].some((s) =>
      s.toLowerCase().includes(q),
    );
  });
}

export function filterStreamCatalog(query: string, row?: StreamTitle["row"]): StreamTitle[] {
  const q = query.trim().toLowerCase();
  return STREAM_CATALOG.filter((t) => {
    if (row && t.row !== row) return false;
    if (!q) return true;
    return [t.title, t.year, STREAM_ROW_LABELS[t.row], ...t.tags].some((s) =>
      s.toLowerCase().includes(q),
    );
  });
}

export function filterTvChannels(
  query: string,
  region?: TvRegion | "all",
  channels: LiveChannel[] = TV_CHANNELS,
): LiveChannel[] {
  const q = query.trim().toLowerCase();
  let list = channels;
  if (region && region !== "all") {
    list = list.filter((c) => c.region === region);
  }
  if (!q) {
    return [...list].sort((a, b) => {
      if (a.trendingKarachi && !b.trendingKarachi) return -1;
      if (!a.trendingKarachi && b.trendingKarachi) return 1;
      return 0;
    });
  }
  return list
    .filter((c) =>
      [c.name, c.category, ...c.tags].some((s) => s.toLowerCase().includes(q)),
    )
    .sort((a, b) => {
      if (a.trendingKarachi && !b.trendingKarachi) return -1;
      if (!a.trendingKarachi && b.trendingKarachi) return 1;
      return 0;
    });
}

/** Semantic playlist suggestions from query tokens (client-side). */
export function suggestPlaylistsFromQuery(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...MUSIC_PLAYLISTS];
  const hits = MUSIC_PLAYLISTS.filter((p) => p.toLowerCase().includes(q));
  const tagHits = MUSIC_CATALOG.filter((t) =>
    t.tags.some((tag) => tag.includes(q) || q.includes(tag)),
  ).map((t) => t.playlist);
  return [...new Set([...hits, ...tagHits])];
}
