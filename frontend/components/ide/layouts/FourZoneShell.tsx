"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import { getLayoutFlags } from "../../../lib/workbench-layout";
import {
  toggleChatPanel,
  toggleCodePanel,
  useWorkbenchZones,
} from "../../../lib/workbench-zone-store";
import { drawerTransition } from "../../../lib/motion-presets";
import { AgentChatHub } from "../workspace/AgentChatHub";
import { CollapsibleBottomTerminal } from "../workspace/CollapsibleBottomTerminal";
import { cn } from "../../../lib/utils";

const panelSpring = { type: "spring" as const, stiffness: 420, damping: 36, mass: 0.82 };

export type FourZoneShellProps = {
  tool: SovereignToolDef;
  centerDesk: ReactNode;
  rightWorkspace: ReactNode;
  chatExtras?: ReactNode;
  centerLabel?: string;
  showCodeToggle?: boolean;
};

function ZoneHeader({
  title,
  toggleLabel,
  onToggle,
  open,
}: {
  title: string;
  toggleLabel: string;
  onToggle: () => void;
  open: boolean;
}) {
  return (
    <header
      className="flex shrink-0 items-center justify-between border-b px-2 py-1.5"
      style={{ borderColor: "#1E293B", background: "#111827" }}
    >
      <span className="truncate text-[9px] font-bold uppercase tracking-wider omni-accent-text">{title}</span>
      <button
        type="button"
        onClick={onToggle}
        className="omni-state-ring rounded-md border px-2 py-0.5 text-[11px] transition hover:brightness-110"
        style={{ borderColor: "#1E293B" }}
        aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
      >
        {toggleLabel}
      </button>
    </header>
  );
}

/** 4-Zone ultralight compliant shell — chat · code · preview */
export function FourZoneShell({
  tool,
  centerDesk,
  rightWorkspace,
  chatExtras,
  centerLabel = "Code Desk",
  showCodeToggle = true,
}: FourZoneShellProps) {
  const { chatOpen, codeOpen } = useWorkbenchZones();
  const flags = getLayoutFlags(tool.slug);
  const routeId = tool.omniRouteId ?? tool.slug;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ZONE 2 — Collapsible Chat (22%) */}
        <motion.aside
          initial={false}
          animate={{
            width: chatOpen ? "22%" : 0,
            opacity: chatOpen ? 1 : 0,
          }}
          transition={panelSpring}
          className="flex min-h-0 shrink-0 flex-col overflow-hidden border-r"
          style={{ borderColor: "#1E293B", minWidth: 0 }}
        >
          <ZoneHeader title="AI Agent Hub" toggleLabel="💬" onToggle={toggleChatPanel} open={chatOpen} />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {chatExtras}
            <AgentChatHub routeId={routeId} toolSlug={tool.slug} />
          </div>
        </motion.aside>

        {!chatOpen ? (
          <button
            type="button"
            onClick={toggleChatPanel}
            className="flex w-7 shrink-0 flex-col items-center justify-center border-r text-[12px]"
            style={{ borderColor: "#1E293B", background: "#111827" }}
            aria-label="Open chat"
          >
            💬
          </button>
        ) : null}

        <motion.div
          key="desk-preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, x: 24 }}
          transition={drawerTransition}
          className="flex min-h-0 min-w-0 flex-1 overflow-hidden"
        >
              {/* ZONE 3 — Collapsible Code / Pipeline Desk (33%) */}
              {showCodeToggle ? (
                <>
                  <motion.div
                    initial={false}
                    animate={{
                      width: codeOpen ? "33%" : 0,
                      opacity: codeOpen ? 1 : 0,
                    }}
                    transition={panelSpring}
                    className="flex min-h-0 shrink-0 flex-col overflow-hidden border-r"
                    style={{ borderColor: "#1E293B", minWidth: 0 }}
                  >
                    <ZoneHeader
                      title={centerLabel}
                      toggleLabel="💻"
                      onToggle={toggleCodePanel}
                      open={codeOpen}
                    />
                    <div className="min-h-0 flex-1 overflow-hidden">{centerDesk}</div>
                  </motion.div>
                  {!codeOpen ? (
                    <button
                      type="button"
                      onClick={toggleCodePanel}
                      className="flex w-7 shrink-0 flex-col items-center justify-center border-r text-[12px]"
                      style={{ borderColor: "#1E293B", background: "#111827" }}
                      aria-label="Open code desk"
                    >
                      💻
                    </button>
                  ) : null}
                </>
              ) : null}

              {/* ZONE 4 — Fluid Preview Workspace */}
              <div
                className={cn("flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden")}
                style={{ background: "#0B0F19" }}
              >
                <header
                  className="shrink-0 border-b px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider omni-accent-text"
                  style={{ borderColor: "#1E293B", background: "#111827" }}
                >
                  Live Execution Workspace
                </header>
              <div className="min-h-0 flex-1 overflow-hidden">{rightWorkspace}</div>
            </div>
          </motion.div>
      </div>

      {flags.showBottomTerminal ? <CollapsibleBottomTerminal /> : null}
    </div>
  );
}

/** Client-only wrapper to avoid SSR framer-motion issues */
export const DynamicFourZoneShell = dynamic(
  () => Promise.resolve({ default: FourZoneShell }),
  { ssr: false },
);
