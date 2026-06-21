"use client";

import Hls from "hls.js";
import { Loader2, Maximize2, Radio, Settings2, Users, Volume2, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchLiveStats,
  makeViewerToken,
  type LiveChannel,
} from "../../lib/live-stream-api";
import { cn } from "../../lib/utils";

type QualityLevel = {
  index: number; // -1 = auto
  label: string;
};

type PlayerState = {
  isPlaying: boolean;
  isBuffering: boolean;
  isLive: boolean;
  error: string | null;
};

export function OmniLivePlayer({ channel }: { channel: LiveChannel }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const tokenRef = useRef<string>(makeViewerToken());

  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    isBuffering: true,
    isLive: channel.isLive,
    error: null,
  });
  const [levels, setLevels] = useState<QualityLevel[]>([]);
  const [activeLevel, setActiveLevel] = useState<number>(-1);
  const [viewers, setViewers] = useState<number>(0);
  const [muted, setMuted] = useState<boolean>(true);
  const [showQuality, setShowQuality] = useState<boolean>(false);

  // ---- HLS attach / teardown ------------------------------------------------
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setState({ isPlaying: false, isBuffering: true, isLive: channel.isLive, error: null });
    setLevels([]);
    setActiveLevel(-1);

    let hls: Hls | null = null;

    const buildLabels = (data: Hls["levels"]): QualityLevel[] => {
      const levelItems = data.map((lvl, index) => ({
        index,
        label: lvl.height ? `${lvl.height}p` : `${Math.round((lvl.bitrate || 0) / 1000)}kbps`,
      }));
      return [{ index: -1, label: "Auto" }, ...levelItems];
    };

    if (Hls.isSupported()) {
      hls = new Hls({
        lowLatencyMode: true,
        backBufferLength: 30,
        enableWorker: true,
      });
      hlsRef.current = hls;
      hls.loadSource(channel.playlistUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLevels(buildLabels(hls!.levels));
        void video.play().catch(() => undefined);
      });
      hls.on(Hls.Events.LEVEL_LOADED, (_evt, data) => {
        setState((s) => ({ ...s, isLive: Boolean(data.details?.live) || channel.isLive }));
      });
      hls.on(Hls.Events.LEVEL_SWITCHED, (_evt, data) => {
        setActiveLevel(hls!.autoLevelEnabled ? -1 : data.level);
      });
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (!data.fatal) return;
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls!.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls!.recoverMediaError();
            break;
          default:
            setState((s) => ({ ...s, error: "Live stream unavailable", isBuffering: false }));
            hls!.destroy();
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS (Safari / iOS)
      video.src = channel.playlistUrl;
      video.addEventListener("loadedmetadata", () => void video.play().catch(() => undefined));
    } else {
      setState((s) => ({ ...s, error: "HLS not supported in this browser", isBuffering: false }));
    }

    return () => {
      if (hls) hls.destroy();
      hlsRef.current = null;
      video.removeAttribute("src");
      video.load();
    };
  }, [channel.playlistUrl, channel.isLive]);

  // ---- <video> element state ------------------------------------------------
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlaying = () => setState((s) => ({ ...s, isPlaying: true, isBuffering: false }));
    const onWaiting = () => setState((s) => ({ ...s, isBuffering: true }));
    const onPause = () => setState((s) => ({ ...s, isPlaying: false }));
    video.addEventListener("playing", onPlaying);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("playing", onPlaying);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("pause", onPause);
    };
  }, []);

  // ---- Viewer-count heartbeat ----------------------------------------------
  useEffect(() => {
    const token = tokenRef.current;
    let cancelled = false;
    const ctrl = new AbortController();
    const poll = async () => {
      try {
        const stats = await fetchLiveStats(channel.statsUrl, token, ctrl.signal);
        if (!cancelled) setViewers(stats.viewers);
      } catch {
        /* transient — keep last count */
      }
    };
    void poll();
    const id = window.setInterval(poll, 5000);
    return () => {
      cancelled = true;
      ctrl.abort();
      window.clearInterval(id);
    };
  }, [channel.statsUrl]);

  const selectLevel = useCallback((index: number) => {
    setActiveLevel(index);
    setShowQuality(false);
    if (hlsRef.current) hlsRef.current.currentLevel = index; // -1 = auto
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const goFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  }, []);

  const activeLabel = levels.find((l) => l.index === activeLevel)?.label ?? "Auto";

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl border border-zinc-800 bg-black"
    >
      <div className="relative aspect-video w-full bg-black">
        <video
          ref={videoRef}
          className="h-full w-full bg-black"
          playsInline
          autoPlay
          muted={muted}
          controlsList="nodownload"
          onContextMenu={(event) => event.preventDefault()}
        />

        {/* Buffering spinner */}
        {state.isBuffering && !state.error ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
            <Loader2 className="h-9 w-9 animate-spin text-white/80" />
          </div>
        ) : null}

        {/* Error overlay */}
        {state.error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 px-6 text-center">
            <Radio className="h-8 w-8 text-red-400" />
            <p className="text-sm font-semibold text-white">{state.error}</p>
            <p className="text-xs text-zinc-400">Channel temporarily unavailable.</p>
          </div>
        ) : null}

        {/* Top overlay: LIVE badge + viewers */}
        <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
          {state.isLive ? (
            <span className="flex items-center gap-1.5 rounded-md bg-red-600 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white shadow">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
              Live
            </span>
          ) : (
            <span className="rounded-md bg-zinc-800/90 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-zinc-200">
              Replay
            </span>
          )}
          <span className="flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-[11px] font-semibold text-zinc-100 backdrop-blur">
            <Users className="h-3 w-3" />
            {viewers.toLocaleString()}
          </span>
        </div>

        {/* Bottom controls */}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-black/80 to-transparent px-3 pb-2 pt-8">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{channel.name}</p>
            <p className="text-[11px] text-zinc-400">
              {channel.category}
              {channel.mode === "transcode" ? " · ABR transcode" : " · HLS proxy"}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              className="rounded-lg bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>

            {levels.length > 1 ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowQuality((v) => !v)}
                  className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-2 text-[11px] font-semibold text-white transition hover:bg-white/20"
                >
                  <Settings2 className="h-4 w-4" />
                  {activeLabel}
                </button>
                {showQuality ? (
                  <div className="absolute bottom-11 right-0 w-32 overflow-hidden rounded-lg border border-zinc-700 bg-[#101014] py-1 shadow-xl">
                    {levels.map((lvl) => (
                      <button
                        key={lvl.index}
                        type="button"
                        onClick={() => selectLevel(lvl.index)}
                        className={cn(
                          "block w-full px-3 py-1.5 text-left text-xs transition hover:bg-white/10",
                          lvl.index === activeLevel ? "font-bold text-red-400" : "text-zinc-200",
                        )}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              onClick={goFullscreen}
              className="rounded-lg bg-white/10 p-2 text-white transition hover:bg-white/20"
              aria-label="Fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
