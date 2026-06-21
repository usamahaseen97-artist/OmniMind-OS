"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { SovereignToolSlug } from "../../../lib/sovereign-tool-registry";
import { useSpatialRenderMode } from "../../../lib/spatial-render-store";
import { SpatialRenderToggle } from "./SpatialRenderToggle";
import { SpatialUtilityDeck } from "./SpatialUtilityDeck";
import { DynamicSpatialScene } from "../client/dynamic-engines";
import type { SceneAsset } from "../matrix/live/scene-asset-types";
import { SpatialCanvasResizeHost } from "./SpatialCanvasResizeHost";

const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.35 } };

interface SpatialRenderViewportProps {
  toolSlug: SovereignToolSlug;
  workspaceTitle: string;
  prompt: string;
  assets: SceneAsset[];
  variant: "exterior" | "interior";
  specLabel: string;
  progress?: number;
  assetTray: ReactNode;
  onAssetDrag?: (id: string, x: number, z: number) => void;
}

export function SpatialRenderViewport({
  toolSlug,
  workspaceTitle,
  prompt,
  assets,
  variant,
  specLabel,
  progress,
  assetTray,
  onAssetDrag,
}: SpatialRenderViewportProps) {
  const renderMode = useSpatialRenderMode();

  return (
    <div className="omni-studio-panel flex h-full min-h-0 flex-col overflow-hidden">
      <header className="omni-studio-header flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-[9px] font-bold uppercase tracking-wider omni-accent-text">
            {workspaceTitle}
          </p>
          <p className="truncate text-[8px]" style={{ color: "var(--omni-text-muted)" }}>
            {specLabel}
            {progress ? ` · ${Math.round(progress)}%` : ""}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <SpatialRenderToggle toolSlug={toolSlug} />
          <SpatialUtilityDeck toolSlug={toolSlug} />
        </div>
      </header>

      <SpatialCanvasResizeHost className="min-h-0 flex-1">
        <AnimatePresence mode="wait">
          <motion.div key={renderMode} className="relative h-full w-full" {...fade}>
            <DynamicSpatialScene
              mode={renderMode}
              variant={variant}
              prompt={prompt}
              assets={assets}
              onAssetDrag={onAssetDrag}
            />
          </motion.div>
        </AnimatePresence>
      </SpatialCanvasResizeHost>

      {assetTray}
    </div>
  );
}
