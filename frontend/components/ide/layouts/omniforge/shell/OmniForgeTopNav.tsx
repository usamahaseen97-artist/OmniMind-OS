"use client";

import { useMemo } from "react";
import {
  Bell,
  GitBranch,
  Play,
  Rocket,
  Settings,
  User,
  Wrench,
  Hammer,
} from "lucide-react";
import type { SovereignToolDef } from "../../../../../lib/sovereign-tool-registry";
import { useOmniForgeWorkspaceOptional } from "../../../../../lib/omniforge-workspace";
import { useOmniForgeLayout } from "../../../../../lib/omniforge-layout-context";
import type { WorkspaceTab } from "../../../../../lib/omniforge-layout-context";
import { useIDE } from "../../../IDEProvider";
import { OMNIFORGE_API_BASE } from "../../../../../lib/omniforge-api";
import { useOmniForgeShellOptional } from "../../../../../lib/omniforge-shell-context";
import { OF, glassStyle } from "../omniforge-theme";

const BUILD_PROMPT = "Scaffold a complete production app for this workspace with all required files.";
const DEPLOY_PROMPT = "Prepare this project for deployment with build scripts and production configuration.";
import { ThemeHub } from "../../../../theme/ThemeHub";

type Props = {
  tool: SovereignToolDef;
  onRun: () => void;
};

export function OmniForgeTopNav({ tool, onRun }: Props) {
  const omniforge = useOmniForgeWorkspaceOptional();
  const shell = useOmniForgeShellOptional();
  const { tabs, activeTab, setActiveTab } = useOmniForgeLayout();
  const { appendTerminal, mergeGenerated } = useIDE();

  const projectName = useMemo(() => {
    if (omniforge?.projectId) return `project-${omniforge.projectId.slice(0, 8)}`;
    return tool.name;
  }, [omniforge?.projectId, tool.name]);

  const live = omniforge?.status === "ready";
  const fileTabs = tabs.filter((t): t is Extract<WorkspaceTab, { kind: "file" }> => t.kind === "file");

  const scaffold = async (prompt: string, label: string) => {
    if (!omniforge || omniforge.status !== "ready") {
      appendTerminal(`✗ API offline — ${OMNIFORGE_API_BASE}`);
      return;
    }
    appendTerminal(`▸ ${label}`);
    try {
      const files = await omniforge.runScaffold(prompt, {
        mode: "vibe",
        targetStack: shell?.targetStack,
      });
      if (files.length) {
        mergeGenerated(files);
        appendTerminal(`✓ ${files.length} file(s) written`);
      }
    } catch (err) {
      appendTerminal(`✗ ${err instanceof Error ? err.message : "Failed"}`);
    }
  };

  const actionBtn =
    "flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-semibold transition hover:brightness-110";

  return (
    <header
      className="flex shrink-0 flex-col border-b"
      style={{ ...glassStyle, borderColor: OF.glassBorder, background: "rgba(14,16,22,0.92)" }}
    >
      <div className="flex h-10 items-center gap-3 px-3">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #22d3ee 100%)", boxShadow: OF.shadow }}
          >
            <Hammer className="h-3.5 w-3.5 text-white" />
          </div>
          <div>
            <p className="text-[11px] font-bold leading-none" style={{ color: OF.text }}>
              {projectName}
            </p>
            <p className="text-[8px]" style={{ color: live ? OF.success : OF.textMuted }}>
              {live ? "● Connected" : "○ Offline"}
            </p>
          </div>
        </div>

        <div className="mx-2 hidden h-5 w-px md:block" style={{ background: OF.border }} />

        <div className="hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex">
          {fileTabs.length ? (
            fileTabs.map((tab) => {
              const active = activeTab.kind === "file" && activeTab.path === tab.path;
              return (
                <button
                  key={tab.path}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className="shrink-0 rounded-md px-2 py-1 font-mono text-[10px] transition"
                  style={{
                    background: active ? OF.rowActive : "transparent",
                    color: active ? OF.cyan : OF.textMuted,
                    border: `1px solid ${active ? OF.glassBorder : "transparent"}`,
                  }}
                >
                  {tab.label}
                </button>
              );
            })
          ) : (
            <span className="text-[10px]" style={{ color: OF.textMuted }}>
              No open tabs
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button type="button" onClick={onRun} className={actionBtn} style={{ borderColor: OF.success, color: OF.success }}>
            <Play className="h-3 w-3" />
            Run
          </button>
          <button
            type="button"
            onClick={() => void scaffold(BUILD_PROMPT, "Build")}
            className={actionBtn}
            style={{ borderColor: "transparent", background: OF.indigoSolid, color: "#fff" }}
          >
            <Wrench className="h-3 w-3" />
            Build
          </button>
          <button
            type="button"
            onClick={() => void scaffold(DEPLOY_PROMPT, "Deploy")}
            className={actionBtn}
            style={{ borderColor: OF.purpleBorder, color: OF.purple }}
          >
            <Rocket className="h-3 w-3" />
            Deploy
          </button>

          <button
            type="button"
            className="hidden items-center gap-1 rounded-lg border px-2 py-1 text-[9px] sm:flex"
            style={{ borderColor: OF.border, color: OF.textMuted }}
            onClick={() => appendTerminal("$ git branch")}
          >
            <GitBranch className="h-3 w-3" />
            main
          </button>

          <button type="button" className="rounded-lg p-1.5 transition hover:bg-white/[0.05]" style={{ color: OF.textMuted }} aria-label="Notifications">
            <Bell className="h-3.5 w-3.5" />
          </button>
          <button type="button" className="rounded-lg p-1.5 transition hover:bg-white/[0.05]" style={{ color: OF.textMuted }} aria-label="Profile">
            <User className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("omnimind:omniforge-toggle-settings"))}
            className="rounded-lg p-1.5 transition hover:bg-white/[0.05]"
            style={{ color: OF.textMuted }}
            aria-label="Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
          <ThemeHub />
        </div>
      </div>
    </header>
  );
}
