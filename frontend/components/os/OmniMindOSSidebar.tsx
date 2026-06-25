"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { ChevronDown, PanelLeft } from "lucide-react";
import { OMNI_OS_CATEGORIES } from "../../lib/omnimind-os-categories";
import type { SovereignToolSlug } from "../../lib/sovereign-tool-registry";
import { useOmniMindEcosystem } from "../../lib/omnimind-ecosystem-context";
import { cn } from "../../lib/utils";
import { OS_TOKENS } from "./tokens";

type OmniMindOSSidebarProps = {
  activeSlug?: SovereignToolSlug;
};

/** Global expandable sidebar — one implementation for all OS-shell tools. */
export function OmniMindOSSidebar({ activeSlug }: OmniMindOSSidebarProps) {
  const { sidebarOpen, setSidebarOpen } = useOmniMindEcosystem();
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(OMNI_OS_CATEGORIES.map((c) => [c.id, true])),
  );

  const toggleCategory = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!sidebarOpen) {
    return (
      <aside
        className="flex w-14 shrink-0 flex-col items-center border-r py-3"
        style={{ borderColor: OS_TOKENS.border.subtle, background: OS_TOKENS.bg.sidebar }}
      >
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/[0.04] hover:text-cyan-300"
          aria-label="Expand sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      </aside>
    );
  }

  return (
    <aside
      className="flex w-[15.5rem] shrink-0 flex-col overflow-hidden border-r"
      style={{ borderColor: OS_TOKENS.border.subtle, background: OS_TOKENS.bg.sidebar }}
    >
      <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: OS_TOKENS.border.subtle }}>
        <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-cyan-300/80">Navigation</span>
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="rounded p-1 text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
          aria-label="Collapse sidebar"
        >
          <PanelLeft className="h-3.5 w-3.5" />
        </button>
      </div>

      <nav className="history-scroll-hover min-h-0 flex-1 overflow-y-auto p-2">
        {OMNI_OS_CATEGORIES.map((category) => {
          const CatIcon = category.icon;
          const isOpen = expanded[category.id] !== false;
          return (
            <div key={category.id} className="mb-2">
              <button
                type="button"
                onClick={() => toggleCategory(category.id)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-white/[0.03]"
              >
                <CatIcon className="h-3.5 w-3.5 shrink-0 text-zinc-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10px] font-semibold text-zinc-300">{category.label}</p>
                  <p className="truncate text-[8px] text-zinc-600">{category.description}</p>
                </div>
                <ChevronDown
                  className={cn("h-3 w-3 text-zinc-600 transition", isOpen && "rotate-180")}
                />
              </button>

              <AnimatePresence initial={false}>
                {isOpen ? (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden pl-1"
                  >
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      const active = item.slug === activeSlug;
                      return (
                        <li key={`${category.id}-${item.id}`}>
                          <Link
                            href={item.href}
                            className={cn(
                              "group mb-0.5 flex items-start gap-2 rounded-lg border px-2 py-1.5 transition",
                              active
                                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-200"
                                : "border-transparent text-zinc-500 hover:border-white/[0.04] hover:bg-white/[0.02] hover:text-zinc-300",
                            )}
                          >
                            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <span className="truncate text-[10px] font-medium">{item.name}</span>
                                {item.status === "beta" ? (
                                  <span className="rounded bg-amber-500/15 px-1 text-[7px] uppercase text-amber-300">beta</span>
                                ) : null}
                                {item.status === "live" && active ? (
                                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                                ) : null}
                              </div>
                              <p className="truncate text-[8px] leading-snug opacity-70">{item.description}</p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </motion.ul>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
