"use client";

import { Cloud, Cpu, Film, HardDrive, Loader2, Wifi } from "lucide-react";
import { cn } from "../../lib/utils";
import { useVisionaryStudio } from "../../lib/visionary";

export function VisionaryStatusBar() {
  const { metrics, project, autoSaveStatus, isPlaying } = useVisionaryStudio();

  const memPct = Math.round((metrics.memoryMb / metrics.memoryTotalMb) * 100);

  return (
    <footer
      className="visionary-status-bar flex h-6 shrink-0 items-center justify-between gap-2 border-t border-white/[0.06] bg-[#05080e] px-2 font-mono text-[9px]"
      aria-label="System status"
    >
      <div className="flex items-center gap-3 text-slate-500">
        <Metric icon={Film} label="GPU" value={`${metrics.gpuPct}%`} warn={metrics.gpuPct > 80} />
        <Metric icon={Cpu} label="CPU" value={`${metrics.cpuPct}%`} />
        <Metric icon={HardDrive} label="RAM" value={`${metrics.memoryMb} MB (${memPct}%)`} />
      </div>

      <div className="hidden items-center gap-3 text-slate-500 sm:flex">
        <span className="flex items-center gap-1">
          {metrics.rendering === "idle" ? (
            <Film size={10} className="opacity-50" />
          ) : (
            <Loader2 size={10} className="animate-spin text-cyan-400" />
          )}
          Render: {metrics.rendering}
        </span>
        <span className="flex items-center gap-1">
          <Cloud size={10} className={metrics.cloudSync === "synced" ? "text-emerald-400" : "text-amber-400"} />
          {metrics.cloudSync}
        </span>
        <span>Tasks: {metrics.backgroundTasks}</span>
      </div>

      <div className="flex items-center gap-2 text-slate-400">
        {isPlaying ? (
          <span className="text-cyan-400">▶ Playing</span>
        ) : null}
        <span className="hidden md:inline truncate max-w-[200px]">{project.name}</span>
        <span
          className={cn(
            "rounded px-1 uppercase",
            autoSaveStatus === "saved" && "text-emerald-500/80",
            autoSaveStatus === "saving" && "text-amber-400",
            autoSaveStatus === "dirty" && "text-slate-500",
          )}
        >
          {autoSaveStatus}
        </span>
        <Wifi size={10} className="text-emerald-500/70" />
      </div>
    </footer>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  warn,
}: {
  icon: typeof Cpu;
  label: string;
  value: string;
  warn?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-1", warn && "text-amber-400")}>
      <Icon size={10} />
      <span className="text-slate-600">{label}</span>
      <span className="text-slate-400">{value}</span>
    </span>
  );
}
