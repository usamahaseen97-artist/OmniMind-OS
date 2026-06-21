"use client";

import {
  Brain,
  Clapperboard,
  FileUp,
  Image,
  LayoutGrid,
  Music,
  Search,
  Sparkles,
  Video,
} from "lucide-react";
import type { OmniToolId } from "../../lib/omni-tools-api";
import { detectToolFromMessage } from "../../lib/execution-detect";
import { cn } from "../../lib/utils";

const TOOL_META: Record<
  OmniToolId,
  { label: string; icon: typeof Sparkles; color: string }
> = {
  video: { label: "Video", icon: Video, color: "text-neon-green border-neon-green/40" },
  create_image: { label: "Create Image", icon: Image, color: "text-emerald-400 border-emerald-500/30" },
  app_build: { label: "App Builder", icon: Clapperboard, color: "text-sky-400 border-sky-500/30" },
  architecture: { label: "Blueprint", icon: LayoutGrid, color: "text-amber-400 border-amber-500/30" },
  create_music: { label: "Create Music", icon: Music, color: "text-fuchsia-400 border-fuchsia-500/30" },
  deep_research: { label: "Deep Research", icon: Search, color: "text-cyan-400 border-cyan-500/30" },
  web_search: { label: "Web Search", icon: Search, color: "text-sky-400 border-sky-500/30" },
  thinking: { label: "Thinking", icon: Brain, color: "text-violet-400 border-violet-500/30" },
  uploads: { label: "More Uploads", icon: FileUp, color: "text-amber-400 border-amber-500/30" },
  personal_intelligence: {
    label: "Personal Intelligence",
    icon: Sparkles,
    color: "text-neon-green border-neon-green/30",
  },
};

interface ActiveToolChipsProps {
  activeTool: OmniToolId | null;
  statusText?: string | null;
  className?: string;
}

export function ActiveToolChips({ activeTool, statusText, className }: ActiveToolChipsProps) {
  if (!activeTool && !statusText) return null;
  const meta = activeTool ? TOOL_META[activeTool] : null;
  const Icon = meta?.icon ?? Clapperboard;

  return (
    <div className={cn("flex flex-wrap items-center gap-2 px-3 py-1.5", className)}>
      {activeTool && meta && (
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium",
            meta.color,
          )}
        >
          <Icon className="h-3 w-3" />
          {meta.label}
        </span>
      )}
      {statusText && (
        <span className="animate-pulse text-[10px] text-zinc-500">{statusText}</span>
      )}
    </div>
  );
}

export { detectToolFromMessage } from "../../lib/execution-detect";
