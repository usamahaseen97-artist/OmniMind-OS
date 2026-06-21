"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { SovereignToolSlug } from "../../../lib/sovereign-tool-registry";
import { DynamicOmniChatShell } from "../dynamic-workbench-widgets";
import { GUEST } from "../layouts/layout-shared";
import { WorkbenchAgentBranding } from "./WorkbenchAgentBranding";

interface AgentChatConsoleProps {
  routeId: string;
  toolSlug: SovereignToolSlug;
  designMode?: boolean;
  headerSlot?: ReactNode;
  companionSlot?: ReactNode;
}

const panelSpring = { type: "spring" as const, stiffness: 440, damping: 38, mass: 0.82 };

/**
 * Single master chatbot per tool — unified prompt, chips, history, and submit.
 */
export function AgentChatConsole({
  routeId,
  toolSlug,
  designMode,
  headerSlot,
  companionSlot,
}: AgentChatConsoleProps) {
  return (
    <motion.div
      layout
      initial={false}
      transition={panelSpring}
      className="omni-lux-chat omni-studio-panel flex h-full min-h-0 flex-col overflow-hidden"
    >
      <WorkbenchAgentBranding routeId={routeId} />
      {headerSlot ? (
        <div className="shrink-0 border-b border-purple-500/[0.12]">
          {headerSlot}
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-hidden">
          <DynamicOmniChatShell
            routeId={routeId}
            userId={GUEST}
            showDashboardTools
            hideLiveDeck
            workbenchUnified
            toolSlug={toolSlug}
            designMode={designMode}
          />
        </div>
        {companionSlot}
      </div>
    </motion.div>
  );
}
