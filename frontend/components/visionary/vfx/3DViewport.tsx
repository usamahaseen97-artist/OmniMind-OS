"use client";

import { useVisionaryVFX } from "../../../lib/visionary/vfx-context";

export function ThreeDViewport() {
  const { sceneObjects, selectedObjectId } = useVisionaryVFX();
  const selected = sceneObjects.find((o) => o.id === selectedObjectId);
  const hdri = sceneObjects.find((o) => o.type === "hdri");
  const lightCount = sceneObjects.filter((o) => o.type === "light").length;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#050608]">
      <div className="flex shrink-0 items-center justify-between border-b border-white/[0.06] px-2 py-1">
        <span className="text-[9px] text-slate-500">3D Viewport</span>
        <span className="text-[8px] text-slate-600">
          HDRI: {hdri?.name ?? "None"} · {lightCount} lights
        </span>
      </div>
      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden"
        style={{
          background: "radial-gradient(ellipse at center, #1e1b4b 0%, #0a0a0f 70%)",
          perspective: "800px",
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {sceneObjects
          .filter((o) => o.type !== "hdri")
          .map((obj, i) => (
            <div
              key={obj.id}
              className={`absolute rounded border ${
                selectedObjectId === obj.id
                  ? "border-fuchsia-400 shadow-lg shadow-fuchsia-500/30"
                  : "border-white/20"
              } bg-gradient-to-br from-slate-700/80 to-slate-900/80`}
              style={{
                width: obj.type === "camera" ? 24 : 48 + i * 8,
                height: obj.type === "camera" ? 24 : 48 + i * 8,
                transform: `translate3d(${obj.position[0] * 20}px, ${obj.position[1] * -20}px, ${obj.position[2] * 10}px) rotateY(${obj.rotation[1]}deg)`,
                zIndex: i,
              }}
            >
              <span className="absolute -top-4 left-0 text-[7px] text-slate-500">{obj.name}</span>
            </div>
          ))}
        {selected ? (
          <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-1 text-[8px] text-slate-400">
            {selected.name} · pos ({selected.position[0].toFixed(1)}, {selected.position[1].toFixed(1)})
          </div>
        ) : null}
      </div>
    </div>
  );
}
