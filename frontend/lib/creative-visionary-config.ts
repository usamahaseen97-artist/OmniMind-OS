export type CreativeGenMode = "video" | "image";

export const CREATIVE_GEN_MODES: { id: CreativeGenMode; label: string; icon: string }[] = [
  { id: "video", label: "AI Video Scene Generator", icon: "🎥" },
  { id: "image", label: "High-Fidelity Image Creator", icon: "🖼️" },
];

export const VIDEO_DURATION_SEC = [5, 15, 30, 60] as const;
export type VideoDurationSec = (typeof VIDEO_DURATION_SEC)[number];

export const IMAGE_BATCH_COUNTS = [1, 2, 3, 4, 5] as const;
export type ImageBatchCount = (typeof IMAGE_BATCH_COUNTS)[number];

export const VIDEO_FOCUS_CHIPS = [
  { label: "Product Reveal Loop", prompt: "Cinematic product reveal with slow dolly and rim lighting" },
  { label: "Human Portrait Motion", prompt: "8K human model portrait with subtle parallax and soft key light" },
  { label: "Ambient B-Roll", prompt: "Wide ambient B-roll with golden hour atmosphere" },
] as const;

export const IMAGE_FOCUS_CHIPS = [
  { label: "Product Shots", prompt: "Ultra-realistic studio product shot with macro detail" },
  { label: "Human Models", prompt: "High-fidelity human model portrait, editorial lighting" },
  { label: "Cinematic Backgrounds", prompt: "Cinematic wide-angle environment plate, depth haze" },
] as const;

export const IMAGE_VARIATION_LABELS = [
  "Variant A · Key light",
  "Variant B · Rim grade",
  "Variant C · Soft diffusion",
  "Variant D · Contrast punch",
  "Variant E · Film grain",
] as const;

export function buildImageGradients(prompt: string, count: number): string[] {
  const seed = prompt.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return Array.from({ length: count }, (_, i) => {
    const hue = (seed * 17 + i * 47) % 360;
    const hue2 = (hue + 40 + i * 12) % 360;
    return `linear-gradient(145deg, hsl(${hue} 42% 18%) 0%, hsl(${hue2} 55% 32%) 50%, hsl(${(hue + 80) % 360} 38% 14%) 100%)`;
  });
}
