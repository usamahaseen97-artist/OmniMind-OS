import type { AIEditAction, EffectPreset, ExportPreset, MediaKind, TransitionPreset } from "./types";

export const EDITOR_TRACK_COLORS: Record<string, string> = {
  video: "#38bdf8",
  audio: "#a78bfa",
  subtitle: "#2dd4bf",
  overlay: "#fbbf24",
  adjustment: "#f472b6",
};

export const EFFECT_PRESETS: EffectPreset[] = [
  { id: "fx-blur", name: "Blur", category: "blur", params: { amount: 12 } },
  { id: "fx-glow", name: "Glow", category: "glow", params: { intensity: 0.6 } },
  { id: "fx-sharpen", name: "Sharpen", category: "sharpen", params: { amount: 0.4 } },
  { id: "fx-noise", name: "Noise", category: "noise", params: { grain: 0.15 } },
  { id: "fx-film-grain", name: "Film Grain", category: "film-grain", params: { size: 0.3 } },
  { id: "fx-lens", name: "Lens", category: "lens", params: { distortion: 0.1 } },
  { id: "fx-bloom", name: "Bloom", category: "bloom", params: { threshold: 0.8 } },
  { id: "fx-motion-blur", name: "Motion Blur", category: "motion-blur", params: { shutter: 180 } },
  { id: "fx-lighting", name: "Lighting", category: "lighting", params: { warmth: 0.2 } },
  { id: "fx-distortion", name: "Distortion", category: "distortion", params: { amount: 0.05 } },
  { id: "fx-vintage", name: "Vintage", category: "vintage", params: { fade: 0.35 } },
  { id: "fx-modern", name: "Modern", category: "modern", params: { clarity: 0.5 } },
  { id: "fx-cinematic", name: "Cinematic", category: "cinematic", params: { letterbox: 1 } },
];

export const TRANSITION_PRESETS: TransitionPreset[] = [
  { id: "tr-fade", name: "Fade", category: "fade", durationFrames: 15 },
  { id: "tr-dissolve", name: "Cross Dissolve", category: "cross-dissolve", durationFrames: 20 },
  { id: "tr-zoom", name: "Zoom", category: "zoom", durationFrames: 12 },
  { id: "tr-slide", name: "Slide", category: "slide", durationFrames: 18 },
  { id: "tr-whip", name: "Whip", category: "whip", durationFrames: 8 },
  { id: "tr-flash", name: "Flash", category: "flash", durationFrames: 6 },
  { id: "tr-film", name: "Film", category: "film", durationFrames: 24 },
  { id: "tr-glitch", name: "Glitch", category: "glitch", durationFrames: 10 },
  { id: "tr-motion", name: "Motion", category: "motion", durationFrames: 16 },
];

export const EXPORT_PRESETS: ExportPreset[] = [
  { id: "exp-yt-4k", label: "YouTube 4K", platform: "youtube", resolution: "4k", fps: 30, hdr: false },
  { id: "exp-tiktok", label: "TikTok 9:16", platform: "tiktok", resolution: "1080p", fps: 30, hdr: false },
  { id: "exp-ig-reel", label: "Instagram Reel", platform: "instagram", resolution: "1080p", fps: 30, hdr: false },
  { id: "exp-fb", label: "Facebook HD", platform: "facebook", resolution: "1080p", fps: 30, hdr: false },
  { id: "exp-li", label: "LinkedIn", platform: "linkedin", resolution: "1080p", fps: 30, hdr: false },
  { id: "exp-4k-master", label: "4K Master", platform: "custom", resolution: "4k", fps: 24, hdr: false },
  { id: "exp-8k-hdr", label: "8K HDR", platform: "custom", resolution: "8k", fps: 24, hdr: true },
];

export const AI_EDIT_ACTIONS: { id: AIEditAction; label: string; description: string }[] = [
  { id: "detect-silence", label: "Detect Silence", description: "Mark silent regions on audio tracks" },
  { id: "remove-pauses", label: "Remove Pauses", description: "Ripple-delete detected silence" },
  { id: "auto-cut", label: "Auto Cut", description: "Suggest cuts at scene boundaries" },
  { id: "highlight-moments", label: "Highlight Moments", description: "Flag high-energy segments" },
  { id: "auto-captions", label: "Auto Captions", description: "Generate subtitle track placeholders" },
  { id: "chapter-detection", label: "Chapter Detection", description: "Insert timeline markers as chapters" },
  { id: "b-roll-placeholders", label: "B-Roll Placeholders", description: "Suggest overlay gaps for B-roll" },
  { id: "scene-detection", label: "Scene Detection", description: "Split clips at detected scenes" },
];

export const TEXT_TEMPLATES = [
  { id: "tt-title", label: "Cinematic Title", lowerThird: false },
  { id: "tt-lower", label: "Lower Third", lowerThird: true },
  { id: "tt-caption", label: "Caption Bar", lowerThird: false },
  { id: "tt-kinetic", label: "Kinetic Text", lowerThird: false },
];

export const MEDIA_KIND_LABELS: Record<MediaKind, string> = {
  video: "Video",
  audio: "Audio",
  image: "Image",
  gif: "GIF",
  png: "PNG",
  psd: "PSD",
  svg: "SVG",
  "3d": "3D",
  brand: "Brand",
};

export const DEFAULT_COLOR_GRADE = {
  exposure: 0,
  contrast: 0,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  temperature: 0,
  tint: 0,
  saturation: 0,
  lutId: null as string | null,
};

export const SEED_MEDIA = [
  { id: "med-1", name: "Interview_A_Cam.mp4", kind: "video" as const, durationFrames: 900, color: "#38bdf8" },
  { id: "med-2", name: "Ambient_Score.wav", kind: "audio" as const, durationFrames: 1800, color: "#a78bfa" },
  { id: "med-3", name: "Logo_Animation.mov", kind: "video" as const, durationFrames: 120, color: "#34d399" },
  { id: "med-4", name: "B-Roll_City.png", kind: "png" as const, durationFrames: 150, color: "#fbbf24" },
  { id: "med-5", name: "Brand_Kit.svg", kind: "brand" as const, durationFrames: 1, color: "#f472b6" },
];

export const VIDEO_EDITOR_MODULES = new Set(["video-studio", "video-editor"]);
