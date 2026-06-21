"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { PanelLeftClose } from "lucide-react";
import { ACTIVITY_BAR_WIDTH_PX } from "../../lib/activity-bar";
import { ACTIVITY_MENU_GROUPS } from "../../lib/workbench-layout";
import { drawerTransition, drawerVariants } from "../../lib/motion-presets";
import { getSovereignTool, type SovereignToolSlug } from "../../lib/sovereign-tool-registry";
import { cn } from "../../lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  currentSlug: SovereignToolSlug;
};

/** Client-only drawer — framer-motion isolated from SSR bundle */
export function ActivityToolsDrawer({ open, onClose, currentSlug }: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.nav
          key="tools-drawer"
          variants={drawerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={drawerTransition}
          className="fixed bottom-0 top-0 z-50 flex w-64 flex-col border-r shadow-2xl"
          style={{
            left: ACTIVITY_BAR_WIDTH_PX,
            background: "var(--omni-panel)",
            borderColor: "var(--omni-border)",
          }}
        >
          <div
            className="flex items-center justify-between border-b px-3 py-2"
            style={{ borderColor: "var(--omni-border)" }}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider omni-accent-text">Sovereign Tools</span>
            <button type="button" onClick={onClose} className="rounded p-1 hover:bg-white/5">
              <PanelLeftClose className="h-4 w-4" style={{ color: "var(--omni-text-muted)" }} />
            </button>
          </div>
          <div className="ide-pane-scroll omni-pro-scroll min-h-0 flex-1 overflow-y-auto p-2">
            {ACTIVITY_MENU_GROUPS.map((group) => (
              <div key={group.label} className="mb-4">
                <p
                  className="mb-1.5 px-2 text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: "var(--omni-text-muted)" }}
                >
                  {group.label}
                </p>
                {group.slugs.map((slug) => {
                  const tool = getSovereignTool(slug);
                  if (!tool) return null;
                  const Icon = tool.icon;
                  const active = currentSlug === slug;
                  return (
                    <Link
                      key={slug}
                      href={tool.href}
                      onClick={onClose}
                      className={cn(
                        "mb-0.5 flex items-center gap-2 rounded-lg px-2 py-2 text-[11px] transition",
                        active ? "omni-accent-bg omni-accent-text omni-active-rail" : "hover:bg-white/[0.04]",
                      )}
                      style={!active ? { color: "var(--omni-text-muted)" } : undefined}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="truncate">{tool.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        </motion.nav>
      ) : null}
    </AnimatePresence>
  );
}
