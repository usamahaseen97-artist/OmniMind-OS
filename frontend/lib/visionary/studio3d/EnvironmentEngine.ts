import type { EnvironmentElement, GameAsset, GameAssetCategory } from "./types";

export class EnvironmentBuilderEngine {
  add(elements: EnvironmentElement[], type: EnvironmentElement["type"], name: string): EnvironmentElement[] {
    return [...elements, { id: `env-${Date.now()}`, type, name, enabled: true }];
  }
}

export class GameAssetEngine {
  create(assets: GameAsset[], category: GameAssetCategory, name: string): GameAsset[] {
    return [...assets, { id: `gasset-${Date.now()}`, name, category, polyCount: 0, textureIds: [] }];
  }
}

export const environmentBuilderEngine = new EnvironmentBuilderEngine();
export const gameAssetEngine = new GameAssetEngine();
