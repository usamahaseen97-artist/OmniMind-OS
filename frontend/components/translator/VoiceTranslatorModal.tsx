"use client";

import { Languages, Mic, MicOff, Radio, Volume2, Waves, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslatorBridgeState } from "../../hooks/useTranslatorBridgeState";
import {
  applyLanguagePair,
  pushAudioBufferChunk,
  setTranslatorLanguages,
  setTranslatorMatrixMode,
  TRANSLATOR_LANGUAGE_PAIRS,
  type TranslatorMatrixMode,
} from "../../lib/translator-bridge";
import { fetchLanguages, translateText, type LanguageOption } from "../../lib/translate-api";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

interface VoiceTranslatorModalProps {
  open: boolean;
  onClose: () => void;
}

function speakTranslation(text: string, langCode: string) {
  if (!text || typeof window === "undefined") return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  const langMap: Record<string, string> = {
    en: "en-US",
    de: "de-DE",
    ar: "ar-SA",
    fr: "fr-FR",
    es: "es-ES",
    ur: "ur-PK",
    "ur-roman": "ur-PK",
    zh: "zh-CN",
  };
  u.lang = langMap[langCode] ?? "en-US";
  u.rate = 0.92;
  window.speechSynthesis.speak(u);
}

/** Stub audio chunk for auto-detect pipeline readiness. */
function stubAudioChunkB64(): string {
  return btoa(`omnimind-chunk-${Date.now()}`);
}

export function VoiceTranslatorModal({ open, onClose }: VoiceTranslatorModalProps) {
  const bridge = useTranslatorBridgeState();
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [matrixMode, setMatrixMode] = useState<TranslatorMatrixMode>("manual");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("ur");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (open) fetchLanguages().then(setLanguages).catch(() => {});
  }, [open]);

  useEffect(() => {
    setMatrixMode(bridge.mode);
    setSourceLang(bridge.sourceLang);
    setTargetLang(bridge.targetLang);
  }, [bridge.mode, bridge.sourceLang, bridge.targetLang]);

  const doTranslate = useCallback(
    async (text?: string) => {
      const src = (text ?? input).trim();
      if (!src) return;
      setLoading(true);
      try {
        const result = await translateText({
          text: src,
          source_lang: matrixMode === "auto" ? "auto" : sourceLang,
          target_lang: targetLang,
          mode: "speech",
        });
        setOutput(
          result.urdu_script && targetLang === "ur"
            ? result.urdu_script
            : result.translated_text,
        );
        speakTranslation(result.translated_text, targetLang);
      } catch (e) {
        setOutput(e instanceof Error ? e.message : "Translation failed");
      } finally {
        setLoading(false);
      }
    },
    [input, sourceLang, targetLang, matrixMode],
  );

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = matrixMode === "auto";
    rec.interimResults = matrixMode === "auto";
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[e.results.length - 1]?.[0]?.transcript ?? "";
      if (matrixMode === "auto") {
        pushAudioBufferChunk(stubAudioChunkB64());
      }
      if (text && e.results[e.results.length - 1]?.isFinal) {
        setInput(text);
        setListening(false);
        if (matrixMode === "auto") setSourceLang("auto");
        void doTranslate(text);
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, [targetLang, sourceLang, matrixMode, doTranslate]);

  const selectMode = (mode: TranslatorMatrixMode) => {
    setMatrixMode(mode);
    setTranslatorMatrixMode(mode);
    if (mode === "auto") {
      setSourceLang("auto");
      setTranslatorLanguages("auto", targetLang);
    }
  };

  const selectPair = (pairId: string) => {
    const pair = TRANSLATOR_LANGUAGE_PAIRS.find((p) => p.id === pairId);
    if (!pair) return;
    applyLanguagePair(pair);
    setSourceLang(pair.source);
    setTargetLang(pair.target);
    setMatrixMode(pair.source === "auto" ? "auto" : "manual");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-end p-3 pt-16 md:p-6 md:pt-20">
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close translator"
      />
      <div className="relative w-full max-w-md animate-fade-in rounded-2xl border border-emerald-500/25 bg-[#0D0E12]/95 p-4 shadow-[0_0_48px_rgba(16,185,129,0.15)] backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-[#10B981]" />
            <span className="text-sm font-bold text-zinc-100">Voice Translator Matrix</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-500">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-3 flex gap-1 rounded-xl border border-emerald-500/20 bg-[#0B0C10] p-1">
          <button
            type="button"
            onClick={() => selectMode("manual")}
            className={cn(
              "flex-1 rounded-lg py-2 text-[10px] font-semibold uppercase tracking-wider transition",
              matrixMode === "manual"
                ? "bg-emerald-500/20 text-[#00FF87]"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            Manual A ⇄ B
          </button>
          <button
            type="button"
            onClick={() => selectMode("auto")}
            className={cn(
              "flex-1 rounded-lg py-2 text-[10px] font-semibold uppercase tracking-wider transition",
              matrixMode === "auto"
                ? "bg-emerald-500/20 text-[#00FF87]"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            Auto-detect
          </button>
        </div>

        {matrixMode === "manual" ? (
          <div className="mb-3 flex flex-wrap gap-1">
            {TRANSLATOR_LANGUAGE_PAIRS.map((pair) => (
              <button
                key={pair.id}
                type="button"
                onClick={() => selectPair(pair.id)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[10px] transition",
                  bridge.activePairId === pair.id
                    ? "border-emerald-500/50 bg-emerald-500/15 text-[#00FF87]"
                    : "border-emerald-500/20 text-zinc-500 hover:border-emerald-500/40",
                )}
              >
                {pair.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="mb-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-3">
            <div className="mb-2 flex items-center justify-between gap-2 text-[10px] font-semibold uppercase text-[#10B981]">
              <span className="flex items-center gap-2">
                <Waves className="h-4 w-4" />
                Audio buffer bridge
              </span>
              <span className="text-zinc-500">{bridge.audioChunks} chunks</span>
            </div>
            <div className="flex h-8 items-end justify-center gap-0.5">
              {Array.from({ length: 24 }, (_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-t bg-[#10B981]/70"
                  style={{
                    height: `${listening ? 20 + Math.random() * 80 : 15 + (i % 5) * 12}%`,
                  }}
                />
              ))}
            </div>
            <p className="mt-2 flex items-center gap-1 text-[10px] text-zinc-500">
              <Radio className="h-3 w-3" />
              POST /api/agents/translator/bridge · ready for streaming chunks
            </p>
          </div>
        )}

        <div className="mb-3 grid grid-cols-2 gap-2">
          <label className="text-[10px] uppercase text-zinc-600">
            From
            <select
              value={sourceLang}
              onChange={(e) => {
                setSourceLang(e.target.value);
                setTranslatorLanguages(e.target.value, targetLang);
              }}
              disabled={matrixMode === "auto"}
              className="mt-1 w-full rounded-lg border border-emerald-500/20 bg-[#0B0C10] px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-[#10B981]/50 disabled:opacity-60"
            >
              <option value="auto">Auto detect</option>
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-[10px] uppercase text-zinc-600">
            To
            <select
              value={targetLang}
              onChange={(e) => {
                setTargetLang(e.target.value);
                setTranslatorLanguages(sourceLang, e.target.value);
              }}
              className="mt-1 w-full rounded-lg border border-emerald-500/20 bg-[#0B0C10] px-2 py-1.5 text-xs text-zinc-200 outline-none focus:border-[#10B981]/50"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.native} ({l.label})
                </option>
              ))}
            </select>
          </label>
        </div>

        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Speak or type — matrix routes to translate API…"
          rows={3}
          className="mb-2 w-full resize-none rounded-xl border border-emerald-500/20 bg-[#0B0C10] px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-[#10B981]/50"
        />

        <div className="mb-3 flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 gap-1 border-emerald-500/30 text-[#10B981] hover:bg-emerald-500/10"
            onClick={() => {
              const rec = recognitionRef.current;
              if (!rec) return;
              if (listening) {
                rec.stop();
                setListening(false);
                return;
              }
              if (matrixMode === "auto") {
                pushAudioBufferChunk(stubAudioChunkB64());
              }
              rec.lang =
                sourceLang === "ur" || sourceLang === "ur-roman" ? "ur-PK" : "en-US";
              setListening(true);
              rec.start();
            }}
          >
            {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            Voice in
          </Button>
          <Button
            type="button"
            className="flex-1 border-0 bg-[#10B981] text-[#0B0C10] hover:bg-[#00FF87]"
            onClick={() => void doTranslate()}
            disabled={loading}
          >
            Translate
          </Button>
        </div>

        {output ? (
          <div className="rounded-xl border border-emerald-500/20 bg-[#15171E]/80 p-3">
            <p className="mb-1 text-[10px] uppercase text-zinc-600">Translation</p>
            <p
              className="text-sm leading-relaxed text-zinc-200"
              dir={targetLang === "ur" ? "rtl" : "ltr"}
            >
              {output}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 gap-1 text-xs text-[#10B981]"
              onClick={() => speakTranslation(output, targetLang)}
            >
              <Volume2 className="h-3.5 w-3.5" /> Play audio
            </Button>
          </div>
        ) : null}

        <p className="mt-2 text-[10px] text-zinc-600">
          Bridge: {bridge.mode} · {bridge.sourceLang} → {bridge.targetLang} · Sovereign stream
          unchanged
        </p>
      </div>
    </div>
  );
}
