/** Shared visual tokens for sovereign tool pages — design only. */

export const toolPageBg =
  "relative bg-[#0B0C10] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]";

export const toolGlassPanel =
  "rounded-xl border border-emerald-500/15 bg-[#15171E]/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm";

export const toolGlassPanelStrong =
  "rounded-xl border border-emerald-500/20 bg-gradient-to-br from-[#15171E]/90 to-[#0d1210]/90 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-md";

export const toolSectionLabel =
  "text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400/70";

export const toolCard =
  "rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-emerald-500/25 hover:bg-emerald-500/[0.03]";

export const toolPrimaryBtn =
  "rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-[0_4px_14px_rgba(16,185,129,0.35)] transition hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50";

export const toolGhostBtn =
  "rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-[11px] font-medium text-emerald-300 transition hover:border-emerald-400/50 hover:bg-emerald-500/10";

export const toolInput =
  "rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/20";

export const toolSelect =
  "rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-zinc-200 outline-none focus:border-emerald-500/40";

export const toolMetricOk =
  "rounded-xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/10 to-transparent p-4 shadow-[0_0_20px_rgba(16,185,129,0.06)]";

export const toolMetricWarn =
  "rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent p-4 shadow-[0_0_20px_rgba(245,158,11,0.08)]";

export const toolPanelHeader =
  "flex items-center gap-2 border-b border-emerald-500/15 bg-gradient-to-r from-emerald-500/[0.06] to-transparent px-4 py-3";

export const TOOL_ACCENT: Record<string, { glow: string; ring: string; text: string }> = {
  "omniforge-engine": { glow: "from-cyan-500/20", ring: "ring-cyan-500/30", text: "text-cyan-300" },
  "architectural-designer": { glow: "from-emerald-500/20", ring: "ring-emerald-500/30", text: "text-emerald-300" },
  "interior-landscape": { glow: "from-teal-500/20", ring: "ring-teal-500/30", text: "text-teal-300" },
  "medical-diagnostic": { glow: "from-rose-500/20", ring: "ring-rose-500/30", text: "text-rose-300" },
  "quantum-trading": { glow: "from-amber-500/20", ring: "ring-amber-500/30", text: "text-amber-300" },
  "creative-visionary": { glow: "from-fuchsia-500/20", ring: "ring-fuchsia-500/30", text: "text-fuchsia-300" },
  "business-analytics": { glow: "from-sky-500/20", ring: "ring-sky-500/30", text: "text-sky-300" },
  "vfx-master": { glow: "from-purple-500/20", ring: "ring-purple-500/30", text: "text-purple-300" },
  "nasa-solver": { glow: "from-orange-500/20", ring: "ring-orange-500/30", text: "text-orange-300" },
  omnimap: { glow: "from-emerald-500/20", ring: "ring-emerald-500/30", text: "text-emerald-300" },
  omnimusic: { glow: "from-pink-500/20", ring: "ring-pink-500/30", text: "text-pink-300" },
  omnitv: { glow: "from-red-500/20", ring: "ring-red-500/30", text: "text-red-300" },
  omnimovies: { glow: "from-indigo-500/20", ring: "ring-indigo-500/30", text: "text-indigo-300" },
  omnitranslator: { glow: "from-lime-500/20", ring: "ring-lime-500/30", text: "text-lime-300" },
};

export function getToolAccent(slug: string) {
  return TOOL_ACCENT[slug] ?? TOOL_ACCENT["architectural-designer"];
}

/** Sidebar groupings — design labels only */
export const TOOL_SIDEBAR_GROUPS: { label: string; slugs: string[] }[] = [
  { label: "Build & Deploy", slugs: ["omniforge-engine"] },
  { label: "Design & Space", slugs: ["architectural-designer", "interior-landscape"] },
  { label: "Intelligence", slugs: ["medical-diagnostic", "quantum-trading", "business-analytics", "nasa-solver"] },
  { label: "Creative Studio", slugs: ["creative-visionary", "vfx-master"] },
  { label: "Omni Entertainment", slugs: ["omnimap", "omnimusic", "omnitv", "omnimovies", "omnitranslator"] },
];
