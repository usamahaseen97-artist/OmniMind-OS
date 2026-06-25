import type { IDEProjectFile } from "./omnimind-ide-config";
import type { MobileUiBlock } from "./omniforge-mobile-types";

export const MOBILE_LAYOUT_PATH = ".omniforge/mobile-layout.json";

export type PreviewProduct = {
  name: string;
  price: number;
  description: string;
  colors: string[];
  image?: string;
};

export type MobileLayoutConfig = {
  blocks: MobileUiBlock[];
  updatedAt?: number;
};

export function parseMobileLayoutFromFiles(files: IDEProjectFile[]): MobileLayoutConfig | null {
  const file = files.find((f) => f.path === MOBILE_LAYOUT_PATH);
  if (!file?.content?.trim()) return null;
  try {
    const parsed = JSON.parse(file.content) as MobileLayoutConfig;
    if (Array.isArray(parsed.blocks) && parsed.blocks.length) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export function parsePreviewProduct(files: IDEProjectFile[]): PreviewProduct | null {
  const catalogJson = files.find((f) => /catalog\.json$/i.test(f.path));
  if (catalogJson?.content) {
    try {
      const data = JSON.parse(catalogJson.content) as PreviewProduct | PreviewProduct[];
      const item = Array.isArray(data) ? data[0] : data;
      if (item?.name) return normalizeProduct(item);
    } catch {
      /* fall through */
    }
  }

  for (const file of files) {
    if (!/product/i.test(file.path) || !file.content) continue;
    const match = file.content.match(/=\s*(\[[\s\S]*?\]);/);
    if (!match?.[1]) continue;
    try {
      const arr = JSON.parse(match[1].replace(/'/g, '"')) as PreviewProduct[];
      if (arr[0]?.name) return normalizeProduct(arr[0]);
    } catch {
      /* try next */
    }
  }

  return null;
}

function normalizeProduct(raw: Partial<PreviewProduct>): PreviewProduct {
  return {
    name: String(raw.name ?? "Product"),
    price: Number(raw.price ?? 0),
    description: String(raw.description ?? ""),
    colors: Array.isArray(raw.colors) ? raw.colors.map(String) : ["#111111"],
    image: raw.image ? String(raw.image) : undefined,
  };
}

export function buildMobileLayoutPayload(blocks: MobileUiBlock[]): string {
  return JSON.stringify({ blocks, updatedAt: Date.now() }, null, 2);
}
