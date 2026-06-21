export type GeneratedImageAsset = {
  url: string;
  alt?: string;
  provider?: string;
};

export type GeneratedFileAsset = {
  path: string;
  content: string;
  language?: string;
  isFolder?: boolean;
};

import type { MusicPlayerTrack } from "./music-player-types";
import { musicPlayerTrackFromApi } from "./music-player-types";
import { buildPollinationsUrl, proxiedImageUrl, isLikelyImageUrl } from "./live-render-pipeline";

export type ExecutionPreviewState = {
  html?: string;
  type: string;
  label: string;
  image_url?: string;
  video_url?: string;
  images?: GeneratedImageAsset[];
  files?: GeneratedFileAsset[];
  svg?: string;
  active_tab?: "live" | "code" | "blueprint";
  /** Spotify + YouTube stream card (create_music / music search) */
  music_track?: MusicPlayerTrack;
};

function proxyImageAsset(img: GeneratedImageAsset): GeneratedImageAsset {
  const raw = (img.url || "").trim();
  if (!raw) return { ...img, url: "" };
  const url = isLikelyImageUrl(raw) ? proxiedImageUrl(raw) : buildPollinationsUrl(raw);
  return { ...img, url };
}

export function previewFromApi(raw: Record<string, unknown>, label: string): ExecutionPreviewState {
  const imagesRaw = raw.images as GeneratedImageAsset[] | undefined;
  const images = imagesRaw?.map((img) => proxyImageAsset(img));
  const image_url = (raw.image_url as string) || imagesRaw?.[0]?.url;
  const video_url = raw.video_url as string | undefined;
  let active_tab: ExecutionPreviewState["active_tab"] = "live";
  const t = String(raw.type || "html");
  if (t === "app_build") active_tab = "code";
  if (t === "blueprint" || t === "architecture") active_tab = "blueprint";
  if ((t === "image" && image_url) || (t === "video" && video_url)) active_tab = "live";

  const musicRaw =
    (raw.music_track as Record<string, unknown> | undefined) ??
    (raw.track as Record<string, unknown> | undefined);
  const music_track = musicRaw ? musicPlayerTrackFromApi(musicRaw) : undefined;
  if (music_track && (t === "audio" || t === "music")) active_tab = "live";

  return {
    html: raw.html as string | undefined,
    type: t,
    label,
    image_url: music_track?.albumImageUrl || (image_url ? proxiedImageUrl(image_url) : undefined),
    video_url,
    images,
    files: raw.files as GeneratedFileAsset[] | undefined,
    svg: raw.svg as string | undefined,
    active_tab: (raw.active_tab as ExecutionPreviewState["active_tab"]) || active_tab,
    music_track: music_track ?? undefined,
  };
}
