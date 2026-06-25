"use client";

import type { GeneratedFileAsset } from "../../../lib/execution-preview";
import { useOmniForgeEngineering } from "../../../lib/omniforge-engineering-context";
import type { ExportFormat } from "../../../lib/omniforge-engineering/types";

export function OmniForgeExportPanel({ files }: { files: GeneratedFileAsset[] }) {
  const eng = useOmniForgeEngineering();
  if (!eng.exportOpen) return null;

  const formats: { id: ExportFormat; label: string; hint: string }[] = [
    { id: "zip", label: "ZIP Archive", hint: "Full project bundle" },
    { id: "git", label: "Git Repository", hint: "Ready with .gitignore" },
    { id: "docker", label: "Docker Project", hint: "Dockerfile + compose" },
    { id: "production", label: "Production Build", hint: "Optimized artifact set" },
  ];

  return (
    <div className="fixed inset-0 z-[195] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#12141c] p-5 shadow-2xl">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-100">Export Project</h2>
        <p className="mt-1 text-[10px] text-zinc-500">{files.filter((f) => !f.path.startsWith(".omniforge/")).length} files available</p>
        <div className="mt-4 grid gap-2">
          {formats.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => eng.runProjectExport(f.id, eng.injectDocumentation(files))}
              className="rounded-lg border border-white/8 px-4 py-3 text-left hover:border-cyan-500/30 hover:bg-cyan-500/5"
            >
              <span className="block text-[11px] font-semibold text-zinc-200">{f.label}</span>
              <span className="text-[9px] text-zinc-500">{f.hint}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={eng.closeExport} className="mt-4 w-full rounded-lg py-2 text-[10px] text-zinc-500 hover:bg-white/5">
          Cancel
        </button>
      </div>
    </div>
  );
}
