import type { PhysicsObject, PhysicsType } from "./types";

/** Physics simulation architecture — placeholders only. */
export class PhysicsSimulationEngine {
  createObject(type: PhysicsType, label: string): PhysicsObject {
    return {
      id: `phys-${Date.now()}`,
      type,
      label,
      mass: type === "rigid-body" ? 1 : 0.5,
      enabled: true,
    };
  }

  step(objects: PhysicsObject[], _delta: number): PhysicsObject[] {
    return objects;
  }
}

export const physicsSimulationEngine = new PhysicsSimulationEngine();
