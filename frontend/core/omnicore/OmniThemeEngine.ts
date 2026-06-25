import type { ThemeId, ThemeTokens } from "./types";
import { THEME_TOKENS } from "./constants";
import { omniEventBus } from "./OmniEventBus";

/** Platform theme engine — complements UI ThemeProvider without replacing it. */
export class OmniThemeEngine {
  themes: ThemeTokens[] = THEME_TOKENS.map((t) => ({ ...t }));
  activeThemeId: ThemeId = "omnimind-dark";

  list() {
    return [...this.themes];
  }

  active() {
    return this.themes.find((t) => t.id === this.activeThemeId) ?? this.themes[0]!;
  }

  setTheme(themeId: ThemeId) {
    const theme = this.themes.find((t) => t.id === themeId);
    if (!theme) return null;
    this.activeThemeId = themeId;
    omniEventBus.publish("theme:changed", { themeId });
    return theme;
  }
}

export const omniThemeEngine = new OmniThemeEngine();
