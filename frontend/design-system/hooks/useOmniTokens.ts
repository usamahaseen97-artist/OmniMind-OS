"use client";

import { useOmniTheme } from "../../components/theme/ThemeProvider";
import { readDesignToken } from "../themes/apply";
import { DS_COLOR_VARS } from "../tokens/colors";

/** Access active design tokens from ThemeProvider + CSS variables. */
export function useOmniTokens() {
  const theme = useOmniTheme();
  return {
    theme,
    tokens: theme.tokens,
    css: (varName: string) => `var(${varName})`,
    read: readDesignToken,
    color: {
      bgShell: `var(${DS_COLOR_VARS.bg.shell})`,
      bgPanel: `var(${DS_COLOR_VARS.bg.panel})`,
      textPrimary: `var(${DS_COLOR_VARS.text.primary})`,
      textMuted: `var(${DS_COLOR_VARS.text.muted})`,
      accent: `var(${DS_COLOR_VARS.accent.primary})`,
      borderSubtle: `var(${DS_COLOR_VARS.border.subtle})`,
    },
  };
}
