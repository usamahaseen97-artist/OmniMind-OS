"use client";

import dynamic from "next/dynamic";
import { Car, Loader2, MapPin, Mic, MicOff, Send, Volume2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { MarkdownMessage } from "../chat/MarkdownMessage";
import { Button } from "../ui/button";
import { searchMaps, type MapPlace, type MapSearchResult } from "../../lib/maps-api";
import { useSuperToolPromptListener } from "../../lib/super-tool-prompt-bus";
import { cn } from "../../lib/utils";

const OmniMapView = dynamic(
  () => import("./OmniMapView").then((m) => m.OmniMapView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center bg-[#0B0C10] text-sm text-zinc-500">
        Loading map…
      </div>
    ),
  },
);

type ChatLine = { role: "user" | "assistant"; content: string; places?: MapPlace[] };

function speak(text: string, lang = "en-US") {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = lang;
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
}

export function OmniMapsPanel() {
  const [query, setQuery] = useState("");
  const [driveMode, setDriveMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState<ChatLine[]>([]);
  const [places, setPlaces] = useState<MapPlace[]>([]);
  const [center, setCenter] = useState({ lat: 24.8607, lng: 67.0011 });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useSuperToolPromptListener("ai-omnimaps", (text) => setQuery(text));

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = "ur-PK";
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      setQuery(text);
      setListening(false);
      if (text) void runSearch(text);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, []);

  const runSearch = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || loading) return;
      setLoading(true);
      setChat((c) => [...c, { role: "user", content: q }]);
      try {
        let userLat: number | undefined;
        let userLng: number | undefined;
        if (navigator.geolocation) {
          await new Promise<void>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                userLat = pos.coords.latitude;
                userLng = pos.coords.longitude;
                resolve();
              },
              () => resolve(),
              { timeout: 4000 },
            );
          });
        }
        const result: MapSearchResult = await searchMaps({
          query: q,
          user_lat: userLat,
          user_lng: userLng,
          drive_mode: driveMode,
        });
        setPlaces(result.places);
        setCenter(result.center);
        setChat((c) => [
          ...c,
          { role: "assistant", content: result.reply, places: result.places },
        ]);
        if (driveMode && result.voice_guidance) {
          speak(result.voice_guidance);
        }
      } catch (e) {
        setChat((c) => [
          ...c,
          {
            role: "assistant",
            content: `**Error:** ${e instanceof Error ? e.message : "Search failed"}`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [driveMode, loading],
  );

  const toggleListen = () => {
    const rec = recognitionRef.current;
    if (!rec) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    if (listening) {
      rec.stop();
      setListening(false);
      return;
    }
    setListening(true);
    rec.start();
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#0B0C10] lg:flex-row">
      {/* Map — dominant viewport */}
      <div className="relative order-1 min-h-[min(72vh,100%)] flex-1 lg:order-2 lg:min-h-0">
        <div className="absolute inset-0 z-0">
          <OmniMapView places={places} center={center} selectedIndex={selectedIndex} />
        </div>

        <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-lg border border-emerald-500/20 bg-[#15171E]/90 px-2.5 py-1 text-[10px] text-[#00FF87] backdrop-blur-md">
          {places.length} pin{places.length !== 1 ? "s" : ""} · OpenStreetMap
        </div>

        {/* Drive Mode — bottom-center glass widget */}
        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-[500] flex justify-center px-3">
          <div
            className={cn(
              "pointer-events-auto flex max-w-md flex-wrap items-center justify-center gap-2 rounded-2xl border border-emerald-500/25 px-4 py-2.5",
              "bg-[#15171E]/90 shadow-[0_0_32px_rgba(16,185,129,0.18)] backdrop-blur-md",
            )}
          >
            <button
              type="button"
              onClick={() => setDriveMode((v) => !v)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition",
                driveMode
                  ? "border-[#00FF87]/40 bg-[#10B981]/20 text-[#00FF87] shadow-[0_0_16px_rgba(16,185,129,0.35)]"
                  : "border-emerald-500/30 bg-[#0B0C10]/80 text-[#10B981] hover:border-emerald-400/50 hover:text-[#00FF87]",
              )}
            >
              <Car className="h-4 w-4" />
              Drive Mode
              {driveMode ? <Volume2 className="h-3.5 w-3.5 animate-pulse" /> : null}
            </button>
            {driveMode ? (
              <span className="text-[10px] text-zinc-400">
                Voice guidance · ranked places
              </span>
            ) : null}
          </div>
        </div>

        {/* Mobile: expand chat sheet */}
        <button
          type="button"
          onClick={() => setMobileChatOpen((v) => !v)}
          className="absolute right-3 top-3 z-[500] rounded-lg border border-emerald-500/30 bg-[#15171E]/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#10B981] backdrop-blur-md lg:hidden"
        >
          {mobileChatOpen ? "Hide search" : "Search & chat"}
        </button>
      </div>

      {/* Chat / search rail */}
      <div
        className={cn(
          "order-2 flex min-h-0 flex-col border-emerald-500/15 bg-[#0B0C10]",
          "lg:order-1 lg:w-[min(300px,28%)] lg:shrink-0 lg:border-r",
          mobileChatOpen
            ? "max-h-[min(50vh,480px)] border-t"
            : "max-lg:hidden lg:flex lg:max-h-none",
        )}
      >
        <div className="shrink-0 border-b border-emerald-500/20 bg-[#15171E]/80 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#10B981]" />
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-zinc-100">AI OmniMaps</h2>
              <p className="text-[10px] text-zinc-500">Semantic geo search</p>
            </div>
          </div>
        </div>

        <div className="history-scroll-hover min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
          {chat.length === 0 && (
            <p className="py-6 text-center text-xs leading-relaxed text-zinc-500">
              Try: &quot;Saddar mein best burger shop&quot; or &quot;Nazimabad sports shop&quot;
            </p>
          )}
          {chat.map((line, i) => (
            <div
              key={i}
              className={cn(
                "rounded-xl border p-3 text-sm",
                line.role === "user"
                  ? "ml-2 border-emerald-500/20 bg-emerald-500/10 text-zinc-200"
                  : "mr-1 border-emerald-500/15 bg-[#15171E]/80 text-zinc-300",
              )}
            >
              {line.role === "assistant" ? (
                <>
                  <MarkdownMessage content={line.content} />
                  {line.places && line.places.length > 0 ? (
                    <ul className="mt-2 space-y-1 border-t border-emerald-500/15 pt-2">
                      {line.places.map((p, idx) => (
                        <li key={idx}>
                          <button
                            type="button"
                            onClick={() => setSelectedIndex(idx)}
                            className={cn(
                              "flex w-full items-start gap-2 rounded-lg border px-2 py-2 text-left text-xs transition",
                              selectedIndex === idx
                                ? "border-emerald-500/40 bg-emerald-500/10"
                                : "border-transparent hover:bg-emerald-500/5",
                            )}
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10B981]/20 text-[10px] font-bold text-[#00FF87]">
                              {idx + 1}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="font-medium text-[#00FF87]">{p.name}</span>
                              {p.rating != null ? (
                                <span className="ml-2 text-amber-400/90">★ {p.rating}</span>
                              ) : null}
                              <span className="block text-zinc-500">{p.review_highlight}</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </>
              ) : (
                line.content
              )}
            </div>
          ))}
          {loading ? (
            <div className="flex items-center gap-2 text-xs text-[#10B981]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing map data…
            </div>
          ) : null}
        </div>

        <div className="shrink-0 border-t border-emerald-500/20 bg-[#15171E]/80 p-3">
          <div className="flex gap-2">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Urdu or English place query…"
              rows={2}
              className="min-w-0 flex-1 resize-none rounded-xl border border-emerald-500/20 bg-[#0B0C10]/90 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-[#10B981]/50 focus:ring-1 focus:ring-[#10B981]/30"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void runSearch(query);
                }
              }}
            />
            <div className="flex flex-col gap-1">
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={toggleListen}
                className={cn(
                  "border-emerald-500/30 text-[#10B981] hover:bg-emerald-500/10",
                  listening && "ring-2 ring-red-400/60",
                )}
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
              <Button
                type="button"
                size="icon"
                onClick={() => void runSearch(query)}
                disabled={loading}
                className="border-0 bg-[#10B981] text-[#0B0C10] hover:bg-[#00FF87]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
