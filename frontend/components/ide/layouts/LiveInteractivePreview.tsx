"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { SovereignToolDef } from "../../../lib/sovereign-tool-registry";
import {
  APP_PREVIEW_ELEMENTS,
  GAME_PREVIEW_ELEMENTS,
  DEFAULT_PREVIEW_ELEMENTS,
  mergeLayoutIntoProject,
  PREVIEW_STYLES_PATH,
  type PreviewElement,
} from "../../../lib/preview-layout-sync";
import { useWorkbenchLive } from "../../../lib/workbench-live-store";
import { DynamicToolLiveSimMatrix } from "../dynamic-workbench-widgets";
import { useIDEOptional } from "../IDEProvider";
import { DevicePreviewWrapper } from "../workspace/DevicePreviewWrapper";
import { cn } from "../../../lib/utils";

const Rnd = dynamic(() => import("react-rnd").then((m) => m.Rnd), { ssr: false });

function elementsForTool(slug: string): PreviewElement[] {
  if (slug === "game-dev") return GAME_PREVIEW_ELEMENTS;
  if (slug === "app-builder") return APP_PREVIEW_ELEMENTS;
  return DEFAULT_PREVIEW_ELEMENTS;
}

interface LiveInteractivePreviewProps {
  tool: SovereignToolDef;
  enableWysiwyg?: boolean;
  useDeviceFrame?: boolean;
  hotReload?: boolean;
  className?: string;
}

/** Panel 1 — hot-reload device viewport with WYSIWYG → code sync */
export function LiveInteractivePreview({
  tool,
  enableWysiwyg = true,
  useDeviceFrame = true,
  hotReload = false,
  className,
}: LiveInteractivePreviewProps) {
  const ide = useIDEOptional();
  const live = useWorkbenchLive();
  const [manualMode, setManualMode] = useState(true);
  const [flash, setFlash] = useState(false);
  const prevContent = useRef("");
  const [elements, setElements] = useState<PreviewElement[]>(() => elementsForTool(tool.slug));

  const syncToCodeEngine = useCallback(
    (next: PreviewElement[]) => {
      if (!ide) return;
      const merged = mergeLayoutIntoProject(ide.projectFiles, next);
      const cssFile = merged.find((f) => f.path === PREVIEW_STYLES_PATH);
      if (!cssFile) return;
      const exists = ide.projectFiles.some((f) => f.path === PREVIEW_STYLES_PATH);
      if (exists) {
        ide.updateFileContent(PREVIEW_STYLES_PATH, cssFile.content);
      } else {
        ide.mergeGenerated([{ path: PREVIEW_STYLES_PATH, content: cssFile.content, language: "css" }]);
      }
      if (ide.selectedFile?.path !== PREVIEW_STYLES_PATH) {
        const cssNode = merged.find((f) => f.path === PREVIEW_STYLES_PATH && !f.isFolder);
        if (cssNode) ide.openFile(cssNode);
      }
      if (hotReload) {
        setFlash(true);
        window.setTimeout(() => setFlash(false), 280);
      }
    },
    [hotReload, ide],
  );

  const updateElement = useCallback(
    (id: string, patch: Partial<PreviewElement>) => {
      setElements((prev) => {
        const next = prev.map((el) => (el.id === id ? { ...el, ...patch } : el));
        syncToCodeEngine(next);
        return next;
      });
    },
    [syncToCodeEngine],
  );

  useEffect(() => {
    syncToCodeEngine(elements);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fileContent = ide?.selectedFile?.content ?? "";
  useEffect(() => {
    if (!hotReload || !fileContent) return;
    if (prevContent.current && prevContent.current !== fileContent) {
      setFlash(true);
      window.setTimeout(() => setFlash(false), 280);
    }
    prevContent.current = fileContent;
  }, [fileContent, hotReload]);

  useEffect(() => {
    if (!hotReload) return;
    const onHot = () => {
      setFlash(true);
      window.setTimeout(() => setFlash(false), 280);
    };
    window.addEventListener("omnimind:hot-reload", onHot);
    return () => window.removeEventListener("omnimind:hot-reload", onHot);
  }, [hotReload]);

  const hotActive = useMemo(() => hotReload && (live.streaming || flash), [flash, hotReload, live.streaming]);

  const previewBody = (
    <div
      className={cn(
        "relative min-h-0 flex-1 overflow-hidden transition-opacity duration-200",
        hotActive ? "opacity-100" : "opacity-100",
      )}
    >
      <DynamicToolLiveSimMatrix tool={tool} />
      {manualMode && enableWysiwyg ? (
        <div className="pointer-events-none absolute inset-0 z-20">
          {elements.map((el) => (
            <Rnd
              key={el.id}
              size={{ width: el.width, height: el.height }}
              position={{ x: el.x, y: el.y }}
              bounds="parent"
              enableResizing
              className="pointer-events-auto"
              onDragStop={(_e, d) => updateElement(el.id, { x: d.x, y: d.y })}
              onResizeStop={(_e, _dir, ref, _delta, pos) =>
                updateElement(el.id, {
                  width: ref.offsetWidth,
                  height: ref.offsetHeight,
                  x: pos.x,
                  y: pos.y,
                })
              }
            >
              <div
                className="flex h-full w-full cursor-move items-center justify-center rounded border border-dashed text-[9px] font-semibold omni-accent-text backdrop-blur-md omni-state-ring"
                style={{
                  borderColor: "var(--omni-accent)",
                  background: "color-mix(in srgb, var(--omni-accent) 14%, transparent)",
                }}
              >
                {el.label}
              </div>
            </Rnd>
          ))}
        </div>
      ) : null}
      {hotReload && flash ? (
        <div
          className="pointer-events-none absolute inset-0 z-30 ring-2 ring-inset transition-opacity"
          style={{ borderColor: "var(--omni-accent)", opacity: 0.35 }}
        />
      ) : null}
    </div>
  );

  return (
    <div className={cn("relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden", className)}>
      {enableWysiwyg ? (
        <div
          className="flex shrink-0 items-center justify-between border-b px-3 py-1.5"
          style={{ borderColor: "#1E293B", background: "#0B0F19" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-semibold uppercase tracking-wider omni-accent-text">
              Hot-Reload Bridge
            </span>
            {hotReload ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[8px] omni-state-ring",
                  live.streaming || flash ? "animate-pulse omni-accent-text" : "",
                )}
                style={{ color: "var(--omni-text-muted)" }}
              >
                {live.streaming ? "Compiling…" : flash ? "Synced" : "Connected"}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => setManualMode((v) => !v)}
            className={cn(
              "omni-state-ring rounded-full border px-2.5 py-0.5 text-[9px] transition",
              manualMode ? "omni-accent-bg omni-accent-text" : "",
            )}
            style={{ borderColor: "#1E293B", color: manualMode ? undefined : "var(--omni-text-muted)" }}
          >
            {manualMode ? "Manual ✓" : "Prompt Only"}
          </button>
        </div>
      ) : null}

      {useDeviceFrame ? <DevicePreviewWrapper>{previewBody}</DevicePreviewWrapper> : previewBody}
    </div>
  );
}
