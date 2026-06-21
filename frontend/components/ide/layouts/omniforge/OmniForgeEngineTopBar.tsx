"use client";

import { Cpu, Play, Rocket, Settings } from "lucide-react";
import { useIDE } from "../../IDEProvider";
import { OMNIFORGE_API_BASE } from "../../../../lib/omniforge-api";
import { useOmniForgeWorkspaceOptional } from "../../../../lib/omniforge-workspace";
import { OF } from "./omniforge-theme";

const BUILD_PROMPT =
  "Scaffold a complete production app for this workspace with all required files.";

const DEPLOY_PROMPT =
  "Prepare this project for deployment with build scripts and production configuration.";

export function OmniForgeEngineTopBar() {
  const omniforge = useOmniForgeWorkspaceOptional();
  const { appendTerminal, mergeGenerated } = useIDE();
  const live = omniforge?.status === "ready";

  const runPreview = () => {
    window.dispatchEvent(new CustomEvent("omnimind:omniforge-preview-refresh"));
    appendTerminal("▸ Run · live preview refresh");
  };

  const scaffold = async (prompt: string, label: string) => {
    if (!omniforge || omniforge.status !== "ready") {
      appendTerminal(`✗ Gateway offline — start backend-fastapi (${OMNIFORGE_API_BASE})`);
      return;
    }
    appendTerminal(`▸ ${label}…`);
    try {
      const files = await omniforge.runScaffold(prompt, { mode: "vibe" });
      if (files.length) {
        mergeGenerated(files);
        appendTerminal(`✓ ${label} wrote ${files.length} file(s)`);
      } else {
        appendTerminal(`⚠ ${label} — no files returned (check :8001)`);
      }
    } catch (err) {
      appendTerminal(`✗ ${err instanceof Error ? err.message : "Failed"}`);
    }
  };

  return (
    <div
      className="flex shrink-0 items-center justify-between border-b px-3 py-1.5 text-xs"
      style={{ background: OF.panelAlt, borderColor: OF.border, color: OF.text }}
    >
      <div className="flex items-center gap-2">
        <span className="font-bold tracking-wide" style={{ color: OF.cyan }}>
          Development Tool
        </span>
        <span className="font-mono text-[9px]" style={{ color: live ? OF.terminalGreen : OF.textMuted }}>
          {live ? "● Live" : "○ Offline"}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={runPreview}
          className="flex items-center gap-1 rounded border px-2.5 py-1 font-semibold transition hover:bg-white/[0.04]"
          style={{ borderColor: OF.success, color: OF.success }}
        >
          <Play size={12} />
          Run
        </button>
        <button
          type="button"
          onClick={() => void scaffold(BUILD_PROMPT, "Build App")}
          className="flex items-center gap-1 rounded px-2.5 py-1 font-semibold text-white"
          style={{ background: OF.indigo }}
        >
          <Cpu size={12} />
          Build
        </button>
        <button
          type="button"
          onClick={() => void scaffold(DEPLOY_PROMPT, "Deploy")}
          className="flex items-center gap-1 rounded border px-2.5 py-1 font-semibold transition hover:bg-white/[0.04]"
          style={{ borderColor: OF.purpleBorder, color: OF.purple }}
        >
          <Rocket size={12} />
          Deploy
        </button>
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("omnimind:omniforge-toggle-settings"))}
          className="rounded p-1 transition hover:bg-white/[0.04]"
          style={{ color: OF.textMuted }}
          aria-label="Settings"
        >
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
}
