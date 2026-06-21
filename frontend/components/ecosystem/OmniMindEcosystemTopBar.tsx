"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Home,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import { useOmniMindEcosystem } from "../../lib/omnimind-ecosystem-context";
import { WORKSPACE_PROFILES } from "../../lib/omnimind-ecosystem-registry";

/** Global top navigation — matrix-backed back, tool switcher, breadcrumbs, project tabs. */
export function OmniMindEcosystemTopBar() {
  const {
    breadcrumbs,
    canGoBack,
    canGoForward,
    executeNavigateBack,
    navigateForward,
    navigateHome,
    navigateToTool,
    workspaceProfile,
    setWorkspaceProfile,
    projectTabs,
    activeProjectTabId,
    setActiveProjectTabId,
    closeProjectTab,
    addProjectTab,
    saveWorkspaceState,
    navMenuItems,
    navMatrixVersion,
    routeDispatching,
  } = useOmniMindEcosystem();

  const [toolMenuOpen, setToolMenuOpen] = useState(false);
  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setToolMenuOpen(false);
        setWorkspaceMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const profileLabel = WORKSPACE_PROFILES.find((p) => p.id === workspaceProfile)?.label ?? "Personal";

  const handleBack = () => {
    void executeNavigateBack("Back to Neural Chatbot");
  };

  return (
    <header className="flex shrink-0 flex-col border-b border-white/[0.06] bg-[rgba(12,14,20,0.98)]">
      <div className="flex h-8 items-center gap-2 px-2">
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            disabled={routeDispatching || !canGoBack}
            onClick={handleBack}
            className="flex items-center gap-1 rounded px-1 py-0.5 text-zinc-500 transition hover:bg-white/[0.05] hover:text-zinc-200 disabled:opacity-30"
            title="Back to Neural Chatbot"
          >
            {routeDispatching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-400" />
            ) : (
              <ArrowLeft className="h-3.5 w-3.5" />
            )}
            <span className="hidden text-[9px] font-medium md:inline">Back</span>
          </button>
          <button
            type="button"
            disabled={!canGoForward || routeDispatching}
            onClick={navigateForward}
            className="rounded p-1 text-zinc-500 transition hover:bg-white/[0.05] hover:text-zinc-200 disabled:opacity-30"
            title="Forward"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={routeDispatching}
            onClick={() => {
              saveWorkspaceState();
              navigateHome();
            }}
            className="rounded p-1 text-zinc-500 transition hover:bg-white/[0.05] hover:text-zinc-200 disabled:opacity-30"
            title="Home"
          >
            <Home className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setToolMenuOpen((v) => !v)}
            className="flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] font-bold tracking-wide text-cyan-300"
          >
            OmniMind
            <ChevronDown className="h-3 w-3" />
          </button>
          {toolMenuOpen ? (
            <div
              key={navMatrixVersion}
              className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border border-white/[0.08] bg-[#12141c] py-1 shadow-2xl"
            >
              {navMenuItems.map((t) => (
                <button
                  key={`${t.id}-${navMatrixVersion}`}
                  type="button"
                  onClick={() => {
                    setToolMenuOpen(false);
                    const ecoId = t.id as Parameters<typeof navigateToTool>[0];
                    if (["omniforge", "omnimusic", "omnivision", "omnichat", "omnideploy", "settings", "omnicode", "omnidocs", "omniai", "omnicloud"].includes(t.id)) {
                      navigateToTool(ecoId);
                    } else {
                      window.location.href = t.href;
                    }
                  }}
                  className="block w-full px-3 py-1.5 text-left text-[10px] text-zinc-300 hover:bg-indigo-500/10 hover:text-cyan-200"
                >
                  {t.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <nav className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex">
          {breadcrumbs.map((crumb, i) => (
            <span key={`${crumb}-${i}`} className="flex shrink-0 items-center gap-1">
              {i > 0 ? <ChevronRight className="h-3 w-3 text-zinc-600" /> : null}
              <span className={`text-[9px] ${i === breadcrumbs.length - 1 ? "text-zinc-200" : "text-zinc-500"}`}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>

        <button
          type="button"
          disabled={routeDispatching}
          onClick={handleBack}
          className="ml-auto hidden items-center gap-1 rounded-md border border-white/[0.06] px-2 py-0.5 text-[8px] text-zinc-400 hover:text-cyan-300 lg:flex"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to Neural Chatbot
        </button>

        <div className="relative lg:ml-0">
          <button
            type="button"
            onClick={() => setWorkspaceMenuOpen((v) => !v)}
            className="rounded-md border border-white/[0.06] px-2 py-0.5 text-[9px] text-zinc-400 hover:text-cyan-300"
          >
            Workspace: {profileLabel}
          </button>
          {workspaceMenuOpen ? (
            <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-lg border border-white/[0.08] bg-[#12141c] py-1 shadow-2xl">
              {WORKSPACE_PROFILES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setWorkspaceProfile(p.id);
                    setWorkspaceMenuOpen(false);
                  }}
                  className={`block w-full px-3 py-1.5 text-left text-[10px] ${
                    workspaceProfile === p.id ? "text-cyan-300" : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex h-7 items-center gap-1 overflow-x-auto border-t border-white/[0.04] px-2">
        {projectTabs.map((tab) => {
          const active = tab.id === activeProjectTabId;
          return (
            <div
              key={tab.id}
              className={`group flex shrink-0 items-center gap-1 rounded-t-md border-b-2 px-2 py-0.5 ${
                active ? "border-cyan-400 bg-white/[0.04] text-cyan-200" : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <button type="button" onClick={() => setActiveProjectTabId(tab.id)} className="text-[9px] font-medium">
                {tab.name}
              </button>
              {projectTabs.length > 1 ? (
                <button
                  type="button"
                  onClick={() => closeProjectTab(tab.id)}
                  className="opacity-0 transition group-hover:opacity-100"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              ) : null}
            </div>
          );
        })}
        <button
          type="button"
          onClick={() => addProjectTab("New Project")}
          className="flex shrink-0 items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] text-zinc-500 hover:bg-white/[0.04] hover:text-cyan-300"
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
    </header>
  );
}
