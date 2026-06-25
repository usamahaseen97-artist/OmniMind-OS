export const DS_TYPOGRAPHY = {
  fontFamily: {
    sans: 'var(--font-inter), "Segoe UI", system-ui, sans-serif',
    mono: 'var(--font-mono), ui-monospace, monospace',
  },
  fontSize: {
    "2xs": "0.5625rem", // 9px
    xs: "0.625rem", // 10px
    sm: "0.6875rem", // 11px
    base: "0.75rem", // 12px
    md: "0.8125rem", // 13px
    lg: "0.875rem", // 14px
    xl: "1rem",
    "2xl": "1.125rem",
    "3xl": "1.25rem",
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: "1.2",
    snug: "1.35",
    normal: "1.5",
    relaxed: "1.65",
  },
  letterSpacing: {
    tight: "-0.01em",
    normal: "0",
    wide: "0.05em",
    wider: "0.1em",
    widest: "0.2em",
  },
} as const;

export const DS_TYPOGRAPHY_VARS = {
  fontSans: "--omni-ds-font-sans",
  fontMono: "--omni-ds-font-mono",
} as const;
