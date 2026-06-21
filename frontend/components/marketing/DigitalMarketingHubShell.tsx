"use client";

import { motion } from "framer-motion";
import type { SovereignToolDef } from "../../lib/sovereign-tool-registry";
import { AgentChatConsole } from "../ide/workspace/AgentChatConsole";
import { MarketingSocialCaptionPanel } from "./MarketingSocialCaptionPanel";
import { MarketingHubWorkspace } from "./MarketingHubWorkspace";

const panelSpring = { type: "spring" as const, stiffness: 440, damping: 38, mass: 0.82 };

/** Digital Marketing Hub — 32% unified chat · 68% dual equal viewports */
export function DigitalMarketingHubShell({ tool }: { tool: SovereignToolDef }) {
  const routeId = tool.omniRouteId ?? tool.slug;

  return (
    <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden">
      <motion.aside
        layout
        initial={false}
        className="flex w-[32%] min-w-[300px] max-w-[420px] shrink-0 flex-col overflow-hidden border-r"
        style={{ borderColor: "#1E293B" }}
        transition={panelSpring}
      >
        <header
          className="shrink-0 border-b px-3 py-2"
          style={{ borderColor: "#1E293B", background: "#111827" }}
        >
          <p className="text-[9px] font-bold uppercase tracking-wider omni-accent-text">AI Agent</p>
        </header>
        <AgentChatConsole
          routeId={routeId}
          toolSlug={tool.slug}
          companionSlot={
            <div className="max-h-[38%] shrink-0 overflow-hidden border-t" style={{ borderColor: "#1E293B" }}>
              <MarketingSocialCaptionPanel />
            </div>
          }
        />
      </motion.aside>

      <motion.main
        layout
        initial={false}
        className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
        transition={panelSpring}
      >
        <MarketingHubWorkspace />
      </motion.main>
    </div>
  );
}
