"use client";

import {
  ListMusic,
  Mic2,
  MonitorSpeaker,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MusicTrack } from "../../lib/entertainment-catalog";
import { recordMusicPlay } from "../../lib/omnimusic-taste";
import { reportEntertainmentTelemetry } from "../../lib/entertainment-streaming";
import { cn } from "../../lib/utils";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type LoopMode = "off" | "all" | "one";

export type MusicPlaybackControls = {
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
};

export type OmniMusicPlayerProps = {
  tracks: MusicTrack[];
  activeTrack: MusicTrack | null;
  onActiveTrackChange: (track: MusicTrack) => void;
  userInitiated?: boolean;
  autoPlayFeaturedOnce?: boolean;
  onPlayingChange?: (playing: boolean) => void;
  onPlaybackReady?: (controls: MusicPlaybackControls) => void;
  onToggleNowPlaying?: () => void;
  nowPlayingOpen?: boolean;
};

export function OmniMusicPlayer({
  tracks,
  activeTrack,
  onActiveTrackChange,
  userInitiated = false,
  autoPlayFeaturedOnce = false,
  onPlayingChange,
  onPlaybackReady,
  onToggleNowPlaying,
  nowPlayingOpen = true,
}: OmniMusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const featuredPlayedRef = useRef(false);
  const loadGenRef = useRef(0);
  const loadingRef = useRef(false);
  const reachedEndRef = useRef(false);
  const playStartedAtRef = useRef(0);
  const advancingRef = useRef(false);
  const activeTrackIdRef = useRef<string | null>(null);

  const tracksRef = useRef(tracks);
  const activeTrackRef = useRef(activeTrack);
  const loopModeRef = useRef<LoopMode>("off");
  const onActiveTrackChangeRef = useRef(onActiveTrackChange);
  const onPlayingChangeRef = useRef(onPlayingChange);
  const userInitiatedRef = useRef(userInitiated);
  const autoPlayFeaturedOnceRef = useRef(autoPlayFeaturedOnce);

  const [playing, setPlaying] = useState(false);
  const [seek, setSeek] = useState(0);
  const [duration, setDuration] = useState(0);
  const isSeekingRef = useRef(false);
  const [volume, setVolume] = useState(0.85);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [loopMode, setLoopMode] = useState<LoopMode>("off");
  const [toast, setToast] = useState<string | null>(null);

  tracksRef.current = tracks;
  activeTrackRef.current = activeTrack;
  loopModeRef.current = loopMode;
  onActiveTrackChangeRef.current = onActiveTrackChange;
  onPlayingChangeRef.current = onPlayingChange;
  userInitiatedRef.current = userInitiated;
  autoPlayFeaturedOnceRef.current = autoPlayFeaturedOnce;

  const effectiveVolume = muted ? 0 : volume;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 4200);
  }, []);

  const pickNextIndex = useCallback((dir: 1 | -1, currentIdx: number) => {
    const list = tracksRef.current;
    if (list.length === 0) return -1;
    if (shuffle && list.length > 1) {
      let idx = Math.floor(Math.random() * list.length);
      while (idx === currentIdx && list.length > 1) {
        idx = Math.floor(Math.random() * list.length);
      }
      return idx;
    }
    return (currentIdx + dir + list.length) % list.length;
  }, [shuffle]);

  const advanceTrack = useCallback(
    (dir: -1 | 1, manual = false) => {
      const track = activeTrackRef.current;
      const list = tracksRef.current;
      if (!track || list.length === 0) return;

      const idx = list.findIndex((t) => t.id === track.id);
      if (idx < 0) {
        if (manual) {
          showToast("Current song is not in the queue — pick a track from the list");
        }
        return;
      }

      const nextIdx = pickNextIndex(dir, idx);
      if (nextIdx < 0 || nextIdx === idx) return;
      const next = list[nextIdx];
      if (!next || next.id === track.id) return;
      if (advancingRef.current) return;

      advancingRef.current = true;
      reachedEndRef.current = false;
      onActiveTrackChangeRef.current(next);
      window.setTimeout(() => {
        advancingRef.current = false;
      }, 500);
    },
    [pickNextIndex, showToast],
  );

  const skip = useCallback(
    (dir: -1 | 1) => {
      advanceTrack(dir, true);
    },
    [advanceTrack],
  );

  const shouldAutoplayNow = useCallback(() => {
    if (userInitiatedRef.current) return true;
    if (autoPlayFeaturedOnceRef.current && !featuredPlayedRef.current) {
      featuredPlayedRef.current = true;
      return true;
    }
    return false;
  }, []);

  const setPlayingState = useCallback((value: boolean) => {
    setPlaying(value);
    onPlayingChangeRef.current?.(value);
  }, []);

  /* Stable audio listeners — never re-bind on track/skip changes */
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = effectiveVolume;

    const onTime = () => {
      if (loadingRef.current) return;
      if (!isSeekingRef.current) setSeek(audio.currentTime);
      const d = audio.duration;
      if (Number.isFinite(d) && d > 3 && audio.currentTime >= d - 0.5) {
        reachedEndRef.current = true;
      }
    };

    const onLoaded = () => {
      if (loadGenRef.current === 0) return;
      const d = audio.duration;
      if (Number.isFinite(d) && d > 0) setDuration(d);
    };

    const onPlay = () => setPlayingState(true);
    const onPause = () => setPlayingState(false);

    const onEnded = () => {
      if (loadingRef.current) return;
      if (loadGenRef.current === 0) return;

      const d = audio.duration;
      const pos = audio.currentTime;
      const naturalEnd =
        reachedEndRef.current &&
        Number.isFinite(d) &&
        d > 3 &&
        pos >= d - 0.75 &&
        Date.now() - playStartedAtRef.current > 2500;

      if (!naturalEnd) {
        reachedEndRef.current = false;
        return;
      }

      const track = activeTrackRef.current;
      if (!track || advancingRef.current) return;

      if (loopModeRef.current === "one") {
        reachedEndRef.current = false;
        audio.currentTime = 0;
        void audio.play().catch(() => undefined);
        return;
      }

      reachedEndRef.current = false;
      advanceTrack(1, false);
    };

    const onError = () => {
      if (loadingRef.current) return;
      setPlayingState(false);
      showToast(
        `"${activeTrackRef.current?.title ?? "Track"}" could not play — tap Next or pick another song`,
      );
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("durationchange", onLoaded);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("durationchange", onLoaded);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
    };
  }, [advanceTrack, effectiveVolume, setPlayingState, showToast]);

  /* Load track only when id changes — ignore spurious audioUrl updates */
  useEffect(() => {
    const track = activeTrack;
    if (!track?.audioUrl) return;

    const audio = audioRef.current;
    if (!audio) return;

    if (activeTrackIdRef.current === track.id && audio.src) {
      const err = audio.error;
      if (!err) return;
    }

    activeTrackIdRef.current = track.id;
    const gen = ++loadGenRef.current;
    loadingRef.current = true;
    reachedEndRef.current = false;
    setSeek(0);
    setDuration(track.durationSec ?? 0);

    audio.pause();
    setPlayingState(false);

    const url = track.audioUrl;

    const onCanPlay = () => {
      if (loadGenRef.current !== gen) return;
      loadingRef.current = false;
      playStartedAtRef.current = Date.now();
      reachedEndRef.current = false;
      recordMusicPlay(track);
      reportEntertainmentTelemetry("omnimusic", "play", {
        track_id: track.id,
        title: track.title,
        artist: track.artist,
      });
      if (shouldAutoplayNow()) {
        void audio.play().catch(() => {
          setPlayingState(false);
          showToast("Tap Play to start");
        });
      }
    };

    audio.removeAttribute("src");
    audio.load();

    audio.src = url;
    audio.load();
    audio.addEventListener("canplay", onCanPlay, { once: true });

    const failTimer = window.setTimeout(() => {
      if (loadGenRef.current !== gen) return;
      loadingRef.current = false;
    }, 12_000);

    return () => {
      window.clearTimeout(failTimer);
      audio.removeEventListener("canplay", onCanPlay);
      loadGenRef.current += 1;
      loadingRef.current = false;
      reachedEndRef.current = false;
      audio.pause();
    };
  }, [activeTrack?.id, setPlayingState, shouldAutoplayNow, showToast]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;
    if (playing) audio.pause();
    else void audio.play().catch(() => showToast("Playback failed"));
  }, [activeTrack, playing, showToast]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !activeTrack) return;
    void audio.play().catch(() => showToast("Playback failed"));
  }, [activeTrack, showToast]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  useEffect(() => {
    onPlaybackReady?.({ togglePlay, play, pause });
  }, [onPlaybackReady, togglePlay, play, pause]);

  const durationSec = duration > 0 ? duration : activeTrack?.durationSec ?? 240;
  const progressPct = Math.min(100, (seek / Math.max(durationSec, 1)) * 100);

  const onSeekInput = (v: number) => {
    isSeekingRef.current = true;
    setSeek(v);
    reachedEndRef.current = v >= durationSec - 0.5;
    if (audioRef.current) audioRef.current.currentTime = v;
  };

  const onSeekEnd = () => {
    isSeekingRef.current = false;
  };

  const cycleLoop = () => {
    setLoopMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  };

  return (
    <footer className="relative z-[70] w-full min-w-0 max-w-full shrink-0 overflow-hidden border-t border-white/10 bg-[#181818]">
      <audio ref={audioRef} preload="metadata" className="hidden" />

      {toast ? (
        <p className="absolute -top-8 left-1/2 z-20 max-w-[90vw] -translate-x-1/2 truncate rounded-md bg-amber-950 px-3 py-1 text-[11px] text-amber-200">
          {toast}
        </p>
      ) : null}

      <div className="group/progress relative h-1 w-full bg-[#4d4d4d] hover:h-1.5">
        <div
          className="pointer-events-none absolute left-0 top-0 h-full bg-white/90 transition-[width] duration-75 group-hover/progress:bg-[#1ed760]"
          style={{ width: `${progressPct}%` }}
        />
        <input
          type="range"
          min={0}
          max={durationSec}
          step={0.25}
          value={seek}
          onChange={(e) => onSeekInput(Number(e.target.value))}
          onMouseUp={onSeekEnd}
          onTouchEnd={onSeekEnd}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Seek"
        />
      </div>

      <div className="grid w-full min-w-0 max-w-full grid-cols-1 items-center gap-3 px-3 py-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] sm:gap-4 sm:px-4">
        <div className="flex min-w-0 items-center gap-3 max-sm:order-2">
          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-zinc-800 shadow-lg">
            {activeTrack?.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activeTrack.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600">
                OM
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {activeTrack?.title ?? "No track selected"}
            </p>
            <p className="truncate text-xs text-zinc-400">{activeTrack?.artist ?? "—"}</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1.5 max-sm:order-1">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setShuffle((s) => !s)}
              className={cn(
                "p-1",
                shuffle ? "text-[#1ed760]" : "text-zinc-400 hover:text-white",
              )}
              aria-label="Shuffle"
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => skip(-1)}
              className="text-zinc-300 hover:text-white"
              aria-label="Previous"
            >
              <SkipBack className="h-5 w-5 fill-current" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              disabled={!activeTrack}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1ed760] text-black shadow-lg ring-2 ring-white/20 transition hover:scale-105 hover:bg-[#1fdf64] disabled:opacity-40"
              aria-label={playing ? "Pause" : "Play"}
              title={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <Pause className="h-5 w-5 fill-current" />
              ) : (
                <Play className="h-5 w-5 fill-current pl-0.5" />
              )}
            </button>
            <button
              type="button"
              onClick={() => skip(1)}
              className="text-zinc-300 hover:text-white"
              aria-label="Next"
            >
              <SkipForward className="h-5 w-5 fill-current" />
            </button>
            <button
              type="button"
              onClick={cycleLoop}
              className={cn(
                "p-1",
                loopMode !== "off" ? "text-[#1ed760]" : "text-zinc-400 hover:text-white",
              )}
              aria-label="Repeat"
            >
              {loopMode === "one" ? (
                <Repeat1 className="h-4 w-4" />
              ) : (
                <Repeat className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-2 text-[11px] tabular-nums text-zinc-500">
            <span>{formatTime(seek)}</span>
            <span className="text-zinc-600">/</span>
            <span>{formatTime(durationSec)}</span>
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-end gap-1 sm:gap-2 max-sm:order-3">
          <button
            type="button"
            onClick={() => onToggleNowPlaying?.()}
            className={cn(
              "hidden shrink-0 p-2 xl:flex",
              nowPlayingOpen ? "text-[#1ed760]" : "text-zinc-400 hover:text-white",
            )}
            aria-label="Now playing view"
            title="Now playing"
          >
            <MonitorSpeaker className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="hidden shrink-0 p-2 text-zinc-400 hover:text-white sm:block"
            aria-label="Lyrics"
            title="Lyrics"
          >
            <Mic2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="hidden shrink-0 p-2 text-zinc-400 hover:text-white md:block"
            aria-label="Queue"
            title="Queue"
          >
            <ListMusic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            className="shrink-0 text-zinc-400 hover:text-white"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted || volume === 0 ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setVolume(v);
              setMuted(v === 0);
              if (audioRef.current) audioRef.current.volume = v;
            }}
            className="h-1 w-20 min-w-0 max-w-[7rem] shrink cursor-pointer appearance-none rounded-full bg-zinc-600 accent-white sm:w-24"
            aria-label="Volume"
          />
        </div>
      </div>
    </footer>
  );
}
