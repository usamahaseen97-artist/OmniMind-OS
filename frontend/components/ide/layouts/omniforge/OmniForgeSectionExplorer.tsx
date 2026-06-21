"use client";

import { GripVertical } from "lucide-react";
import type { DevTrioSlug } from "../../../../lib/dev-trio";
import { DevFileTreeColumn } from "../../workspace/DevFileTreeColumn";
import { OF } from "./omniforge-theme";

export function OmniForgeSectionExplorer({ toolSlug }: { toolSlug: DevTrioSlug }) {
  return (
    <aside
      className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden"
      style={{ background: OF.bg, borderRight: `1px solid ${OF.border}` }}
    >
      <header
        className="shrink-0 border-b px-3 py-2"
        style={{ borderColor: OF.border, background: OF.panel }}
      >
        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: OF.text }}>
          File Explorer
        </p>
        <p className="text-[8px]" style={{ color: OF.textMuted }}>
          Repository · workspace tree
        </p>
      </header>
      <div className="min-h-0 flex-1 overflow-hidden [&_.omni-dev-panel-header]:!border-[rgba(197,198,199,0.12)] [&_.omni-dev-panel]:!bg-[#0B0C10]">
        <DevFileTreeColumn toolSlug={toolSlug} />
      </div>
      <div
        className="flex shrink-0 items-center gap-1 border-t px-2 py-1 text-[8px]"
        style={{ borderColor: OF.border, color: OF.textMuted }}
      >
        <GripVertical className="h-3 w-3 opacity-40" />
        <span>Drag files to open in workspace</span>
      </div>
    </aside>
  );
}
