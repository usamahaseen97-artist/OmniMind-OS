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
