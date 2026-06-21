"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  setMedicalRenderMode,
  useMedicalDiagnosticStore,
  useMedicalRenderMode,
} from "../../lib/medical-diagnostic-store";
import { SpatialCanvasResizeHost } from "../ide/workspace/SpatialCanvasResizeHost";
import { MedicalScanCanvas2D } from "./MedicalScanCanvas2D";
import { MedicalVolumetricScene3D } from "./MedicalVolumetricScene3D";
import { MedicalScanTimeline } from "./MedicalScanTimeline";
import { cn } from "../../lib/utils";

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.3 } };

const MODES = [
  { id: "scan2d" as const, label: "2D Scan Mode", icon: "🔬" },
  { id: "volumetric3d" as const, label: "3D Volumetric Render", icon: "🫀" },
];

export function MedicalDiagnosticViewport() {
  const mode = useMedicalRenderMode();
  const { clinicalSummary, meshUrl } = useMedicalDiagnosticStore();

  return (
    <div className="omni-studio-panel flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <header className="omni-studio-header flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
        <div className="min-w-0">
          <p className="omni-cyber-cyan truncate text-[9px] font-bold uppercase tracking-wider">
            High-Realistic Diagnostic Viewport
          </p>
          <p className="omni-text-dusk truncate text-[8px]">
            {meshUrl ? `Mesh: ${meshUrl.split("/").pop()}` : "WebGL · clinical reconstruction"}
          </p>
        </div>
        <div
          className="omni-glass-panel flex shrink-0 items-center gap-0.5 rounded-lg p-0.5"
          role="tablist"
        >
          {MODES.map((m) => {
            const on = mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setMedicalRenderMode(m.id)}
                className={cn(
                  "relative rounded-md px-2 py-1 text-[9px] font-semibold transition-all duration-200",
                  on ? "omni-cyber-cyan" : "omni-text-dusk",
                )}
              >
                {on ? (
                  <motion.span
                    layoutId="medical-render-pill"
                    className="absolute inset-0 rounded-md bg-[#241745]/70 ring-1 ring-purple-500/30"
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
      </header>

      <SpatialCanvasResizeHost className="omni-medical-panel-canvas min-h-0 flex-[1_1_68%]">
        <AnimatePresence mode="wait">
          <motion.div key={mode} className="relative h-full w-full" {...fade}>
            {mode === "scan2d" ? <MedicalScanCanvas2D /> : <MedicalVolumetricScene3D />}
          </motion.div>
        </AnimatePresence>
      </SpatialCanvasResizeHost>

      {clinicalSummary ? (
        <p className="omni-text-dusk shrink-0 truncate border-t border-purple-500/[0.12] px-3 py-1 text-[8px]">
          {clinicalSummary}
        </p>
      ) : null}

      <div className="min-h-0 flex-[0_0_22%] overflow-hidden">
        <MedicalScanTimeline />
      </div>
    </div>
  );
}
