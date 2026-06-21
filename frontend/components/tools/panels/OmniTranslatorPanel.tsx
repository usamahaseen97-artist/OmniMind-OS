"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeftRight, Languages, Mic, MicOff, Volume2 } from "lucide-react";
import { motion } from "motion/react";
import { fetchLanguages, translateText } from "../../../lib/translate-api";
import type { SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import {
  getToolAccent,
  toolGhostBtn,
  toolInput,
  toolPrimaryBtn,
  toolSelect,
} from "../../../lib/tool-ui-styles";
import { cn } from "../../../lib/utils";

interface OmniTranslatorPanelProps {
  tool: SovereignToolDef;
}

export function OmniTranslatorPanel({ tool }: OmniTranslatorPanelProps) {
  const accent = getToolAccent(tool.slug);
  const [langs, setLangs] = useState<{ code: string; name: string }[]>([]);
  const [from, setFrom] = useState("en");
  const [to, setTo] = useState("ur");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetchLanguages().then((l) => {
      if (l?.length) setLangs(l.map((x) => ({ code: x.code, name: x.label })));
      else setLangs([{ code: "en", name: "English" }, { code: "ur", name: "Urdu" }, { code: "zh", name: "Chinese" }]);
    });
  }, []);

  const runTranslate = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    setBusy(true);
    try {
      const res = await translateText({ text, source_lang: from, target_lang: to });
      setOutput(res.translated_text ?? "");
    } catch {
      setOutput("(Translation service — ensure backend /translate is running on port 8001)");
    } finally {
      setBusy(false);
    }
  }, [from, input, to]);

  const toggleMic = () => {
    if (typeof window === "undefined" || !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setInput((p) => p + " [voice input requires Chrome/Edge]");
      return;
    }
    const SR = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
      || (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) return;
    if (listening) {
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = from === "ur" ? "ur-PK" : from === "zh" ? "zh-CN" : "en-US";
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const t = e.results[0]?.[0]?.transcript ?? "";
      setInput(t);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  };

  const speak = () => {
    if (!output || typeof window === "undefined") return;
    const u = new SpeechSynthesisUtterance(output);
    u.lang = to === "ur" ? "ur-PK" : to === "zh" ? "zh-CN" : "en-US";
    window.speechSynthesis.speak(u);
  };

  const swapLangs = () => {
    setFrom(to);
    setTo(from);
    setInput(output);
    setOutput(input);
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#0B0C10]">
      <header className="relative shrink-0 overflow-hidden border-b border-emerald-500/15 bg-gradient-to-r from-[#15171E] via-[#12151c] to-[#0B0C10] px-5 py-4">
        <div className={cn("pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-40 blur-2xl", accent.glow)} />
        <div className="relative flex items-center gap-3">
          <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl border bg-black/30", accent.ring)}>
            <Languages className={cn("h-5 w-5", accent.text)} />
          </div>
          <div>
            <h1 className="text-base font-bold text-zinc-50">{tool.name}</h1>
            <p className="text-[11px] text-zinc-400">{tool.tagline} — real-time bilingual bridge</p>
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 md:grid-cols-2">
        <section className="flex min-h-0 flex-col border-b border-emerald-500/10 bg-gradient-to-b from-[#0d100e] to-[#0B0C10] p-5 md:border-b-0 md:border-r">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500/30 to-sky-600/10 text-sm font-bold text-sky-300">
              A
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-200">Speaker A</p>
              <p className="text-[10px] text-zinc-600">Source language</p>
            </div>
          </div>
          <div className="mb-3 flex flex-wrap gap-2">
            <select value={from} onChange={(e) => setFrom(e.target.value)} className={toolSelect}>
              {langs.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={toggleMic}
              className={cn(
                "flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition",
                listening
                  ? "border-red-500/40 bg-red-500/10 text-red-300"
                  : "border-emerald-500/35 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15",
              )}
            >
              {listening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
              {listening ? "Listening…" : "Voice input"}
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            placeholder="Speak or type in language A…"
            className={cn(toolInput, "min-h-[180px] flex-1 resize-none")}
          />
        </section>

        <section className="flex min-h-0 flex-col bg-gradient-to-b from-[#0a0d0c] to-[#0B0C10] p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-lime-500/30 to-lime-600/10 text-sm font-bold text-lime-300">
                B
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-200">Speaker B</p>
                <p className="text-[10px] text-zinc-600">Target language</p>
              </div>
            </div>
            <button
              type="button"
              onClick={swapLangs}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-zinc-500 transition hover:border-emerald-500/30 hover:text-emerald-400"
              title="Swap languages"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </button>
          </div>
          <select value={to} onChange={(e) => setTo(e.target.value)} className={cn(toolSelect, "mb-3 w-fit")}>
            {langs.map((l) => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
          <motion.div
            layout
            className="min-h-[180px] flex-1 rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/30 to-black/40 p-4 text-sm leading-relaxed text-[#00FF87] shadow-[inset_0_0_30px_rgba(16,185,129,0.06)]"
          >
            {busy ? (
              <span className="flex items-center gap-2 text-zinc-400">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                Translating…
              </span>
            ) : (
              output || "Translation appears here instantly for face-to-face meetings."
            )}
          </motion.div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => void runTranslate()} disabled={busy} className={toolPrimaryBtn}>
              Translate now
            </button>
            <button type="button" onClick={speak} className={cn(toolGhostBtn, "flex items-center gap-1.5")}>
              <Volume2 className="h-3.5 w-3.5" /> Speak aloud
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
