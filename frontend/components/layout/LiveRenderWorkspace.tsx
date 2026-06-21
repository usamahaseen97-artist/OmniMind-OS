"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, RefreshCw, Sparkles, X } from "lucide-react";
import {
  PHASE_MS,
  processStateFromElapsed,
  proxiedImageUrl,
  type LiveRenderSession,
  type RenderProcessState,
} from "../../lib/live-render-pipeline";
import { cn } from "../../lib/utils";

interface LiveRenderWorkspaceProps {
  session: LiveRenderSession;
  onProcessStateChange?: (state: RenderProcessState) => void;
  onComplete?: () => void;
  onClose?: () => void;
  className?: string;
}

function NoisyGridCanvas({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      const img = ctx.createImageData(w, h);
      const d = img.data;
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 90 + 20;
        d[i] = v * 0.3;
        d[i + 1] = v * 0.9;
        d[i + 2] = v * 0.45;
        d[i + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full opacity-90"
      aria-hidden
    />
  );
}

export function LiveRenderWorkspace({
  session,
  onProcessStateChange,
  onComplete,
  onClose,
  className,
}: LiveRenderWorkspaceProps) {
  const [tickState, setTickState] = useState<RenderProcessState>("WARM-UP");
  const [imgLoaded, setImgLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [displaySrc, setDisplaySrc] = useState(() =>
    proxiedImageUrl(session.thumbnailUrl ?? session.imageUrl),
  );
  const completedRef = useRef(false);

  const parentFinal = session.processState === "FINAL";

  useEffect(() => {
    setImgLoaded(false);
    setLoadError(false);
    completedRef.current = false;
    const src = proxiedImageUrl(session.thumbnailUrl ?? session.imageUrl);
    setDisplaySrc(src);

    const img = new Image();
    img.onload = () => {
      setImgLoaded(true);
      setLoadError(false);
    };
    img.onerror = () => setLoadError(true);
    img.src = src;

    const tick = () => {
      if (parentFinal) {
        setTickState("FINAL");
        onProcessStateChange?.("FINAL");
        if (imgLoaded && !completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
        return;
      }
      const elapsed = Date.now() - session.startedAt;
      const s = processStateFromElapsed(elapsed);
      setTickState(s);
      onProcessStateChange?.(s);
      if (s === "FINAL" && imgLoaded && !completedRef.current) {
        completedRef.current = true;
        onComplete?.();
      }
    };

    tick();
    const id = window.setInterval(tick, 80);
    const forceFinal = window.setTimeout(() => {
      if (!parentFinal) setTickState("FINAL");
    }, PHASE_MS.buildingEnd + 6000);

    return () => {
      window.clearInterval(id);
      window.clearTimeout(forceFinal);
    };
  }, [
    session.startedAt,
    session.imageUrl,
    session.thumbnailUrl,
    session.processState,
    parentFinal,
    imgLoaded,
    onComplete,
    onProcessStateChange,
    retryCount,
  ]);

  const displayState: RenderProcessState = parentFinal ? "FINAL" : tickState;
  const thumbSrc = proxiedImageUrl(session.thumbnailUrl ?? session.imageUrl);

  const retryLoad = () => {
    setRetryCount((c) => c + 1);
    setLoadError(false);
    const bust = `${thumbSrc}${thumbSrc.includes("?") ? "&" : "?"}t=${Date.now()}`;
    setDisplaySrc(bust);
  };

  return (
    <section
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[#030508]",
        className,
      )}
      aria-label="Active Render Workspace"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,136,0.08),transparent_65%)]" />

      <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-neon-green/15 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-neon-green" />
          <div>
            <h2 className="text-sm font-bold tracking-wide text-white">
              Active Render Workspace
            </h2>
            <p className="text-[10px] text-neon-green/80">
              {session.mode === "inpaint" ? "In-paint · multi-step" : "OmniMind V11 · Live Render"}
            </p>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 p-1.5 text-zinc-500 hover:border-neon-green/30 hover:text-neon-green"
            title="Return to chat"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </header>

      <ProcessStepBar active={displayState} />

      <div className="pointer-events-auto relative z-10 min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3 md:p-5">
        {displayState === "WARM-UP" && (
          <div className="flex h-full flex-col items-center justify-center gap-6 rounded-2xl border border-neon-green/20 bg-[#0a0f0c]/80 p-8">
            <div className="h-48 w-full max-w-lg animate-pulse rounded-xl bg-gradient-to-br from-neon-green/10 via-transparent to-neon-green/5" />
            <Loader2 className="h-10 w-10 animate-spin text-neon-green" />
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-neon-green">
                WARM-UP
              </p>
              <p className="mt-2 text-xs text-zinc-400">{session.contextLabel}</p>
            </div>
          </div>
        )}

        {displayState === "BUILD" && (
          <div className="relative h-full min-h-[320px] overflow-hidden rounded-2xl border border-neon-green/25 bg-black">
            <NoisyGridCanvas active />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              {thumbSrc && !loadError ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={thumbSrc}
                  alt=""
                  className="h-24 w-24 rounded-lg border border-emerald-500/30 object-cover opacity-40 blur-[1px]"
                />
              ) : null}
              <Loader2 className="h-8 w-8 animate-spin text-neon-green" />
              <p className="text-xs font-semibold uppercase tracking-wider text-neon-green/90">
                BUILD
              </p>
              <p className="text-[10px] text-zinc-500">Diffusing · compositing layers…</p>
            </div>
          </div>
        )}

        {displayState === "FINAL" && (
          <div className="relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-neon-green/30 bg-black shadow-[0_0_60px_rgba(0,255,136,0.12)]">
            <div className="flex shrink-0 items-center gap-3 border-b border-emerald-500/15 bg-[#15171E]/90 px-3 py-2">
              {!loadError ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={displaySrc}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-lg border border-emerald-500/40 object-cover shadow-[0_0_12px_rgba(0,255,135,0.2)]"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-900/80">
                  <RefreshCw className="h-4 w-4 text-zinc-600" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[#00FF87]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  FINAL — output ready
                </p>
                <p className="truncate text-[10px] text-zinc-500">{session.contextLabel}</p>
              </div>
            </div>

            <div className="relative min-h-0 flex-1 bg-[#050608]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displaySrc}
                alt={session.prompt}
                className={cn(
                  "h-full w-full object-contain transition-opacity duration-500",
                  loadError ? "opacity-30" : "opacity-100",
                )}
                onLoad={() => {
                  setImgLoaded(true);
                  setLoadError(false);
                }}
                onError={() => {
                  if (retryCount < 3) retryLoad();
                  else setLoadError(true);
                }}
              />
              {loadError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 p-4">
                  <p className="text-xs text-zinc-400">Refreshing high-fidelity asset…</p>
                  <button
                    type="button"
                    onClick={retryLoad}
                    className="inline-flex items-center gap-2 rounded-lg border border-neon-green/40 bg-neon-green/10 px-4 py-2 text-xs font-medium text-neon-green hover:bg-neon-green/20"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Reload thumbnail
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ProcessStepBar({ active }: { active: RenderProcessState }) {
  const steps: RenderProcessState[] = ["WARM-UP", "BUILD", "FINAL"];
  const idx = steps.indexOf(active);
  return (
    <div className="relative z-10 flex shrink-0 gap-2 border-b border-emerald-500/10 px-4 py-2">
      {steps.map((label, i) => (
        <div
          key={label}
          className={cn(
            "flex-1 rounded-full py-1 text-center text-[9px] font-bold uppercase tracking-wider",
            i <= idx
              ? "bg-[#00FF87]/15 text-[#00FF87] shadow-[0_0_12px_rgba(0,255,135,0.12)]"
              : "bg-white/5 text-zinc-600",
          )}
        >
          {label}
        </div>
      ))}
    </div>
  );
}
