import type { LucideIcon } from "lucide-react";
import { Film, LayoutDashboard, Map, Music, Tv, Zap } from "lucide-react";

export type AppViewId =
  | "sovereign-core"
  | "omnimusic"
  | "omnimovies"
  | "omnistream"
  | "omnitv"
  | "omnicharge"
  | "omnimap";

export type AppView = {
  id: AppViewId;
  label: string;
  tagline: string;
  icon: LucideIcon;
  accent: string;
};

export const APP_VIEWS: AppView[] = [
  {
    id: "sovereign-core",
    label: "Neural Chatbot",
    tagline: "Gemini-class Q&A · notes · files · images",
    icon: LayoutDashboard,
    accent: "ring-[var(--omni-border)] bg-[color-mix(in_srgb,var(--omni-accent)_12%,transparent)] text-[var(--omni-accent)]",
  },
  {
    id: "omnimusic",
    label: "OmniMusic",
    tagline: "Neural audio studio",
    icon: Music,
    accent: "ring-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-300",
  },
  {
    id: "omnimovies",
    label: "OmniMovies",
    tagline: "International cinema · Big Data",
    icon: Film,
    accent: "ring-[#E50914]/40 bg-[#E50914]/15 text-red-300",
  },
  {
    id: "omnitv",
    label: "OmniTV",
    tagline: "Live channel guide",
    icon: Tv,
    accent: "ring-violet-400/40 bg-violet-500/15 text-violet-300",
  },
  {
    id: "omnicharge",
    label: "OmniCharge",
    tagline: "Wireless charging wallet",
    icon: Zap,
    accent: "ring-cyan-400/40 bg-cyan-500/15 text-cyan-300",
  },
  {
    id: "omnimap",
    label: "OmniMap",
    tagline: "Smart maps & voice drive",
    icon: Map,
    accent: "ring-emerald-400/40 bg-emerald-500/15 text-emerald-300",
  },
];

const HEADER_MACRO_IDS: AppViewId[] = [
  "omnimusic",
  "omnimovies",
  "omnitv",
  "omnicharge",
  "omnimap",
];

/** Upper header toolbar only — five macro modules. */
export const HEADER_MACRO_VIEWS = APP_VIEWS.filter((v) =>
  HEADER_MACRO_IDS.includes(v.id),
);

/** @deprecated use HEADER_MACRO_VIEWS */
export const ENTERTAINMENT_VIEWS = HEADER_MACRO_VIEWS;

export function getAppView(id: AppViewId): AppView {
  return APP_VIEWS.find((v) => v.id === id) ?? APP_VIEWS[0];
}
