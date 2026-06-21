"use client";

import type { ReactNode } from "react";
import { cn } from "../../lib/utils";

interface OmniMindLayoutProps {
  sidebar: ReactNode;
  children: ReactNode;
  secureNodeActive?: boolean;
  className?: string;
}

/** Clean luxury shell — charcoal palette, non-overlapping header */
export function OmniMindLayout({
  sidebar,
  children,
  secureNodeActive = true,
  className,
}: OmniMindLayoutProps) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full select-none overflow-hidden bg-[#121214] font-sans text-[#e3e3e3] antialiased",
        className,
      )}
    >
      <div className="z-20 h-full shrink-0">{sidebar}</div>

      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[#0f0f11]">
        <header className="relative z-10 flex h-14 shrink-0 items-center justify-between border-b border-[#1e1e22] bg-[#121214]/90 px-6 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="rounded border border-[#26262b] bg-[#1a1a1e] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-gray-500">
              Core Stack
            </span>
          </div>

          <h1 className="absolute left-1/2 -translate-x-1/2 text-xs font-semibold uppercase tracking-[0.4em] text-gray-300">
            OMNIMIND
          </h1>

          <div className="flex items-center gap-2 text-[10px] tracking-wider text-gray-500">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                secureNodeActive ? "bg-gray-500" : "bg-amber-600",
              )}
              aria-hidden
            />
            <span>{secureNodeActive ? "SECURE SYSTEM" : "RECONNECTING"}</span>
          </div>
        </header>

        <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
