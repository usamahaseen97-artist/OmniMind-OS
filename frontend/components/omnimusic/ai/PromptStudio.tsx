"use client";

import { WORKFLOW_LABELS } from "../../../lib/omnimusic-studio/ai/constants";
import type { GenerationWorkflowKind } from "../../../lib/omnimusic-studio/ai-types";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";
import { GenreLibrary } from "./GenreLibrary";
import { MoodLibrary } from "./MoodLibrary";
import { StyleLibrary } from "./StyleLibrary";

export function PromptStudio() {
  const { prompt, updatePrompt, promptErrors, submitGeneration, resetPrompt } = useOmniMusicStudio();

  return (
    <div className="space-y-2">
      <p className="text-[9px] uppercase text-slate-600">Prompt Studio</p>
      <label className="block text-[8px] text-slate-500">
        Workflow
        <select
          className="mt-0.5 w-full rounded bg-black/40 px-1 py-1 text-[8px]"
          value={prompt.workflow}
          onChange={(e) => updatePrompt({ workflow: e.target.value as GenerationWorkflowKind })}
        >
          {Object.entries(WORKFLOW_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </label>
      <textarea
        className="h-16 w-full rounded bg-black/40 p-2 text-[9px] text-slate-300"
        placeholder="Describe your music…"
        value={prompt.prompt}
        onChange={(e) => updatePrompt({ prompt: e.target.value })}
      />
      <textarea
        className="h-10 w-full rounded bg-black/40 p-2 text-[8px] text-slate-500"
        placeholder="Negative prompt"
        value={prompt.negativePrompt}
        onChange={(e) => updatePrompt({ negativePrompt: e.target.value })}
      />
      <GenreLibrary />
      <MoodLibrary />
      <StyleLibrary />
      <div className="grid grid-cols-2 gap-2 text-[8px]">
        <label className="text-slate-500">
          BPM
          <input type="number" className="w-full rounded bg-black/40 px-1" value={prompt.bpm} onChange={(e) => updatePrompt({ bpm: Number(e.target.value), tempo: Number(e.target.value) })} />
        </label>
        <label className="text-slate-500">
          Key
          <input className="w-full rounded bg-black/40 px-1" value={prompt.key} onChange={(e) => updatePrompt({ key: e.target.value })} />
        </label>
        <label className="text-slate-500">
          Scale
          <input className="w-full rounded bg-black/40 px-1" value={prompt.scale} onChange={(e) => updatePrompt({ scale: e.target.value })} />
        </label>
        <label className="text-slate-500">
          Duration (s)
          <input type="number" className="w-full rounded bg-black/40 px-1" value={prompt.durationSec} onChange={(e) => updatePrompt({ durationSec: Number(e.target.value) })} />
        </label>
        <label className="text-slate-500">
          Language
          <input className="w-full rounded bg-black/40 px-1" value={prompt.language} onChange={(e) => updatePrompt({ language: e.target.value })} />
        </label>
        <label className="text-slate-500">
          Emotion
          <input className="w-full rounded bg-black/40 px-1" value={prompt.emotion} onChange={(e) => updatePrompt({ emotion: e.target.value })} />
        </label>
      </div>
      <label className="block text-[8px] text-slate-500">
        Song structure
        <input className="mt-0.5 w-full rounded bg-black/40 px-1 py-0.5" value={prompt.songStructure} onChange={(e) => updatePrompt({ songStructure: e.target.value })} />
      </label>
      <label className="block text-[8px] text-slate-500">
        Energy {prompt.energy}
        <input type="range" min={0} max={100} value={prompt.energy} onChange={(e) => updatePrompt({ energy: Number(e.target.value) })} className="w-full" />
      </label>
      <label className="block text-[8px] text-slate-500">
        Creativity {prompt.creativity}
        <input type="range" min={0} max={100} value={prompt.creativity} onChange={(e) => updatePrompt({ creativity: Number(e.target.value) })} className="w-full" />
      </label>
      <label className="block text-[8px] text-slate-500">
        Seed
        <input type="number" className="w-full rounded bg-black/40 px-1" value={prompt.seed ?? ""} onChange={(e) => updatePrompt({ seed: e.target.value ? Number(e.target.value) : null })} />
      </label>
      <label className="block text-[8px] text-slate-500">
        Reference track (placeholder)
        <input className="w-full rounded bg-black/40 px-1" placeholder="Track ID" value={prompt.referenceTrackId ?? ""} onChange={(e) => updatePrompt({ referenceTrackId: e.target.value || null })} />
      </label>
      {promptErrors.length > 0 ? (
        <ul className="text-[8px] text-rose-400">{promptErrors.map((e) => <li key={e}>{e}</li>)}</ul>
      ) : null}
      <div className="flex gap-2">
        <button type="button" onClick={() => submitGeneration("high")} className="flex-1 rounded bg-violet-500/20 py-1 text-[9px] text-violet-200">Generate</button>
        <button type="button" onClick={resetPrompt} className="rounded border border-white/[0.06] px-2 text-[8px] text-slate-500">Reset</button>
      </div>
    </div>
  );
}
