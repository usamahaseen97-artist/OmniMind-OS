"use client";

import { motion } from "framer-motion";
import { useCallback, useMemo } from "react";
import type { DevTrioSlug } from "../../../lib/dev-trio";
import { assertDevTrioSlug } from "../../../lib/dev-trio";
import { useOmniForgeWorkspaceOptional } from "../../../lib/omniforge-workspace";
import { useOmniForgeShellOptional } from "../../../lib/omniforge-shell-context";
import { DynamicOmniChatShell } from "../dynamic-workbench-widgets";
import { GUEST } from "../layouts/layout-constants";
import { useIDE } from "../IDEProvider";

const panelSpring = { type: "spring" as const, stiffness: 440, damping: 38, mass: 0.82 };

export type OmniForgeForgeControls = {
  mode: "coding" | "terminal" | "vibe";
  modelLayer: string;
  githubRepo: string;
  providerKey: string;
};

/**
 * Sovereign OmniMind console — dev trio exclusive (OmniForge Engine).
 */
export function DevOmniChatConsole({
  routeId,
  toolSlug,
  forgeControls,
}: {
  routeId: string;
  toolSlug: DevTrioSlug;
  forgeControls: OmniForgeForgeControls;
}) {
  assertDevTrioSlug(toolSlug);
  const { projectFiles, setTopTab } = useIDE();
  const omniforge = useOmniForgeWorkspaceOptional();
  const shell = useOmniForgeShellOptional();

  const fileCount = useMemo(
    () => projectFiles.filter((f) => !f.isFolder).length,
    [projectFiles],
  );

  const providerHint = useMemo(() => {
    if (forgeControls.providerKey.trim()) return "openai";
    if (shell?.useFreeOpenSourcePipeline) return "free";
    if (forgeControls.modelLayer === "Local GPU") return "local";
    if (forgeControls.modelLayer === "Cloud Hybrid") return "gemini";
    return "auto";
  }, [forgeControls.modelLayer, forgeControls.providerKey, shell?.useFreeOpenSourcePipeline]);

  const onOmniForgeScaffold = useCallback(
    async (prompt: string) => {
      if (!omniforge || omniforge.status !== "ready") {
        throw new Error("OmniForge project session is not ready");
      }
      return omniforge.runScaffold(prompt, {
        mode: forgeControls.mode,
        modelLayer: forgeControls.modelLayer,
        githubRepo: forgeControls.githubRepo || undefined,
      });
    },
    [forgeControls.githubRepo, forgeControls.mode, forgeControls.modelLayer, omniforge],
  );

  return (
    <motion.div
      layout
      initial={false}
      transition={panelSpring}
      className="omni-dev-sovereign-console flex h-full min-h-0 min-w-0 flex-col overflow-hidden"
    >
      <header className="omni-dev-panel-header flex shrink-0 items-center border-b px-3 py-2" style={{ borderColor: "rgba(197,198,199,0.12)", background: "#1F2833" }}>
        <div className="min-w-0">
          <p className="truncate text-[9px] font-bold uppercase tracking-wider text-[#66FCF1]">
            Sovereign OmniMind Console
          </p>
          <p className="truncate text-[8px] text-[#C5C6C7]/60">
            {omniforge?.status === "ready"
              ? `Live AI · project ${omniforge.projectId?.slice(0, 8)}`
              : omniforge?.status === "offline"
                ? "Gateway offline · legacy dev engine fallback"
                : "Connecting OmniForge session…"}
          </p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        <DynamicOmniChatShell
          routeId={routeId}
          userId={GUEST}
          showDashboardTools
          hideLiveDeck
          workbenchUnified
          devTrioPremium
          devTrioFileCount={fileCount}
          onDevTrioReview={() => setTopTab("review-code")}
          toolSlug={toolSlug}
          omniforgeProjectId={omniforge?.projectId ?? null}
          omniforgeProviderHint={providerHint}
          omniforgeMode={forgeControls.mode}
          onOmniForgeScaffold={onOmniForgeScaffold}
        />
      </div>
    </motion.div>
  );
}
