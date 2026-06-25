"use client";

import { useEffect } from "react";
import { omniCore } from "../../core/omnicore";
import { useOmniMindEcosystem } from "../../lib/omnimind-ecosystem-context";
import { useOmniCoreOptional } from "../../lib/omnicore/omnicore-context";

/**
 * RC1 — sync ecosystem UI state with OmniCore platform layer.
 * Preserves existing ecosystem workflows; adds unified brain + search indexing.
 */
export function OmniMindUnifiedSync() {
  const eco = useOmniMindEcosystem();
  const core = useOmniCoreOptional();

  useEffect(() => {
    omniCore.boot();
    omniCore.brain.boot();
  }, []);

  useEffect(() => {
    if (!core) return;
    if (eco.commandPaletteOpen !== core.commandPaletteOpen) {
      core.toggleCommandPalette(eco.commandPaletteOpen);
    }
  }, [eco.commandPaletteOpen, core]);

  useEffect(() => {
    const onToolNav = (e: Event) => {
      const detail = (e as CustomEvent<{ toolId?: string }>).detail;
      if (detail?.toolId) omniCore.brain.recordToolUse(detail.toolId);
    };
    window.addEventListener("omnimind:navigate-tool", onToolNav);
    return () => window.removeEventListener("omnimind:navigate-tool", onToolNav);
  }, []);

  useEffect(() => {
    const unsub = omniCore.eventBus.subscribe("command:executed", ({ commandId }) => {
      if (commandId === "cmd-cloud-sync") void omniCore.platformSync.syncAll();
      if (commandId === "cmd-ai-assist" || commandId === "cmd-ai-natural") {
        eco.setAgentPanelOpen(true);
      }
    });
    return () => {
      unsub();
    };
  }, [eco]);

  useEffect(() => {
    const onSave = () => {
      if (omniCore.settings.value("workspace.autoSave", true)) {
        void omniCore.platformSync.syncAll();
      }
    };
    window.addEventListener("omnimind:ecosystem-save", onSave);
    return () => window.removeEventListener("omnimind:ecosystem-save", onSave);
  }, []);

  return null;
}
