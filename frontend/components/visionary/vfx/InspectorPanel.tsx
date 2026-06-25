"use client";

import { useState } from "react";
import { VFX_AI_ACTIONS, VFX_EXPORT_FORMATS } from "../../../lib/visionary/vfx/constants";
import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";
import type { VFXExportFormat } from "../../../lib/visionary/vfx/types";
import { EffectStack } from "./EffectStack";
import { MaterialEditor } from "./MaterialEditor";
import { ShaderGraph } from "./ShaderGraph";
import { LightingSystem } from "./LightingSystem";
import { PhysicsSimulation } from "./PhysicsSimulation";
import { MaskEditor } from "./MaskEditor";
import { RotoBrush } from "./RotoBrush";

export function InspectorPanel() {
  const { selectedNodeId, nodes, selectedObjectId, sceneObjects, runAIAction } = useVisionaryVFX();
  const selectedNode = nodes.find((n) => n.id === selectedNodeId);
  const selectedObject = sceneObjects.find((o) => o.id === selectedObjectId);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto border-l border-white/[0.06] bg-[#0a0e16]">
      <p className="shrink-0 border-b border-white/[0.06] px-2 py-1.5 text-[9px] font-semibold uppercase text-slate-500">
        Inspector
      </p>

      {selectedNode ? (
        <div className="border-b border-white/[0.04] p-2">
          <p className="text-[10px] font-medium text-fuchsia-200">{selectedNode.label}</p>
          <p className="text-[8px] text-slate-600">{selectedNode.type}</p>
        </div>
      ) : null}

      {selectedObject ? (
        <div className="border-b border-white/[0.04] p-2">
          <p className="text-[10px] text-slate-300">{selectedObject.name}</p>
          <p className="text-[8px] text-slate-600">{selectedObject.type}</p>
        </div>
      ) : null}

      <EffectStack />
      <MaskEditor />
      <RotoBrush />
      <LightingSystem />
      <MaterialEditor />
      <ShaderGraph />
      <PhysicsSimulation />

      <div className="border-t border-white/[0.04] p-2">
        <p className="mb-2 text-[9px] uppercase text-slate-600">AI Tools</p>
        <div className="flex flex-wrap gap-1">
          {VFX_AI_ACTIONS.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => runAIAction(tool.id)}
              className="rounded bg-violet-500/10 px-1.5 py-0.5 text-[7px] text-violet-300 hover:bg-violet-500/20"
            >
              {tool.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function VFXExportPanel({ compact = false }: { compact?: boolean }) {
  const { queueVFXExport } = useVisionaryVFX();
  const [format, setFormat] = useState<VFXExportFormat>("png-sequence");
  const [alphaChannel, setAlphaChannel] = useState(true);

  const selectedFormat = VFX_EXPORT_FORMATS.find((f) => f.id === format);

  return (
    <div className={`shrink-0 border-t border-white/[0.06] bg-[#080a0e] ${compact ? "px-2 py-1" : "p-3"}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[8px] uppercase text-slate-600">Export</span>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as VFXExportFormat)}
          className="rounded border border-white/10 bg-black/40 text-[9px] text-slate-400"
        >
          {VFX_EXPORT_FORMATS.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>
        <label className="flex items-center gap-1 text-[8px] text-slate-500">
          <input
            type="checkbox"
            checked={alphaChannel && (selectedFormat?.alpha ?? false)}
            disabled={!selectedFormat?.alpha}
            onChange={(e) => setAlphaChannel(e.target.checked)}
          />
          Alpha
        </label>
        <button
          type="button"
          onClick={() => queueVFXExport(format)}
          className="ml-auto rounded bg-fuchsia-600/80 px-2 py-0.5 text-[9px] text-white hover:bg-fuchsia-500"
        >
          Queue Render
        </button>
      </div>
    </div>
  );
}
