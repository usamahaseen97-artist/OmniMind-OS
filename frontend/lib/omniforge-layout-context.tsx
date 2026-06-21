"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type WorkspaceTab =
  | { kind: "file"; path: string; label: string }
  | { kind: "welcome" };

type OmniForgeLayoutContextValue = {
  tabs: WorkspaceTab[];
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  openFileTab: (path: string, label?: string) => void;
  closeFileTab: (path: string) => void;
};

const OmniForgeLayoutContext = createContext<OmniForgeLayoutContextValue | null>(null);

export function OmniForgeLayoutProvider({ children }: { children: ReactNode }) {
  const [fileTabs, setFileTabs] = useState<WorkspaceTab[]>([]);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>({ kind: "welcome" });

  const tabs = useMemo(() => {
    if (!fileTabs.length) return [{ kind: "welcome" as const }];
    return fileTabs;
  }, [fileTabs]);

  const openFileTab = useCallback((path: string, label?: string) => {
    const fileLabel = label ?? path.split("/").pop() ?? path;
    const tab: WorkspaceTab = { kind: "file", path, label: fileLabel };
    setFileTabs((prev) => {
      if (prev.some((t) => t.kind === "file" && t.path === path)) return prev;
      return [...prev, tab];
    });
    setActiveTab(tab);
  }, []);

  const closeFileTab = useCallback((path: string) => {
    setFileTabs((prev) => {
      const next = prev.filter((t) => !(t.kind === "file" && t.path === path));
      return next;
    });
    setActiveTab((current) => {
      if (current.kind === "file" && current.path === path) {
        return { kind: "welcome" };
      }
      return current;
    });
  }, []);

  const value = useMemo(
    () => ({ tabs, activeTab, setActiveTab, openFileTab, closeFileTab }),
    [activeTab, closeFileTab, openFileTab, tabs],
  );

  return <OmniForgeLayoutContext.Provider value={value}>{children}</OmniForgeLayoutContext.Provider>;
}

export function useOmniForgeLayout() {
  const ctx = useContext(OmniForgeLayoutContext);
  if (!ctx) throw new Error("useOmniForgeLayout must be used within OmniForgeLayoutProvider");
  return ctx;
}
