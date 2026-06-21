"use client";

import { useEffect, useRef } from "react";

interface HlsVideoPlayerProps {
  src: string;
  className?: string;
  muted?: boolean;
  autoPlay?: boolean;
  /** Spark buffer-healing hint: 360p | 720p | 1080p | auto */
  preferredVariant?: string;
  onError?: (message: string) => void;
  onPlaying?: () => void;
}

/** HLS (.m3u8) player — Chrome/Edge need hls.js; Safari uses native HLS. */
function variantCap(preferred?: string): number {
  switch (preferred) {
    case "360p":
      return 360;
    case "480p":
      return 480;
    case "720p":
      return 720;
    case "1080p":
      return 1080;
    default:
      return 1080;
  }
}

export function HlsVideoPlayer({
  src,
  className,
  muted = false,
  autoPlay = true,
  preferredVariant,
  onError,
  onPlaying,
}: HlsVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hls: import("hls.js").default | null = null;
    let cancelled = false;

    const playNative = () => {
      video.src = src;
      if (autoPlay) {
        void video.play().then(() => onPlaying?.()).catch(() => {
          onError?.("Autoplay blocked — use player controls");
        });
      }
    };

    const onVideoError = () => {
      onError?.("Stream unavailable — try another channel");
    };

    video.addEventListener("error", onVideoError);

    void (async () => {
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        playNative();
        return;
      }

      const Hls = (await import("hls.js")).default;
      if (cancelled) return;

      if (Hls.isSupported()) {
        const cap = variantCap(preferredVariant);
        hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          capLevelToPlayerSize: true,
          startLevel: -1,
          maxMaxBufferLength: preferredVariant === "360p" ? 20 : 30,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          const levels = hls?.levels ?? [];
          if (levels.length && cap < 1080) {
            let pick = 0;
            for (let i = 0; i < levels.length; i += 1) {
              if ((levels[i]?.height ?? 0) <= cap) pick = i;
            }
            hls!.currentLevel = pick;
          }
          if (autoPlay) {
            void video.play().then(() => onPlaying?.()).catch(() => {
              onError?.("Autoplay blocked — tap play");
            });
          }
        });
        hls.on(Hls.Events.ERROR, (_e, data) => {
          if (data.fatal) {
            onError?.("HLS error — switching source…");
            playNative();
          }
        });
      } else {
        playNative();
      }
    })();

    return () => {
      cancelled = true;
      video.removeEventListener("error", onVideoError);
      hls?.destroy();
    };
  }, [src, autoPlay, preferredVariant, onError, onPlaying]);

  return (
    <video
      ref={videoRef}
      className={className}
      controls
      playsInline
      muted={muted}
    />
  );
}
