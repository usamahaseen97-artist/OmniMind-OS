import type { ThemeExtension } from "./types";

/** Theme SDK — colors, fonts, icons, syntax, branding. */
export class OmniThemeSDK {
  themes: ThemeExtension[] = [
    {
      id: "theme-dark-pro",
      pluginId: "ext-theme-dark-pro",
      colors: { bg: "#0B0F19", fg: "#e2e8f0", accent: "#38bdf8" },
      fonts: { ui: "Inter", mono: "JetBrains Mono" },
      iconSet: "lucide",
      syntaxTheme: "omnimind-dark",
      branding: { logo: "omnimind" },
    },
  ];

  get(pluginId: string) {
    return this.themes.find((t) => t.pluginId === pluginId) ?? null;
  }

  register(theme: ThemeExtension) {
    this.themes.push(theme);
    return theme;
  }

  apply(pluginId: string) {
    const theme = this.get(pluginId);
    if (!theme || typeof document === "undefined") return theme;
    const root = document.documentElement;
    Object.entries(theme.colors).forEach(([k, v]) => root.style.setProperty(`--omni-${k}`, v));
    return theme;
  }
}

export const omniThemeSDK = new OmniThemeSDK();
