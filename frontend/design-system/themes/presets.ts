import type { DSColorValues } from "../tokens/colors";

export type OmniDesignTheme = {
  id: string;
  label: string;
  colorScheme: "dark" | "light";
  bg: string;
  panel: string;
  panelAlt: string;
  accent: string;
  accentGlow: string;
  border: string;
  text: string;
  textMuted: string;
  gradientFrom: string;
  gradientTo: string;
  colors: DSColorValues;
};

type ColorPatch = {
  bg?: Partial<DSColorValues["bg"]>;
  text?: Partial<DSColorValues["text"]>;
  border?: Partial<DSColorValues["border"]>;
  accent?: Partial<DSColorValues["accent"]>;
  status?: Partial<DSColorValues["status"]>;
  a11y?: Partial<DSColorValues["a11y"]>;
};

function colors(
  base: {
    bg: string;
    panel: string;
    panelAlt: string;
    accent: string;
    accentGlow: string;
    border: string;
    text: string;
    textMuted: string;
    gradientFrom: string;
    gradientTo: string;
    colorScheme: "dark" | "light";
  },
  patch: ColorPatch = {},
): DSColorValues {
  const inv = base.colorScheme === "dark" ? "#0a0b10" : "#ffffff";
  const defaults: DSColorValues = {
    bg: {
      canvas: base.bg,
      shell: base.bg,
      workspace: base.panelAlt,
      panel: base.panel,
      panelElevated: base.panelAlt,
      sidebar: base.panel,
      header: base.panel,
      status: base.bg,
      overlay: "rgba(0,0,0,0.65)",
      input: "rgba(0,0,0,0.3)",
    },
    text: {
      primary: base.text,
      secondary: base.textMuted,
      muted: base.textMuted,
      accent: base.accent,
      inverse: inv,
      link: base.accent,
    },
    border: {
      subtle: base.border,
      default: base.border,
      strong: base.border,
      accent: base.accentGlow,
      focus: base.accent,
    },
    accent: {
      primary: base.accent,
      primaryGlow: base.accentGlow,
      secondary: base.accent,
      gradientFrom: base.gradientFrom,
      gradientTo: base.gradientTo,
    },
    status: {
      success: "#34d399",
      successBg: "rgba(52,211,153,0.12)",
      warning: "#fbbf24",
      warningBg: "rgba(251,191,36,0.12)",
      error: "#f87171",
      errorBg: "rgba(248,113,113,0.12)",
      info: "#67e8f9",
      infoBg: "rgba(103,232,249,0.12)",
      live: "#34d399",
      idle: "#6b7280",
    },
    a11y: {
      focusRing: base.accent,
      highContrastText: base.colorScheme === "dark" ? "#ffffff" : "#000000",
      highContrastBg: base.colorScheme === "dark" ? "#000000" : "#ffffff",
    },
  };

  return {
    bg: { ...defaults.bg, ...patch.bg },
    text: { ...defaults.text, ...patch.text },
    border: { ...defaults.border, ...patch.border },
    accent: { ...defaults.accent, ...patch.accent },
    status: { ...defaults.status, ...patch.status },
    a11y: { ...defaults.a11y, ...patch.a11y },
  };
}

export const ENTERPRISE_THEMES = {
  "deep-purple": {
    id: "deep-purple",
    label: "Enterprise Dark",
    colorScheme: "dark" as const,
    bg: "#0B0F19",
    panel: "#111827",
    panelAlt: "#0F172A",
    accent: "#67e8f9",
    accentGlow: "rgba(103,232,249,0.35)",
    border: "rgba(255,255,255,0.06)",
    text: "#F1F5F9",
    textMuted: "#94A3B8",
    gradientFrom: "#0a0416",
    gradientTo: "#160b33",
    colors: colors(
      {
        bg: "#0B0F19",
        panel: "#111827",
        panelAlt: "#0F172A",
        accent: "#67e8f9",
        accentGlow: "rgba(103,232,249,0.35)",
        border: "rgba(255,255,255,0.06)",
        text: "#F1F5F9",
        textMuted: "#94A3B8",
        gradientFrom: "#0a0416",
        gradientTo: "#160b33",
        colorScheme: "dark",
      },
      {
        bg: { shell: "#0a0b10", workspace: "#0b1018", sidebar: "#0d1018" },
        accent: { secondary: "#a78bfa" },
        border: { accent: "rgba(34,211,238,0.25)" },
      },
    ),
  },
  "gold-accent": {
    id: "gold-accent",
    label: "Gold Accent",
    colorScheme: "dark" as const,
    bg: "#0d0d0d",
    panel: "#141414",
    panelAlt: "#1a1a1a",
    accent: "#eab308",
    accentGlow: "rgba(234,179,8,0.45)",
    border: "rgba(234,179,8,0.28)",
    text: "#fafafa",
    textMuted: "#a3a3a3",
    gradientFrom: "#0d0d0d",
    gradientTo: "#1a1a1a",
    colors: colors({
      bg: "#0d0d0d",
      panel: "#141414",
      panelAlt: "#1a1a1a",
      accent: "#eab308",
      accentGlow: "rgba(234,179,8,0.45)",
      border: "rgba(234,179,8,0.28)",
      text: "#fafafa",
      textMuted: "#a3a3a3",
      gradientFrom: "#0d0d0d",
      gradientTo: "#1a1a1a",
      colorScheme: "dark",
    }),
  },
  light: {
    id: "light",
    label: "Enterprise Light",
    colorScheme: "light" as const,
    bg: "#f8fafc",
    panel: "#ffffff",
    panelAlt: "#f1f5f9",
    accent: "#0ea5e9",
    accentGlow: "rgba(14,165,233,0.25)",
    border: "rgba(15,23,42,0.08)",
    text: "#0f172a",
    textMuted: "#64748b",
    gradientFrom: "#f8fafc",
    gradientTo: "#e2e8f0",
    colors: colors(
      {
        bg: "#f8fafc",
        panel: "#ffffff",
        panelAlt: "#f1f5f9",
        accent: "#0ea5e9",
        accentGlow: "rgba(14,165,233,0.25)",
        border: "rgba(15,23,42,0.08)",
        text: "#0f172a",
        textMuted: "#64748b",
        gradientFrom: "#f8fafc",
        gradientTo: "#e2e8f0",
        colorScheme: "light",
      },
      {
        bg: { overlay: "rgba(15,23,42,0.4)", input: "#ffffff" },
        text: { inverse: "#ffffff" },
        border: { subtle: "rgba(15,23,42,0.06)" },
        accent: { secondary: "#6366f1" },
      },
    ),
  },
  "oled-black": {
    id: "oled-black",
    label: "OLED Black",
    colorScheme: "dark" as const,
    bg: "#000000",
    panel: "#0a0a0a",
    panelAlt: "#111111",
    accent: "#22d3ee",
    accentGlow: "rgba(34,211,238,0.4)",
    border: "rgba(255,255,255,0.05)",
    text: "#f4f4f5",
    textMuted: "#71717a",
    gradientFrom: "#000000",
    gradientTo: "#0a0a0a",
    colors: colors(
      {
        bg: "#000000",
        panel: "#0a0a0a",
        panelAlt: "#111111",
        accent: "#22d3ee",
        accentGlow: "rgba(34,211,238,0.4)",
        border: "rgba(255,255,255,0.05)",
        text: "#f4f4f5",
        textMuted: "#71717a",
        gradientFrom: "#000000",
        gradientTo: "#0a0a0a",
        colorScheme: "dark",
      },
      { bg: { shell: "#000000", workspace: "#000000", sidebar: "#050505" } },
    ),
  },
  "grey-professional": {
    id: "grey-professional",
    label: "Grey Professional",
    colorScheme: "dark" as const,
    bg: "#18181b",
    panel: "#27272a",
    panelAlt: "#3f3f46",
    accent: "#94a3b8",
    accentGlow: "rgba(148,163,184,0.3)",
    border: "rgba(255,255,255,0.08)",
    text: "#fafafa",
    textMuted: "#a1a1aa",
    gradientFrom: "#18181b",
    gradientTo: "#27272a",
    colors: colors(
      {
        bg: "#18181b",
        panel: "#27272a",
        panelAlt: "#3f3f46",
        accent: "#94a3b8",
        accentGlow: "rgba(148,163,184,0.3)",
        border: "rgba(255,255,255,0.08)",
        text: "#fafafa",
        textMuted: "#a1a1aa",
        gradientFrom: "#18181b",
        gradientTo: "#27272a",
        colorScheme: "dark",
      },
      { accent: { secondary: "#cbd5e1" } },
    ),
  },
  "high-contrast": {
    id: "high-contrast",
    label: "High Contrast",
    colorScheme: "dark" as const,
    bg: "#000000",
    panel: "#000000",
    panelAlt: "#1a1a1a",
    accent: "#ffff00",
    accentGlow: "rgba(255,255,0,0.5)",
    border: "#ffffff",
    text: "#ffffff",
    textMuted: "#e5e5e5",
    gradientFrom: "#000000",
    gradientTo: "#000000",
    colors: colors(
      {
        bg: "#000000",
        panel: "#000000",
        panelAlt: "#1a1a1a",
        accent: "#ffff00",
        accentGlow: "rgba(255,255,0,0.5)",
        border: "#ffffff",
        text: "#ffffff",
        textMuted: "#e5e5e5",
        gradientFrom: "#000000",
        gradientTo: "#000000",
        colorScheme: "dark",
      },
      {
        border: { subtle: "#ffffff", default: "#ffffff", strong: "#ffffff" },
        accent: { secondary: "#00ffff" },
        status: {
          success: "#00ff00",
          warning: "#ffff00",
          error: "#ff0000",
          info: "#00ffff",
        },
        a11y: { focusRing: "#ffff00" },
      },
    ),
  },
} satisfies Record<string, OmniDesignTheme>;

export type EnterpriseThemeId = keyof typeof ENTERPRISE_THEMES;

export const THEME_HUB_ORDER: EnterpriseThemeId[] = [
  "deep-purple",
  "oled-black",
  "grey-professional",
  "gold-accent",
  "light",
  "high-contrast",
];
