"use client";

import { useEffect, useMemo, useState } from "react";
import { Code2, LayoutGrid, Monitor, RefreshCw } from "lucide-react";
import type { ExecutionPreviewState } from "../../lib/execution-preview";
import { GeneratedImageGallery } from "../chat/GeneratedImageGallery";
import { LiveVideoPlayer } from "./LiveVideoPlayer";
import { MusicPlayer } from "../music/MusicPlayer";
import { cn } from "../../lib/utils";

interface ExecutionWorkspacePanelProps {
  preview: ExecutionPreviewState | null;
  onRefresh?: () => void;
  /** Inside LiveExecutionDeck / slide-over — full height, no fixed aside chrome */
  embedded?: boolean;
  /** Nested inside LiveExecutionDeck (no duplicate header) */
  deckMode?: boolean;
}

type TabId = "live" | "code" | "blueprint";

export function ExecutionWorkspacePanel({
  preview,
  onRefresh,
  embedded = false,
  deckMode = false,
}: ExecutionWorkspacePanelProps) {
  const defaultTab: TabId = preview?.active_tab ?? "live";
  const [tab, setTab] = useState<TabId>(defaultTab);
  const [selectedFile, setSelectedFile] = useState(0);

  useEffect(() => {
    if (preview?.active_tab) setTab(preview.active_tab);
  }, [preview?.active_tab, preview?.type]);

  const tabs = useMemo(() => {
    const t: { id: TabId; label: string; icon: typeof Monitor }[] = [
      { id: "live", label: "Live Preview", icon: Monitor },
    ];
    if (preview?.files?.length) t.push({ id: "code", label: "Code", icon: Code2 });
    if (preview?.svg || preview?.type === "blueprint") {
      t.push({ id: "blueprint", label: "Blueprint", icon: LayoutGrid });
    }
    return t;
  }, [preview]);

  const files = preview?.files ?? [];
  const file = files[selectedFile];

  const Root = embedded || deckMode ? "div" : "aside";

  return (
    <Root
      className={cn(
        "pointer-events-auto flex min-h-0 flex-col overflow-hidden touch-manipulation",
        embedded || deckMode
          ? "h-full w-full bg-transparent"
          : "w-[min(420px,38vw)] shrink-0 border-l border-[#10B981]/10 bg-[#15171E] max-xl:hidden",
      )}
    >
      {!embedded && !deckMode ? (
        <header className="flex items-center justify-between border-b border-gray-800/60 px-3 py-2">
          <div className="flex items-center gap-2">
            <Monitor className="h-4 w-4 text-[#10B981]" />
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#10B981]">
              Execution Workspace
            </h2>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-[#10B981]/10 hover:text-[#10B981]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
          )}
        </header>
      ) : null}

      <div className="flex gap-1 border-b border-white/[0.06] px-2 py-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium",
              tab === id
                ? "bg-[#10B981]/15 text-[#00FF87]"
                : "text-zinc-500 hover:text-zinc-300",
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
      </div>

      <div className="pointer-events-auto relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-2">
        {!preview ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-lg border border-dashed border-neon-green/20 bg-[#0a0f0c] p-6 text-center">
            <Monitor className="mb-3 h-10 w-10 text-neon-green/30" />
            <p className="text-xs font-medium text-zinc-400">Execution Workspace</p>
            <p className="mt-2 max-w-[220px] text-[10px] leading-relaxed text-zinc-600">
              Say Make / Create / Build — images, apps, and blueprints render here live.
            </p>
          </div>
        ) : tab === "code" && files.length > 0 ? (
          <div className="flex h-full min-h-[320px] gap-2 overflow-hidden">
            <nav className="w-[38%] shrink-0 overflow-y-auto rounded-lg border border-white/[0.06] bg-black/40 p-1 text-[10px]">
              {files.map((f, i) => (
                <button
                  key={f.path}
                  type="button"
                  onClick={() => setSelectedFile(i)}
                  className={cn(
                    "block w-full truncate rounded px-2 py-1.5 text-left",
                    i === selectedFile
                      ? "bg-neon-green/15 text-neon-green"
                      : "text-zinc-500 hover:text-zinc-300",
                  )}
                >
                  {f.path}
                </button>
              ))}
            </nav>
            <pre className="min-w-0 flex-1 overflow-auto rounded-lg border border-neon-green/15 bg-[#0a0f0c] p-2 text-[10px] leading-relaxed text-zinc-300">
              {file?.content ?? ""}
            </pre>
          </div>
        ) : tab === "blueprint" && preview.svg ? (
          <div
            className="h-full min-h-[320px] overflow-auto rounded-lg border border-neon-green/20 bg-[#060807] p-2"
            dangerouslySetInnerHTML={{ __html: preview.svg }}
          />
        ) : preview.music_track ? (
          <div className="pointer-events-auto flex h-full min-h-[320px] items-center justify-center p-2">
            <MusicPlayer track={preview.music_track} autoPlay />
          </div>
        ) : preview.type === "video" && preview.video_url ? (
          <div className="pointer-events-auto flex h-full min-h-[320px] flex-col gap-2">
            <LiveVideoPlayer
              src={preview.video_url}
              poster={preview.image_url}
              className="min-h-[280px] flex-1"
            />
            <p className="text-[10px] text-zinc-500">
              Tap video to play
            </p>
          </div>
        ) : preview.images?.length || preview.image_url ? (
          <GeneratedImageGallery
            images={
              preview.images ??
              [{ url: preview.image_url!, alt: preview.label }]
            }
            className="h-full"
          />
        ) : preview.html ? (
          <iframe
            title="OmniMind Live Preview"
            srcDoc={preview.html}
            sandbox="allow-scripts allow-same-origin"
            className="h-full min-h-[320px] w-full rounded-lg border border-neon-green/20 bg-black"
          />
        ) : (
          <p className="p-4 text-xs text-zinc-500">No preview payload for this tool.</p>
        )}
      </div>

      {preview?.label && (
        <p className="border-t border-neon-green/10 px-3 py-2 text-[10px] text-zinc-600">
          <span className="text-neon-green">{preview.type}</span> · {preview.label}
        </p>
      )}
    </Root>
  );
}
