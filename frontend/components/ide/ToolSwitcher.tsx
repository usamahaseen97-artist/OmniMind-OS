"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, LayoutGrid } from "lucide-react";
import { ACTIVITY_MENU_GROUPS } from "../../lib/workbench-layout";
import { getSovereignTool, type SovereignToolDef } from "../../lib/sovereign-tool-registry";
import { cn } from "../../lib/utils";

const fade = { duration: 0.18, ease: "easeOut" as const };

export function ToolSwitcher({ tool }: { tool: SovereignToolDef }) {
  const pathname = usePathname();
  const currentSlug = pathname.replace("/", "") || tool.slug;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, []);

  return (
    <div ref={rootRef} className="relative flex min-w-0 items-center gap-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="omni-state-ring flex max-w-full items-center gap-1.5 rounded-lg border px-2.5 py-1 transition hover:brightness-110"
        style={{ borderColor: "#1E293B", background: "color-mix(in srgb, var(--omni-panel) 85%, transparent)" }}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <LayoutGrid className="h-3.5 w-3.5 shrink-0 omni-accent-text" strokeWidth={1.75} />
        <span className="truncate text-[11px] font-semibold omni-accent-text">{tool.name}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")}
          style={{ color: "var(--omni-text-muted)" }}
        />
      </button>

      <AnimatePresence>
        {open ? (
          <>
            <button
              type="button"
              aria-label="Close tool menu"
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[1px]"
              onClick={() => setOpen(false)}
            />
            <motion.div
              role="listbox"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={fade}
              className="absolute left-0 top-[calc(100%+6px)] z-[70] max-h-[min(70vh,420px)] w-[min(92vw,280px)] overflow-hidden rounded-xl border shadow-2xl"
              style={{ borderColor: "#1E293B", background: "#111827" }}
            >
              <div className="border-b px-3 py-2" style={{ borderColor: "#1E293B" }}>
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="text-[10px] font-bold uppercase tracking-wider omni-accent-text hover:underline"
                >
                  ⬅️ Neural Dashboard
                </Link>
              </div>
              <div className="ide-pane-scroll omni-pro-scroll max-h-[min(64vh,380px)] overflow-y-auto p-2">
                {ACTIVITY_MENU_GROUPS.map((group) => (
                  <div key={group.label} className="mb-3">
                    <p
                      className="mb-1 px-2 text-[8px] font-bold uppercase tracking-wider"
                      style={{ color: "var(--omni-text-muted)" }}
                    >
                      {group.label}
                    </p>
                    {group.slugs.map((slug) => {
                      const entry = getSovereignTool(slug);
                      if (!entry) return null;
                      const Icon = entry.icon;
                      const active = currentSlug === slug;
                      return (
                        <Link
                          key={slug}
                          href={entry.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "mb-0.5 flex items-center gap-2 rounded-lg px-2 py-2 text-[11px] transition",
                            active ? "omni-accent-bg omni-accent-text" : "hover:bg-white/[0.04]",
                          )}
                          style={!active ? { color: "var(--omni-text-muted)" } : undefined}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{entry.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
