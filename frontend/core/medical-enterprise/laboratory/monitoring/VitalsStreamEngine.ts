import type { VitalReading, VitalSignType, StreamSubscription } from "../types";

type StreamListener = (reading: VitalReading) => void;

/** Real-time vitals streaming architecture */
export class VitalsStreamEngine {
  private buffers = new Map<string, VitalReading[]>();
  private subscriptions = new Map<string, StreamSubscription>();
  private listeners = new Map<string, Set<StreamListener>>();
  private maxBuffer = 500;

  subscribe(patientId: string, types: StreamSubscription["types"] = ["vitals"]): StreamSubscription {
    const sub: StreamSubscription = {
      id: `stream-${Date.now()}`,
      patientId,
      types,
      createdAt: new Date().toISOString(),
      active: true,
    };
    this.subscriptions.set(sub.id, sub);
    if (!this.listeners.has(patientId)) this.listeners.set(patientId, new Set());
    return sub;
  }

  unsubscribe(subscriptionId: string) {
    const sub = this.subscriptions.get(subscriptionId);
    if (sub) sub.active = false;
  }

  push(reading: VitalReading) {
    const buf = this.buffers.get(reading.patientId) ?? [];
    buf.push(reading);
    if (buf.length > this.maxBuffer) buf.shift();
    this.buffers.set(reading.patientId, buf);

    const listeners = this.listeners.get(reading.patientId);
    if (listeners) {
      for (const fn of listeners) fn(reading);
    }
  }

  onReading(patientId: string, listener: StreamListener) {
    let set = this.listeners.get(patientId);
    if (!set) {
      set = new Set();
      this.listeners.set(patientId, set);
    }
    set.add(listener);
    return () => set!.delete(listener);
  }

  getRecent(patientId: string, type?: VitalSignType, limit = 50) {
    const buf = this.buffers.get(patientId) ?? [];
    let filtered = type ? buf.filter((r) => r.type === type) : buf;
    return filtered.slice(-limit);
  }

  getTimeline(patientId: string, from?: string, to?: string) {
    let readings = this.buffers.get(patientId) ?? [];
    if (from) readings = readings.filter((r) => r.recordedAt >= from);
    if (to) readings = readings.filter((r) => r.recordedAt <= to);
    return readings;
  }
}

let engine: VitalsStreamEngine | null = null;

export function getVitalsStreamEngine() {
  if (!engine) engine = new VitalsStreamEngine();
  return engine;
}
