"use client";

import { AlertTriangle, ExternalLink, Loader2, Maximize2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchChannelEpisodes,
  resolveYouTubeEmbed,
  withYouTubePlayerParams,
  type ChannelEpisode,
  type LegalLiveChannel,
} from "../../lib/live-tv-api";
import { cn } from "../../lib/utils";
import { OmniTVEpisodes } from "./OmniTVEpisodes";
import { HlsVideoPlayer } from "./HlsVideoPlayer";

function extractVideoId(url?: string): string | undefined {
  return url?.match(/\/embed\/([a-zA-Z0-9_-]{6,})/)?.[1];
}

const EPISODE_CATEGORIES = new Set(["Dramas", "Movies", "Sports"]);

export function OmniTVPlayerFallback({
  channel,
  error,
  officialUrl,
}: {
  channel?: LegalLiveChannel;
  error?: string | null;
  officialUrl?: string;
}) {
  const sourceUrl = officialUrl || channel?.youtubeLiveUrl || channel?.officialUrl;

  return (
    <div className="flex aspect-video min-h-[320px] w-full flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center">
      <AlertTriangle className="mb-3 h-8 w-8 text-amber-400" />
      <p className="text-sm font-semibold text-zinc-100">Channel temporarily unavailable</p>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-zinc-500">
        {error ||
          "The official provider may block embeds in this region or may not be live right now."}
      </p>
      {sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 px-4 py-2 text-xs font-semibold text-[#00FF87] transition hover:bg-emerald-500/10"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Watch on Official Source
        </a>
      ) : null}
    </div>
  );
}

export function OmniTVExternalSource({ channel }: { channel: LegalLiveChannel }) {
  const url = channel.officialUrl || channel.liveUrl;
  return (
    <div className="flex aspect-video min-h-[320px] w-full flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-zinc-950 to-black p-6 text-center">
      <ExternalLink className="mb-3 h-8 w-8 text-[#00FF87]" />
      <p className="text-sm font-semibold text-zinc-100">Official rights-holder stream</p>
      <p className="mt-2 max-w-md text-xs leading-relaxed text-zinc-400">
        Live matches are exclusive to the official broadcaster and can&apos;t be embedded for
        legal reasons. Open the official source to watch live.
      </p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#00FF87] px-5 py-2.5 text-sm font-bold text-black transition hover:bg-emerald-300"
        >
          <ExternalLink className="h-4 w-4" />
          Watch on Official Source
        </a>
      ) : null}
    </div>
  );
}

export function OmniTVIframePlayer({
  embedUrl,
  title,
  officialUrl,
  className,
  unavailableAfterMs = 9000,
}: {
  embedUrl?: string;
  title: string;
  officialUrl?: string;
  className?: string;
  unavailableAfterMs?: number;
}) {
  const [isLoading, setIsLoading] = useState(Boolean(embedUrl));
  const [showUnavailableFallback, setShowUnavailableFallback] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const src = useMemo(() => withYouTubePlayerParams(embedUrl), [embedUrl]);

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen?.();
    }
  };

  useEffect(() => {
    setIsLoading(Boolean(src));
    setShowUnavailableFallback(false);

    if (!src) return;
    const fallbackTimer = window.setTimeout(() => {
      setShowUnavailableFallback(true);
    }, unavailableAfterMs);

    return () => window.clearTimeout(fallbackTimer);
  }, [src, unavailableAfterMs]);

  if (!src) {
    return (
      <OmniTVPlayerFallback
        error="No embeddable player URL is available for this channel."
        officialUrl={officialUrl}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "group/player relative aspect-video min-h-[320px] w-full overflow-hidden rounded-2xl border border-zinc-800 bg-black shadow-[0_0_40px_rgba(0,255,135,0.08)]",
        className,
      )}
    >
      <button
        type="button"
        onClick={toggleFullscreen}
        title="Fullscreen"
        aria-label="Toggle fullscreen"
        className="absolute right-3 top-3 z-30 inline-flex items-center gap-1.5 rounded-full border border-zinc-700/80 bg-black/70 px-3 py-1.5 text-xs font-semibold text-zinc-100 backdrop-blur transition hover:border-[#00FF87]/60 hover:text-[#00FF87]"
      >
        <Maximize2 className="h-4 w-4" />
        Fullscreen
      </button>

      {isLoading ? (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80">
          <Loader2 className="h-7 w-7 animate-spin text-[#00FF87]" />
          <p className="mt-3 text-xs text-zinc-500">Loading official stream…</p>
        </div>
      ) : null}

      <iframe
        key={src}
        src={src}
        title={title}
        className="h-full w-full bg-black"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        onLoad={() => setIsLoading(false)}
      />

      {showUnavailableFallback ? (
        <div className="absolute bottom-3 left-3 right-3 z-10 rounded-xl border border-zinc-700 bg-black/85 p-3 backdrop-blur">
          <p className="text-xs font-semibold text-zinc-200">
            Channel temporarily unavailable
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            The official provider may have disabled embedding or changed the live stream ID.
          </p>
          {officialUrl ? (
            <a
              href={officialUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-2 rounded-full border border-emerald-500/40 px-3 py-1.5 text-[11px] font-semibold text-[#00FF87] transition hover:bg-emerald-500/10"
            >
              <ExternalLink className="h-3 w-3" />
              Watch on Official Source
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function OmniTVPlayer({
  channel,
  onError,
}: {
  channel?: LegalLiveChannel;
  onError: (message: string) => void;
}) {
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState<string | undefined>();
  const [resolvingEmbed, setResolvingEmbed] = useState(false);
  const [episodes, setEpisodes] = useState<ChannelEpisode[]>([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);
  const [selectedVideoId, setSelectedVideoId] = useState<string | undefined>();

  useEffect(() => {
    if (!channel || channel.sourceType !== "youtube") {
      setYoutubeEmbedUrl(undefined);
      setResolvingEmbed(false);
      return;
    }

    const ctrl = new AbortController();
    setResolvingEmbed(true);
    void resolveYouTubeEmbed(channel, ctrl.signal)
      .then((embedUrl) => {
        if (!ctrl.signal.aborted) setYoutubeEmbedUrl(embedUrl);
      })
      .catch(() => {
        if (!ctrl.signal.aborted) setYoutubeEmbedUrl(channel.embedUrl);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setResolvingEmbed(false);
      });

    return () => ctrl.abort();
  }, [channel]);

  const showEpisodes = Boolean(
    channel &&
      channel.sourceType === "youtube" &&
      channel.youtubeChannelId &&
      EPISODE_CATEGORIES.has(channel.category),
  );

  useEffect(() => {
    setSelectedVideoId(undefined);
    if (!channel || !showEpisodes) {
      setEpisodes([]);
      return;
    }

    const ctrl = new AbortController();
    setEpisodesLoading(true);
    void fetchChannelEpisodes(channel.id, ctrl.signal)
      .then((items) => {
        if (!ctrl.signal.aborted) setEpisodes(items);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setEpisodesLoading(false);
      });

    return () => ctrl.abort();
  }, [channel, showEpisodes]);

  if (!channel) return <OmniTVPlayerFallback />;

  if (channel.sourceType === "external") {
    return <OmniTVExternalSource channel={channel} />;
  }

  if (channel.sourceType === "youtube") {
    const resolvedEmbed = youtubeEmbedUrl || channel.embedUrl;
    const currentEmbed = selectedVideoId
      ? withYouTubePlayerParams(`https://www.youtube.com/embed/${selectedVideoId}`)
      : resolvedEmbed;
    const activeVideoId = selectedVideoId || extractVideoId(resolvedEmbed);

    return (
      <div className={cn("grid gap-3", showEpisodes && "lg:grid-cols-[minmax(0,1fr)_280px]")}>
        <div className="relative min-w-0">
          {resolvingEmbed && !selectedVideoId ? (
            <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl bg-black/70">
              <Loader2 className="h-7 w-7 animate-spin text-[#00FF87]" />
            </div>
          ) : null}
          <OmniTVIframePlayer
            embedUrl={currentEmbed}
            title={channel.name}
            officialUrl={channel.youtubeLiveUrl || channel.officialUrl}
          />
        </div>
        {showEpisodes ? (
          <OmniTVEpisodes
            episodes={episodes}
            loading={episodesLoading}
            activeVideoId={activeVideoId}
            onSelect={setSelectedVideoId}
          />
        ) : null}
      </div>
    );
  }

  if (channel.sourceType === "hls" && channel.hlsUrl) {
    return (
      <HlsVideoPlayer
        key={channel.hlsUrl}
        src={channel.hlsUrl}
        autoPlay
        muted={false}
        className="aspect-video min-h-[320px] w-full rounded-2xl border border-zinc-800 bg-black object-contain"
        onError={onError}
      />
    );
  }

  return <OmniTVPlayerFallback channel={channel} />;
}
