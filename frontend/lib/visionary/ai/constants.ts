import type { AIWorkflowKind, AspectRatio, ModelProviderId, PromptDraft, QualityPreset } from "./types";

export const AI_WORKFLOWS: {
  id: AIWorkflowKind;
  label: string;
  input: "text" | "image" | "text+image";
  output: "image" | "video" | "3d" | "mixed";
}[] = [
  { id: "text-to-image", label: "Text → Image", input: "text", output: "image" },
  { id: "text-to-video", label: "Text → Video", input: "text", output: "video" },
  { id: "image-to-image", label: "Image → Image", input: "image", output: "image" },
  { id: "image-to-video", label: "Image → Video", input: "image", output: "video" },
  { id: "text-to-3d", label: "Text → 3D", input: "text", output: "3d" },
  { id: "text-to-logo", label: "Text → Logo", input: "text", output: "image" },
  { id: "text-to-product-mockup", label: "Text → Product Mockup", input: "text", output: "image" },
  { id: "text-to-social-post", label: "Text → Social Post", input: "text", output: "mixed" },
  { id: "text-to-ad-creative", label: "Text → Ad Creative", input: "text", output: "mixed" },
  { id: "text-to-storyboard", label: "Text → Storyboard", input: "text", output: "image" },
  { id: "text-to-character", label: "Text → Character", input: "text", output: "image" },
  { id: "text-to-comic", label: "Text → Comic", input: "text", output: "image" },
  { id: "text-to-anime", label: "Text → Anime", input: "text", output: "image" },
  { id: "text-to-cinematic", label: "Text → Cinematic", input: "text", output: "video" },
  { id: "text-to-background", label: "Text → Background", input: "text", output: "image" },
  { id: "text-to-thumbnail", label: "Text → Thumbnail", input: "text", output: "image" },
  { id: "text-to-ui-design", label: "Text → UI Design", input: "text", output: "image" },
  { id: "text-to-website", label: "Text → Website", input: "text", output: "mixed" },
  { id: "text-to-app-mockup", label: "Text → App Mockup", input: "text", output: "image" },
  { id: "text-to-game-assets", label: "Text → Game Assets", input: "text", output: "mixed" },
];

export const MODEL_PROVIDER_DESCRIPTORS: {
  id: ModelProviderId;
  label: string;
  workflows: AIWorkflowKind[];
}[] = [
  {
    id: "openai",
    label: "OpenAI",
    workflows: ["text-to-image", "text-to-video", "text-to-ui-design", "text-to-website"],
  },
  {
    id: "google",
    label: "Google",
    workflows: ["text-to-image", "text-to-video", "text-to-cinematic", "text-to-thumbnail"],
  },
  {
    id: "runway",
    label: "Runway",
    workflows: ["text-to-video", "image-to-video", "text-to-cinematic"],
  },
  {
    id: "stability",
    label: "Stability",
    workflows: ["text-to-image", "image-to-image", "text-to-background", "text-to-logo"],
  },
  {
    id: "flux",
    label: "Flux",
    workflows: ["text-to-image", "image-to-image", "text-to-character", "text-to-anime"],
  },
  {
    id: "comfyui",
    label: "ComfyUI",
    workflows: AI_WORKFLOWS.map((w) => w.id),
  },
  {
    id: "local",
    label: "Local Models",
    workflows: ["text-to-image", "image-to-image", "text-to-background"],
  },
  {
    id: "omni-future",
    label: "Omni Models (Future)",
    workflows: AI_WORKFLOWS.map((w) => w.id),
  },
];

export const ASPECT_RATIOS: AspectRatio[] = ["1:1", "4:3", "16:9", "9:16", "3:2", "21:9", "custom"];

export const QUALITY_PRESETS: QualityPreset[] = ["draft", "standard", "high", "ultra"];

export const LENS_OPTIONS = ["Wide 24mm", "Standard 50mm", "Portrait 85mm", "Telephoto 135mm", "Macro"];
export const LIGHTING_OPTIONS = ["Natural", "Studio Soft", "Golden Hour", "Neon", "Dramatic", "Flat"];
export const MOOD_OPTIONS = ["Professional", "Cinematic", "Playful", "Dark", "Minimal", "Vibrant"];
export const STYLE_OPTIONS = ["Photorealistic", "Illustration", "3D Render", "Flat Design", "Anime", "Comic"];

export const PROMPT_TEMPLATES: {
  id: string;
  label: string;
  workflow: AIWorkflowKind;
  positive: string;
  negative: string;
}[] = [
  {
    id: "tpl-cinematic",
    label: "Cinematic Hero",
    workflow: "text-to-cinematic",
    positive: "{{subject}} in dramatic lighting, anamorphic lens, film grain, 4K",
    negative: "blurry, low quality, watermark",
  },
  {
    id: "tpl-social",
    label: "Social Carousel",
    workflow: "text-to-social-post",
    positive: "{{brand}} product showcase, clean layout, {{mood}} palette",
    negative: "cluttered, illegible text",
  },
  {
    id: "tpl-logo",
    label: "Minimal Logo",
    workflow: "text-to-logo",
    positive: "Minimal vector logo for {{company}}, {{style}}, scalable",
    negative: "photorealistic, complex gradients",
  },
  {
    id: "tpl-product",
    label: "Product Mockup",
    workflow: "text-to-product-mockup",
    positive: "{{product}} on studio pedestal, soft shadows, commercial photography",
    negative: "distorted, unrealistic proportions",
  },
  {
    id: "tpl-anime",
    label: "Anime Character",
    workflow: "text-to-anime",
    positive: "{{character}} full body, anime style, cel shading, dynamic pose",
    negative: "western cartoon, blurry",
  },
  {
    id: "tpl-ui",
    label: "App UI Screen",
    workflow: "text-to-ui-design",
    positive: "{{app}} mobile dashboard, modern UI, {{style}}, Figma-ready",
    negative: "low resolution, inconsistent spacing",
  },
];

export const MODULE_WORKFLOW_MAP: Partial<Record<string, AIWorkflowKind>> = {
  "ai-creator": "text-to-image",
  "image-studio": "text-to-image",
  "video-studio": "text-to-video",
  "vfx-studio": "image-to-video",
  "marketing-studio": "text-to-ad-creative",
  "brand-studio": "text-to-logo",
  "product-studio": "text-to-product-mockup",
  "animation-studio": "text-to-anime",
  "3d-studio": "text-to-3d",
  "social-media-studio": "text-to-social-post",
};

export function createDefaultPrompt(workflow: AIWorkflowKind = "text-to-image"): PromptDraft {
  return {
    id: `prompt-${Date.now()}`,
    positive: "",
    negative: "blurry, low quality, watermark, distorted",
    workflow,
    variables: [
      { key: "subject", value: "", label: "Subject" },
      { key: "style", value: "Photorealistic", label: "Style" },
      { key: "brand", value: "", label: "Brand" },
    ],
    camera: {
      lens: "Standard 50mm",
      focalLength: 50,
      aperture: "f/2.8",
      lighting: "Studio Soft",
      mood: "Professional",
      angle: "Eye level",
    },
    aspectRatio: "16:9",
    quality: "high",
    creativity: 0.7,
    seed: null,
    cfg: 7.5,
    steps: 30,
    referenceImageIds: [],
    multiPrompts: [],
  };
}
