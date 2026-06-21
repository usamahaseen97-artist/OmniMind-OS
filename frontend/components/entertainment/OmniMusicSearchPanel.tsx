"use client";

import { Loader2, Mic, Search, Sparkles, Wand2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  apiTrackToMusicTrack,
  fetchMusicPredictQueries,
  fetchMusicSuggestions,
  identifyMusicSnippet,
  type MusicSuggestion,
} from "../../lib/omnimusic-api";
import { useMusicVoiceSearch } from "../../hooks/useMusicVoiceSearch";
import type { MusicTrack } from "../../lib/entertainment-catalog";
import { cn } from "../../lib/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSelectTrack: (track: MusicTrack) => void;
  onSearchQuery: (q: string) => void;
  userId?: string;
  variant?: "standalone" | "topbar";
};

export function OmniMusicSearchPanel({
  value,
  onChange,
  onSelectTrack,
  onSearchQuery,
  userId,
  variant = "standalone",
}: Props) {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<MusicSuggestion[]>([]);
  const [aiQueries, setAiQueries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [identifying, setIdentifying] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const isTopbar = variant === "topbar";

  const runIdentify = useCallback(
    async (snippet: string) => {
      const text = snippet.trim();
      if (text.length < 2) return;
      setIdentifying(true);
      onChange(text);
      setOpen(true);
      try {
        const res = await identifyMusicSnippet(text, userId);
        if (res.track) {
          onSelectTrack(apiTrackToMusicTrack(res.track));
          onSearchQuery(res.search_query ?? text);
          return;
        }
        if (res.search_query) onSearchQuery(res.search_query);
        else onSearchQuery(text);
      } finally {
        setIdentifying(false);
      }
    },
    [onChange, onSelectTrack, onSearchQuery, userId],
  );

  const { listening, error: voiceError, toggle, supported } = useMusicVoiceSearch(runIdentify);

  useEffect(() => {
    const q = value.trim();
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      setLoading(true);
      void Promise.all([
        fetchMusicSuggestions(q, ctrl.signal),
        q.length >= 2 ? fetchMusicPredictQueries(q, ctrl.signal) : Promise.resolve([]),
      ])
        .then(([sug, pred]) => {
          setSuggestions(sug);
          setAiQueries(pred);
        })
        .finally(() => setLoading(false));
    }, q ? 80 : 0);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pickSuggestion = (s: MusicSuggestion) => {
    if (s.type === "track" && s.track) {
      onSelectTrack(apiTrackToMusicTrack(s.track));
      onChange(s.label);
      setOpen(false);
      return;
    }
    const q = s.search_query ?? s.label;
    onChange(q);
    onSearchQuery(q);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={cn("relative", isTopbar ? "w-full max-w-2xl mx-auto" : "shrink-0 border-b border-white/10 bg-[#121212] px-4 py-4 md:px-6")}>
      {!isTopbar ? (
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          OmniMusic
        </p>
      ) : null}
      <div
        className={cn(
          "flex items-center gap-2 rounded-full border bg-[#242424] px-4 transition",
          isTopbar ? "py-2" : "py-2.5",
          open ? "border-white/30" : "border-transparent hover:border-white/20",
        )}
      >
        <Search className="h-5 w-5 shrink-0 text-zinc-400" />
        <input
          type="search"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="What do you want to play?"
          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
          aria-label="Search music"
          autoComplete="off"
        />
        {loading || identifying ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#1ed760]" />
        ) : null}
        <button
          type="button"
          onClick={toggle}
          title={supported ? "Hum or speak a lyric — AI finds the song" : "Voice not supported"}
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition",
            listening
              ? "animate-pulse bg-red-500/90 text-white"
              : "bg-[#1ed760] text-black hover:scale-105",
          )}
          aria-label="Voice search"
          aria-pressed={listening}
        >
          <Mic className="h-4 w-4" />
        </button>
      </div>

      {!isTopbar && (voiceError || listening) ? (
        <p className={cn("mt-1.5 text-[11px]", listening ? "text-[#1ed760]" : "text-amber-400/90")}>
          {listening ? "Listening…" : voiceError}
        </p>
      ) : null}

      {open && (suggestions.length > 0 || aiQueries.length > 0) ? (
        <div
          className={cn(
            "absolute z-[80] mt-1 max-h-[min(50vh,360px)] overflow-y-auto rounded-xl border border-white/10 bg-[#282828] py-2 shadow-2xl",
            isTopbar ? "left-0 right-0 top-full" : "left-4 right-4 top-full md:left-6 md:right-6",
          )}
        >
          {aiQueries.length > 0 ? (
            <div className="border-b border-white/5 px-3 pb-2">
              <p className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase text-[#1ed760]">
                <Sparkles className="h-3 w-3" />
                AI thinks you want
              </p>
              <div className="flex flex-wrap gap-1.5">
                {aiQueries.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      onChange(q);
                      onSearchQuery(q);
                      setOpen(false);
                    }}
                    className="rounded-full bg-white/10 px-3 py-1 text-xs text-zinc-200 hover:bg-white/15"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
          <ul>
            {suggestions.map((s, i) => (
              <li key={`${s.label}-${i}`}>
                <button
                  type="button"
                  onClick={() => pickSuggestion(s)}
                  className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-white/10"
                >
                  <Wand2 className="h-4 w-4 shrink-0 text-zinc-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{s.label}</p>
                    {s.sub ? <p className="truncate text-xs text-zinc-500">{s.sub}</p> : null}
                  </div>
                  {s.source === "audius" ? (
                    <span className="text-[9px] uppercase text-violet-400">Live</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
