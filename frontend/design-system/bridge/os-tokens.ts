import { DS_GLASS, DS_LAYOUT } from "../tokens";
import { DS_MOTION } from "../tokens/motion";

/**
 * OS shell tokens — derived from design-system CSS variables.
 * Replaces hardcoded hex in components/os/tokens.ts while preserving API.
 */
export function getOSTokensFromDesignSystem() {
  return {
    bg: {
      shell: "var(--omni-ds-bg-shell)",
      panel: "var(--omni-ds-bg-panel)",
      panelElevated: "var(--omni-ds-bg-panel-elevated)",
      workspace: "var(--omni-ds-bg-workspace)",
      sidebar: "var(--omni-ds-bg-sidebar)",
      header: "var(--omni-ds-bg-header)",
      status: "var(--omni-ds-bg-status)",
    },
    border: {
      subtle: "var(--omni-ds-border-subtle)",
      accent: "var(--omni-ds-border-accent)",
    },
    text: {
      primary: "var(--omni-ds-text-primary)",
      muted: "var(--omni-ds-text-muted)",
      accent: "var(--omni-ds-text-accent)",
    },
    layout: { ...DS_LAYOUT },
    motion: { panel: DS_MOTION.panel },
    glass: {
      panel: DS_GLASS.panel,
      chip: DS_GLASS.chip,
    },
  } as const;
}

/** @deprecated Use getOSTokensFromDesignSystem() for theme-aware tokens. Static fallback for SSR. */
export const OS_TOKENS = {
  bg: {
    shell: "#0a0b10",
    panel: "#12141c",
    panelElevated: "#161922",
    workspace: "#0b1018",
    sidebar: "#0d1018",
    header: "rgba(12, 14, 20, 0.98)",
    status: "#0a0b10",
  },
  border: {
    subtle: "rgba(255,255,255,0.06)",
    accent: "rgba(34,211,238,0.25)",
  },
  text: {
    primary: "#e3e8ef",
    muted: "#8b95a8",
    accent: "#67e8f9",
  },
  layout: { ...DS_LAYOUT },
  motion: { panel: DS_MOTION.panel },
  glass: {
    panel: DS_GLASS.panel,
    chip: DS_GLASS.chip,
  },
} as const;
