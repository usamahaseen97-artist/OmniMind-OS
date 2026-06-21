"use client";

import { useEffect, useState } from "react";
import { useOmniForgeMobileLayout } from "../../../../lib/omniforge-mobile-layout-store";
import { useOmniForgeWorkspaceOptional } from "../../../../lib/omniforge-workspace";
import { OmniForgeMobileViewport } from "./OmniForgeMobileBlocks";
import { OF } from "./omniforge-theme";

/** Pane 4 — Responsive live app / mobile preview shell */
export function OmniForgeLivePreviewPane() {
  const { blocks, reorder, hasLayout } = useOmniForgeMobileLayout();
  const omniforge = useOmniForgeWorkspaceOptional();
  const [pulse, setPulse] = useState(false);
  const live = omniforge?.status === "ready";

  useEffect(() => {
    const flash = () => {
      setPulse(true);
      window.setTimeout(() => setPulse(false), 1400);
    };
    window.addEventListener("omnimind:omniforge-files-loaded", flash);
    window.addEventListener("omnimind:mobile-layout-changed", flash);
    return () => {
      window.removeEventListener("omnimind:omniforge-files-loaded", flash);
      window.removeEventListener("omnimind:mobile-layout-changed", flash);
    };
  }, []);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden" style={{ background: OF.panel }}>
      <header className="shrink-0 border-b px-3 py-2" style={{ borderColor: OF.border, background: OF.panelAlt }}>
        <p className="text-[9px] font-bold uppercase tracking-[0.22em]" style={{ color: OF.textLabel }}>
          Live App Shell
        </p>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold" style={{ color: OF.cyan }}>
            OmniMind SaaS Preview
          </p>
          <span
            className="flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[8px] font-mono font-semibold"
            style={{
              borderColor: live ? "rgba(34,197,94,0.45)" : OF.border,
              background: live ? "rgba(34,197,94,0.14)" : "rgba(255,255,255,0.03)",
              color: live ? OF.success : OF.textMuted,
              boxShadow: pulse ? "0 0 12px rgba(34,197,94,0.35)" : undefined,
            }}
          >
            {live ? (
              <span className={`h-1.5 w-1.5 rounded-full bg-[#22C55E] ${pulse ? "animate-ping" : "animate-pulse"}`} />
            ) : null}
            {live ? "Hot reload active" : "Offline"}
          </span>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-3 py-4">
        {hasLayout ? (
          <div
            className="relative flex w-full max-w-[280px] flex-col overflow-hidden shadow-2xl"
            style={{
              borderRadius: 34,
              border: `11px solid ${OF.phoneBezel}`,
              background: OF.bgDeep,
              minHeight: 480,
              maxHeight: "min(72vh, 600px)",
              boxShadow: `0 24px 48px rgba(0,0,0,0.55), 0 0 0 1px ${OF.border}`,
            }}
          >
            <div className="flex h-8 shrink-0 items-center justify-center">
              <div className="h-1 w-16 rounded-full bg-black/70" />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <OmniForgeMobileViewport blocks={blocks} onReorder={reorder} />
            </div>
          </div>
        ) : (
          <div className="flex max-w-xs flex-col items-center gap-3 px-4 text-center">
            <div
              className="flex h-48 w-28 items-center justify-center rounded-[2rem] border-2 border-dashed"
              style={{ borderColor: OF.border, background: OF.bgDeep }}
            >
              <span className="text-[8px]" style={{ color: OF.textMuted }}>
                No app yet
              </span>
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: OF.textMuted }}>
              Prompt the Sovereign Agent to scaffold your app — preview renders here when layout files exist.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
