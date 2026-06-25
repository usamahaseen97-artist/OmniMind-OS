import type { CharacterArchetype, CharacterPreset } from "./types";

export class CharacterCreatorEngine {
  generate(archetype: CharacterArchetype, name: string): CharacterPreset {
    return { id: `char-${Date.now()}`, name, archetype, rigId: null };
  }
}

export const characterCreatorEngine = new CharacterCreatorEngine();
