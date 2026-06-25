import { getBackendUrl } from "./backend-url";
import type { SpatialRenderDialogState, SpatialRenderMode } from "./spatial-types";

export type { SpatialRenderDialogState, SpatialRenderMode } from "./spatial-types";

export type SpatialModule = "external" | "interior";

export type SpatialDirectivePayload = {
  session_id: string;
  module: SpatialModule;
  render_mode: SpatialRenderMode;
  coordinates: Array<{
    id: string;
    type: string;
    label: string;
    position: { x: number; y: number; z: number };
    scale: { x: number; y: number; z: number };
    rotation: { x: number; y: number; z: number };
    layer?: string;
  }>;
  vectors: Array<{ from: { x: number; y: number; z: number }; to: { x: number; y: number; z: number }; node_id: string }>;
  textures: Record<string, unknown>;
  illumination: Record<string, unknown>;
  config_text: string;
  specs: Record<string, unknown>;
  archetype?: string;
};

export function spatialModuleForSlug(slug: string): SpatialModule {
  return slug === "interior-landscape" ? "interior" : "external";
}

export function spatialWsUrl(): string {
  const base = getBackendUrl().replace(/\/$/, "");
  const wsBase = base.replace(/^http/, "ws");
  return `${wsBase}/api/spatial/sync-canvas`;
}

export async function executeSpatialDirective(body: {
  module: SpatialModule;
  prompt: string;
  render_mode: SpatialRenderMode;
  session_id?: string;
}): Promise<SpatialDirectivePayload> {
  const res = await fetch(`${getBackendUrl()}/api/spatial/execute-directive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      module: body.module,
      prompt: body.prompt,
      render_mode: body.render_mode,
      session_id: body.session_id ?? "",
    }),
  });
  if (!res.ok) throw new Error(`execute-directive failed (${res.status})`);
  return res.json() as Promise<SpatialDirectivePayload>;
}

export async function toggleSpatialRenderMode(body: {
  module: SpatialModule;
  render_mode: SpatialRenderMode;
  session_id?: string;
  prompt?: string;
}): Promise<SpatialDirectivePayload> {
  const res = await fetch(`${getBackendUrl()}/api/spatial/toggle-render-mode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      module: body.module,
      render_mode: body.render_mode,
      session_id: body.session_id ?? "",
      prompt: body.prompt ?? "",
    }),
  });
  if (!res.ok) throw new Error(`toggle-render-mode failed (${res.status})`);
  return res.json() as Promise<SpatialDirectivePayload>;
}

export async function saveSpatialBlueprint(body: {
  module: SpatialModule;
  session_id?: string;
  label?: string;
}): Promise<{ ok: boolean; vault_path: string; node_count: number }> {
  const res = await fetch(`${getBackendUrl()}/api/spatial/save-blueprint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      module: body.module,
      session_id: body.session_id ?? "",
      label: body.label ?? "",
    }),
  });
  if (!res.ok) throw new Error(`save-blueprint failed (${res.status})`);
  return res.json();
}

export async function exportSpatialRender(body: {
  module: SpatialModule;
  session_id?: string;
  render_mode?: SpatialRenderMode;
  prompt?: string;
}): Promise<{
  ok: boolean;
  download_name: string;
  archive: string;
  svg_preview?: string;
  package?: Record<string, unknown>;
}> {
  const res = await fetch(`${getBackendUrl()}/api/spatial/export-render`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      module: body.module,
      session_id: body.session_id ?? "",
      render_mode: body.render_mode ?? "cinematic",
      prompt: body.prompt ?? "",
    }),
  });
  if (!res.ok) throw new Error(`export-render failed (${res.status})`);
  return res.json();
}


export type SpatialHybridSyncPayload = {
  ok: boolean;
  session_id: string;
  module: SpatialModule;
  render_mode: SpatialRenderMode;
  config_text: string;
  active_matrix_coordinates: {
    walls: Array<Record<string, unknown>>;
    assets: Array<Record<string, unknown>>;
    camera_path: {
      start: { x: number; y: number; z: number; fov: number };
      end: { x: number; y: number; z: number; fov: number };
    };
  };
  cinematic_asset_bundle: {
    texture_mappings: Array<Record<string, unknown>>;
    lighting_vectors: Record<string, unknown>;
  };
  render_dialog_state: SpatialRenderDialogState;
};

export async function processSpatialDirective(body: {
  execution_type: "ai_agent" | "manual";
  module: SpatialModule;
  parameters: {
    prompt?: string;
    adjustments?: Record<string, unknown>;
    render_settings?: Partial<SpatialRenderDialogState> & { render_mode?: SpatialRenderMode };
    session_id?: string;
  };
}): Promise<SpatialHybridSyncPayload> {
  const res = await fetch(`${getBackendUrl()}/api/spatial/process-directive`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      execution_type: body.execution_type,
      module: body.module,
      parameters: {
        prompt: body.parameters.prompt,
        adjustments: body.parameters.adjustments,
        render_settings: body.parameters.render_settings ?? {},
        session_id: body.parameters.session_id ?? "",
      },
    }),
  });
  if (!res.ok) throw new Error(`process-directive failed (${res.status})`);
  return res.json() as Promise<SpatialHybridSyncPayload>;
}

export async function syncSpatialDrag(body: {
  session_id: string;
  asset_id: string;
  x: number;
  y?: number;
  z: number;
}): Promise<{ config_text: string; structure_tree: unknown[] }> {
  const res = await fetch(`${getBackendUrl()}/api/spatial/sync-drag`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`sync-drag failed (${res.status})`);
  return res.json();
}
