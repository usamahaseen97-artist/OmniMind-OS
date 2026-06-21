"use client";

import { FileCode2, Folder, X } from "lucide-react";
import type { GeneratedFileAsset } from "../../lib/execution-preview";
import { cn } from "../../lib/utils";

interface ProjectFileDrawerProps {
  open: boolean;
  onClose: () => void;
  files: GeneratedFileAsset[];
}

export function ProjectFileDrawer({ open, onClose, files }: ProjectFileDrawerProps) {
  if (!open) return null;

  const display = files.length
    ? files
    : [
        { path: "src/", content: "", language: "folder" },
        { path: "src/main.ts", content: "", language: "typescript" },
        { path: "package.json", content: "", language: "json" },
        { path: ".env.example", content: "", language: "env" },
      ];

  return (
    <div className="absolute left-[3.25rem] top-14 z-40 w-60 rounded-xl border border-white/10 bg-[#0f1014]/98 shadow-2xl backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
          <Folder className="h-3.5 w-3.5 text-cyan-400" />
          Project Files
        </span>
        <button type="button" onClick={onClose} className="text-zinc-600 hover:text-zinc-300">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <ul className="history-scroll-hover max-h-64 overflow-y-auto p-2">
        {display.map((f) => (
          <li
            key={f.path}
            className={cn(
              "flex items-center gap-2 rounded px-2 py-1 font-mono text-[10px]",
              files.length ? "text-emerald-300/90" : "text-zinc-600",
            )}
          >
            <FileCode2 className="h-3 w-3 shrink-0 opacity-60" />
            <span className="truncate">{f.path}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
