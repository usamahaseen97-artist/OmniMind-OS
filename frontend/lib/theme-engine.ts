export type ThemePresetId = "deep-purple" | "gold-accent" | "auto" | "custom";

export type OmniThemeTokens = {
  id: ThemePresetId;
  label: string;
  bg: string;
  panel: string;
  panelAlt: string;
  accent: string;
  accentGlow: string;
  border: string;
  text: string;
  textMuted: string;
};

export const PRESET_THEMES: Record<Exclude<ThemePresetId, "custom" | "auto">, OmniThemeTokens> = {
  "deep-purple": {
    id: "deep-purple",
    label: "Matte Slate Premium",
    bg: "#0B0F19",
    panel: "#111827",
    panelAlt: "#0F172A",
    accent: "#94A3B8",
    accentGlow: "rgba(148, 163, 184, 0.35)",
    border: "#1E293B",
    text: "#F1F5F9",
    textMuted: "#94A3B8",
  },
  "gold-accent": {
    id: "gold-accent",
    label: "Gold Accent",
    bg: "#0d0d0d",
    panel: "#141414",
    panelAlt: "#1a1a1a",
    accent: "#eab308",
    accentGlow: "rgba(234, 179, 8, 0.45)",
    border: "rgba(234, 179, 8, 0.28)",
    text: "#fafafa",
    textMuted: "#a3a3a3",
  },
};

const STORAGE_KEY = "omnimind-v11-theme";

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
}

function hslToHex(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
  };
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
}

export function generateRandomTheme(): OmniThemeTokens {
  const hue = Math.floor(Math.random() * 360);
  const accent = hslToHex(hue, 0.78, 0.58);
  const [r, g, b] = hexToRgb(accent);
  const bg = rgbToHex(r * 0.03 + 4, g * 0.03 + 4, b * 0.04 + 6);
  const panel = rgbToHex(r * 0.07 + 8, g * 0.06 + 7, b * 0.09 + 10);
  const panelAlt = rgbToHex(r * 0.1 + 12, g * 0.09 + 10, b * 0.12 + 14);

  return {
    id: "auto",
    label: "Auto-Theme Matrix",
    bg,
    panel,
    panelAlt,
    accent,
    accentGlow: `rgba(${r}, ${g}, ${b}, 0.45)`,
    border: `rgba(${r}, ${g}, ${b}, 0.3)`,
    text: "#f8fafc",
    textMuted: "#94a3b8",
  };
}

export function themeFromCustomColor(hex: string): OmniThemeTokens {
  const normalized = hex.startsWith("#") ? hex : `#${hex}`;
  const [r, g, b] = hexToRgb(normalized);
  const bg = rgbToHex(r * 0.05, g * 0.05, b * 0.07 + 6);
  const panel = rgbToHex(r * 0.09 + 8, g * 0.08 + 6, b * 0.11 + 12);
  const panelAlt = rgbToHex(r * 0.12 + 12, g * 0.11 + 10, b * 0.15 + 16);

  return {
    id: "custom",
    label: "Custom Color",
    bg,
    panel,
    panelAlt,
    accent: normalized,
    accentGlow: `rgba(${r}, ${g}, ${b}, 0.42)`,
    border: `rgba(${r}, ${g}, ${b}, 0.28)`,
    text: "#f8fafc",
    textMuted: "#94a3b8",
  };
}

export function applyThemeTokens(tokens: OmniThemeTokens): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--omni-bg", tokens.bg);
  root.style.setProperty("--omni-panel", tokens.panel);
  root.style.setProperty("--omni-panel-alt", tokens.panelAlt);
  root.style.setProperty("--omni-accent", tokens.accent);
  root.style.setProperty("--omni-accent-glow", tokens.accentGlow);
  root.style.setProperty("--omni-border", tokens.border);
  root.style.setProperty("--omni-text", tokens.text);
  root.style.setProperty("--omni-text-muted", tokens.textMuted);
  root.style.setProperty("--omni-card", tokens.panelAlt);
  root.style.setProperty("--neon-green", tokens.accent);
  root.style.setProperty("--neon-green-dim", tokens.accent);
  root.style.setProperty("--neon-cyan", tokens.accent);
}

export type PersistedThemeState = {
  presetId: ThemePresetId;
  customColor?: string;
  autoOnInit?: boolean;
};

export function loadPersistedTheme(): PersistedThemeState {
  if (typeof window === "undefined") {
    return { presetId: "deep-purple", autoOnInit: false };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { presetId: "deep-purple", autoOnInit: false };
    const parsed = JSON.parse(raw) as { presetId?: string; customColor?: string; autoOnInit?: boolean };
    if (parsed.presetId === "sovereign-tech" || parsed.presetId === "cyberpunk") {
      return { presetId: "deep-purple", customColor: parsed.customColor, autoOnInit: parsed.autoOnInit };
    }
    if (
      parsed.presetId === "deep-purple" ||
      parsed.presetId === "gold-accent" ||
      parsed.presetId === "auto" ||
      parsed.presetId === "custom"
    ) {
      return parsed as PersistedThemeState;
    }
    return { presetId: "deep-purple", autoOnInit: false };
  } catch {
    return { presetId: "deep-purple", autoOnInit: false };
  }
}

export function persistTheme(state: PersistedThemeState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resolveTheme(state: PersistedThemeState): OmniThemeTokens {
  if (state.presetId === "auto") return generateRandomTheme();
  if (state.presetId === "custom" && state.customColor) return themeFromCustomColor(state.customColor);
  if (state.presetId in PRESET_THEMES) {
    return PRESET_THEMES[state.presetId as keyof typeof PRESET_THEMES];
  }
  return PRESET_THEMES["deep-purple"];
}
