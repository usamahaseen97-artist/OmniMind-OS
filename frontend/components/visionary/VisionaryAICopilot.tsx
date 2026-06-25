"use client";

import { GripHorizontal, Minimize2, Send, Sparkles, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { useVisionaryStudio } from "../../lib/visionary";

const QUICK_ACTIONS = [
  "Explain the active tool",
  "Add a title layer at playhead",
  "Organize timeline tracks",
  "Suggest export preset",
];

export function VisionaryAICopilot() {
  const {
    copilotOpen,
    setCopilotOpen,
    copilotMessages,
    sendCopilotMessage,
    activeModule,
    project,
    playheadFrame,
  } = useVisionaryStudio();

  const [input, setInput] = useState("");
  const [pos, setPos] = useState({ x: 24, y: 80 });
  const dragRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const onSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const text = input.trim();
      if (!text) return;
      sendCopilotMessage(text);
      setInput("");
    },
    [input, sendCopilotMessage],
  );

  const onDragStart = useCallback(
    (e: React.PointerEvent) => {
      dragRef.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
      panelRef.current?.setPointerCapture(e.pointerId);
    },
    [pos.x, pos.y],
  );

  const onDragMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current) return;
    setPos({
      x: Math.max(8, dragRef.current.px + (e.clientX - dragRef.current.x)),
      y: Math.max(48, dragRef.current.py + (e.clientY - dragRef.current.y)),
    });
  }, []);

  const onDragEnd = useCallback(() => {
    dragRef.current = null;
  }, []);

  if (!copilotOpen) return null;

  return (
    <div
      ref={panelRef}
      className="visionary-copilot fixed z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-cyan-500/25 bg-[#0c1018]/95 shadow-2xl shadow-black/50 backdrop-blur-xl"
      style={{ right: pos.x, bottom: pos.y }}
      role="dialog"
      aria-label="Visionary AI Copilot"
    >
      <div
        className="flex cursor-grab items-center justify-between border-b border-white/[0.06] bg-cyan-500/5 px-3 py-2 active:cursor-grabbing"
        onPointerDown={onDragStart}
        onPointerMove={onDragMove}
        onPointerUp={onDragEnd}
      >
        <div className="flex items-center gap-2">
          <GripHorizontal size={12} className="text-slate-600" />
          <Sparkles size={14} className="text-cyan-400" />
          <div>
            <p className="text-[10px] font-semibold text-slate-200">Visionary Copilot</p>
            <p className="text-[8px] text-slate-500">{activeModule.replace(/-/g, " ")} · frame {playheadFrame}</p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setCopilotOpen(false)}
            className="rounded p-1 text-slate-500 hover:bg-white/[0.06] hover:text-slate-300"
            aria-label="Minimize copilot"
          >
            <Minimize2 size={12} />
          </button>
          <button
            type="button"
            onClick={() => setCopilotOpen(false)}
            className="rounded p-1 text-slate-500 hover:bg-white/[0.06] hover:text-slate-300"
            aria-label="Close copilot"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      <div className="max-h-52 min-h-[120px] flex-1 overflow-y-auto p-3 space-y-2">
        {copilotMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "rounded-lg px-2.5 py-2 text-[10px] leading-relaxed",
              msg.role === "user"
                ? "ml-4 bg-white/[0.06] text-slate-200"
                : "mr-2 border border-cyan-500/15 bg-cyan-500/5 text-slate-300",
            )}
          >
            {msg.content}
          </div>
        ))}
      </div>

      <div className="flex shrink-0 flex-wrap gap-1 border-t border-white/[0.04] px-2 py-1.5">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action}
            type="button"
            onClick={() => sendCopilotMessage(action)}
            className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[8px] text-slate-400 hover:border-cyan-500/30 hover:text-cyan-200"
          >
            {action}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex shrink-0 gap-1 border-t border-white/[0.06] p-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${project.name}…`}
          className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-black/40 px-2 py-1.5 text-[10px] text-slate-200 outline-none focus:border-cyan-500/40"
        />
        <button
          type="submit"
          className="rounded-lg bg-cyan-500/20 px-2.5 text-cyan-200 hover:bg-cyan-500/30"
          aria-label="Send"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
