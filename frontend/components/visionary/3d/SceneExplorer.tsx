"use client";

import { Plus } from "lucide-react";
import { cn } from "../../../lib/utils";
import { useVisionaryStudio3D } from "../../../lib/visionary/studio3d-context";

export function SceneExplorer() {
  const { project, addScene } = useVisionaryStudio3D();

  return (
    <div className="border-b border-white/[0.06] p-2">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[9px] font-semibold uppercase text-slate-500">Scenes</p>
        <button type="button" onClick={() => addScene("New Scene")} className="text-cyan-400"><Plus size={12} /></button>
      </div>
      <ul>
        {project.scenes.map((s) => (
          <li key={s.id} className={cn("rounded px-2 py-1 text-[10px]", s.id === project.activeSceneId ? "bg-cyan-500/10 text-cyan-200" : "text-slate-500")}>
            {s.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
