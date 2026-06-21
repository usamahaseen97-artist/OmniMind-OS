"use client";

import { X } from "lucide-react";
import type { ExecutionPreviewState } from "../../lib/execution-preview";
import type { LiveRenderSession } from "../../lib/live-render-pipeline";
import { cn } from "../../lib/utils";
import { ExecutionWorkspacePanel } from "./ExecutionWorkspacePanel";
import { LiveRenderWorkspace } from "./LiveRenderWorkspace";

interface CollapsibleExecutionPanelProps {
  open: boolean;
  onClose: () => void;
  preview: ExecutionPreviewState | null;
  renderSession: LiveRenderSession | null;
  onRenderClose?: () => void;
  onRenderComplete?: () => void;
}

/**
 * Sliding execution workspace — hidden until preview/render is active.
 */
export function CollapsibleExecutionPanel({
  open,
  onClose,
  preview,
  renderSession,
  onRenderClose,
  onRenderComplete,
}: CollapsibleExecutionPanelProps) {
  const visible = open && (preview != null || renderSession != null);
  if (!visible) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Close execution panel"
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px] xl:bg-black/30"
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-[min(440px,92vw)] flex-col overflow-hidden",
          "border-l border-gray-800/60 bg-[#15171E] shadow-[-16px_0_48px_rgba(0,0,0,0.5)]",
          "transition-transform duration-300 ease-out",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-gray-800/60 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#10B981]">
            Execution
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          {renderSession ? (
            <LiveRenderWorkspace
              session={renderSession}
              className="h-full w-full"
              onClose={onRenderClose}
              onComplete={onRenderComplete}
            />
          ) : (
            <ExecutionWorkspacePanel preview={preview} embedded />
          )}
        </div>
      </aside>
    </>
  );
}
