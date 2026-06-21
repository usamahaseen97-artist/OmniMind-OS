"use client";

import { Pause, Play, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MusicPlayerTrack } from "../../lib/music-player-types";
import { cn } from "../../lib/utils";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export type MusicPlayerProps = {
  track: MusicPlayerTrack;
  /** Compact card for inline chat messages */
  compact?: boolean;
  className?: string;
  autoPlay?: boolean;
};

/**
 * Chatbot + Live Screen music card — poster, play/pause, HTML5 audio stream.
 */
export function MusicPlayer({
  track,
  compact = false,
  className,
  autoPlay = false,
}: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [seek, setSeek] = useState(0);
  const [duration, setDuration] = useState(track.durationSec ?? 0);
  const [error, setError] = useState<string | null>(null);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      void audio.play().catch(() => setError("Tap play to start audio"));
    }
  }, [playing]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = track.audioUrl;
    audio.load();
    setSeek(0);
    setError(null);
    setPlaying(false);
    if (autoPlay) {
      void audio.play().then(() => setPlaying(true)).catch(() => setError("Tap play to start"));
    }
  }, [track.audioUrl, autoPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setSeek(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || track.durationSec || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setSeek(0);
    };
    const onErr = () => setError("Stream unavailable — try searching again");

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onErr);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onErr);
    };
  }, [track.durationSec]);

  const durationSec = duration > 0 ? duration : track.durationSec ?? 0;
  const progressPct = durationSec > 0 ? Math.min(100, (seek / durationSec) * 100) : 0;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-[#15171E] via-[#0B0C10] to-[#15171E] shadow-[0_0_32px_rgba(16,185,129,0.12)]",
        compact ? "max-w-md" : "w-full max-w-lg",
        className,
      )}
      data-testid="music-player-card"
    >
      <audio ref={audioRef} preload="metadata" className="hidden" src={track.audioUrl} />

      <div className={cn("flex gap-4", compact ? "p-3" : "p-4")}>
        <div className="relative shrink-0">
          <div
            className={cn(
              "overflow-hidden rounded-xl border border-emerald-500/20 bg-[#0B0C10] shadow-lg",
              compact ? "h-20 w-20" : "h-28 w-28 sm:h-32 sm:w-32",
              playing && "ring-2 ring-[#10B981]/40",
            )}
          >
            {track.albumImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={track.albumImageUrl}
                alt=""
                className={cn(
                  "h-full w-full object-cover",
                  playing && "animate-[spin_18s_linear_infinite]",
                )}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-600/30 to-violet-900/20 text-[10px] font-bold text-emerald-400/70">
                OM
              </div>
            )}
          </div>
          {playing ? (
            <div className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="h-2 w-0.5 animate-pulse rounded-full bg-[#10B981]"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <div>
            <p className={cn("font-semibold leading-tight text-zinc-100", compact ? "text-sm" : "text-base")}>
              {track.title}
            </p>
            <p className="truncate text-[11px] text-zinc-500">{track.artist}</p>
            {track.album && !compact ? (
              <p className="mt-0.5 truncate text-[10px] text-zinc-600">{track.album}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-[#0B0C10] shadow-[0_0_20px_rgba(16,185,129,0.45)] transition hover:scale-105"
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
            </button>
            <Volume2 className="hidden h-4 w-4 text-zinc-600 sm:block" aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="h-1 overflow-hidden rounded-full bg-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-[#10B981] to-[#00FF87] transition-[width] duration-150"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {durationSec > 0 ? (
                <div className="mt-1 flex justify-between text-[9px] tabular-nums text-zinc-600">
                  <span>{formatTime(seek)}</span>
                  <span>{formatTime(durationSec)}</span>
                </div>
              ) : null}
            </div>
          </div>

          {error ? <p className="text-[10px] text-amber-400/90">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
