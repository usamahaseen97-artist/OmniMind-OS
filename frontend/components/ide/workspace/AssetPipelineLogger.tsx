"use client";

import { useWorkbenchLive } from "../../../lib/workbench-live-store";
import { useIDEOptional } from "../IDEProvider";
import { GlassScrollViewport } from "./GlassScrollViewport";

/** Zone 3 morph — asset pipeline / build logger for non-code tools */
export function AssetPipelineLogger({ title = "Asset Pipeline Logger" }: { title?: string }) {
  const live = useWorkbenchLive();
  const ide = useIDEOptional();
  const lines = [
    ...(ide?.terminalLines.slice(-6) ?? []),
    live.statusText,
    live.streamText ? live.streamText.slice(0, 120) : null,
  ].filter(Boolean) as string[];

  const feed = lines.length
    ? lines
    : [
        "Pipeline idle — awaiting agent command…",
        "FastAPI matrix · port 8001 linked",
        "Render queue · 0 pending jobs",
      ];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden" style={{ background: "#0B0F19" }}>
      <GlassScrollViewport showControls className="min-h-0 flex-1">
        <div className="space-y-1 p-3 font-mono text-[10px] leading-relaxed">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-wider omni-accent-text">{title}</p>
          {feed.map((line, i) => (
            <p
              key={`${line}-${i}`}
              className={line.startsWith("✓") ? "omni-accent-text" : ""}
              style={line.startsWith("✓") ? undefined : { color: "var(--omni-text-muted)" }}
            >
              {live.streaming && i === feed.length - 1 ? "▸ " : "› "}
              {line}
            </p>
          ))}
          {live.streaming ? (
            <p className="animate-pulse omni-accent-text">▸ Streaming agent tokens…</p>
          ) : null}
        </div>
      </GlassScrollViewport>
    </div>
  );
}
