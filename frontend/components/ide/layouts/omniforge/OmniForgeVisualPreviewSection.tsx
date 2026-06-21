"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Globe,
  Maximize2,
  Minimize2,
  Monitor,
  RefreshCw,
  RotateCw,
  Smartphone,
  Tablet,
  ZoomIn,
} from "lucide-react";
import { useIDE } from "../../IDEProvider";
import { useOmniForgeWorkspaceOptional } from "../../../../lib/omniforge-workspace";
import { useOmniForgeShell } from "../../../../lib/omniforge-shell-context";
import {
  buildPreviewBlobUrlFromWorkspace,
  canComposePreview,
  DEVICE_FRAMES,
  findPreviewEntry,
} from "../../../../lib/omniforge-preview-runtime";
import { OmniForgeEngineControls } from "./OmniForgeEngineControls";
import type { OmniForgeForgeControls } from "../../workspace/DevOmniChatConsole";
import { GlassIconBtn, GlassSection } from "./ui/GlassSection";
import { OmniForgeLiveModeFab } from "./ui/OmniForgeLiveModeFab";
import { OF } from "./omniforge-theme";

type Props = OmniForgeForgeControls & {
  modeHint: string;
  onModeChange: (m: OmniForgeForgeControls["mode"]) => void;
  onModelLayerChange: (v: string) => void;
  onGithubRepoChange: (v: string) => void;
  onProviderKeyChange: (v: string) => void;
};

const DEVICE_ICONS = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
  browser: Globe,
} as const;

/** Section 2 — Live Preview (24–26%) */
export function OmniForgeVisualPreviewSection(props: Props) {
  const { projectFiles } = useIDE();
  const omniforge = useOmniForgeWorkspaceOptional();
  const {
    previewDevice,
    setPreviewDevice,
    previewFullscreen,
    setPreviewFullscreen,
  } = useOmniForgeShell();

  const [rotated, setRotated] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [autoReload, setAutoReload] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [controlsOpen, setControlsOpen] = useState(true);
  const blobRef = useRef<string | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const live = omniforge?.status === "ready";
  const entry = useMemo(() => findPreviewEntry(projectFiles), [projectFiles]);

  const previewUrl = useMemo(() => {
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    const url = buildPreviewBlobUrlFromWorkspace(projectFiles);
    blobRef.current = url;
    return url;
  }, [projectFiles, refreshKey]);

  useEffect(() => () => {
    if (blobRef.current) URL.revokeObjectURL(blobRef.current);
  }, []);

  const triggerReload = useCallback(() => setRefreshKey((k) => k + 1), []);

  useEffect(() => {
    if (!autoReload) return;
    const sync = () => triggerReload();
    const onStream = (e: Event) => {
      const detail = (e as CustomEvent<{ files?: { path: string; content: string }[] }>).detail;
      if (!detail?.files || canComposePreview(detail.files)) triggerReload();
    };
    window.addEventListener("omnimind:omniforge-files-loaded", sync);
    window.addEventListener("omnimind:omniforge-file-stream", onStream);
    window.addEventListener("omnimind:omniforge-file-save", sync);
    window.addEventListener("omnimind:omniforge-preview-refresh", sync);
    const settings = () => setControlsOpen((v) => !v);
    window.addEventListener("omnimind:omniforge-toggle-settings", settings);
    return () => {
      window.removeEventListener("omnimind:omniforge-files-loaded", sync);
      window.removeEventListener("omnimind:omniforge-file-stream", onStream);
      window.removeEventListener("omnimind:omniforge-file-save", sync);
      window.removeEventListener("omnimind:omniforge-preview-refresh", sync);
      window.removeEventListener("omnimind:omniforge-toggle-settings", settings);
    };
  }, [autoReload, triggerReload]);

  const frame = DEVICE_FRAMES[previewDevice === "browser" ? "desktop" : previewDevice];
  const w = rotated ? frame.height : frame.width;
  const h = rotated ? frame.width : frame.height;
  const scale = zoom / 100;
  const isFrame = previewDevice !== "desktop" && previewDevice !== "browser";

  const previewBody = previewUrl ? (
    <iframe
      key={`${refreshKey}-${entry?.entryPath}`}
      title="Live application preview"
      src={previewUrl}
      className="h-full w-full border-0 bg-white"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
    />
  ) : (
    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
      <div
        className="mb-3 flex items-center justify-center rounded-[2rem] border-[6px]"
        style={{
          width: isFrame ? 200 : "80%",
          height: isFrame ? 380 : "70%",
          borderColor: OF.phoneFrame,
          background: "rgba(255,255,255,0.03)",
        }}
      >
        <p className="px-4 text-[10px] leading-relaxed" style={{ color: OF.textMuted }}>
          Live preview renders when an HTML entry exists in the workspace.
        </p>
      </div>
    </div>
  );

  const deviceToolbar = (
    <div className="flex flex-wrap items-center gap-1">
      {(Object.keys(DEVICE_ICONS) as (keyof typeof DEVICE_ICONS)[]).map((id) => {
        const Icon = DEVICE_ICONS[id];
        return (
          <GlassIconBtn key={id} title={id} active={previewDevice === id} onClick={() => setPreviewDevice(id)}>
            <Icon className="h-3.5 w-3.5" />
          </GlassIconBtn>
        );
      })}
      <GlassIconBtn title="Rotate" onClick={() => setRotated((v) => !v)}>
        <RotateCw className="h-3.5 w-3.5" />
      </GlassIconBtn>
      <GlassIconBtn title="Reload" onClick={triggerReload}>
        <RefreshCw className="h-3.5 w-3.5" />
      </GlassIconBtn>
      <GlassIconBtn title="Fullscreen" onClick={() => setPreviewFullscreen(!previewFullscreen)}>
        {previewFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
      </GlassIconBtn>
    </div>
  );

  const metaRow = (
    <div className="flex flex-wrap items-center gap-2 text-[8px]" style={{ color: OF.textMuted }}>
      <label className="flex items-center gap-1">
        <input type="checkbox" checked={autoReload} onChange={(e) => setAutoReload(e.target.checked)} className="accent-cyan-400" />
        Auto refresh
      </label>
      <span>
        {w}×{h}
      </span>
      <ZoomIn className="h-3 w-3" />
      <input type="range" min={50} max={150} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="h-1 w-14 accent-cyan-400" />
      <span>{zoom}%</span>
      {live ? <span style={{ color: OF.success }}>● live</span> : null}
    </div>
  );

  if (previewFullscreen) {
    return (
      <div ref={frameRef} className="fixed inset-0 z-[100] flex flex-col" style={{ background: OF.bgDeep }}>
        <div className="flex items-center justify-between border-b px-3 py-2" style={{ borderColor: OF.border, background: OF.panel }}>
          {deviceToolbar}
          <button type="button" onClick={() => setPreviewFullscreen(false)} className="text-[10px]" style={{ color: OF.cyan }}>
            Exit fullscreen
          </button>
        </div>
        <div className="flex flex-1 items-center justify-center p-4">{previewBody}</div>
      </div>
    );
  }

  return (
    <GlassSection
      title="Live Preview"
      subtitle={autoReload ? "Auto refresh on" : "Manual refresh"}
      actions={deviceToolbar}
      noPad
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="border-b px-3 py-1.5" style={{ borderColor: OF.glassBorder }}>
        {metaRow}
      </div>
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-3" style={{ background: OF.bgDeep }}>
        {previewUrl ? (
          <div
            className="overflow-hidden transition-all duration-300"
            style={{
              width: isFrame ? w * scale : "100%",
              height: isFrame ? h * scale : "100%",
              maxWidth: "100%",
              maxHeight: "100%",
              borderRadius: previewDevice === "mobile" ? 32 : previewDevice === "tablet" ? 20 : 8,
              border: isFrame ? `10px solid ${OF.phoneBezel}` : `1px solid ${OF.border}`,
              boxShadow: isFrame ? `0 24px 48px rgba(0,0,0,0.5), inset 0 0 0 1px ${OF.phoneFrame}` : OF.shadow,
            }}
          >
            {previewBody}
          </div>
        ) : (
          previewBody
        )}
      </div>
      <OmniForgeLiveModeFab onActivate={() => setPreviewFullscreen(true)} />
      {controlsOpen ? (
        <div className="shrink-0 border-t" style={{ borderColor: OF.glassBorder }}>
          <button
            type="button"
            onClick={() => setControlsOpen(false)}
            className="w-full py-1 text-[8px] uppercase tracking-wider"
            style={{ color: OF.textMuted }}
          >
            Theme control ▼
          </button>
          <OmniForgeEngineControls {...props} compact />
        </div>
      ) : (
        <button type="button" onClick={() => setControlsOpen(true)} className="border-t py-1 text-center text-[8px]" style={{ borderColor: OF.glassBorder, color: OF.textMuted }}>
          Theme control ▲
        </button>
      )}
      </div>
    </GlassSection>
  );
}
