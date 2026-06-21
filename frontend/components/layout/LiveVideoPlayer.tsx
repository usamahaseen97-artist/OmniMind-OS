"use client";

import { Maximize2, Pause, Play, Volume2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { proxiedImageUrl } from "../../lib/live-render-pipeline";
import { resolveMediaUrl } from "../../lib/media-url";
import { cn } from "../../lib/utils";

interface LiveVideoPlayerProps {
  src: string;
  poster?: string;
  className?: string;
}

/** Click-to-play video for Live Sandbox — full pointer interaction. */
export function LiveVideoPlayer({ src, poster, className }: LiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  const togglePlay = useCallback(async () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      try {
        await el.play();
        setPlaying(true);
        setStarted(true);
      } catch {
        /* autoplay policy */
      }
    } else {
      el.pause();
      setPlaying(false);
    }
  }, []);

  const openFullscreen = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    const req = el.requestFullscreen?.bind(el);
    if (req) void req();
  }, []);

  return (
    <div
      className={cn(
        "group relative flex min-h-[240px] w-full flex-1 cursor-pointer flex-col overflow-hidden rounded-xl border border-neon-green/30 bg-black shadow-[0_0_32px_rgba(0,255,136,0.08)]",
        className,
      )}
      onClick={() => void togglePlay()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void togglePlay();
        }
      }}
      aria-label={playing ? "Pause video" : "Play video"}
    >
      <video
        ref={videoRef}
        src={resolveMediaUrl(src)}
        poster={poster ? proxiedImageUrl(poster) : undefined}
        playsInline
        preload="metadata"
        className="pointer-events-none h-full max-h-[min(520px,72vh)] w-full flex-1 object-contain"
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      {!started && (
        <div
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 backdrop-blur-[2px]"
          aria-hidden
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#00FF87]/60 bg-[#10B981]/20 shadow-[0_0_28px_rgba(0,255,135,0.35)] transition group-hover:scale-105">
            <Play className="ml-1 h-8 w-8 fill-[#00FF87] text-[#00FF87]" />
          </span>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#00FF87]">
            Tap to play
          </p>
        </div>
      )}

      {started && !playing && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
          <Play className="h-12 w-12 text-[#00FF87]/90" />
        </div>
      )}

      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/90 to-transparent px-3 py-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => void togglePlay()}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-black/70 text-[#00FF87] hover:bg-emerald-500/20"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <span className="flex items-center gap-1 text-[10px] text-zinc-400">
          <Volume2 className="h-3 w-3" />
          Live preview
        </span>
        <button
          type="button"
          onClick={openFullscreen}
          className="pointer-events-auto flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-500/30 bg-black/70 text-zinc-400 hover:text-[#00FF87]"
          aria-label="Fullscreen"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
