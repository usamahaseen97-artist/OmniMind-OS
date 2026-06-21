"use client";

import { useEffect } from "react";
import { useOmniMindEcosystem } from "../../lib/omnimind-ecosystem-context";
import { useOmniForgeShellOptional } from "../../lib/omniforge-shell-context";

/** Global keyboard bindings — IDE productivity shortcuts (PRD Sec 5–7). */
export function OmniMindKeyboardBindings() {
  const eco = useOmniMindEcosystem();
  const shell = useOmniForgeShellOptional();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      const typing = tag === "input" || tag === "textarea" || (e.target as HTMLElement)?.isContentEditable;

      if (mod && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        eco.setCommandPaletteOpen(true);
        return;
      }
      if (mod && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        eco.setAgentPanelOpen(!eco.agentPanelOpen);
        return;
      }
      if (mod && e.key.toLowerCase() === "p") {
        e.preventDefault();
        eco.setQuickSearchOpen(true);
        return;
      }
      if (mod && e.key.toLowerCase() === "f" && !typing) {
        e.preventDefault();
        eco.setQuickSearchOpen(true);
        return;
      }
      if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        eco.saveWorkspaceState();
        eco.saveSnapshot("Manual Save");
        window.dispatchEvent(new CustomEvent("omnimind:ecosystem-save"));
        eco.pushNotification("Workspace saved + deploy artifacts synced", "success");
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
        const tabs = eco.projectTabs;
        if (tabs.length < 2) return;
        const idx = tabs.findIndex((t) => t.id === eco.activeProjectTabId);
        const next = tabs[(idx + 1) % tabs.length]!;
        eco.setActiveProjectTabId(next.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [eco, shell]);

  return null;
}
