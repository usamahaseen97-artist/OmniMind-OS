"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type EcosystemPanel =
  | "none"
  | "hub"
  | "activity"
  | "tasks"
  | "ai-tasks"
  | "projects"
  | "background";

type EcosystemOSContextValue = {
  activePanel: EcosystemPanel;
  sidebarCollapsed: boolean;
  openPanel: (panel: EcosystemPanel) => void;
  closePanel: () => void;
  togglePanel: (panel: EcosystemPanel) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
};

const EcosystemOSContext = createContext<EcosystemOSContextValue | null>(null);

export function EcosystemOSProvider({ children }: { children: ReactNode }) {
  const [activePanel, setActivePanel] = useState<EcosystemPanel>("none");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const openPanel = useCallback((panel: EcosystemPanel) => setActivePanel(panel), []);
  const closePanel = useCallback(() => setActivePanel("none"), []);
  const togglePanel = useCallback((panel: EcosystemPanel) => {
    setActivePanel((p) => (p === panel ? "none" : panel));
  }, []);
  const toggleSidebar = useCallback(() => setSidebarCollapsed((c) => !c), []);

  const value = useMemo(
    () => ({
      activePanel,
      sidebarCollapsed,
      openPanel,
      closePanel,
      togglePanel,
      toggleSidebar,
      setSidebarCollapsed,
    }),
    [activePanel, sidebarCollapsed, openPanel, closePanel, togglePanel, toggleSidebar],
  );

  return <EcosystemOSContext.Provider value={value}>{children}</EcosystemOSContext.Provider>;
}

export function useEcosystemOS() {
  const ctx = useContext(EcosystemOSContext);
  if (!ctx) throw new Error("useEcosystemOS requires EcosystemOSProvider");
  return ctx;
}

export function useEcosystemOSOptional() {
  return useContext(EcosystemOSContext);
}
