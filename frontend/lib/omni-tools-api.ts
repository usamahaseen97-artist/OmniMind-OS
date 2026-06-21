import { resolveBackendUrl } from "./backend-url";
import { buildPollinationsUrl } from "./live-render-pipeline";

import type { GeneratedFileAsset, GeneratedImageAsset } from "./execution-preview";
import type { MusicPlayerTrack } from "./music-player-types";

export type OmniToolId =
  | "video"
  | "create_image"
  | "create_music"
  | "deep_research"
  | "web_search"
  | "thinking"
  | "uploads"
  | "personal_intelligence"
  | "app_build"
  | "architecture";

export type ImageProcessState = "WARM-UP" | "BUILD" | "FINAL";

export type ToolDispatchResult = {
  success: boolean;
  tool?: string;
  message?: string;
  status?: string;
  thinking_seconds?: number;
  status_steps?: string[];
  preview?: {
    html?: string;
    type: string;
    image_url?: string;
    video_url?: string;
    images?: GeneratedImageAsset[];
    files?: GeneratedFileAsset[];
    svg?: string;
    active_tab?: "live" | "code" | "blueprint";
    music_track?: MusicPlayerTrack;
    track?: Record<string, unknown>;
  };
  track?: Record<string, unknown>;
  image_url?: string;
  imageUrl?: string;
  file_url?: string;
  provider?: string;
  video_url?: string;
  images?: GeneratedImageAsset[];
  files?: GeneratedFileAsset[];
  error?: string;
  mode?: "generate" | "inpaint";
  process_state?: ImageProcessState;
  subject_hint?: string;
  media_id?: string;
  reference_media_id?: string;
  subject_segmentation?: {
    kind: string;
    cx: number;
    cy: number;
    rx: number;
    ry: number;
  };
};

export type ToolDispatchPayload = {
  user_id: string;
  message: string;
  tool?: OmniToolId;
  image_refs?: string[];
  video_refs?: string[];
  audio_refs?: string[];
  file_refs?: { name: string; kind: string }[];
  history?: { role: string; content: string }[];
  agent_id?: string;
  source_image_id?: string;
  init_image_weight?: number;
  /** Primary conditioning frame (base64 data URL) — highest priority for I2V */
  init_image?: string;
  init_image_locked?: boolean;
  clip_guidance_scale?: number;
  denoising_strength?: number;
  image_guidance_scale?: number;
};

export type ImageSynthesizePayload = {
  user_id: string;
  message: string;
  agent_id: string;
  reference_media_id?: string;
  background_description?: string;
  subject_segmentation?: {
    kind: string;
    cx: number;
    cy: number;
    rx: number;
    ry: number;
  };
  mode?: "generate" | "inpaint";
};

export async function synthesizeImage(
  payload: ImageSynthesizePayload,
): Promise<ToolDispatchResult> {
  const base = await resolveBackendUrl();
  const ctrl = new AbortController();
  const timer = window.setTimeout(() => ctrl.abort(), 15_000);
  try {
    const res = await fetch(`${base}/api/v1/tools/image/synthesize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const err = await res.text();
      return fastPollinationsFallback(payload, err || res.statusText);
    }
    return res.json() as Promise<ToolDispatchResult>;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return fastPollinationsFallback(payload, msg);
  } finally {
    window.clearTimeout(timer);
  }
}

function fastPollinationsFallback(
  payload: ImageSynthesizePayload,
  reason?: string,
): ToolDispatchResult {
  const prompt = payload.message || "image";
  const url = buildPollinationsUrl(prompt);
  return {
    success: true,
    tool: "create_image",
    image_url: url,
    imageUrl: url,
    file_url: url,
    images: [{ url, alt: prompt.slice(0, 120) }],
    preview: {
      type: "image",
      image_url: url,
      images: [{ url, alt: prompt.slice(0, 120) }],
      active_tab: "live",
    },
    message: reason
      ? `**Image ready.** (fast path — ${reason.slice(0, 80)})`
      : "**Image ready.** (fast path)",
    provider: "pollinations_fast",
    mode: payload.mode ?? "generate",
  };
}

export async function dispatchOmniTool(
  payload: ToolDispatchPayload,
): Promise<ToolDispatchResult> {
  const base = await resolveBackendUrl();
  const res = await fetch(`${base}/api/v1/tools/dispatch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    return { success: false, error: err || res.statusText };
  }
  return res.json() as Promise<ToolDispatchResult>;
}

export async function generateVideo(
  payload: ToolDispatchPayload,
  onProgress?: (message: string, progress: number) => void,
): Promise<ToolDispatchResult> {
  const { generateVideoWithPolling } = await import("./video-generation-api");
  return generateVideoWithPolling(payload, onProgress);
}
