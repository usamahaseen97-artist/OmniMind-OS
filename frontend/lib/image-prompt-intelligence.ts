/** Client-side multimodal image prompt rules — mirrors backend. */

const PUBLIC_FIGURES: Record<string, string> = {
  "younis khan": "Younis Khan Pakistani cricketer, exact recognizable face, sports portrait",
  "yunus khan": "Younis Khan Pakistani cricketer, exact recognizable face",
  "youns khan": "Younis Khan cricketer portrait, identifiable face",
  "younus khan cricketer": "Younis Khan legendary Pakistani cricketer, photorealistic portrait",
  "younus khan crickter": "Younis Khan legendary Pakistani cricketer, exact face, green kit optional",
  "yunus khan crickter": "Younis Khan cricketer, identifiable face, not generic",
};

const EDIT_RE =
  /\b(background|piche|peeche|baghair|change\s*krdo|inpaint|bungalow|gariyan|khri|parked|edit\s+the|replace|isi\s+pic|last\s+image|us\s+pic)\b/i;

const MULTIMODAL_IMAGE_RE =
  /\b(pic|picture|photo|tasveer|portrait|image)\b.*\b(bana|banao|banado|bana do|generate|make|draw)\b|\bki\s+pic\b|\bpic\s+bana/i;

export function isImageEditInstruction(text: string): boolean {
  return EDIT_RE.test(text);
}

export function isMultimodalImageRequest(text: string): boolean {
  const low = text.toLowerCase().replace(/crickter/g, "cricketer");
  if (matchPublicFigure(text)) return true;
  if (MULTIMODAL_IMAGE_RE.test(low)) return true;
  if (/\bcricketer\b/.test(low) && /\b(pic|photo|portrait)\b/.test(low)) return true;
  if (isImageEditInstruction(text)) return true;
  return false;
}

export function matchPublicFigure(text: string): string | null {
  const low = text.toLowerCase().replace(/crickter/g, "cricketer");
  for (const [key, hint] of Object.entries(PUBLIC_FIGURES)) {
    if (low.includes(key)) return hint;
  }
  const m = text.match(/\b([A-Za-z]+(?:\s+[A-Za-z]+)?)\s+crickter\b/i);
  if (m) {
    return `${m[1]}, famous Pakistani cricketer, recognizable identity, not a generic lookalike`;
  }
  const m2 = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(cricketer|actor|player)\b/i);
  if (m2) {
    return `${m2[1]}, famous ${m2[2]}, recognizable identity, not a generic lookalike`;
  }
  return null;
}

const REALISM_SUFFIX =
  ", ultra photorealistic commercial photography, Gemini Imagen-class realism, 85mm portrait lens";

export function enhanceImagePrompt(raw: string): string {
  const figure = matchPublicFigure(raw);
  const base = raw
    .replace(/^(make|create|generate|draw)\s+(me\s+)?(an?\s+)?(image|picture|photo)\s+(of\s+)?/gi, "")
    .replace(/^(.*?)\s+ki\s+pic\s+bana.*/i, "$1")
    .replace(/\b(bana do|banao|banado)\b/gi, "")
    .trim();
  if (figure) {
    return `${figure}. ${base || raw}${REALISM_SUFFIX}`.trim();
  }
  return `${base || raw}${REALISM_SUFFIX}`.trim();
}
