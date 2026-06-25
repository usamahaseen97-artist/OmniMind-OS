/** OmniMind Design System — semantic color tokens (CSS var names). */
export const DS_COLOR_VARS = {
  bg: {
    canvas: "--omni-ds-bg-canvas",
    shell: "--omni-ds-bg-shell",
    workspace: "--omni-ds-bg-workspace",
    panel: "--omni-ds-bg-panel",
    panelElevated: "--omni-ds-bg-panel-elevated",
    sidebar: "--omni-ds-bg-sidebar",
    header: "--omni-ds-bg-header",
    status: "--omni-ds-bg-status",
    overlay: "--omni-ds-bg-overlay",
    input: "--omni-ds-bg-input",
  },
  text: {
    primary: "--omni-ds-text-primary",
    secondary: "--omni-ds-text-secondary",
    muted: "--omni-ds-text-muted",
    accent: "--omni-ds-text-accent",
    inverse: "--omni-ds-text-inverse",
    link: "--omni-ds-text-link",
  },
  border: {
    subtle: "--omni-ds-border-subtle",
    default: "--omni-ds-border-default",
    strong: "--omni-ds-border-strong",
    accent: "--omni-ds-border-accent",
    focus: "--omni-ds-border-focus",
  },
  accent: {
    primary: "--omni-ds-accent-primary",
    primaryGlow: "--omni-ds-accent-glow",
    secondary: "--omni-ds-accent-secondary",
    gradientFrom: "--omni-ds-gradient-from",
    gradientTo: "--omni-ds-gradient-to",
  },
  status: {
    success: "--omni-ds-status-success",
    successBg: "--omni-ds-status-success-bg",
    warning: "--omni-ds-status-warning",
    warningBg: "--omni-ds-status-warning-bg",
    error: "--omni-ds-status-error",
    errorBg: "--omni-ds-status-error-bg",
    info: "--omni-ds-status-info",
    infoBg: "--omni-ds-status-info-bg",
    live: "--omni-ds-status-live",
    idle: "--omni-ds-status-idle",
  },
  a11y: {
    focusRing: "--omni-ds-a11y-focus-ring",
    highContrastText: "--omni-ds-a11y-hc-text",
    highContrastBg: "--omni-ds-a11y-hc-bg",
  },
} as const;

export type DSColorValues = {
  bg: Record<keyof typeof DS_COLOR_VARS.bg, string>;
  text: Record<keyof typeof DS_COLOR_VARS.text, string>;
  border: Record<keyof typeof DS_COLOR_VARS.border, string>;
  accent: Record<keyof typeof DS_COLOR_VARS.accent, string>;
  status: Record<keyof typeof DS_COLOR_VARS.status, string>;
  a11y: Record<keyof typeof DS_COLOR_VARS.a11y, string>;
};
