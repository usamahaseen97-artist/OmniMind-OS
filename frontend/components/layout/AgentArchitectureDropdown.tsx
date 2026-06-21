"use client";

import { ChevronDown, Cpu } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AGENT_ARCHITECTURE_OPTIONS,
  getAgentArchitectureOption,
  type AgentArchitectureOption,
} from "../../lib/agent-architecture-options";
import type { OmniRouteId } from "../../lib/omni-tools";
import { cn } from "../../lib/utils";

interface AgentArchitectureDropdownProps {
  activeRoute: OmniRouteId | string;
  onSelect: (id: OmniRouteId) => void;
  className?: string;
}

function AgentOptionRow({
  opt,
  selected,
  onPick,
}: {
  opt: AgentArchitectureOption;
  selected: boolean;
  onPick: () => void;
}) {
  const Icon = opt.icon;
  return (
    <li>
      <button
        type="button"
        role="option"
        aria-selected={selected}
        onClick={onPick}
        className={cn(
          "group relative flex w-full items-start gap-3 rounded-xl px-3.5 py-3 text-left transition-all duration-200",
          selected
            ? "bg-emerald-500/15 text-[#00FF87] ring-1 ring-emerald-500/40"
            : "text-zinc-300 hover:bg-emerald-950/40 hover:text-[#00FF87]",
        )}
      >
        <span
          className={cn(
            "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors",
            selected
              ? "border-emerald-500/40 bg-emerald-500/20"
              : "border-gray-700/80 bg-black/20 group-hover:border-emerald-500/30",
          )}
        >
          <Icon
            className={cn(
              "h-4 w-4",
              selected ? "text-[#00FF87]" : "text-zinc-500 group-hover:text-[#10B981]",
            )}
          />
        </span>
        <span className="min-w-0 flex-1 pr-2">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold leading-tight">{opt.label}</span>
            <span
              className={cn(
                "inline-flex max-w-0 translate-x-1 overflow-hidden whitespace-nowrap rounded-md border border-emerald-500/30",
                "bg-emerald-950/60 px-0 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#00FF87]",
                "opacity-0 transition-all duration-300 ease-out",
                "group-hover:max-w-[12rem] group-hover:translate-x-0 group-hover:px-2 group-hover:opacity-100",
                selected && "max-w-[12rem] translate-x-0 px-2 opacity-100",
              )}
            >
              {opt.systemRole}
            </span>
          </span>
          <span className="mt-1 block text-[11px] leading-snug text-zinc-500 group-hover:text-zinc-400">
            {opt.description}
          </span>
        </span>
      </button>
    </li>
  );
}

export function AgentArchitectureDropdown({
  activeRoute,
  onSelect,
  className,
}: AgentArchitectureDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = getAgentArchitectureOption(activeRoute);
  const ActiveIcon = active.icon;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <div ref={rootRef} className={cn("relative z-40", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "agent-selector-glow group flex w-full max-w-lg items-center gap-3 rounded-xl border border-emerald-500/40",
          "bg-[#1E293B]/80 px-3.5 py-3 text-left backdrop-blur-md",
          "ring-1 ring-emerald-500/30 transition-all duration-300",
          "hover:border-emerald-400/55 hover:ring-emerald-500/40",
          open && "border-emerald-400/60 ring-2 ring-emerald-500/35",
        )}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-emerald-500/35 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.25)]">
          <Cpu className="h-5 w-5 text-[#00FF87]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/90">
            Select Agent Architecture
          </span>
          <span className="mt-1 flex items-center gap-2 truncate text-sm font-semibold text-zinc-50">
            <ActiveIcon className="h-4 w-4 shrink-0 text-[#10B981]" />
            <span className="truncate">
              Active: <span className="text-[#00FF87]">{active.activeTitle}</span>
            </span>
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-emerald-400/80 transition-transform duration-300 ease-in-out",
            "group-hover:text-[#00FF87]",
            open && "rotate-180 text-[#00FF87]",
          )}
        />
      </button>

      <div
        role="listbox"
        aria-label="Agent architectures"
        className={cn(
          "absolute left-0 right-0 top-[calc(100%+8px)] z-50 min-w-[min(100%,520px)] origin-top overflow-hidden rounded-2xl",
          "border border-emerald-500/30 bg-[#1E293B]/95 shadow-[0_20px_60px_rgba(0,0,0,0.55),0_0_40px_rgba(16,185,129,0.08)] backdrop-blur-xl",
          "transition-all duration-300 ease-out",
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-[0.97] opacity-0",
        )}
      >
        <div className="border-b border-emerald-500/20 px-4 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-400/80">
            14 Sovereign Architectures
          </p>
        </div>
        <ul className="history-scroll-hover grid max-h-[min(480px,58vh)] grid-cols-1 gap-1 overflow-y-auto p-2 sm:grid-cols-2">
          {AGENT_ARCHITECTURE_OPTIONS.map((opt) => (
            <AgentOptionRow
              key={opt.id}
              opt={opt}
              selected={activeRoute === opt.id}
              onPick={() => {
                try {
                  onSelect(opt.id);
                } catch (error) {
                  console.error("[OmniMind] agent architecture pick failed:", error);
                } finally {
                  close();
                }
              }}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}
