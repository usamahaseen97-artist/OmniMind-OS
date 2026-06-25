"use client";

import { useState } from "react";
import {
  Bookmark,
  ChevronDown,
  History,
  ImagePlus,
  Plus,
  Sparkles,
  Wand2,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import {
  ASPECT_RATIOS,
  LENS_OPTIONS,
  LIGHTING_OPTIONS,
  MOOD_OPTIONS,
  QUALITY_PRESETS,
  STYLE_OPTIONS,
} from "../../../lib/visionary/ai/constants";
import { AI_WORKFLOWS, useVisionaryAI } from "../../../lib/visionary/ai-context";
import type { AIWorkflowKind } from "../../../lib/visionary/ai/types";

/** Professional prompt editor with templates, variables, and generation controls. */
export function PromptProcessor() {
  const {
    activeWorkflow,
    setActiveWorkflow,
    promptDraft,
    setPromptDraft,
    promptHistory,
    savedPrompts,
    savePrompt,
    loadPrompt,
    applyTemplate,
    optimizePrompt,
    optimizationScore,
    optimizationSuggestions,
    submitGeneration,
    engine,
  } = useVisionaryAI();

  const [showAdvanced, setShowAdvanced] = useState(true);
  const [saveLabel, setSaveLabel] = useState("");
  const templates = engine.templates.listBuiltIn();
  const { resolved, warnings } = engine.promptProcessor.process(promptDraft);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-white/[0.06] px-3 py-2">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-cyan-400/80">Prompt Editor</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 space-y-3">
        <label className="block">
          <span className="text-[9px] uppercase tracking-wider text-slate-500">Workflow</span>
          <select
            value={activeWorkflow}
            onChange={(e) => {
              const w = e.target.value as AIWorkflowKind;
              setActiveWorkflow(w);
              setPromptDraft((p) => ({ ...p, workflow: w }));
            }}
            className="mt-1 w-full rounded border border-white/[0.08] bg-black/40 px-2 py-1.5 text-[11px] text-slate-200"
          >
            {AI_WORKFLOWS.map((w) => (
              <option key={w.id} value={w.id}>
                {w.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-[9px] uppercase tracking-wider text-slate-500">Positive Prompt</span>
          <textarea
            value={promptDraft.positive}
            onChange={(e) => setPromptDraft((p) => ({ ...p, positive: e.target.value }))}
            rows={4}
            placeholder="Describe your creative vision…"
            className="mt-1 w-full resize-none rounded border border-white/[0.08] bg-black/40 px-2 py-2 text-[11px] text-slate-200 outline-none focus:border-cyan-500/40"
          />
        </label>

        <label className="block">
          <span className="text-[9px] uppercase tracking-wider text-slate-500">Negative Prompt</span>
          <textarea
            value={promptDraft.negative}
            onChange={(e) => setPromptDraft((p) => ({ ...p, negative: e.target.value }))}
            rows={2}
            className="mt-1 w-full resize-none rounded border border-white/[0.08] bg-black/40 px-2 py-2 text-[10px] text-slate-400"
          />
        </label>

        <div>
          <p className="text-[9px] uppercase tracking-wider text-slate-500">Templates</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t.id)}
                className="rounded border border-white/[0.08] px-2 py-0.5 text-[9px] text-slate-400 hover:border-cyan-500/30 hover:text-cyan-200"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[9px] uppercase tracking-wider text-slate-500">Variables</p>
          <div className="mt-1 space-y-1">
            {promptDraft.variables.map((v, i) => (
              <div key={v.key} className="flex gap-1">
                <span className="w-16 shrink-0 truncate pt-1.5 text-[9px] text-slate-600">{v.label}</span>
                <input
                  value={v.value}
                  onChange={(e) => {
                    const variables = [...promptDraft.variables];
                    variables[i] = { ...v, value: e.target.value };
                    setPromptDraft((p) => ({ ...p, variables }));
                  }}
                  className="min-w-0 flex-1 rounded border border-white/[0.06] bg-black/30 px-2 py-1 text-[10px] text-slate-300"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex w-full items-center gap-1 text-[9px] text-slate-500 hover:text-slate-300"
        >
          <ChevronDown size={12} className={cn("transition-transform", showAdvanced && "rotate-180")} />
          Camera &amp; Quality
        </button>

        {showAdvanced ? (
          <div className="grid grid-cols-2 gap-2">
            <SelectField label="Lens" value={promptDraft.camera.lens} options={LENS_OPTIONS}
              onChange={(lens) => setPromptDraft((p) => ({ ...p, camera: { ...p.camera, lens } }))} />
            <SelectField label="Lighting" value={promptDraft.camera.lighting} options={LIGHTING_OPTIONS}
              onChange={(lighting) => setPromptDraft((p) => ({ ...p, camera: { ...p.camera, lighting } }))} />
            <SelectField label="Mood" value={promptDraft.camera.mood} options={MOOD_OPTIONS}
              onChange={(mood) => setPromptDraft((p) => ({ ...p, camera: { ...p.camera, mood } }))} />
            <SelectField label="Style" value={promptDraft.variables[1]?.value ?? ""} options={STYLE_OPTIONS}
              onChange={(style) => {
                const variables = [...promptDraft.variables];
                if (variables[1]) variables[1] = { ...variables[1], value: style };
                setPromptDraft((p) => ({ ...p, variables }));
              }} />
            <SelectField label="Aspect" value={promptDraft.aspectRatio} options={ASPECT_RATIOS}
              onChange={(aspectRatio) => setPromptDraft((p) => ({ ...p, aspectRatio: aspectRatio as typeof p.aspectRatio }))} />
            <SelectField label="Quality" value={promptDraft.quality} options={QUALITY_PRESETS}
              onChange={(quality) => setPromptDraft((p) => ({ ...p, quality: quality as typeof p.quality }))} />
            <SliderField label="Creativity" value={promptDraft.creativity} min={0} max={1} step={0.05}
              onChange={(creativity) => setPromptDraft((p) => ({ ...p, creativity }))} />
            <SliderField label="CFG" value={promptDraft.cfg} min={1} max={20} step={0.5}
              onChange={(cfg) => setPromptDraft((p) => ({ ...p, cfg }))} />
            <SliderField label="Steps" value={promptDraft.steps} min={10} max={80} step={1}
              onChange={(steps) => setPromptDraft((p) => ({ ...p, steps }))} />
            <label className="col-span-2 block">
              <span className="text-[8px] text-slate-600">Seed (empty = random)</span>
              <input
                type="number"
                value={promptDraft.seed ?? ""}
                onChange={(e) =>
                  setPromptDraft((p) => ({
                    ...p,
                    seed: e.target.value ? Number(e.target.value) : null,
                  }))
                }
                className="mt-0.5 w-full rounded border border-white/[0.06] bg-black/30 px-2 py-1 text-[10px] text-slate-300"
              />
            </label>
          </div>
        ) : null}

        <div>
          <p className="text-[9px] uppercase tracking-wider text-slate-500">Multi Prompt Weights</p>
          <button
            type="button"
            onClick={() =>
              setPromptDraft((p) => ({
                ...p,
                multiPrompts: [...p.multiPrompts, { text: "", weight: 1 }],
              }))
            }
            className="mt-1 flex items-center gap-1 text-[9px] text-cyan-400/80 hover:text-cyan-300"
          >
            <Plus size={10} /> Add weighted prompt
          </button>
          {promptDraft.multiPrompts.map((mp, i) => (
            <div key={i} className="mt-1 flex gap-1">
              <input
                value={mp.text}
                onChange={(e) => {
                  const multiPrompts = [...promptDraft.multiPrompts];
                  multiPrompts[i] = { ...mp, text: e.target.value };
                  setPromptDraft((p) => ({ ...p, multiPrompts }));
                }}
                placeholder="Prompt fragment"
                className="min-w-0 flex-1 rounded border border-white/[0.06] bg-black/30 px-2 py-1 text-[10px]"
              />
              <input
                type="number"
                value={mp.weight}
                step={0.1}
                onChange={(e) => {
                  const multiPrompts = [...promptDraft.multiPrompts];
                  multiPrompts[i] = { ...mp, weight: Number(e.target.value) };
                  setPromptDraft((p) => ({ ...p, multiPrompts }));
                }}
                className="w-14 rounded border border-white/[0.06] bg-black/30 px-1 text-[10px]"
              />
            </div>
          ))}
        </div>

        <div>
          <p className="text-[9px] uppercase tracking-wider text-slate-500">Reference Images</p>
          <button
            type="button"
            className="mt-1 flex w-full items-center justify-center gap-2 rounded border border-dashed border-white/[0.1] py-3 text-[10px] text-slate-500 hover:border-cyan-500/30 hover:text-cyan-300"
          >
            <ImagePlus size={14} />
            Attach reference ({promptDraft.referenceImageIds.length})
          </button>
        </div>

        {warnings.length > 0 ? (
          <ul className="rounded border border-amber-500/20 bg-amber-500/5 p-2 text-[9px] text-amber-200/80">
            {warnings.map((w) => (
              <li key={w}>• {w}</li>
            ))}
          </ul>
        ) : null}

        {optimizationSuggestions.length > 0 ? (
          <div className="rounded border border-cyan-500/20 bg-cyan-500/5 p-2">
            <p className="text-[9px] font-medium text-cyan-300">
              Optimizer {optimizationScore !== null ? `· ${optimizationScore}/100` : ""}
            </p>
            <ul className="mt-1 text-[9px] text-slate-400">
              {optimizationSuggestions.map((s) => (
                <li key={s}>• {s}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <details className="text-[9px] text-slate-600">
          <summary className="cursor-pointer text-slate-500">Resolved preview</summary>
          <p className="mt-1 font-mono">{resolved || "—"}</p>
        </details>

        {(promptHistory.length > 0 || savedPrompts.length > 0) && (
          <div className="border-t border-white/[0.04] pt-2">
            <p className="flex items-center gap-1 text-[9px] text-slate-500">
              <History size={10} /> Recent prompts
            </p>
            <div className="mt-1 max-h-20 overflow-y-auto space-y-0.5">
              {[...savedPrompts, ...promptHistory].slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => loadPrompt(p)}
                  className="block w-full truncate text-left text-[9px] text-slate-500 hover:text-cyan-300"
                >
                  {p.label || p.positive.slice(0, 48) || "Untitled"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="shrink-0 space-y-1 border-t border-white/[0.06] p-3">
        <div className="flex gap-1">
          <input
            value={saveLabel}
            onChange={(e) => setSaveLabel(e.target.value)}
            placeholder="Save as…"
            className="min-w-0 flex-1 rounded border border-white/[0.06] bg-black/30 px-2 py-1 text-[10px]"
          />
          <button
            type="button"
            onClick={() => {
              if (saveLabel.trim()) savePrompt(saveLabel.trim());
              setSaveLabel("");
            }}
            className="rounded border border-white/[0.08] px-2 text-slate-400 hover:text-slate-200"
            title="Save prompt"
          >
            <Bookmark size={12} />
          </button>
          <button
            type="button"
            onClick={() => void optimizePrompt()}
            className="rounded border border-white/[0.08] px-2 text-slate-400 hover:text-cyan-300"
            title="Optimize"
          >
            <Wand2 size={12} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => void submitGeneration()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-600/80 to-cyan-500/60 py-2.5 text-[11px] font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-500 hover:to-cyan-400"
        >
          <Sparkles size={14} />
          Generate
        </button>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-[8px] text-slate-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-0.5 w-full rounded border border-white/[0.06] bg-black/30 px-1 py-1 text-[9px] text-slate-300"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="col-span-2 block">
      <span className="flex justify-between text-[8px] text-slate-600">
        <span>{label}</span>
        <span>{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-0.5 w-full accent-cyan-400"
      />
    </label>
  );
}
