"use client";

import { Check, Sparkles } from "lucide-react";
import type { ArchitectChoicePayload } from "../../lib/architect-flow";
import { cn } from "../../lib/utils";

interface ArchitectChoicePanelProps {
  payload: ArchitectChoicePayload;
  selectedId?: string;
  onSelect: (optionId: string) => void;
  onAction?: (actionId: string, actionValue?: string) => void;
  email?: string;
  onEmailChange?: (email: string) => void;
  disabled?: boolean;
  className?: string;
  /** Compact chip buttons for Code Bot right panel */
  variant?: "cards" | "chips";
}

export function ArchitectChoicePanel({
  payload,
  selectedId,
  onSelect,
  onAction,
  email = "",
  onEmailChange,
  disabled = false,
  className,
  variant = "cards",
}: ArchitectChoicePanelProps) {
  const showEmail =
    payload.emailPrompt &&
    selectedId &&
    payload.emailPrompt.showWhen.includes(selectedId);

  const isChips = variant === "chips";

  return (
    <div
      className={cn(
        isChips
          ? "flex flex-col gap-2.5"
          : "rounded-xl border border-emerald-500/25 bg-[#15171E]/90 p-3 shadow-[0_0_24px_rgba(16,185,129,0.08)]",
        className,
      )}
      data-architect-step={payload.step}
      data-architect-phase={payload.phase}
    >
      <div className={cn("flex items-start gap-2", isChips && "px-0.5")}>
        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#10B981]" />
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-emerald-400/80">
            Step {payload.step} · {payload.phase}
          </p>
          <h3 className={cn("font-semibold text-zinc-100", isChips ? "text-xs" : "text-sm")}>
            {payload.title}
          </h3>
          {payload.subtitle ? (
            <p className="mt-0.5 text-[10px] leading-snug text-zinc-500">{payload.subtitle}</p>
          ) : null}
        </div>
      </div>

      {payload.options.length > 0 ? (
        isChips ? (
          <div className="flex flex-wrap gap-1.5">
            {payload.options.map((opt) => {
              const active = selectedId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  disabled={disabled}
                  title={opt.description}
                  onClick={() => onSelect(opt.id)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-[11px] font-semibold transition",
                    active
                      ? "border-emerald-400/60 bg-emerald-500/20 text-[#00FF87] shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                      : "border-white/10 bg-black/30 text-zinc-300 hover:border-emerald-500/35 hover:text-emerald-200",
                    disabled && "pointer-events-none opacity-50",
                    opt.recommended && !active && "ring-1 ring-emerald-500/20",
                  )}
                >
                  {opt.label}
                  {opt.recommended ? (
                    <span className="ml-1 text-[8px] font-normal text-emerald-500/80">★</span>
                  ) : null}
                </button>
              );
            })}
          </div>
        ) : (
          <ul className="mb-2 flex flex-col gap-1">
            {payload.options.map((opt) => {
              const active = selectedId === opt.id;
              return (
                <li key={opt.id}>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect(opt.id)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded-lg border px-2.5 py-1.5 text-left transition",
                      active
                        ? "border-emerald-400/50 bg-emerald-500/15 ring-1 ring-emerald-500/30"
                        : "border-gray-800/60 bg-black/20 hover:border-emerald-500/30 hover:bg-emerald-950/20",
                      disabled && "pointer-events-none opacity-50",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                        active ? "border-[#00FF87] bg-[#00FF87]/20 text-[#00FF87]" : "border-zinc-600",
                      )}
                    >
                      {active ? <Check className="h-2.5 w-2.5" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-semibold text-zinc-100">{opt.label}</span>
                        {opt.recommended ? (
                          <span className="rounded bg-emerald-500/20 px-1 py-0.5 text-[8px] font-bold uppercase text-[#00FF87]">
                            Recommended
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-[10px] leading-snug text-zinc-500">
                        {opt.description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )
      ) : null}

      {showEmail && onEmailChange ? (
        <label className="block">
          <span className="mb-1 block text-[10px] font-medium text-zinc-400">
            {payload.emailPrompt!.label}
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder={payload.emailPrompt!.placeholder}
            disabled={disabled}
            className="w-full rounded-lg border border-gray-800/80 bg-black/30 px-2.5 py-1.5 text-xs text-zinc-100 outline-none focus:border-emerald-500/40"
          />
        </label>
      ) : null}

      {payload.actions?.length ? (
        <div className={cn("flex flex-wrap gap-1.5", isChips ? "pt-0.5" : "pt-1")}>
          {payload.actions.map((action) => (
            <button
              key={action.id}
              type="button"
              disabled={disabled || (action.requiresSelection && !selectedId && !action.value)}
              onClick={() => onAction?.(action.id, action.value)}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-[10px] font-semibold transition",
                action.id.includes("trigger") || action.label.includes("Deploy")
                  ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                  : "border-emerald-500/40 bg-emerald-500/10 text-[#00FF87] hover:bg-emerald-500/20",
                (disabled || (action.requiresSelection && !selectedId && !action.value)) &&
                  "opacity-40",
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
