import type { PBRMaterial, MaterialPreset } from "./types";

export class MaterialEngine3D {
  create(materials: PBRMaterial[], name: string, preset: MaterialPreset): PBRMaterial[] {
    return [
      ...materials,
      {
        id: `mat-${Date.now()}`,
        name,
        preset,
        baseColor: "#94a3b8",
        metallic: preset === "metal" ? 1 : 0,
        roughness: 0.5,
        emission: preset === "emission" ? 1 : 0,
        opacity: preset === "glass" ? 0.3 : 1,
        normalMap: null,
      },
    ];
  }

  update(materials: PBRMaterial[], id: string, patch: Partial<PBRMaterial>): PBRMaterial[] {
    return materials.map((m) => (m.id === id ? { ...m, ...patch } : m));
  }
}

export const materialEngine3D = new MaterialEngine3D();
