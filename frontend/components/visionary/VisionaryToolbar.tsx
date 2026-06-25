"use client";

import type { ReactNode } from "react";
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Redo2,
  Save,
  Search,
  Sparkles,
  Undo2,
  Upload,
  User,
  Download,
  Play,
  Film,
  Plus,
} from "lucide-react";
import { ToolSwitcher } from "../ide/ToolSwitcher";
import { ThemeHub } from "../theme/ThemeHub";
import { cn } from "../../lib/utils";
import { useVisionaryStudio } from "../../lib/visionary";

export function VisionaryToolbar({ toolSwitcher }: { toolSwitcher?: ReactNode }) {
  const {
    project,
    undo,
    redo,
    undoStack,
    redoStack,
    setCopilotOpen,
    copilotOpen,
    globalSearch,
    setGlobalSearch,
    notifications,
    autoSaveStatus,
    pushHistory,
  } = useVisionaryStudio();

  return (
    <header
      className="visionary-toolbar flex h-11 shrink-0 items-center gap-1 border-b border-white/[0.06] bg-[#0a0e16] px-2"
      aria-label="Visionary Studio toolbar"
    >
      {toolSwitcher ? (
        <div className="flex shrink-0 items-center border-r border-white/[0.06] pr-2">
          {toolSwitcher}
        </div>
      ) : null}
      <div className="flex items-center gap-1 border-r border-white/[0.06] pr-2">
        <button
          type="button"
          onClick={() => pushHistory("New project", "edit")}
          className="visionary-toolbar-btn"
          title="New Project"
        >
          <Plus size={14} />
          <span className="hidden lg:inline">New</span>
        </button>
        <button type="button" className="visionary-toolbar-btn" title="Open">
          <FolderOpen size={14} />
          <span className="hidden lg:inline">Open</span>
        </button>
        <button
          type="button"
          onClick={() => pushHistory("Manual save", "edit")}
          className="visionary-toolbar-btn"
          title="Save"
        >
          <Save size={14} />
          <span className="hidden lg:inline">Save</span>
        </button>
      </div>

      <div className="flex items-center gap-0.5 border-r border-white/[0.06] px-2">
        <button
          type="button"
          onClick={undo}
          disabled={undoStack.length <= 1}
          className="visionary-toolbar-icon"
          title="Undo"
        >
          <Undo2 size={14} />
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={redoStack.length === 0}
          className="visionary-toolbar-icon"
          title="Redo"
        >
          <Redo2 size={14} />
        </button>
      </div>

      <div className="flex items-center gap-1 border-r border-white/[0.06] px-2">
        <button type="button" className="visionary-toolbar-btn" title="Import">
          <Upload size={14} />
          <span className="hidden xl:inline">Import</span>
        </button>
        <button type="button" className="visionary-toolbar-btn" title="Export">
          <Download size={14} />
          <span className="hidden xl:inline">Export</span>
        </button>
        <button type="button" className="visionary-toolbar-btn" title="Preview">
          <Play size={14} />
          <span className="hidden xl:inline">Preview</span>
        </button>
        <button type="button" className="visionary-toolbar-btn omni-accent-text" title="Render">
          <Film size={14} />
          <span className="hidden xl:inline">Render</span>
        </button>
      </div>

      <div className="min-w-0 flex-1 px-2">
        <p className="truncate text-center text-[11px] font-medium text-slate-200">
          {project.name}
          <span className="ml-2 text-[9px] font-normal text-slate-500">
            {project.resolution.width}×{project.resolution.height} · {project.fps}fps
          </span>
        </p>
      </div>

      <div className="relative hidden md:block">
        <Search size={12} className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" />
        <input
          type="search"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          placeholder="Search project…"
          className="h-7 w-40 rounded-md border border-white/[0.08] bg-white/[0.03] pl-7 pr-2 text-[10px] text-slate-200 outline-none focus:border-cyan-500/40 lg:w-52"
        />
      </div>

      <button
        type="button"
        onClick={() => setCopilotOpen(!copilotOpen)}
        className={cn(
          "visionary-toolbar-btn ml-1",
          copilotOpen && "border-cyan-500/40 bg-cyan-500/10 text-cyan-200",
        )}
        title="AI Copilot"
      >
        <Sparkles size={14} />
        <span className="hidden lg:inline">AI</span>
      </button>

      <button type="button" className="visionary-toolbar-icon relative" title="Notifications">
        <Bell size={14} />
        {notifications > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 text-[8px] font-bold text-white">
            {notifications}
          </span>
        ) : null}
      </button>

      <button type="button" className="visionary-toolbar-icon" title="Profile">
        <User size={14} />
      </button>

      <span
        className={cn(
          "ml-1 hidden rounded px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-wide sm:inline",
          autoSaveStatus === "saved" && "bg-emerald-500/15 text-emerald-300",
          autoSaveStatus === "saving" && "bg-amber-500/15 text-amber-300",
          autoSaveStatus === "dirty" && "bg-slate-500/15 text-slate-400",
        )}
      >
        {autoSaveStatus}
      </span>
    </header>
  );
}
