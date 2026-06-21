"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import type { SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import { showWorkspaceUtilityDeck } from "../../../lib/workbench-utility";
import { toggleChatPanel, useWorkbenchZones } from "../../../lib/workbench-zone-store";
import { AgentChatConsole } from "../workspace/AgentChatConsole";
import { ProjectUtilityDeck } from "../workspace/ProjectUtilityDeck";

const panelSpring = { type: "spring" as const, stiffness: 440, damping: 38, mass: 0.82 };

export type WorkspaceShellProps = {
  tool: SovereignToolDef;
  workspace: ReactNode;
  chatHeaderSlot?: ReactNode;
  designMode?: boolean;
};

/**
 * Clean 2-panel flow — Chat | Workspace
 * Intermediate pipeline panel purged (image_21 green mark).
 */
export function WorkspaceShell({ tool, workspace, chatHeaderSlot, designMode }: WorkspaceShellProps) {
  const { chatOpen } = useWorkbenchZones();
  const routeId = tool.omniRouteId ?? tool.slug;
  const showUtility = showWorkspaceUtilityDeck(tool.slug);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <motion.aside
          layout
          initial={false}
          animate={{ width: chatOpen ? "32%" : 0, opacity: chatOpen ? 1 : 0 }}
          transition={panelSpring}
          className="flex min-h-0 shrink-0 flex-col overflow-hidden border-r"
          style={{ borderColor: "#1E293B", minWidth: 0 }}
        >
          <header
            className="flex shrink-0 items-center justify-between border-b px-2 py-1.5"
            style={{ borderColor: "#1E293B", background: "#111827" }}
          >
            <span className="text-[9px] font-bold uppercase tracking-wider omni-accent-text">AI Agent</span>
            <button
              type="button"
              onClick={toggleChatPanel}
              className="omni-state-ring rounded-md border px-2 py-0.5 text-[11px]"
              style={{ borderColor: "#1E293B" }}
              aria-label="Collapse chat"
            >
              💬
            </button>
          </header>
          <AgentChatConsole
            routeId={routeId}
            toolSlug={tool.slug}
            designMode={designMode}
            headerSlot={chatHeaderSlot}
          />
        </motion.aside>

        {!chatOpen ? (
          <button
            type="button"
            onClick={toggleChatPanel}
            className="flex w-7 shrink-0 items-center justify-center border-r text-[12px]"
            style={{ borderColor: "#1E293B", background: "#111827" }}
            aria-label="Open chat"
          >
            💬
          </button>
        ) : null}

        <motion.main
          layout
          initial={false}
          className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
          style={{ background: "#0B0F19" }}
        >
          <header
            className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-1.5"
            style={{ borderColor: "#1E293B", background: "#111827" }}
          >
            <span className="text-[9px] font-bold uppercase tracking-wider omni-accent-text">
              Live Workspace
            </span>
            {showUtility ? <ProjectUtilityDeck toolSlug={tool.slug} /> : null}
          </header>
          <div className="min-h-0 flex-1 overflow-hidden">{workspace}</div>
        </motion.main>
      </div>
    </div>
  );
}
