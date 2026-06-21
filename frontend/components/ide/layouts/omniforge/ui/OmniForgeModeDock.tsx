"use client";

import { Github, KeyRound, TerminalSquare, WandSparkles } from "lucide-react";
import type { OmniForgeForgeControls } from "../../../workspace/DevOmniChatConsole";
import { OMNIFORGE_TARGET_STACKS } from "../../../../../lib/omniforge-project-profile";
import { useOmniForgeShell } from "../../../../../lib/omniforge-shell-context";
import { OF } from "../omniforge-theme";

type Props = OmniForgeForgeControls & {
  modeHint: string;
  onModeChange: (m: OmniForgeForgeControls["mode"]) => void;
  onModelLayerChange: (v: string) => void;
  onGithubRepoChange: (v: string) => void;
  onProviderKeyChange: (v: string) => void;
};

/** Coding · Terminal · Vibe mode + stack + auth configuration. */
export function OmniForgeModeDock(props: Props) {
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
  } = props;
  const { targetStack, setTargetStack } = useOmniForgeShell();

  const modeBtn = (id: OmniForgeForgeControls["mode"], label: string, icon?: React.ReactNode) => {
    const active = mode === id;
    return (
      <button
        type="button"
        onClick={() => onModeChange(id)}
        className="flex flex-1 items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wide transition"
        style={{
          borderColor: active ? OF.indigoSolid : OF.border,
          background: active ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.02)",
          color: active ? OF.cyan : OF.textMuted,
        }}
      >
        {icon}
        {label}
      </button>
    );
  };

  return (
    <div className="shrink-0 space-y-2 border-b p-2" style={{ borderColor: OF.glassBorder, background: "rgba(0,0,0,0.2)" }}>
      <div className="flex gap-1">
        {modeBtn("coding", "Coding")}
        {modeBtn("terminal", "Terminal", <TerminalSquare className="h-3 w-3" />)}
        {modeBtn("vibe", "Vibe", <WandSparkles className="h-3 w-3" />)}
      </div>
      <p className="text-[8px]" style={{ color: OF.textMuted }}>
        {modeHint}
      </p>
      <select
        value={targetStack}
        onChange={(e) => setTargetStack(e.target.value as typeof targetStack)}
        className="w-full rounded-lg border px-2 py-1 text-[9px] outline-none"
        style={{ background: OF.inputBg, borderColor: OF.border, color: OF.text }}
      >
        {OMNIFORGE_TARGET_STACKS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label} — {s.description}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-1">
        <KeyRound className="h-3 w-3 shrink-0" style={{ color: OF.textMuted }} />
        <input
          value={providerKey}
          onChange={(e) => onProviderKeyChange(e.target.value)}
          placeholder="Cloud API key / open-source layer"
          className="w-full rounded-lg border px-2 py-1 text-[9px] outline-none"
          style={{ background: OF.inputBg, borderColor: OF.border, color: OF.text }}
        />
      </div>
      <input
        value={modelLayer}
        onChange={(e) => onModelLayerChange(e.target.value)}
        placeholder="Local LLM URL or model layer"
        className="w-full rounded-lg border px-2 py-1 text-[9px] outline-none"
        style={{ background: OF.inputBg, borderColor: OF.border, color: OF.text }}
      />
      <div className="flex items-center gap-1">
        <Github className="h-3 w-3 shrink-0" style={{ color: OF.textMuted }} />
        <input
          value={githubRepo}
          onChange={(e) => onGithubRepoChange(e.target.value)}
          placeholder="GitHub clone URL (optional)"
          className="w-full rounded-lg border px-2 py-1 text-[9px] outline-none"
          style={{ background: OF.inputBg, borderColor: OF.border, color: OF.text }}
        />
      </div>
    </div>
  );
}
