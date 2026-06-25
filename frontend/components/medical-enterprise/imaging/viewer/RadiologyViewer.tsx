"use client";

import { useCallback, useRef, useState } from "react";
import type { ViewerState, ImagingStudy, ViewerTool } from "@/core/medical-enterprise/imaging/types";
import { getViewerEngine, WINDOW_LEVEL_PRESETS } from "@/core/medical-enterprise/imaging/viewer/ViewerEngine";
import { cn } from "@/lib/utils";

export function ViewerCanvas({
  studyId,
  state,
  label = "2D Viewer",
}: {
  studyId: string;
  state: ViewerState;
  label?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = state.transform;

  return (
    <div className="relative flex h-full min-h-[200px] flex-col overflow-hidden rounded-lg border border-white/[0.08] bg-black">
      <div className="border-b border-white/[0.06] px-2 py-1 text-[9px] text-slate-500">{label} · {studyId}</div>
      <div className="relative flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{
            transform: `translate(${t.panX}px, ${t.panY}px) scale(${t.zoom}) rotate(${t.rotation}deg)`,
            filter: `brightness(${t.brightness}) contrast(${t.contrast})`,
          }}
          aria-label="Medical image viewer canvas"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] text-slate-600">
          W/L {t.windowCenter}/{t.windowWidth} · GPU tile stream ready
        </div>
      </div>
    </div>
  );
}

export function ViewerToolbar({
  studyId,
  state,
  onStateChange,
}: {
  studyId: string;
  state: ViewerState;
  onStateChange: (s: ViewerState) => void;
}) {
  const engine = getViewerEngine();

  const setTool = (tool: ViewerTool) => onStateChange(engine.setTool(studyId, tool));
  const zoom = (d: number) => onStateChange(engine.zoom(studyId, d));
  const rotate = () => onStateChange(engine.rotate(studyId, 90));
  const wlp = (id: string) => {
    const preset = WINDOW_LEVEL_PRESETS.find((p: (typeof WINDOW_LEVEL_PRESETS)[number]) => p.id === id);
    if (preset) onStateChange(engine.applyWindowLevel(studyId, preset));
  };

  const tools: { id: ViewerTool; label: string }[] = [
    { id: "pan", label: "Pan" },
    { id: "zoom", label: "Zoom" },
    { id: "window-level", label: "W/L" },
    { id: "distance", label: "Distance" },
    { id: "area", label: "Area" },
    { id: "angle", label: "Angle" },
    { id: "annotate", label: "Annotate" },
    { id: "roi", label: "ROI" },
    { id: "bookmark", label: "Bookmark" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-white/[0.06] bg-[#080d14] px-2 py-1">
      {tools.map((tool) => (
        <button
          key={tool.id}
          type="button"
          onClick={() => setTool(tool.id)}
          className={cn(
            "rounded px-2 py-0.5 text-[9px]",
            state.tool === tool.id ? "bg-cyan-500/20 text-cyan-200" : "text-slate-500 hover:text-slate-300",
          )}
        >
          {tool.label}
        </button>
      ))}
      <span className="mx-1 text-slate-700">|</span>
      <button type="button" onClick={() => zoom(0.25)} className="text-[9px] text-slate-500 hover:text-slate-300">+</button>
      <button type="button" onClick={() => zoom(-0.25)} className="text-[9px] text-slate-500 hover:text-slate-300">−</button>
      <button type="button" onClick={rotate} className="text-[9px] text-slate-500 hover:text-slate-300">↻</button>
      {WINDOW_LEVEL_PRESETS.map((p: (typeof WINDOW_LEVEL_PRESETS)[number]) => (
        <button key={p.id} type="button" onClick={() => wlp(p.id)} className="text-[8px] text-slate-600 hover:text-cyan-300">
          {p.label}
        </button>
      ))}
    </div>
  );
}

export function ComparisonLayout({
  primaryStudyId,
  comparisonStudyId,
  primaryState,
  comparisonState,
}: {
  primaryStudyId: string;
  comparisonStudyId: string;
  primaryState: ViewerState;
  comparisonState: ViewerState;
}) {
  return (
    <div className="grid h-full grid-cols-2 gap-2 p-2">
      <ViewerCanvas studyId={primaryStudyId} state={primaryState} label="Current study" />
      <ViewerCanvas studyId={comparisonStudyId} state={comparisonState} label="Prior study" />
    </div>
  );
}

export function RadiologyViewer({ study }: { study: ImagingStudy }) {
  const engine = getViewerEngine();
  const [state, setState] = useState(() => engine.getState(study.id));

  return (
    <div className="flex h-full flex-col">
      <ViewerToolbar studyId={study.id} state={state} onStateChange={setState} />
      {state.comparisonStudyId ? (
        <ComparisonLayout
          primaryStudyId={study.id}
          comparisonStudyId={state.comparisonStudyId}
          primaryState={state}
          comparisonState={engine.getState(state.comparisonStudyId)}
        />
      ) : (
        <ViewerCanvas studyId={study.id} state={state} />
      )}
    </div>
  );
}
