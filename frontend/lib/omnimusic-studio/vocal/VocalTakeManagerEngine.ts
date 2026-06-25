import type { VocalTake } from "../vocal-types";

export class VocalTakeManagerEngine {
  private takes: VocalTake[] = [];

  list(trackId?: string): VocalTake[] {
    return trackId ? this.takes.filter((t) => t.trackId === trackId) : [...this.takes];
  }

  add(take: Omit<VocalTake, "id" | "recordedAt">): VocalTake {
    const full: VocalTake = { ...take, id: `vt-${Date.now()}`, recordedAt: new Date().toISOString() };
    this.takes.unshift(full);
    return full;
  }

  star(id: string) {
    const t = this.takes.find((x) => x.id === id);
    if (t) t.starred = !t.starred;
  }

  comp(id: string) {
    const t = this.takes.find((x) => x.id === id);
    if (t) {
      this.takes.forEach((x) => {
        if (x.trackId === t.trackId) x.comped = x.id === id;
      });
    }
  }

  delete(id: string) {
    this.takes = this.takes.filter((t) => t.id !== id);
  }
}

export const vocalTakeManagerEngine = new VocalTakeManagerEngine();
