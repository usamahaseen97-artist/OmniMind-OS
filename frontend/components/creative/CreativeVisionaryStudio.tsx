"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Film, ImageIcon, Sparkles } from "lucide-react";
import {
  CREATIVE_GEN_MODES,
  IMAGE_BATCH_COUNTS,
  IMAGE_FOCUS_CHIPS,
  IMAGE_VARIATION_LABELS,
  VIDEO_DURATION_SEC,
  VIDEO_FOCUS_CHIPS,
  buildImageGradients,
  type CreativeGenMode,
  type ImageBatchCount,
  type VideoDurationSec,
} from "../../lib/creative-visionary-config";
import { appendWorkbenchPrompt } from "../../lib/workbench-prompt-bridge";
import { useWorkbenchLive } from "../../lib/workbench-live-store";
import { AgentChatConsole } from "../ide/workspace/AgentChatConsole";
import { cn } from "../../lib/utils";

const fade = { duration: 0.2, ease: "easeInOut" as const };

interface CreativeVisionaryStudioProps {
  routeId: string;
}

export function CreativeVisionaryStudio({ routeId }: CreativeVisionaryStudioProps) {
  const live = useWorkbenchLive();
  const lastHandledPrompt = useRef("");

  const [mode, setMode] = useState<CreativeGenMode>("video");
  const [duration, setDuration] = useState<VideoDurationSec>(15);
  const [batchCount, setBatchCount] = useState<ImageBatchCount>(3);
  const [imageGradients, setImageGradients] = useState<string[]>([]);
  const [showVideoPreview, setShowVideoPreview] = useState(false);

  useEffect(() => {
    const p = live.lastPrompt?.trim();
    if (!p || p === lastHandledPrompt.current) return;
    lastHandledPrompt.current = p;

    if (mode === "image") {
      setImageGradients(buildImageGradients(p, batchCount));
      setShowVideoPreview(false);
    } else {
      setImageGradients([]);
      setShowVideoPreview(true);
    }
  }, [batchCount, live.lastPrompt, mode]);

  const pillBtn = (active: boolean) =>
    cn(
      "omni-state-ring rounded-full border px-3 py-1.5 text-[10px] font-semibold transition",
      active ? "omni-accent-bg border-[#1E293B] text-[var(--omni-text)]" : "border-[#1E293B] text-[var(--omni-text-muted)] hover:brightness-110",
    );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden" style={{ background: "#0B0F19" }}>
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-6 sm:px-8 sm:py-8">
          <motion.div
            layout
            className="mb-6 w-full rounded-2xl border p-5 sm:p-6"
            style={{
              borderColor: "#1E293B",
              background: "linear-gradient(165deg, #111827 0%, #0B0F19 55%, #0d1220 100%)",
            }}
          >
            <div className="mb-4 flex items-center justify-center gap-2">
              <Sparkles className="h-4 w-4 omni-accent-text" />
              <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] omni-accent-text">
                Generative Mode Matrix
              </p>
            </div>

            <div
              className="mb-4 flex flex-wrap justify-center gap-1 rounded-xl border p-1"
              style={{ borderColor: "#1E293B", background: "#0B0F19" }}
              role="tablist"
            >
              {CREATIVE_GEN_MODES.map((m) => {
                const on = mode === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setMode(m.id)}
                    className={cn(
                      "relative rounded-lg px-4 py-2 text-[10px] font-semibold transition",
                      on ? "text-[var(--omni-text)]" : "text-[var(--omni-text-muted)]",
                    )}
                  >
                    {on ? (
                      <motion.span
                        layoutId="creative-gen-mode-pill"
                        className="absolute inset-0 rounded-lg omni-accent-bg"
                        style={{ border: "1px solid #1E293B" }}
                        transition={{ type: "spring", stiffness: 480, damping: 34 }}
                      />
                    ) : null}
                    <span className="relative z-10 whitespace-nowrap">
                      {m.icon} {m.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {mode === "video" ? (
                <motion.div
                  key="video-controls"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={fade}
                  className="space-y-3"
                >
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {VIDEO_FOCUS_CHIPS.map((c) => (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => appendWorkbenchPrompt(c.prompt)}
                        className={pillBtn(false)}
                        style={{ borderColor: "#1E293B" }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {VIDEO_DURATION_SEC.map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => setDuration(sec)}
                        className={pillBtn(duration === sec)}
                        style={{ borderColor: "#1E293B" }}
                      >
                        {sec} Seconds
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="image-controls"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={fade}
                  className="space-y-3"
                >
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {IMAGE_FOCUS_CHIPS.map((c) => (
                      <button
                        key={c.label}
                        type="button"
                        onClick={() => appendWorkbenchPrompt(c.prompt)}
                        className={pillBtn(false)}
                        style={{ borderColor: "#1E293B" }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {IMAGE_BATCH_COUNTS.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setBatchCount(n)}
                        className={pillBtn(batchCount === n)}
                        style={{ borderColor: "#1E293B" }}
                      >
                        {n} Pic{n > 1 ? "s" : ""}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            layout
            className="mb-6 h-[min(56vh,560px)] min-h-[360px] w-full overflow-hidden rounded-2xl border"
            style={{ borderColor: "#1E293B" }}
          >
            <AgentChatConsole routeId={routeId} toolSlug="creative-visionary" />
          </motion.div>

          <AnimatePresence mode="wait">
            {mode === "image" && imageGradients.length > 0 ? (
              <motion.div
                key="image-grid"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={fade}
                className="w-full"
              >
                <p className="mb-3 text-center text-[9px] font-bold uppercase tracking-wider omni-accent-text">
                  Batch rendering matrix · {imageGradients.length} variations
                </p>
                <div
                  className={cn(
                    "grid gap-3",
                    imageGradients.length === 1 && "mx-auto max-w-md grid-cols-1",
                    imageGradients.length === 2 && "grid-cols-2",
                    imageGradients.length >= 3 && "grid-cols-2 sm:grid-cols-3",
                    imageGradients.length === 5 && "sm:grid-cols-3 lg:grid-cols-5",
                  )}
                >
                  {imageGradients.map((gradient, i) => (
                    <motion.div
                      key={gradient}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06, duration: 0.25 }}
                      className="relative aspect-[4/5] overflow-hidden rounded-xl border"
                      style={{ borderColor: "#1E293B" }}
                    >
                      <div className="absolute inset-0" style={{ background: gradient }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <ImageIcon className="mb-1 h-4 w-4 text-white/70" />
                        <p className="text-[9px] font-semibold text-white">{IMAGE_VARIATION_LABELS[i]}</p>
                        <p className="mt-0.5 line-clamp-2 text-[8px] text-white/60">{live.lastPrompt}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : null}

            {mode === "video" && showVideoPreview ? (
              <motion.div
                key="video-preview"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={fade}
                className="w-full max-w-3xl"
              >
                <div
                  className="relative aspect-video overflow-hidden rounded-2xl border"
                  style={{ borderColor: "#1E293B", background: "#111827" }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
                    <Film className="h-10 w-10 omni-accent-text opacity-80" />
                    <p className="text-[11px] font-bold uppercase tracking-wider omni-accent-text">
                      {duration}s Cinematic Scene · Rendering
                    </p>
                    <p className="max-w-md text-[10px] leading-relaxed" style={{ color: "var(--omni-text-muted)" }}>
                      {live.lastPrompt}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
