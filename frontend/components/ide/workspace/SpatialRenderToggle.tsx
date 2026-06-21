"use client";

import { motion } from "framer-motion";
import {
  setSpatialConfigText,
  setSpatialRenderMode,
  setSpatialSessionId,
  useSpatialRenderMode,
  useSpatialSessionId,
  type SpatialRenderMode,
} from "../../../lib/spatial-render-store";
import {
  spatialModuleForSlug,
  toggleSpatialRenderMode,
} from "../../../lib/spatial-engine-api";
import type { SovereignToolSlug } from "../../../lib/sovereign-tool-registry";
import { useWorkbenchLive } from "../../../lib/workbench-live-store";
import { cn } from "../../../lib/utils";

const MODES: { id: SpatialRenderMode; label: string; icon: string }[] = [
  { id: "matrix", label: "3D Matrix Mode", icon: "📐" },
  { id: "cinematic", label: "Cinematic Real-Time", icon: "✨" },
];

export function SpatialRenderToggle({ toolSlug }: { toolSlug: SovereignToolSlug }) {
  const active = useSpatialRenderMode();
  const sessionId = useSpatialSessionId();
  const live = useWorkbenchLive();
  const module = spatialModuleForSlug(toolSlug);

  const switchMode = (next: SpatialRenderMode) => {
    if (active === next) return;
    setSpatialRenderMode(next);
    void toggleSpatialRenderMode({
      module,
      render_mode: next,
      session_id: sessionId,
      prompt: live.lastPrompt,
    })
      .then((payload) => {
        setSpatialSessionId(payload.session_id);
        setSpatialConfigText(payload.config_text);
      })
      .catch(() => {
        /* local toggle still applies */
      });
  };

  return (
    <div
      className="flex shrink-0 items-center gap-0.5 rounded-lg border p-0.5"
      style={{ borderColor: "#1E293B", background: "#0B0F19" }}
      role="tablist"
      aria-label="Render mode"
    >
      {MODES.map((m) => {
        const on = active === m.id;
        return (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => switchMode(m.id)}
            className={cn(
              "relative rounded-md px-2.5 py-1 text-[9px] font-semibold transition",
              on ? "text-[var(--omni-text)]" : "",
            )}
            style={!on ? { color: "var(--omni-text-muted)" } : undefined}
          >
            {on ? (
              <motion.span
                layoutId="spatial-render-pill"
                className="absolute inset-0 rounded-md omni-accent-bg"
                style={{ border: "1px solid #1E293B" }}
                transition={{ type: "spring", stiffness: 480, damping: 34 }}
              />
            ) : null}
            <span className="relative z-10 whitespace-nowrap">
              {m.icon} {m.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
