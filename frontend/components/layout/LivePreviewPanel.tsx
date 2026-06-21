"use client";

import { Monitor, RefreshCw } from "lucide-react";

export type LivePreviewState = {
  html: string;
  type: string;
  label: string;
};

interface LivePreviewPanelProps {
  preview: LivePreviewState | null;
  onRefresh?: () => void;
}

export function LivePreviewPanel({ preview, onRefresh }: LivePreviewPanelProps) {
  return (
    <aside className="hidden min-h-0 w-[min(380px,34vw)] shrink-0 flex-col overflow-hidden border-l border-neon-green/10 bg-[#060807] xl:flex">
      <header className="flex items-center justify-between border-b border-neon-green/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-neon-green" />
          <h2 className="text-xs font-bold uppercase tracking-widest text-neon-green">
            Live Screen
          </h2>
        </div>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-neon-green/10 hover:text-neon-green"
            title="Refresh preview"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </header>

      <div className="relative flex-1 overflow-hidden p-2">
        {preview?.html ? (
          <iframe
            title="OmniMind Live Preview"
            srcDoc={preview.html}
            sandbox="allow-scripts allow-same-origin"
            className="h-full min-h-[320px] w-full rounded-lg border border-neon-green/20 bg-black"
          />
        ) : (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-neon-green/20 bg-[#0a0f0c] p-6 text-center">
            <Monitor className="mb-3 h-10 w-10 text-neon-green/30" />
            <p className="text-xs font-medium text-zinc-400">Live Preview</p>
            <p className="mt-2 max-w-[200px] text-[10px] leading-relaxed text-zinc-600">
              Build-as-you-chat: web UI, 3D plans, charts, and VFX appear here as agents work.
            </p>
          </div>
        )}
      </div>

      {preview?.label && (
        <p className="border-t border-neon-green/10 px-4 py-2 text-[10px] text-zinc-600">
          Rendering: <span className="text-neon-green">{preview.label}</span>
        </p>
      )}
    </aside>
  );
}
