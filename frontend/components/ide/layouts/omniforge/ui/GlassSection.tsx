"use client";

import type { ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { OF, glassStyle } from "../omniforge-theme";

type Props = {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
  noPad?: boolean;
};

export function GlassSection({
  title,
  subtitle,
  actions,
  children,
  collapsible,
  collapsed,
  onToggleCollapse,
  className = "",
  noPad,
}: Props) {
  return (
    <section
      className={`flex h-full min-h-0 flex-col overflow-hidden border-r ${className}`}
      style={{ ...glassStyle, borderRightColor: OF.glassBorder, background: OF.panel }}
    >
      <header
        className="flex shrink-0 items-center gap-2 border-b px-3 py-2"
        style={{ borderColor: OF.glassBorder, background: "rgba(255,255,255,0.02)" }}
      >
        {collapsible ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="rounded p-0.5 transition hover:bg-white/[0.06]"
            style={{ color: OF.textMuted }}
            aria-label={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em]" style={{ color: OF.text }}>
            {title}
          </p>
          {subtitle ? (
            <p className="truncate text-[9px]" style={{ color: OF.textMuted }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions}
      </header>
      {!collapsed ? (
        <div className={`min-h-0 flex-1 overflow-hidden ${noPad ? "" : ""}`}>{children}</div>
      ) : null}
    </section>
  );
}

export function GlassChip({
  active,
  onClick,
  children,
  disabled,
}: {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-full border px-2.5 py-1 text-[9px] font-medium transition disabled:opacity-40"
      style={{
        borderColor: active ? OF.indigoSolid : OF.border,
        background: active ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
        color: active ? OF.indigo : OF.textMuted,
        boxShadow: active ? `0 0 12px ${OF.cyanGlow}` : undefined,
      }}
    >
      {children}
    </button>
  );
}

export function GlassIconBtn({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="rounded-md p-1.5 transition hover:bg-white/[0.06]"
      style={{
        color: active ? OF.cyan : OF.textMuted,
        background: active ? OF.rowActive : "transparent",
      }}
    >
      {children}
    </button>
  );
}
