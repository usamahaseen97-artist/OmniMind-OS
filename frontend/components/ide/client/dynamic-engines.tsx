"use client";

import dynamic from "next/dynamic";
import type { SceneAsset } from "../matrix/live/scene-asset-types";
import type { SpatialRenderMode } from "../../../lib/spatial-render-store";
import { WidgetLoading } from "../dynamic-workbench-widgets";

export type { SceneAsset };

/** Matrix wireframe spatial canvas */
const MatrixScene3D = dynamic(
  () => import("../matrix/live/MatrixScene3D").then((m) => ({ default: m.MatrixScene3D })),
  { ssr: false, loading: () => <WidgetLoading label="3D matrix" /> },
);

/** Cinematic path-traced spatial canvas */
const CinematicScene3D = dynamic(
  () => import("../matrix/live/CinematicScene3D").then((m) => ({ default: m.CinematicScene3D })),
  { ssr: false, loading: () => <WidgetLoading label="cinematic render" /> },
);

export function DynamicSpatialScene({
  mode,
  variant,
  prompt,
  assets,
  onAssetDrag,
}: {
  mode: SpatialRenderMode;
  variant: "exterior" | "interior";
  prompt: string;
  assets: SceneAsset[];
  onAssetDrag?: (id: string, x: number, z: number) => void;
}) {
  if (mode === "cinematic") {
    return <CinematicScene3D prompt={prompt} assets={assets} variant={variant} />;
  }
  return (
    <MatrixScene3D
      prompt={prompt}
      assets={assets}
      variant={variant}
      onAssetDrag={onAssetDrag}
    />
  );
}

/** @deprecated use DynamicSpatialScene */
export const DynamicArchitecturalScene3D = dynamic(
  () =>
    import("../matrix/live/ArchitecturalScene3D").then((m) => ({
      default: m.ArchitecturalScene3D,
    })),
  {
    ssr: false,
    loading: () => <WidgetLoading label="3D engine" />,
  },
);

export const DynamicAnimatedToolViewport = dynamic(
  () =>
    import("../motion/AnimatedToolViewport").then((m) => ({
      default: m.AnimatedToolViewport,
    })),
  {
    ssr: false,
    loading: () => <WidgetLoading label="workspace" />,
  },
);
