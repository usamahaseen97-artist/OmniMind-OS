"use client";

import { Layers, Package } from "lucide-react";
import type { SovereignToolSlug } from "../../../lib/sovereign-tool-registry";
import { processSpatialDirective, spatialModuleForSlug } from "../../../lib/spatial-engine-api";
import {
  applySpatialHybridSync,
  useSpatialRenderMode,
  useSpatialSessionId,
} from "../../../lib/spatial-render-store";
import { addSpatialCanvasAsset } from "../../../lib/spatial-canvas-store";
import { cn } from "../../../lib/utils";

const PBR_SWATCHES = [
  { id: "marble", label: "Marble", gradient: "from-zinc-200 via-zinc-100 to-zinc-300" },
  { id: "oak", label: "Oak", gradient: "from-amber-800 via-amber-700 to-amber-900" },
  { id: "glass", label: "Glass", gradient: "from-cyan-200/40 via-sky-100/20 to-white/10" },
  { id: "concrete", label: "Concrete", gradient: "from-zinc-500 via-zinc-600 to-zinc-700" },
  { id: "fabric", label: "Fabric", gradient: "from-stone-400 via-stone-500 to-stone-600" },
] as const;

const EXTERIOR_STRUCTURAL = [
  { emoji: "🏛️", label: "Facade", type: "volume" },
  { emoji: "🪟", label: "Glazing", type: "glazing" },
  { emoji: "🏊", label: "Pool", type: "pool" },
  { emoji: "🌳", label: "Landscape", type: "landscape" },
  { emoji: "🧱", label: "Stone", type: "structure" },
  { emoji: "🚗", label: "Driveway", type: "structure" },
];

const INTERIOR_STRUCTURAL = [
  { emoji: "🛋️", label: "Sofa", type: "furniture" },
  { emoji: "🪑", label: "Chair", type: "furniture" },
  { emoji: "💡", label: "Lighting", type: "light" },
  { emoji: "🪟", label: "Partition", type: "partition" },
  { emoji: "🧵", label: "Fabric", type: "furniture" },
  { emoji: "🍽️", label: "Dining", type: "furniture" },
];

interface SpatialMaterialTrayProps {
  toolSlug: SovereignToolSlug;
}

export function SpatialMaterialTray({ toolSlug }: SpatialMaterialTrayProps) {
  const module = spatialModuleForSlug(toolSlug);
  const sessionId = useSpatialSessionId();
  const renderMode = useSpatialRenderMode();
  const isInterior = toolSlug === "interior-landscape";
  const structural = isInterior ? INTERIOR_STRUCTURAL : EXTERIOR_STRUCTURAL;

  const applyMaterial = async (material: string) => {
    try {
      const payload = await processSpatialDirective({
        execution_type: "manual",
        module,
        parameters: {
          session_id: sessionId,
          adjustments: { type: "material_apply", material },
          render_settings: { render_mode: renderMode },
        },
      });
      applySpatialHybridSync(payload);
    } catch {
      /* backend optional */
    }
  };

  const spawnStructural = async (item: (typeof structural)[number]) => {
    const placed = addSpatialCanvasAsset(item.emoji, item.label);
    try {
      const payload = await processSpatialDirective({
        execution_type: "manual",
        module,
        parameters: {
          session_id: sessionId,
          adjustments: {
            type: "spawn_asset",
            asset_id: placed.id,
            asset_type: item.type,
            label: item.label,
            x: placed.x,
            y: 0.4,
            z: placed.z,
          },
          render_settings: { render_mode: renderMode },
        },
      });
      applySpatialHybridSync(payload);
    } catch {
      /* backend optional */
    }
  };

  return (
    <div className="omni-studio-panel flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <header className="omni-studio-header shrink-0 border-b px-3 py-2">
        <p className="flex min-w-0 items-center gap-1.5 truncate text-[9px] font-bold uppercase tracking-wider omni-accent-text">
          <Layers className="h-3 w-3 shrink-0" />
          <span className="truncate">Control Matrix</span>
        </p>
        <p className="truncate whitespace-nowrap text-[8px]" style={{ color: "var(--omni-text-muted)" }}>
          PBR swatches · structural elements
        </p>
      </header>

      <div className="ide-pane-scroll min-h-0 min-w-0 flex-1 space-y-4 overflow-x-hidden overflow-y-auto overscroll-y-contain p-3">
        <section className="min-w-0">
          <p className="mb-2 truncate whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Material swatches
          </p>
          <div className="grid min-w-0 grid-cols-3 gap-2">
            {PBR_SWATCHES.map((swatch) => (
              <button
                key={swatch.id}
                type="button"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/spatial-material", swatch.id)}
                onClick={() => void applyMaterial(swatch.id)}
                className="group flex min-w-0 flex-col items-center gap-1 overflow-hidden"
                title={`Apply ${swatch.label}`}
              >
                <span
                  className={cn(
                    "omni-state-ring h-11 w-11 shrink-0 rounded-full border bg-gradient-to-br shadow-inner transition group-hover:scale-105",
                    swatch.gradient,
                  )}
                  style={{ borderColor: "#1E293B" }}
                />
                <span className="w-full truncate text-center text-[8px] text-zinc-500">{swatch.label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="min-w-0">
          <p className="mb-2 flex min-w-0 items-center gap-1 truncate whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
            <Package className="h-3 w-3 shrink-0" />
            <span className="truncate">Structural elements</span>
          </p>
          <div className="grid min-w-0 grid-cols-3 gap-2">
            {structural.map((item) => (
              <button
                key={item.emoji}
                type="button"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("text/spatial-asset", item.label)}
                onClick={() => void spawnStructural(item)}
                className="omni-state-ring flex min-w-0 flex-col items-center gap-1 overflow-hidden rounded-lg border p-2 transition hover:brightness-110"
                style={{ borderColor: "#1E293B", background: "color-mix(in srgb, #111827 90%, transparent)" }}
                title={`Place ${item.label}`}
              >
                <span className="shrink-0 text-xl">{item.emoji}</span>
                <span className="w-full truncate text-center text-[7px] text-zinc-500">{item.label}</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
