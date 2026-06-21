/** Tailwind class bundles for OmniMind cross-device layout (mobile → tablet → laptop). */

export const sovereignGrid =
  "flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden";

export const sovereignMainColumn = "min-h-0 min-w-0 flex-1 overflow-hidden";

/** Main stage + live deck: 75% / 25% on desktop; stacked on mobile. */
export const sandboxSplit = [
  "relative flex h-full min-h-0 flex-1 flex-col overflow-hidden",
  "lg:flex-row",
].join(" ");

export const sandboxMainPane = [
  "flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
  "max-lg:min-h-0 max-lg:flex-1",
  "lg:w-3/4 lg:max-w-[75%] lg:flex-[3]",
].join(" ");

export const sandboxDeckShell = [
  "relative z-[60] flex min-h-0 min-w-0 flex-col overflow-hidden pointer-events-auto touch-manipulation isolate",
  "max-lg:shrink-0 max-lg:border-t",
  "lg:w-1/4 lg:min-w-[280px] lg:max-w-[25%] lg:flex-[1] lg:border-t-0 lg:border-l",
].join(" ");

/** @deprecated use sandboxMainPane */
export const sandboxChatPane = sandboxMainPane;

/** @deprecated use sandboxDeckShell */
export const sandboxDeckPane = sandboxDeckShell;

export const entertainmentStack = [
  "flex h-full min-h-0 w-full max-w-full flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain",
].join(" ");

export const cardStackOnMobile = "flex flex-col gap-3 max-lg:p-3 lg:gap-0 lg:p-0";

/** Upper macro-engine strip (OmniMusic · OmniMovies · OmniTV · OmniCharge) */
export const macroEngineToolbar = [
  "flex shrink-0 w-full max-w-full min-w-0 items-center justify-center gap-1",
  "border-b border-emerald-500/15 bg-[#0B0C10]/95 px-2 py-1 backdrop-blur-md",
  "overflow-x-auto overflow-y-hidden overscroll-x-contain",
].join(" ");

/** Unified header chrome — compact toolbar */
export const appHeaderBar = [
  "relative z-30 grid h-9 max-h-9 shrink-0 w-full max-w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_minmax(0,auto)] items-center gap-0.5 overflow-hidden",
  "border-b border-emerald-500/20 bg-[#15171E]/90 px-1.5 py-0 backdrop-blur-md",
  "sm:gap-1 sm:px-2",
].join(" ");

/** Horizontal carousels — scroll inside viewport, no page overflow */
export const entertainmentHorizontalRail = [
  "entertainment-horizontal-rail relative min-w-0 w-full max-w-full overflow-hidden",
  "[contain:inline-size]",
].join(" ");

export const entertainmentHorizontalScroll = [
  "history-scroll-hover flex w-full min-w-0 max-w-full gap-3 overflow-x-auto overflow-y-hidden overscroll-x-contain pb-2 scroll-smooth",
  "snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:thin]",
].join(" ");

export const appHeaderActions = [
  "flex min-w-0 max-w-full shrink flex-row flex-wrap items-center justify-end gap-0.5 overflow-visible",
  "sm:gap-1",
].join(" ");

/** Top-left ☰ — single horizontal row, no overlap. */
export const commandRailCluster =
  "flex shrink-0 flex-row flex-nowrap items-center gap-3";

/** Title row with optional ← aligned inline. */
export const headerTitleCluster =
  "flex min-w-0 flex-1 flex-row flex-nowrap items-center gap-2 sm:gap-3";

export const commandRailButton = [
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
  "border border-emerald-500/30 bg-[#0B0C10]/80 text-[#10B981]",
  "backdrop-blur-md transition-all duration-200",
  "hover:border-emerald-400/50 hover:bg-[#15171E] hover:text-[#00FF87]",
  "hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]",
].join(" ");
