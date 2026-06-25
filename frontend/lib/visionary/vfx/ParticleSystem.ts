import type { ParticleEmitter, ParticlePreset } from "./types";

const PRESET_DEFAULTS: Record<ParticlePreset, Partial<ParticleEmitter>> = {
  fire: { count: 2000, lifetime: 1.2, speed: 3, gravity: -0.5 },
  smoke: { count: 1500, lifetime: 2.5, speed: 1, gravity: -0.2 },
  dust: { count: 800, lifetime: 3, speed: 0.5, gravity: 0.1 },
  rain: { count: 5000, lifetime: 0.8, speed: 8, gravity: 9.8 },
  snow: { count: 3000, lifetime: 4, speed: 1, gravity: 0.3 },
  magic: { count: 1200, lifetime: 2, speed: 2, gravity: 0 },
  energy: { count: 1800, lifetime: 1.5, speed: 4, gravity: 0 },
  explosion: { count: 4000, lifetime: 0.6, speed: 12, gravity: 2 },
  spark: { count: 600, lifetime: 0.4, speed: 6, gravity: 3 },
  fog: { count: 2000, lifetime: 5, speed: 0.3, gravity: 0 },
  clouds: { count: 100, lifetime: 8, speed: 0.2, gravity: 0 },
};

/** Particle system architecture — simulation stubs only. */
export class ParticleSystemEngine {
  createEmitter(preset: ParticlePreset): ParticleEmitter {
    const defaults = PRESET_DEFAULTS[preset];
    return {
      id: `pe-${Date.now()}`,
      preset,
      count: defaults.count ?? 1000,
      lifetime: defaults.lifetime ?? 1,
      speed: defaults.speed ?? 1,
      gravity: defaults.gravity ?? 0,
      enabled: true,
    };
  }

  simulate(emitter: ParticleEmitter, deltaMs: number): { active: number; fps: number } {
    if (!emitter.enabled) return { active: 0, fps: 0 };
    const active = Math.floor(emitter.count * (emitter.lifetime / (emitter.lifetime + deltaMs / 1000)));
    return { active, fps: 60 };
  }
}

export const particleSystemEngine = new ParticleSystemEngine();
