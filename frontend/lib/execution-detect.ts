import type { OmniRouteId } from "./omni-tools";
import type { OmniToolId } from "./omni-tools-api";
import {
  isImageEditInstruction,
  isMultimodalImageRequest,
  matchPublicFigure,
} from "./image-prompt-intelligence";
import { parseSlashCommand } from "./slash-commands";
import { isSovereignGeneralChatRoute } from "./tool-routes";

const EXECUTION_VERBS =
  /\b(make|makes|making|create|creates|creating|build|builds|building|generate|generates|generating|design|draw|produce|render|compose|develop|craft|banao|बनाओ|बनाना|बना कर|पिक्चर|तस्वीर|ऐप|वेबसाइट)\b/i;

const PIC_BANAO = /pic\s*banao|picture\s*banao|photo\s*banao|पिक्चर\s*बनाओ|तस्वीर\s*बनाओ/i;

const QUICK_IMAGE =
  /\b(generate|make|create|draw|banao)\b.*\b(pic|picture|photo|image)\b|\b(pic|picture|photo)\b.*\b(generate|make|create|banao)\b/i;

const IMAGE_HINTS =
  /\b(image|images|picture|pictures|photo|photos|pic|illustration|horse|lion|ahorse|loin|logo|icon|wallpaper|artwork|पिक्चर|तस्वीर|चित्र)\b/i;

const VIDEO_HINTS =
  /\b(video|videos|clip|clips|animate|animation|cartoon|vfx|film|cinematic|last_generated_video|image\s*to\s*video|text\s*to\s*video|isko\s*video|ki\s*video|वीडियो|विडियो)\b/i;

const BACKGROUND_EDIT =
  /\b(background|bg|piche|peeche|behind|change\s*krdo|change\s*karo|change\s*karein|replace|dubai|skyline|cityscape)\b/i;

const CREATIVE_MAKE =
  /\b(iso|isko|is\s*ko|banao|bana\s*do|banado|karo|krdo|kardena|kr\s*dena|make|create|generate|render)\b/i;

const APP_HINTS =
  /\b(app|apps|website|web\s*site|webapp|portal|saas|mutton|ecommerce|store|shop|package\.json|react|ऐप|वेबसाइट|shop)\b/i;

const ARCH_HINTS =
  /\b(blueprint|floor\s*plan|floorplan|architecture|layout|schematic|courtyard|bedroom|bedrooms|parking|\d+\s*[x×]\s*\d+|ft\b|feet|plot)\b/i;

const CONFIRM = new Set([
  "yes",
  "y",
  "ok",
  "okay",
  "go",
  "continue",
  "both",
  "haan",
  "ji",
  "sure",
  "start",
]);

function normalize(text: string): string {
  return text
    .replace(/\bahorse\b/gi, "horse")
    .replace(/\bloin\b/gi, "lion")
    .replace(/\bpic\b/gi, "picture");
}

function detectOne(
  text: string,
  routeId?: OmniRouteId | string,
  hasImageAttachment?: boolean,
): OmniToolId | null {
  const norm = normalize(text);
  const low = norm.toLowerCase();
  const sovereign = routeId ? isSovereignGeneralChatRoute(routeId) : false;

  if (sovereign) {
    if (
      hasImageAttachment &&
      (VIDEO_HINTS.test(norm) || CREATIVE_MAKE.test(norm) || BACKGROUND_EDIT.test(norm))
    ) {
      return "video";
    }
    if (VIDEO_HINTS.test(norm) || /\b(make.*video|video banao|clip banao)\b/i.test(low)) {
      return "video";
    }
    if (isMultimodalImageRequest(norm) || isImageEditInstruction(norm) || matchPublicFigure(norm)) {
      return "create_image";
    }
    if (/\b(deep research|research report)\b/.test(low)) return "deep_research";
    if (/\b(web search|latest news|search the web)\b/.test(low)) return "web_search";
    if (/^think:|think step by step/.test(low)) return "thinking";
    if (QUICK_IMAGE.test(norm) || PIC_BANAO.test(norm)) return "create_image";
    if (
      IMAGE_HINTS.test(norm) &&
      (EXECUTION_VERBS.test(norm) || /\b(pic|picture|photo|image)\b/.test(low))
    ) {
      return "create_image";
    }
    if (/\b(create image|generate image|draw |picture of)\b/.test(low)) {
      return "create_image";
    }
    return null;
  }

  if (VIDEO_HINTS.test(norm)) return "video";
  if (/\b(deep research|research report)\b/.test(low)) return "deep_research";
  if (/\b(web search|latest news|search the web)\b/.test(low)) return "web_search";
  if (/^think:|think step by step/.test(low)) return "thinking";

  if (
    ARCH_HINTS.test(norm) &&
    (EXECUTION_VERBS.test(norm) || /bedroom/.test(low) || /\d+\s*[x×]\s*\d+/.test(low))
  ) {
    return "architecture";
  }
  if (APP_HINTS.test(norm) && EXECUTION_VERBS.test(norm)) return "app_build";
  if (QUICK_IMAGE.test(norm)) return "create_image";
  if (PIC_BANAO.test(norm) || (/\bbanao\b/i.test(norm) && IMAGE_HINTS.test(norm))) {
    return "create_image";
  }
  if (IMAGE_HINTS.test(norm) && /\b(pic|picture|photo|image)\b/.test(low)) {
    return "create_image";
  }
  if (
    IMAGE_HINTS.test(norm) &&
    (EXECUTION_VERBS.test(norm) ||
      /\b(create image|generate image|draw |picture of)\b/.test(low))
  ) {
    return "create_image";
  }
  if (EXECUTION_VERBS.test(norm)) {
    if (IMAGE_HINTS.test(norm)) return "create_image";
    if (APP_HINTS.test(norm)) return "app_build";
    if (ARCH_HINTS.test(norm)) return "architecture";
  }
  if (/\b(create image|generate image|draw )\b/.test(low)) return "create_image";
  if (/\b(create music|compose|soundtrack)\b/.test(low)) return "create_music";
  return null;
}

export function detectToolFromMessage(
  text: string,
  history?: { role: string; content: string }[],
  routeId?: OmniRouteId | string,
  hasImageAttachment?: boolean,
): OmniToolId | null {
  const slash = parseSlashCommand(text);
  if (slash) return slash.tool;

  const direct = detectOne(text, routeId, hasImageAttachment);
  if (direct) return direct;

  const low = text.trim().toLowerCase();
  if (CONFIRM.has(low) && history?.length) {
    for (let i = history.length - 1; i >= 0; i--) {
      if (history[i].role !== "user") continue;
      const prev = detectOne(history[i].content, routeId, hasImageAttachment);
      if (prev) return prev;
    }
  }
  return null;
}

export function isVideoIntentMessage(text: string): boolean {
  return VIDEO_HINTS.test(normalize(text));
}

export function executionPromptFromHistory(
  text: string,
  history: { role: string; content: string }[],
): string {
  if (!CONFIRM.has(text.trim().toLowerCase())) return text;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === "user" && history[i].content.length > 8) {
      return history[i].content;
    }
  }
  return text;
}
