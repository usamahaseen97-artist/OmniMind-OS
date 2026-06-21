"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { MessageSquare, PanelRight } from "lucide-react";
import { getToolAccent } from "../../lib/tool-ui-styles";
import { cn } from "../../lib/utils";

interface ToolSplitShellProps {
  slug?: string;
  title: string;
  tagline: string;
  icon: LucideIcon;
  left: ReactNode;
  right: ReactNode;
  leftLabel?: string;
  rightLabel?: string;
  statusLabel?: string;
  statusOnline?: boolean;
  className?: string;
}

export function ToolSplitShell({
  slug = "architectural-designer",
  title,
  tagline,
  icon: Icon,
  left,
  right,
  leftLabel = "AI Assistant",
  rightLabel = "Live Workspace",
  statusLabel,
  statusOnline,
  className,
}: ToolSplitShellProps) {
  const accent = getToolAccent(slug);

  return (
    <div className={cn("flex h-full min-h-0 flex-col overflow-hidden bg-[#0B0C10]", className)}>
      <header className="relative shrink-0 overflow-hidden border-b border-emerald-500/15 bg-gradient-to-r from-[#15171E] via-[#12151c] to-[#0B0C10] px-4 py-3">
        <div
          className={cn(
            "pointer-events-none absolute -right-6 -top-10 h-28 w-28 rounded-full bg-gradient-to-br opacity-50 blur-2xl",
            accent.glow,
          )}
        />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-black/30 shadow-lg",
                accent.ring,
              )}
            >
              <Icon className={cn("h-5 w-5", accent.text)} />
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold tracking-tight text-zinc-50">{title}</h1>
              <p className="truncate text-[11px] text-zinc-400">{tagline}</p>
            </div>
          </div>
          {statusLabel ? (
            <span
              className={cn(
                "shrink-0 rounded-full border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-wide",
                statusOnline
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-300",
              )}
            >
              {statusLabel}
            </span>
          ) : null}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <motion.section
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="flex min-h-0 w-full min-w-0 flex-col border-b border-emerald-500/10 lg:w-[min(440px,40%)] lg:border-b-0 lg:border-r"
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.04] bg-black/20 px-3 py-2">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-500/80" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{leftLabel}</span>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">{left}</div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.04] bg-black/20 px-3 py-2">
            <PanelRight className="h-3.5 w-3.5 text-emerald-500/80" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">{rightLabel}</span>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">{right}</div>
        </motion.section>
      </div>
    </div>
  );
}
