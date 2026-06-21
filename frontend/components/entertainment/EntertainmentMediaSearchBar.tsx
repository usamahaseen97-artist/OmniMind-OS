"use client";

import { Search, Sparkles } from "lucide-react";
import type { FormEvent } from "react";
import { cn } from "../../lib/utils";

interface EntertainmentMediaSearchBarProps {
  engineLabel: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (query: string) => void;
  hint?: string;
  className?: string;
}

/**
 * Top semantic search for macro-engines — isolated from General Chatbot chat/MongoDB.
 */
export function EntertainmentMediaSearchBar({
  engineLabel,
  placeholder,
  value,
  onChange,
  onSubmit,
  hint,
  className,
}: EntertainmentMediaSearchBarProps) {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.(value.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "shrink-0 border-b border-gray-800/60 bg-gradient-to-r from-[#15171E] via-[#0B0C10] to-[#15171E] px-4 py-3",
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#10B981]" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/90">
          {engineLabel} · Media Intelligence
        </span>
      </div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-2xl border border-emerald-500/25 bg-black/40 p-1.5",
          "shadow-[0_0_24px_rgba(16,185,129,0.08)] backdrop-blur-md focus-within:border-emerald-500/45 focus-within:ring-1 focus-within:ring-emerald-500/25",
        )}
      >
        <Search className="ml-2 h-4 w-4 shrink-0 text-[#10B981]/70" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
          aria-label={`Search ${engineLabel}`}
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-[#10B981] px-4 py-2 text-xs font-semibold text-[#0B0C10] transition hover:bg-[#00FF87]"
        >
          Filter
        </button>
      </div>
      {hint ? <p className="mt-2 text-[10px] text-zinc-600">{hint}</p> : null}
    </form>
  );
}
