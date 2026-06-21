"use client";

import { useEffect, useState } from "react";
import { Bug, MessageSquare, Sparkles, Wand2 } from "lucide-react";

type FloatingSelection = { text: string; x: number; y: number };

/** Floating toolbar on editor text selection — Explain, Optimize, Refactor. */
export function OmniMindFloatingEditorMenu() {
  const [sel, setSel] = useState<FloatingSelection | null>(null);

  useEffect(() => {
    const onMouseUp = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() ?? "";
      if (!text || text.length < 3) {
        setSel(null);
        return;
      }
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();
      if (!rect) return;
      setSel({ text, x: rect.left + rect.width / 2, y: rect.top - 8 });
    };
    document.addEventListener("mouseup", onMouseUp);
    return () => document.removeEventListener("mouseup", onMouseUp);
  }, []);

  const dispatch = (action: string) => {
    if (!sel) return;
    window.dispatchEvent(
      new CustomEvent("omnimind:ecosystem-agent-prompt", {
        detail: { text: `${action}: ${sel.text.slice(0, 500)}` },
      }),
    );
    setSel(null);
  };

  if (!sel) return null;

  const btn =
    "flex items-center gap-1 rounded-full border border-white/[0.1] bg-[#1a1d26] px-2 py-1 text-[8px] font-medium text-zinc-300 shadow-lg hover:border-cyan-500/40 hover:text-cyan-200";

  return (
    <div
      className="fixed z-[150] flex -translate-x-1/2 -translate-y-full gap-1"
      style={{ left: sel.x, top: sel.y }}
    >
      <button type="button" className={btn} onClick={() => dispatch("Explain")}>
        <MessageSquare className="h-3 w-3" />
        Explain
      </button>
      <button type="button" className={btn} onClick={() => dispatch("Optimize")}>
        <Wand2 className="h-3 w-3" />
        Optimize
      </button>
      <button type="button" className={btn} onClick={() => dispatch("Refactor")}>
        <Sparkles className="h-3 w-3" />
        Refactor
      </button>
      <button type="button" className={btn} onClick={() => dispatch("Fix bugs in")}>
        <Bug className="h-3 w-3" />
        Fix
      </button>
    </div>
  );
}
