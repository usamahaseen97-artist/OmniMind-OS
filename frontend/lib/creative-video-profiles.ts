export type CreativeVideoDurationSec = 10 | 30 | 60;

export type CreativeVideoProfile = {
  seconds: CreativeVideoDurationSec;
  label: string;
  resolution: string;
  resolutionVector: string;
  fps: number;
  frameCount: number;
  aspect: string;
  codec: string;
  shots: number;
  lensProfile: string;
  motionModel: string;
  bitrate: string;
  encodeLabel: string;
};

export const CREATIVE_VIDEO_PROFILES: Record<CreativeVideoDurationSec, CreativeVideoProfile> = {
  10: {
    seconds: 10,
    label: "10s Video",
    resolution: "1080×1920",
    resolutionVector: "1080w × 1920h · 9:16 vertical",
    fps: 30,
    frameCount: 300,
    aspect: "9:16",
    codec: "H.264 · AAC",
    shots: 3,
    lensProfile: "35mm equiv · shallow DOF",
    motionModel: "Text-to-Video · fast cuts",
    bitrate: "~8 Mbps",
    encodeLabel: "Short-form burst encode",
  },
  30: {
    seconds: 30,
    label: "30s Video",
    resolution: "1920×1080",
    resolutionVector: "1920w × 1080h · 16:9 cinematic",
    fps: 24,
    frameCount: 720,
    aspect: "16:9",
    codec: "H.264 · AAC",
    shots: 6,
    lensProfile: "50mm anamorphic · film grain",
    motionModel: "Text / Image-to-Video · dolly",
    bitrate: "~12 Mbps",
    encodeLabel: "Standard cinematic pipeline",
  },
  60: {
    seconds: 60,
    label: "60s Video",
    resolution: "1920×1080",
    resolutionVector: "1920w × 1080h · 16:9 · multi-scene",
    fps: 24,
    frameCount: 1440,
    aspect: "16:9",
    codec: "H.264 · AAC · Ken-Burns",
    shots: 12,
    lensProfile: "24–85mm sequence · HDR grade",
    motionModel: "Sora-style scene stack · I2V",
    bitrate: "~16 Mbps",
    encodeLabel: "Full cinematic synthesis",
  },
};

export const CREATIVE_VIDEO_DURATION_OPTIONS: CreativeVideoDurationSec[] = [10, 30, 60];

export function profileForDuration(sec: CreativeVideoDurationSec): CreativeVideoProfile {
  return CREATIVE_VIDEO_PROFILES[sec];
}

export function durationHintForMessage(sec: CreativeVideoDurationSec): string {
  return `[Output length: ${sec} seconds, ${CREATIVE_VIDEO_PROFILES[sec].resolution}, cinematic H.264]`;
}
