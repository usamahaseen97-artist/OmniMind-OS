import type { MixerChannel } from "./types";

export class MixerEngine {
  syncFromTracks(channels: MixerChannel[], tracks: { id: string; name: string; volume: number; pan: number; muted: boolean; solo: boolean }[]): MixerChannel[] {
    return tracks.map((t) => {
      const existing = channels.find((c) => c.trackId === t.id);
      return existing
        ? { ...existing, name: t.name, gain: t.volume, pan: t.pan, muted: t.muted, solo: t.solo }
        : {
            id: `mix-${t.id}`,
            trackId: t.id,
            name: t.name,
            gain: t.volume,
            pan: t.pan,
            muted: t.muted,
            solo: t.solo,
            peakL: 0,
            peakR: 0,
            fxSlots: [],
            sends: [],
          };
    });
  }

  update(channels: MixerChannel[], id: string, patch: Partial<MixerChannel>): MixerChannel[] {
    return channels.map((c) => (c.id === id ? { ...c, ...patch } : c));
  }
}

export const mixerEngine = new MixerEngine();
