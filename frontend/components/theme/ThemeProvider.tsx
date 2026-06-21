"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyThemeTokens,
  generateRandomTheme,
  loadPersistedTheme,
  persistTheme,
  PRESET_THEMES,
  resolveTheme,
  themeFromCustomColor,
  type OmniThemeTokens,
  type PersistedThemeState,
  type ThemePresetId,
} from "../../lib/theme-engine";

export type ThemeContextValue = {
  tokens: OmniThemeTokens;
  presetId: ThemePresetId;
  accentColor: string;
  currentTheme: ThemePresetId;
  customColor: string;
  setPreset: (id: Exclude<ThemePresetId, "custom" | "auto">) => void;
  setCustomColor: (hex: string) => void;
  setAccentColor: (hex: string) => void;
  triggerAutoTheme: () => void;
};

/** App Router equivalent of legacy pages/_app ThemeContext */
export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useOmniTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useOmniTheme must be used within ThemeProvider");
  return ctx;
}

const SSR_DEFAULT = PRESET_THEMES["deep-purple"];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<PersistedThemeState>({ presetId: "deep-purple", autoOnInit: true });
  const [tokens, setTokens] = useState<OmniThemeTokens>(SSR_DEFAULT);

  useEffect(() => {
    const persisted = loadPersistedTheme();
    setState(persisted);
    const initial = persisted.presetId === "auto" ? generateRandomTheme() : resolveTheme(persisted);
    setTokens(initial);
    applyThemeTokens(initial);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) applyThemeTokens(tokens);
  }, [tokens, mounted]);

  const commit = useCallback((next: PersistedThemeState, nextTokens: OmniThemeTokens) => {
    setState(next);
    setTokens(nextTokens);
    persistTheme(next);
    applyThemeTokens(nextTokens);
  }, []);

  const setPreset = useCallback(
    (id: Exclude<ThemePresetId, "custom" | "auto">) => {
      const nextTokens = PRESET_THEMES[id];
      commit({ presetId: id, customColor: state.customColor, autoOnInit: false }, nextTokens);
    },
    [commit, state.customColor],
  );

  const setCustomColor = useCallback(
    (hex: string) => {
      const nextTokens = themeFromCustomColor(hex);
      commit({ presetId: "custom", customColor: hex, autoOnInit: false }, nextTokens);
    },
    [commit],
  );

  const setAccentColor = setCustomColor;

  const triggerAutoTheme = useCallback(() => {
    const nextTokens = generateRandomTheme();
    commit({ presetId: "auto", customColor: state.customColor, autoOnInit: true }, nextTokens);
  }, [commit, state.customColor]);

  const value = useMemo(
    () => ({
      tokens,
      presetId: state.presetId,
      accentColor: tokens.accent,
      currentTheme: state.presetId,
      customColor: state.customColor ?? "#a855f7",
      setPreset,
      setCustomColor,
      setAccentColor,
      triggerAutoTheme,
    }),
    [tokens, state.presetId, state.customColor, setPreset, setCustomColor, triggerAutoTheme],
  );

  return (
    <ThemeContext.Provider value={value}>
      <div
        className="omni-theme-root h-full min-h-0 w-full"
        style={{ background: tokens.bg, color: tokens.text }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}
