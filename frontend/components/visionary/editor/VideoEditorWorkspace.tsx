"use client";

import { Scissors, MousePointer2, MoveHorizontal, Slice, Link2 } from "lucide-react";
import type { ReactNode } from "react";
import { Group, Panel } from "react-resizable-panels";
import { cn } from "../../../lib/utils";
import { useVisionaryEditor } from "../../../lib/visionary/editor-context";
import type { EditTool } from "../../../lib/visionary/editor/types";
import { SplitResizeHandle } from "../../ide/layouts/SplitWorkspace";
import { MediaPool } from "./MediaPool";
import { PreviewMonitor } from "./PreviewMonitor";
import { PlaybackControls } from "./PlaybackControls";
import { TimelineEngine } from "./TimelineEngine";
import { InspectorPanel } from "./InspectorPanel";
import { ExportQueue } from "./ExportQueue";
import { AutoSaveManager } from "./AutoSaveManager";
import { HistoryPanel } from "./HistoryPanel";

const TOOLS: { id: EditTool; label: string; icon: typeof MousePointer2; shortcut: string }[] = [
  { id: "select", label: "Select", icon: MousePointer2, shortcut: "V" },
  { id: "ripple", label: "Ripple", icon: MoveHorizontal, shortcut: "B" },
  { id: "trim", label: "Trim", icon: Slice, shortcut: "T" },
  { id: "razor", label: "Split", icon: Scissors, shortcut: "C" },
  { id: "slip", label: "Slip", icon: MoveHorizontal, shortcut: "Y" },
  { id: "slide", label: "Slide", icon: MoveHorizontal, shortcut: "U" },
];

function EditToolStrip() {
  const { editTool, setEditTool, splitAtPlayhead, joinSelectedWithNext, deleteSelectedClip } = useVisionaryEditor();

  return (
    <div className="flex items-center gap-1">
      {TOOLS.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => {
            setEditTool(t.id);
            if (t.id === "razor") splitAtPlayhead();
          }}
          title={`${t.label} (${t.shortcut})`}
          className={cn(
            "flex items-center gap-1 rounded px-2 py-1 text-[9px]",
            editTool === t.id ? "bg-cyan-500/15 text-cyan-200" : "text-slate-500 hover:text-slate-300",
          )}
        >
          <t.icon size={12} />
          {t.label}
        </button>
      ))}
      <span className="mx-1 h-4 w-px bg-white/10" />
      <button type="button" onClick={joinSelectedWithNext} className="visionary-timeline-btn text-[9px] px-2">
        <Link2 size={11} className="inline mr-1" />Join
      </button>
      <button type="button" onClick={deleteSelectedClip} className="visionary-timeline-btn text-[9px] px-2 text-rose-400">
        Delete
      </button>
    </div>
  );
}

/**
 * Professional NLE workspace — Premiere / Resolve class layout (Phase 3).
 */
export function VideoEditorWorkspace() {
  return (
    <div className="video-editor-workspace flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#0B0F19]">
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0a0e16] px-2">
        <EditToolStrip />
        <div className="flex items-center gap-2">
          <AutoSaveManager />
          <HistoryPanel compact />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <Group orientation="horizontal" className="h-full">
          <Panel defaultSize={22} minSize={14} maxSize={35} className="flex min-h-0 flex-col overflow-hidden">
            <MediaPool />
          </Panel>
          <SplitResizeHandle orientation="horizontal" />
          <Panel defaultSize={56} minSize={40} className="flex min-h-0 flex-col overflow-hidden">
            <Group orientation="vertical" className="h-full">
              <Panel defaultSize={52} minSize={28} className="flex min-h-0 flex-col overflow-hidden">
                <PreviewMonitor />
                <PlaybackControls />
              </Panel>
              <SplitResizeHandle orientation="vertical" />
              <Panel defaultSize={48} minSize={22} className="flex min-h-0 flex-col overflow-hidden">
                <TimelineEngine />
              </Panel>
            </Group>
          </Panel>
          <SplitResizeHandle orientation="horizontal" />
          <Panel defaultSize={22} minSize={16} maxSize={32} className="flex min-h-0 flex-col overflow-hidden">
            <InspectorPanel />
          </Panel>
        </Group>
      </div>

      <ExportQueue compact />
    </div>
  );
}
