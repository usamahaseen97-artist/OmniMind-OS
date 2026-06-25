import type { MixBus, MixChannelStrip } from "../mixing-types";

export class ProMixerEngine {
  channels: MixChannelStrip[] = [];
  buses: MixBus[] = [];

  initFromTracks(tracks: { id: string; name: string; volume: number; pan: number; muted: boolean; solo: boolean; kind: string }[]) {
    this.channels = tracks.filter((t) => t.kind !== "master").map((t) => ({
      id: `ch-${t.id}`,
      trackId: t.id,
      name: t.name,
      gain: t.volume,
      pan: t.pan,
      muted: t.muted,
      solo: t.solo,
      peakL: Math.random() * 0.5,
      peakR: Math.random() * 0.5,
      rmsL: Math.random() * 0.3,
      rmsR: Math.random() * 0.3,
      busId: null,
      folderId: null,
      sends: t.kind === "audio" ? [{ id: `send-${t.id}`, busId: "bus-fx", level: 0.25, preFader: false }] : [],
      inserts: [],
      sidechainSourceId: null,
    }));
    this.buses = [
      { id: "bus-fx", name: "FX Return", kind: "aux", gain: 1, pan: 0, muted: false, solo: false, parentId: null, fxSlotIds: [] },
      { id: "bus-drum", name: "Drums", kind: "group", gain: 1, pan: 0, muted: false, solo: false, parentId: null, fxSlotIds: [] },
      { id: "bus-master", name: "Master", kind: "master", gain: 1, pan: 0, muted: false, solo: false, parentId: null, fxSlotIds: [] },
      { id: "bus-monitor", name: "Monitor", kind: "monitor", gain: 1, pan: 0, muted: false, solo: false, parentId: null, fxSlotIds: [] },
      { id: "bus-cue", name: "Cue Mix", kind: "cue", gain: 1, pan: 0, muted: false, solo: false, parentId: null, fxSlotIds: [] },
    ];
  }

  updateChannel(id: string, patch: Partial<MixChannelStrip>) {
    this.channels = this.channels.map((c) => (c.id === id ? { ...c, ...patch } : c));
  }

  addBus(name: string, kind: MixBus["kind"]) {
    this.buses.push({ id: `bus-${Date.now()}`, name, kind, gain: 1, pan: 0, muted: false, solo: false, parentId: null, fxSlotIds: [] });
  }
}

export const proMixerEngine = new ProMixerEngine();
