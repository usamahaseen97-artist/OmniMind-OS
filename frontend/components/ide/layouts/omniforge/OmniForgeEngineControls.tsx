"use client";

import { Github, KeyRound, TerminalSquare, WandSparkles } from "lucide-react";
import type { OmniForgeForgeControls } from "../../workspace/DevOmniChatConsole";
import { useOmniForgeShellOptional } from "../../../../lib/omniforge-shell-context";
import { OmniForgeSessionBar } from "../../workspace/OmniForgeSessionBar";
import { OF, purpleFocusRing } from "./omniforge-theme";

type Props = OmniForgeForgeControls & {
  modeHint: string;
  onModeChange: (m: OmniForgeForgeControls["mode"]) => void;
  onModelLayerChange: (v: string) => void;
  onGithubRepoChange: (v: string) => void;
  onProviderKeyChange: (v: string) => void;
  compact?: boolean;
};

export function OmniForgeEngineControls(props: Props) {
  const {
    mode,
    modelLayer,
    githubRepo,
    providerKey,
    modeHint,
    onModeChange,
    onModelLayerChange,
    onGithubRepoChange,
    onProviderKeyChange,
    compact = false,
  } = props;
  const shell = useOmniForgeShellOptional();

  const modeBtn = (active: boolean) =>
    `rounded-md border px-2.5 py-1 text-[9px] font-mono font-semibold uppercase tracking-wide transition ${
      active ? "text-white" : "text-[#9CA3AF] hover:bg-white/[0.03]"
    }`;

  return (
    <div className={`shrink-0 ${compact ? "px-2 py-2" : "border-t px-3 py-2.5"}`} style={{ borderColor: OF.border, background: OF.bgDeep }}>
      {!compact ? (
        <p className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: OF.textLabel }}>
          OMNIFORGE ENGINE CONTROLE
        </p>
      ) : null}
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button type="button" className={modeBtn(mode === "coding")} style={purpleFocusRing(mode === "coding")} onClick={() => onModeChange("coding")}>
          Coding Mode
        </button>
        <button type="button" className={modeBtn(mode === "terminal")} style={purpleFocusRing(mode === "terminal")} onClick={() => onModeChange("terminal")}>
          <TerminalSquare className="mr-1 inline h-3 w-3" />
          Terminal
        </button>
        <button type="button" className={modeBtn(mode === "vibe")} style={purpleFocusRing(mode === "vibe")} onClick={() => onModeChange("vibe")}>
          <WandSparkles className="mr-1 inline h-3 w-3" />
          Vibe Coding
        </button>
      </div>
      <p className="mt-1.5 text-[8px]" style={{ color: OF.textMuted }}>
        {modeHint}
      </p>
      {shell ? (
        <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-md border px-2 py-1.5 text-[9px]" style={{ borderColor: OF.border, color: OF.cyan }}>
          <input
            type="checkbox"
            checked={shell.useFreeOpenSourcePipeline}
            onChange={(e) => shell.setUseFreeOpenSourcePipeline(e.target.checked)}
            className="accent-cyan-400"
          />
          Use Free/Open-Source Pipeline
        </label>
      ) : null}
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <KeyRound className="h-3.5 w-3.5 shrink-0" style={{ color: OF.textMuted }} />
          <input
            value={providerKey}
            onChange={(e) => onProviderKeyChange(e.target.value)}
            placeholder="OmniMind API Keys"
            className="w-full rounded-md border px-2 py-1.5 text-[10px] outline-none"
            style={{ ...purpleFocusRing(Boolean(providerKey)), background: OF.inputBg, color: OF.text, borderWidth: 1 }}
          />
        </div>
        <input
          value={modelLayer}
          onChange={(e) => onModelLayerChange(e.target.value)}
          placeholder="Local LLM URL"
          className="w-full rounded-md border px-2 py-1.5 text-[10px] outline-none"
          style={{ background: OF.inputBg, color: OF.text, borderColor: OF.border }}
        />
        <div className="flex items-center gap-1.5">
          <Github className="h-3.5 w-3.5 shrink-0" style={{ color: OF.textMuted }} />
          <input
            value={githubRepo}
            onChange={(e) => onGithubRepoChange(e.target.value)}
            placeholder="Repository clone URL"
            className="w-full rounded-md border px-2 py-1.5 text-[10px] outline-none"
            style={{ ...purpleFocusRing(Boolean(githubRepo)), background: OF.inputBg, color: OF.text, borderWidth: 1 }}
          />
        </div>
      </div>
      {!compact ? <OmniForgeSessionBar /> : null}
    </div>
  );
}
