"use client";

import { useEffect, useMemo, useState } from "react";
import { Clapperboard, Film, Gauge, ImageIcon, Scan } from "lucide-react";
import {
  CREATIVE_VIDEO_DURATION_OPTIONS,
  profileForDuration,
  type CreativeVideoDurationSec,
} from "../../lib/creative-video-profiles";
import { cn } from "../../lib/utils";

interface CreativeVideoDurationPanelProps {
  duration: CreativeVideoDurationSec;
  onDurationChange: (sec: CreativeVideoDurationSec) => void;
  pipelineActive?: boolean;
  pipelineProgress?: number;
  /** Tracked upload file name for I2V */
  sourceFileName?: string | null;
  sourcePreviewUrl?: string | null;
  pipelinePhaseLabel?: string;
  className?: string;
}

export function CreativeVideoDurationPanel({
  duration,
  onDurationChange,
  pipelineActive = false,
  pipelineProgress = 0,
  sourceFileName = null,
  sourcePreviewUrl = null,
  pipelinePhaseLabel,
  className,
}: CreativeVideoDurationPanelProps) {
  const profile = profileForDuration(duration);
  const [calibrating, setCalibrating] = useState(false);
  const [localPulse, setLocalPulse] = useState(0);

  useEffect(() => {
    if (pipelineActive) return;
    setCalibrating(true);
    setLocalPulse(0);
    const t0 = window.setTimeout(() => setCalibrating(false), 480);
    const tick = window.setInterval(() => {
      setLocalPulse((p) => (p >= 100 ? 100 : p + 14));
    }, 60);
    const stop = window.setTimeout(() => window.clearInterval(tick), 520);
    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(stop);
      window.clearInterval(tick);
    };
  }, [duration, pipelineActive]);

  const displayProgress = useMemo(() => {
    if (pipelineActive) return Math.min(99, Math.max(8, pipelineProgress));
    if (calibrating) return Math.min(100, localPulse);
    return 0;
  }, [calibrating, localPulse, pipelineActive, pipelineProgress]);

  const statusLabel = pipelineActive
    ? pipelinePhaseLabel ?? "Active render · Frame 0 lock"
    : sourceFileName
      ? "Source tracked · ready"
      : calibrating
        ? "Calibrating profile"
        : "Profile idle";

  const statRows = [
    { label: "Resolution", value: profile.resolutionVector, icon: Scan },
    { label: "Framing", value: `${profile.shots} shots · ${profile.lensProfile}`, icon: Film },
    { label: "Pipeline", value: `${profile.motionModel} · ${profile.codec}`, icon: Clapperboard },
    { label: "Encode", value: `${profile.encodeLabel} · ${profile.bitrate}`, icon: Gauge },
  ] as const;

  return (
    <section
      className={cn(
        "pointer-events-auto shrink-0 border-b border-emerald-500/20 bg-[#15171E] px-3 py-3 touch-manipulation",
        className,
      )}
      aria-label="Creative Video duration controls"
    >
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400/90">
        Sora-style duration
      </p>

      <div className="pointer-events-auto flex flex-wrap gap-2">
        {CREATIVE_VIDEO_DURATION_OPTIONS.map((sec) => {
          const active = duration === sec;
          const p = profileForDuration(sec);
          return (
            <button
              key={sec}
              type="button"
              onClick={() => onDurationChange(sec)}
              className={cn(
                "pointer-events-auto cursor-pointer rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-all",
                "border-emerald-500/20 bg-[#15171E] hover:bg-[#00FF87]/10 active:scale-[0.98]",
                active &&
                  "border-[#00FF87]/50 bg-[#00FF87]/15 text-[#00FF87] shadow-[0_0_20px_rgba(0,255,135,0.15)]",
                !active && "text-zinc-400",
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {sourceFileName ? (
        <div className="pointer-events-auto mt-2 flex items-center gap-2 rounded-lg border border-[#00FF87]/30 bg-[#00FF87]/5 px-2 py-1.5">
          {sourcePreviewUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={sourcePreviewUrl}
              alt=""
              className="h-9 w-9 shrink-0 rounded border border-emerald-500/40 object-cover"
            />
          ) : (
            <ImageIcon className="h-4 w-4 shrink-0 text-[#00FF87]" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-bold uppercase tracking-wider text-[#00FF87]">
              init_image locked
            </p>
            <p className="truncate text-[10px] text-zinc-300" title={sourceFileName}>
              {sourceFileName}
            </p>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "pointer-events-auto mt-3 rounded-lg border p-3",
          pipelineActive
            ? "border-[#00FF87]/35 bg-[#0a120e]/90 shadow-[0_0_24px_rgba(0,255,135,0.08)]"
            : "border-emerald-500/20 bg-[#0B0C10]/80",
        )}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-[10px] font-medium uppercase tracking-wider",
              pipelineActive ? "text-[#00FF87] animate-pulse" : "text-zinc-500",
            )}
          >
            {statusLabel}
          </span>
          <span className="font-mono text-xs tabular-nums text-[#00FF87]">
            {displayProgress > 0 ? `${Math.round(displayProgress)}%` : "—"}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
          <div
            className={cn(
              "h-full rounded-full bg-gradient-to-r from-emerald-600 to-[#00FF87] transition-[width] duration-300",
              pipelineActive && "animate-pulse",
            )}
            style={{ width: `${displayProgress}%` }}
          />
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-md border border-emerald-500/15 bg-[#15171E] px-2 py-1.5">
            <p className="text-[9px] uppercase text-zinc-600">Frames</p>
            <p className="font-mono text-[11px] text-zinc-200">
              {profile.frameCount} @ {profile.fps}fps
            </p>
          </div>
          <div className="rounded-md border border-emerald-500/15 bg-[#15171E] px-2 py-1.5">
            <p className="text-[9px] uppercase text-zinc-600">Aspect</p>
            <p className="font-mono text-[11px] text-zinc-200">{profile.aspect}</p>
          </div>
        </div>

        <ul className="mt-2 space-y-1.5">
          {statRows.map(({ label, value, icon: Icon }) => (
            <li
              key={label}
              className="flex items-start gap-2 rounded-md border border-white/[0.04] bg-black/20 px-2 py-1.5"
            >
              <Icon className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500/70" />
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-wide text-zinc-600">{label}</p>
                <p className="text-[10px] leading-snug text-zinc-300">{value}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
