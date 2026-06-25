import type { MixBus } from "../mixing-types";

export class BusManagerCore {
  list(buses: MixBus[], kind?: MixBus["kind"]) {
    return kind ? buses.filter((b) => b.kind === kind) : buses;
  }

  update(buses: MixBus[], id: string, patch: Partial<MixBus>): MixBus[] {
    return buses.map((b) => (b.id === id ? { ...b, ...patch } : b));
  }
}

export const busManagerCore = new BusManagerCore();
