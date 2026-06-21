/** Shared Tailwind bundles for right-deck interactive surfaces. */

export const deckSurface =
  "relative z-50 min-h-0 flex-1 pointer-events-auto touch-manipulation isolate";

export const deckPanelScroll =
  "history-scroll-hover relative z-50 flex h-full min-h-0 flex-col gap-2 overflow-y-auto p-3 pointer-events-auto touch-manipulation";

export const deckChip =
  "rounded-lg border border-emerald-500/20 bg-[#0B0C10]/90 transition-all duration-200 hover:border-emerald-500/60 hover:bg-[#15171E]/90 active:scale-[0.98]";

export const deckChipActive =
  "border-emerald-500/60 bg-emerald-500/15 text-[#00FF87] shadow-[0_0_12px_rgba(0,255,135,0.15)]";

export const deckRow =
  "flex w-full cursor-pointer items-center justify-between rounded-lg border border-emerald-500/20 bg-[#0B0C10] px-2.5 py-2 text-left transition-all duration-200 hover:border-emerald-500/60 hover:bg-emerald-500/5 active:scale-[0.99]";

export const deckInput =
  "w-full rounded-lg border border-emerald-500/25 bg-[#0B0C10] px-2 py-1.5 text-[10px] text-zinc-300 outline-none transition-all focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30";

export const deckPrimaryBtn =
  "flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 py-2 text-xs font-semibold text-[#00FF87] transition-all hover:border-emerald-500/60 hover:bg-emerald-500/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";
