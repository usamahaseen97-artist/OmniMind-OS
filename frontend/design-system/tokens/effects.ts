export const DS_RADIUS = {
  none: "0",
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.25rem",
  full: "9999px",
} as const;

export const DS_ELEVATION = {
  none: "none",
  sm: "0 1px 2px rgba(0,0,0,0.25)",
  md: "0 4px 16px rgba(0,0,0,0.3)",
  lg: "0 8px 32px rgba(0,0,0,0.35)",
  xl: "0 16px 48px rgba(0,0,0,0.45)",
  glow: "0 0 24px var(--omni-ds-accent-glow)",
} as const;

export const DS_BLUR = {
  sm: "4px",
  md: "8px",
  lg: "16px",
  xl: "24px",
  panel: "40px",
} as const;

export const DS_GLASS = {
  panel:
    "border border-[color:var(--omni-ds-border-subtle)] bg-[color:var(--omni-ds-bg-panel)]/95 backdrop-blur-md shadow-[var(--omni-ds-elevation-lg)]",
  chip:
    "border border-[color:var(--omni-ds-border-default)] bg-white/[0.03] backdrop-blur-sm",
  card:
    "border border-[color:var(--omni-ds-border-subtle)] bg-[color:var(--omni-ds-bg-panel-elevated)]/90 backdrop-blur-sm",
} as const;

export const DS_GRADIENTS = {
  canvas: "linear-gradient(135deg, var(--omni-ds-gradient-from), var(--omni-ds-gradient-to))",
  accent: "linear-gradient(90deg, var(--omni-ds-accent-primary), var(--omni-ds-accent-secondary))",
  glow: "radial-gradient(ellipse at top, var(--omni-ds-accent-glow), transparent 70%)",
} as const;
