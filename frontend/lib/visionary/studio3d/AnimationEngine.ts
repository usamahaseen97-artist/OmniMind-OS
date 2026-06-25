import type { AnimationClip3D, RigDefinition } from "./types";

export class AnimationEngine3D {
  createClip(clips: AnimationClip3D[], name: string, category: AnimationClip3D["category"]): AnimationClip3D[] {
    return [...clips, { id: `anim-${Date.now()}`, name, durationFrames: 120, category, loop: category === "walk" || category === "run" }];
  }

  createRig(rigs: RigDefinition[], name: string): RigDefinition[] {
    return [...rigs, { id: `rig-${Date.now()}`, name, boneCount: 64, ikEnabled: true, fkEnabled: true }];
  }
}

export const animationEngine3D = new AnimationEngine3D();
