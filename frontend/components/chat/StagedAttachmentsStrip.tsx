"use client";

import { Clapperboard, Code2, ImageIcon, X } from "lucide-react";
import type { StagedAttachment } from "../../lib/staged-attachments";
import { cn } from "../../lib/utils";

const KIND_ICON = {
  video: Clapperboard,
  image: ImageIcon,
  file: Code2,
} as const;

interface StagedAttachmentsStripProps {
  attachments: StagedAttachment[];
  onRemove: (id: string) => void;
  className?: string;
}

export function StagedAttachmentsStrip({
  attachments,
  onRemove,
  className,
}: StagedAttachmentsStripProps) {
  if (attachments.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5 px-1 pb-2", className)}>
      {attachments.map((att) => {
        const Icon = KIND_ICON[att.kind];
        return (
          <span
            key={att.id}
            className="inline-flex max-w-[200px] items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 py-1 pl-2 pr-1 text-[10px] text-[#00FF87] shadow-[0_0_8px_rgba(16,185,129,0.12)]"
          >
            <Icon className="h-3 w-3 shrink-0 opacity-90" />
            <span className="truncate font-medium">{att.name}</span>
            <button
              type="button"
              onClick={() => onRemove(att.id)}
              className="rounded-full p-0.5 text-zinc-500 transition hover:bg-black/30 hover:text-zinc-200"
              aria-label={`Remove ${att.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        );
      })}
    </div>
  );
}
