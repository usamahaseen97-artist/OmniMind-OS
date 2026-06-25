import { cn } from "../../lib/utils";
import { DS_GLASS, DS_TRANSITION_CLASS } from "../tokens";

/** Shared enterprise component class recipes */
export const ds = {
  focusRing:
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--omni-ds-a11y-focus-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[color:var(--omni-ds-bg-canvas)]",
  text: {
    label: "text-[9px] font-bold uppercase tracking-[0.2em] text-[color:var(--omni-ds-text-muted)]",
    body: "text-[11px] text-[color:var(--omni-ds-text-primary)]",
    caption: "text-[9px] text-[color:var(--omni-ds-text-muted)]",
    accent: "text-[color:var(--omni-ds-text-accent)]",
  },
  surface: {
    panel: cn(DS_GLASS.panel, DS_TRANSITION_CLASS.colors),
    card: cn(DS_GLASS.card, "rounded-xl", DS_TRANSITION_CLASS.colors),
    chip: cn(DS_GLASS.chip, "rounded-full", DS_TRANSITION_CLASS.colors),
  },
  interactive: cn(
    DS_TRANSITION_CLASS.default,
    "hover:bg-white/[0.04] active:scale-[0.98]",
  ),
} as const;

export function dsButtonVariants(variant: "primary" | "secondary" | "ghost" | "danger" | "outline" = "primary") {
  const base = cn(
    "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium",
    ds.focusRing,
    DS_TRANSITION_CLASS.colors,
    "disabled:pointer-events-none disabled:opacity-50",
  );
  const variants = {
    primary:
      "bg-[color:var(--omni-ds-accent-primary)] text-[color:var(--omni-ds-text-inverse)] hover:brightness-110 shadow-[var(--omni-ds-elevation-glow)]",
    secondary:
      "bg-[color:var(--omni-ds-bg-panel-elevated)] text-[color:var(--omni-ds-text-primary)] border border-[color:var(--omni-ds-border-subtle)] hover:border-[color:var(--omni-ds-border-accent)]",
    ghost: "text-[color:var(--omni-ds-text-muted)] hover:bg-white/[0.05] hover:text-[color:var(--omni-ds-text-primary)]",
    danger: "bg-[color:var(--omni-ds-status-error-bg)] text-[color:var(--omni-ds-status-error)] hover:brightness-110",
    outline:
      "border border-[color:var(--omni-ds-border-default)] bg-transparent text-[color:var(--omni-ds-text-primary)] hover:border-[color:var(--omni-ds-border-accent)]",
  };
  return cn(base, variants[variant]);
}

export function dsButtonSizes(size: "xs" | "sm" | "md" | "lg" | "icon" = "md") {
  const sizes = {
    xs: "h-7 px-2 text-[10px]",
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-11 px-5 text-sm",
    icon: "h-9 w-9 p-0",
  };
  return sizes[size];
}
