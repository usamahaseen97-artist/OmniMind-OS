"use client";

import { Maximize2 } from "lucide-react";
import { OF } from "../omniforge-theme";

/** Floating control — opens immersive live preview modal (image_13 / image_14). */
export function OmniForgeLiveModeFab({ onActivate }: { onActivate: () => void }) {
  return (
    <button
      type="button"
      onClick={onActivate}
      className="absolute bottom-4 right-4 z-30 flex items-center gap-2 rounded-full px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider shadow-lg transition hover:scale-[1.03] active:scale-[0.98]"
      style={{
        background: `linear-gradient(135deg, ${OF.indigoSolid} 0%, ${OF.cyan} 100%)`,
        color: "#fff",
        boxShadow: `0 8px 32px ${OF.cyanGlow}, ${OF.shadow}`,
      }}
      aria-label="Open live mode fullscreen"
    >
      <Maximize2 className="h-4 w-4" />
      Live Mode
    </button>
  );
}
