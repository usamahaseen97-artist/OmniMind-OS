import { applyDesignSystemTheme } from "../design-system/themes/apply";
import { ENTERPRISE_THEMES, type EnterpriseThemeId } from "../design-system/themes/presets";

export type ThemePresetId = EnterpriseThemeId | "auto" | "custom";

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

function toLegacyTokens(id: EnterpriseThemeId): OmniThemeTokens {
  const t = ENTERPRISE_THEMES[id];
  return {
    id,
    label: t.label,
    bg: t.bg,
    panel: t.panel,
    panelAlt: t.panelAlt,
    accent: t.accent,
    accentGlow: t.accentGlow,
    border: t.border,
    text: t.text,
    textMuted: t.textMuted,
  };
}

export const PRESET_THEMES: Record<EnterpriseThemeId, OmniThemeTokens> = {
  "deep-purple": toLegacyTokens("deep-purple"),
  "gold-accent": toLegacyTokens("gold-accent"),
  light: toLegacyTokens("light"),
  "oled-black": toLegacyTokens("oled-black"),
  "grey-professional": toLegacyTokens("grey-professional"),
  "high-contrast": toLegacyTokens("high-contrast"),
};

const STORAGE_KEY = "omnimind-v12-theme";

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

  const tokens: OmniThemeTokens = {
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
  applyThemeTokens(tokens);
  return tokens;
}

export function themeFromCustomColor(hex: string): OmniThemeTokens {
  const normalized = hex.startsWith("#") ? hex : `#${hex}`;
  const [r, g, b] = hexToRgb(normalized);
  const bg = rgbToHex(r * 0.05, g * 0.05, b * 0.07 + 6);
  const panel = rgbToHex(r * 0.09 + 8, g * 0.08 + 6, b * 0.11 + 12);
  const panelAlt = rgbToHex(r * 0.12 + 12, g * 0.11 + 10, b * 0.15 + 16);

  const tokens: OmniThemeTokens = {
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
  applyThemeTokens(tokens);
  return tokens;
}

/** Apply theme — full design-system CSS variables + legacy vars. */
export function applyThemeTokens(tokens: OmniThemeTokens): void {
  if (typeof document === "undefined") return;

  if (tokens.id in ENTERPRISE_THEMES) {
    applyDesignSystemTheme(ENTERPRISE_THEMES[tokens.id as EnterpriseThemeId]);
    return;
  }

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
  root.style.setProperty("--neon-cyan", tokens.accent);
}

export type PersistedThemeState = {
  presetId: ThemePresetId;
  customColor?: string;
  autoOnInit?: boolean;
};

const VALID_PRESETS: ThemePresetId[] = [
  "deep-purple",
  "gold-accent",
  "light",
  "oled-black",
  "grey-professional",
  "high-contrast",
  "auto",
  "custom",
];

export function loadPersistedTheme(): PersistedThemeState {
  if (typeof window === "undefined") {
    return { presetId: "deep-purple", autoOnInit: false };
  }
  try {
    const keys = [STORAGE_KEY, "omnimind-v11-theme"];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as { presetId?: string; customColor?: string; autoOnInit?: boolean };
      if (parsed.presetId === "sovereign-tech" || parsed.presetId === "cyberpunk") {
        return { presetId: "deep-purple", customColor: parsed.customColor, autoOnInit: parsed.autoOnInit };
      }
      if (parsed.presetId && VALID_PRESETS.includes(parsed.presetId as ThemePresetId)) {
        return parsed as PersistedThemeState;
      }
    }
    return { presetId: "deep-purple", autoOnInit: false };
  } catch {
    return { presetId: "deep-purple", autoOnInit: false };
  }
}

export function persistTheme(state: PersistedThemeState): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem("omnimind-v11-theme", JSON.stringify(state));
}

export function resolveTheme(state: PersistedThemeState): OmniThemeTokens {
  if (state.presetId === "auto") return generateRandomTheme();
  if (state.presetId === "custom" && state.customColor) return themeFromCustomColor(state.customColor);
  if (state.presetId in PRESET_THEMES) {
    return PRESET_THEMES[state.presetId as EnterpriseThemeId];
  }
  return PRESET_THEMES["deep-purple"];
}

export { ENTERPRISE_THEMES, THEME_HUB_ORDER } from "../design-system/themes/presets";
