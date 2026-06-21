"use client";

import { motion } from "motion/react";
import { Play } from "lucide-react";
import type { ArchitectFlowSelections } from "../../lib/architect-flow";
import { cn } from "../../lib/utils";

interface LiveSimulationViewportProps {
  mode: "game" | "app";
  selections: ArchitectFlowSelections;
  running?: boolean;
}

export function LiveSimulationViewport({ mode, selections, running = true }: LiveSimulationViewportProps) {
  const frontend = selections.frontendId ?? (mode === "game" ? "phaser" : "nextjs");
  const isPhaser = frontend === "phaser" || frontend === "threejs" || mode === "game";

  return (
    <div className="flex h-full min-h-[280px] flex-col p-4">
      <div
        className={cn(
          "relative mx-auto aspect-video w-full max-w-2xl flex-1 overflow-hidden rounded-xl border border-white/[0.08] shadow-[inset_0_0_60px_rgba(0,0,0,0.4)]",
          isPhaser ? "bg-gradient-to-b from-[#141c28] to-[#0a0e14]" : "bg-[#0B0C10]",
        )}
      >
        {isPhaser ? (
          <>
            <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(0,255,204,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,204,0.1)_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-emerald-950/50 to-transparent" />
            <motion.div
              className="absolute bottom-16 text-3xl drop-shadow-lg"
              animate={{ left: ["6%", "70%", "6%"] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
            >
              🏃
            </motion.div>
            <div className="absolute bottom-12 left-[18%] h-9 w-14 rounded border border-[#00ffcc]/20 bg-emerald-950/40" />
            <div className="absolute bottom-12 left-[58%] h-11 w-9 rounded border border-cyan-500/20 bg-cyan-950/30" />
            <p className="absolute left-3 top-3 rounded-md bg-black/50 px-2 py-1 font-mono text-[9px] text-[#00ffcc]/90">
              Phaser.Scene · player.update()
            </p>
          </>
        ) : (
          <div className="flex h-full flex-col p-5">
            <div className="mb-4 flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-[#15171E] px-3">
              <div className="h-2 w-2 rounded-full bg-[#00ffcc]/80" />
              <div className="h-2 flex-1 max-w-[120px] rounded bg-white/10" />
            </div>
            <div className="mb-2 h-5 w-3/5 rounded bg-[#00ffcc]/15" />
            <div className="mb-6 h-3 w-2/5 rounded bg-white/10" />
            <div className="grid flex-1 grid-cols-3 gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg border border-white/[0.06] bg-white/[0.03]" />
              ))}
            </div>
            <p className="mt-auto font-mono text-[9px] text-zinc-600">{frontend} · HMR active</p>
          </div>
        )}

        <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/70 px-2 py-1 text-[8px] text-zinc-400">
          <Play className="h-2.5 w-2.5 text-[#00ffcc]" />
          {running ? "Live" : "Idle"}
        </div>
      </div>

      <p className="mt-3 text-center text-[10px] text-zinc-600">
        Preview refreshes when you confirm stack choices in the workspace.
      </p>
    </div>
  );
}
