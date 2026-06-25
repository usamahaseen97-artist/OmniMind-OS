import type { DigitalHuman, DigitalHumanRole } from "./types";

export class DigitalHumanEngine {
  create(humans: DigitalHuman[], name: string, role: DigitalHumanRole): DigitalHuman[] {
    return [
      ...humans,
      { id: `dh-${Date.now()}`, name, role, avatarId: null, lipSyncEnabled: true, facialAnimEnabled: true },
    ];
  }
}

export const digitalHumanEngine = new DigitalHumanEngine();
