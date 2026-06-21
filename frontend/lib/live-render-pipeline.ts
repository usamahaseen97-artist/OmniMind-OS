/** Client-side image URL + phased live-render states for Create Image / in-paint flows. */

import { enhanceImagePrompt } from "./image-prompt-intelligence";

export type RenderProcessState = "WARM-UP" | "BUILD" | "FINAL";

/** @deprecated use RenderProcessState */
export type LiveRenderPhase = "warming" | "building" | "final";

export type LiveRenderSession = {
  prompt: string;
  contextLabel: string;
  imageUrl: string;
  thumbnailUrl?: string;
  processState: RenderProcessState;
  /** @deprecated use processState */
  phase: LiveRenderPhase;
  mode: "generate" | "inpaint";
  startedAt: number;
  sourceImageUrl?: string;
};

const HORSE_LION_RE =
  /horse|lion|घोड़|शेर|arabian|african|savanna|savannah/i;

export function isHorseLionPrompt(text: string): boolean {
  return HORSE_LION_RE.test(text);
}

export function buildImagePrompt(raw: string): string {
  const enhanced = enhanceImagePrompt(raw);
  if (isHorseLionPrompt(raw) || (!enhanced && HORSE_LION_RE.test(raw))) {
    return (
      "Photorealistic detailed photograph, powerful Arabian horse and majestic African lion " +
      "standing side by side on textured savanna grassland at golden sunset, cinematic lighting, 8k"
    );
  }
  return enhanced;
}

export function buildPollinationsUrl(prompt: string): string {
  const p = buildImagePrompt(prompt).slice(0, 800);
  return `/api/media/image?prompt=${encodeURIComponent(p)}`;
}

/** True when value is a loadable URL/path — not a bare generation prompt. */
export function isLikelyImageUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (v.startsWith("data:") || v.startsWith("blob:")) return true;
  if (v.startsWith("/api/media/image") || v.startsWith("/omni-api/")) return true;
  if (v.startsWith("/api/")) return true;
  if (v.startsWith("http://") || v.startsWith("https://")) return true;
  if (v.startsWith("//")) return true;
  return false;
}

export function proxiedImageUrl(url: string): string {
  if (!url) return url;
  if (!isLikelyImageUrl(url)) {
    return buildPollinationsUrl(url);
  }
  if (url.startsWith("/api/media/image")) return url;
  if (url.startsWith("data:") || url.startsWith("blob:")) return url;
  if (url.includes("/api/v1/tools/media/generated-image/")) {
    const match = url.match(/\/api\/v1\/tools\/media\/generated-image\/([^/?#]+)/i);
    if (match) {
      return `/omni-api/api/v1/tools/media/generated-image/${match[1]}`;
    }
  }
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const parsed = new URL(url);
      if (parsed.pathname.includes("/api/v1/tools/media/generated-image/")) {
        return `/omni-api${parsed.pathname}${parsed.search}`;
      }
    } catch {
      /* fall through to proxy fetch */
    }
    return `/api/media/image?url=${encodeURIComponent(url)}`;
  }
  if (url.startsWith("/api/") || url.startsWith("/omni-api/")) {
    return url.startsWith("/omni-api") ? url : `/omni-api${url}`;
  }
  return buildPollinationsUrl(url);
}

export function contextLabelForPrompt(text: string, mode: "generate" | "inpaint" = "generate"): string {
  if (mode === "inpaint") {
    return "In-painting subject · replacing background…";
  }
  if (isHorseLionPrompt(text)) {
    return "Simulating Horse & Lion context.";
  }
  const figure = enhanceImagePrompt(text).slice(0, 48);
  const short = buildImagePrompt(text).slice(0, 48);
  return figure.length > short.length ? `Identity lock: ${figure}…` : `Context: ${short}…`;
}

export const PHASE_MS = {
  warmingEnd: 2200,
  buildingEnd: 5200,
} as const;

export function processStateFromElapsed(ms: number): RenderProcessState {
  if (ms < PHASE_MS.warmingEnd) return "WARM-UP";
  if (ms < PHASE_MS.buildingEnd) return "BUILD";
  return "FINAL";
}

export function phaseFromElapsed(ms: number): LiveRenderPhase {
  const s = processStateFromElapsed(ms);
  if (s === "WARM-UP") return "warming";
  if (s === "BUILD") return "building";
  return "final";
}

export function toLegacyPhase(state: RenderProcessState): LiveRenderPhase {
  if (state === "WARM-UP") return "warming";
  if (state === "BUILD") return "building";
  return "final";
}

export function createRenderSession(
  prompt: string,
  imageUrl?: string,
  opts?: {
    mode?: "generate" | "inpaint";
    processState?: RenderProcessState;
    sourceImageUrl?: string;
    thumbnailUrl?: string;
  },
): LiveRenderSession {
  const mode = opts?.mode ?? "generate";
  const url = imageUrl ?? buildPollinationsUrl(prompt);
  const processState = opts?.processState ?? "WARM-UP";
  return {
    prompt,
    contextLabel: contextLabelForPrompt(prompt, mode),
    imageUrl: url,
    thumbnailUrl: opts?.thumbnailUrl ?? url,
    processState,
    phase: toLegacyPhase(processState),
    mode,
    startedAt: Date.now(),
    sourceImageUrl: opts?.sourceImageUrl,
  };
}

export function advanceRenderSession(
  session: LiveRenderSession,
  patch: Partial<
    Pick<
      LiveRenderSession,
      "imageUrl" | "thumbnailUrl" | "processState" | "contextLabel" | "mode"
    >
  >,
): LiveRenderSession {
  const processState = patch.processState ?? session.processState;
  return {
    ...session,
    ...patch,
    processState,
    phase: toLegacyPhase(processState),
    thumbnailUrl: patch.thumbnailUrl ?? patch.imageUrl ?? session.thumbnailUrl,
  };
}
