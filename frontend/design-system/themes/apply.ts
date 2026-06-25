import { DS_COLOR_VARS } from "../tokens/colors";
import { DS_TYPOGRAPHY_VARS } from "../tokens/typography";
import type { OmniDesignTheme } from "./presets";

/** Apply full design-system theme to document root — instant OS-wide switch. */
export function applyDesignSystemTheme(theme: OmniDesignTheme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;

  root.style.colorScheme = theme.colorScheme;
  root.dataset.omniTheme = theme.id;

  // Legacy vars (theme-engine compatibility)
  root.style.setProperty("--omni-bg", theme.bg);
  root.style.setProperty("--omni-panel", theme.panel);
  root.style.setProperty("--omni-panel-alt", theme.panelAlt);
  root.style.setProperty("--omni-accent", theme.accent);
  root.style.setProperty("--omni-accent-glow", theme.accentGlow);
  root.style.setProperty("--omni-border", theme.border);
  root.style.setProperty("--omni-text", theme.text);
  root.style.setProperty("--omni-text-muted", theme.textMuted);
  root.style.setProperty("--omni-card", theme.panelAlt);
  root.style.setProperty("--neon-green", theme.accent);
  root.style.setProperty("--neon-green-dim", theme.textMuted);
  root.style.setProperty("--neon-cyan", theme.accent);
  root.style.setProperty("--omni-violet-obsidian", theme.gradientFrom);
  root.style.setProperty("--omni-violet-mid", theme.bg);
  root.style.setProperty("--omni-violet-deep", theme.gradientTo);

  const { colors } = theme;
  const set = (name: string, value: string) => root.style.setProperty(name, value);

  for (const [key, varName] of Object.entries(DS_COLOR_VARS.bg)) {
    set(varName, colors.bg[key as keyof typeof colors.bg]);
  }
  for (const [key, varName] of Object.entries(DS_COLOR_VARS.text)) {
    set(varName, colors.text[key as keyof typeof colors.text]);
  }
  for (const [key, varName] of Object.entries(DS_COLOR_VARS.border)) {
    set(varName, colors.border[key as keyof typeof colors.border]);
  }
  for (const [key, varName] of Object.entries(DS_COLOR_VARS.accent)) {
    set(varName, colors.accent[key as keyof typeof colors.accent]);
  }
  for (const [key, varName] of Object.entries(DS_COLOR_VARS.status)) {
    set(varName, colors.status[key as keyof typeof colors.status]);
  }
  for (const [key, varName] of Object.entries(DS_COLOR_VARS.a11y)) {
    set(varName, colors.a11y[key as keyof typeof colors.a11y]);
  }

  set("--omni-ds-gradient-from", theme.gradientFrom);
  set("--omni-ds-gradient-to", theme.gradientTo);
  set("--omni-ds-elevation-lg", "0 8px 32px rgba(0,0,0,0.35)");
  set(DS_TYPOGRAPHY_VARS.fontSans, 'var(--font-inter), "Segoe UI", system-ui, sans-serif');
  set(DS_TYPOGRAPHY_VARS.fontMono, 'var(--font-mono), ui-monospace, monospace');
}

/** Read a design token from computed styles (client only). */
export function readDesignToken(varName: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}
