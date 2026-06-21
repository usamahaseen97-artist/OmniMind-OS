"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { getToolAccent } from "../../lib/tool-ui-styles";
import { cn } from "../../lib/utils";

interface ToolWorkspaceFrameProps {
  slug: string;
  title: string;
  tagline: string;
  description?: string;
  icon: LucideIcon;
  children: ReactNode;
  fullBleed?: boolean;
}

/** Decorative header wrapper for full-bleed tools (entertainment, maps). */
export function ToolWorkspaceFrame({
  slug,
  title,
  tagline,
  description,
  icon: Icon,
  children,
  fullBleed = false,
}: ToolWorkspaceFrameProps) {
  const accent = getToolAccent(slug);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative shrink-0 overflow-hidden border-b border-emerald-500/15 px-4 py-3",
          "bg-gradient-to-r from-[#15171E] via-[#12151c] to-[#0B0C10]",
        )}
      >
        <div
          className={cn(
            "pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-40 blur-2xl",
            accent.glow,
          )}
        />
        <div className="relative flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border bg-black/30 shadow-lg",
              accent.ring,
            )}
          >
            <Icon className={cn("h-5 w-5", accent.text)} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold tracking-tight text-zinc-50">{title}</h1>
            <p className="truncate text-[11px] text-zinc-400">{tagline}</p>
            {description ? (
              <p className="mt-0.5 hidden truncate text-[10px] text-zinc-600 sm:block">{description}</p>
            ) : null}
          </div>
        </div>
      </motion.header>
      <div className={cn("min-h-0 flex-1 overflow-hidden", !fullBleed && "p-1")}>{children}</div>
    </div>
  );
}
