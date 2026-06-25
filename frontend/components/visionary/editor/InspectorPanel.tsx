"use client";

import { cn } from "../../../lib/utils";
import { AI_EDIT_ACTIONS } from "../../../lib/visionary/editor/constants";
import { useVisionaryEditor } from "../../../lib/visionary/editor-context";
import type { EditorInspectorTab } from "../../../lib/visionary/editor/types";
import { ClipManager } from "./TrackManager";
import { EffectsBrowser } from "./EffectsBrowser";
import { TransitionsBrowser } from "./TransitionsBrowser";
import { TextEditor } from "./TextEditor";
import { SubtitleEditor } from "./SubtitleEditor";
import { AudioMixer } from "./AudioMixer";
import { ColorWorkspace } from "./ColorWorkspace";
import { KeyframeEditor } from "./KeyframeEditor";

const TABS: { id: EditorInspectorTab; label: string }[] = [
  { id: "clip", label: "Clip" },
  { id: "effects", label: "FX" },
  { id: "transitions", label: "Trans" },
  { id: "text", label: "Text" },
  { id: "subtitles", label: "Subs" },
  { id: "audio", label: "Audio" },
  { id: "color", label: "Color" },
  { id: "keyframes", label: "Keys" },
  { id: "ai", label: "AI" },
];

export function InspectorPanel() {
  const { inspectorTab, setInspectorTab } = useVisionaryEditor();

  return (
    <aside className="flex h-full min-h-0 flex-col border-l border-white/[0.06] bg-[#080c14]">
      <div className="shrink-0 border-b border-white/[0.06] px-2 py-2">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Inspector</p>
      </div>
      <div className="flex shrink-0 flex-wrap gap-0.5 border-b border-white/[0.04] p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setInspectorTab(t.id)}
            className={cn(
              "rounded px-1.5 py-0.5 text-[8px]",
              inspectorTab === t.id ? "bg-white/10 text-slate-200" : "text-slate-500",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {inspectorTab === "clip" ? <ClipManager /> : null}
        {inspectorTab === "effects" ? <EffectsBrowser /> : null}
        {inspectorTab === "transitions" ? <TransitionsBrowser /> : null}
        {inspectorTab === "text" ? <TextEditor /> : null}
        {inspectorTab === "subtitles" ? <SubtitleEditor /> : null}
        {inspectorTab === "audio" ? <AudioMixer /> : null}
        {inspectorTab === "color" ? <ColorWorkspace /> : null}
        {inspectorTab === "keyframes" ? <KeyframeEditor /> : null}
        {inspectorTab === "ai" ? <AIAssistantPanel /> : null}
      </div>
    </aside>
  );
}

function AIAssistantPanel() {
  const { aiTasks, runAIAction } = useVisionaryEditor();

  return (
    <div className="space-y-2 p-2">
      <p className="text-[9px] font-semibold uppercase text-slate-500">AI Timeline Assistant</p>
      {AI_EDIT_ACTIONS.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => runAIAction(a.id)}
          className="w-full rounded border border-white/[0.06] bg-white/[0.02] px-2 py-2 text-left hover:border-cyan-500/25"
        >
          <p className="text-[10px] text-slate-200">{a.label}</p>
          <p className="text-[8px] text-slate-600">{a.description}</p>
        </button>
      ))}
      {aiTasks.length > 0 ? (
        <ul className="mt-2 space-y-1 border-t border-white/[0.04] pt-2">
          {aiTasks.slice(0, 5).map((t) => (
            <li key={t.id} className="text-[9px] text-slate-500">
              {t.action} · {t.status} {t.progress}%
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
