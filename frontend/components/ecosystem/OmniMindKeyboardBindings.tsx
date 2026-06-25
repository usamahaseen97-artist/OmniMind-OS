"use client";

import { useEffect } from "react";
import { useOmniMindEcosystem } from "../../lib/omnimind-ecosystem-context";
import { useOmniForgeShellOptional } from "../../lib/omniforge-shell-context";
import { useOmniCoreOptional } from "../../lib/omnicore/omnicore-context";
import { omniCore } from "../../core/omnicore";
import {
  cycleTab,
  reopenClosedTab,
  setQuickSwitcherOpen,
  toggleDockPanel,
} from "../../lib/workspace-engine/store";

/** Global keyboard bindings — ecosystem + OmniCore unified (RC1). */
export function OmniMindKeyboardBindings() {
  const eco = useOmniMindEcosystem();
  const shell = useOmniForgeShellOptional();
  const core = useOmniCoreOptional();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const typing = tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable;

      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        eco.setCommandPaletteOpen(true);
        core?.toggleCommandPalette(true);
        omniCore.shortcuts.trigger("sc-search");
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        eco.setCommandPaletteOpen(true);
        core?.toggleCommandPalette(true);
        omniCore.shortcuts.trigger("sc-palette");
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        eco.setAgentPanelOpen(!eco.agentPanelOpen);
        omniCore.shortcuts.trigger("sc-ai");
        return;
      }
      if (mod && e.key.toLowerCase() === "p" && !e.shiftKey) {
        e.preventDefault();
        eco.setQuickSearchOpen(true);
        omniCore.shortcuts.trigger("sc-quick-open");
        return;
      }
      if (mod && e.key.toLowerCase() === "f" && !typing) {
        e.preventDefault();
        eco.setQuickSearchOpen(true);
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        eco.saveSnapshot("Save As Snapshot");
        eco.pushNotification("Workspace snapshot saved", "success");
        return;
      }
      if (mod && e.key.toLowerCase() === "s" && !e.shiftKey) {
        e.preventDefault();
        eco.saveWorkspaceState();
        eco.saveSnapshot("Manual Save");
        window.dispatchEvent(new CustomEvent("omnimind:ecosystem-save"));
        eco.pushNotification("Workspace saved + deploy artifacts synced", "success");
        return;
      }
      if (mod && e.key === "`") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("omnimind:toggle-terminal"));
        omniCore.shortcuts.trigger("sc-terminal");
        toggleDockPanel("terminal");
        return;
      }
      if (mod && e.key === "/") {
        e.preventDefault();
        eco.setQuickSearchOpen(true);
        return;
      }
      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey && !typing) {
        omniCore.undo.undo("omniforge-engine", omniCore.projects.activeProjectId);
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "z" && !typing) {
        omniCore.undo.redo("omniforge-engine", omniCore.projects.activeProjectId);
        return;
      }
      if (mod && e.key === "Enter") {
        e.preventDefault();
        eco.dispatchEcosystemCommand("run:preview");
        window.dispatchEvent(new CustomEvent("omnimind:ecosystem-run"));
        return;
      }
      if (mod && e.key.toLowerCase() === "b") {
        e.preventDefault();
        eco.setSidebarOpen(!eco.sidebarOpen);
        if (shell) shell.setExplorerOpen(!shell.explorerOpen);
        window.dispatchEvent(new CustomEvent("omnimind:ecosystem-toggle-servers"));
        return;
      }
      if (e.key === "F5") {
        e.preventDefault();
        eco.dispatchEcosystemCommand("run:preview");
        return;
      }
      if (mod && e.key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          cycleTab(true);
          setQuickSwitcherOpen(true);
        } else {
          cycleTab(false);
          setQuickSwitcherOpen(true);
        }
        omniCore.shortcuts.trigger("sc-project-tab");
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        reopenClosedTab();
        return;
      }
      if (mod && /^[1-9]$/.test(e.key)) {
        const toolIndex = Number(e.key) - 1;
        window.dispatchEvent(new CustomEvent("omnimind:switch-tool-index", { detail: { index: toolIndex } }));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [eco, shell, core]);

  return null;
}
