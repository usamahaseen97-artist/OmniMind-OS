"use client";

import { AVATAR_FEATURES } from "../../../lib/visionary/studio3d/constants";
import { useVisionaryStudio3D } from "../../../lib/visionary/studio3d-context";

export function AvatarCreator() {
  const { activeAvatarFeature, setActiveAvatarFeature } = useVisionaryStudio3D();

  return (
    <div className="flex h-full">
      <div className="w-40 shrink-0 border-r border-white/[0.06] p-2">
        {AVATAR_FEATURES.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveAvatarFeature(f.id)}
            className={`mb-1 block w-full rounded px-2 py-1 text-left text-[9px] ${
              activeAvatarFeature === f.id ? "bg-cyan-500/10 text-cyan-200" : "text-slate-500"
            }`}
          >
            {f.label}
          </button>
        ))}
        <p className="mt-4 text-[7px] text-slate-600">Lip Sync · Facial Animation — placeholders</p>
      </div>
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-40 w-40 rounded-full bg-gradient-to-br from-amber-200/20 to-rose-300/20" />
          <p className="mt-3 text-[10px] text-cyan-300">Editing: {AVATAR_FEATURES.find((f) => f.id === activeAvatarFeature)?.label}</p>
        </div>
      </div>
    </div>
  );
}
