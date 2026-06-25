import type { WearableDevice, DeviceSession, VitalReading, VitalSignType, DeviceTransport, WearableDeviceKind } from "../types";

/** Wearable & medical device integration registry */
export class DeviceRegistry {
  private devices = new Map<string, WearableDevice>();
  private plugins = new Map<string, { connect: (deviceId: string) => Promise<DeviceSession> }>();

  constructor() {
    const defaults: WearableDevice[] = [
      { id: "dev-watch-1", name: "Smart Watch", kind: "smart-watch", transport: "bluetooth", supportedVitals: ["heart-rate", "spo2", "activity", "sleep"], paired: false },
      { id: "dev-cgm-1", name: "Continuous Glucose Monitor", kind: "cgm", transport: "bluetooth", supportedVitals: ["blood-glucose"], paired: false },
      { id: "dev-bp-1", name: "Blood Pressure Monitor", kind: "bp-monitor", transport: "bluetooth", supportedVitals: ["blood-pressure"], paired: false },
      { id: "dev-spo2-1", name: "Pulse Oximeter", kind: "pulse-oximeter", transport: "bluetooth", supportedVitals: ["spo2", "heart-rate"], paired: false },
      { id: "dev-ecg-1", name: "ECG Monitor", kind: "ecg-monitor", transport: "wifi", supportedVitals: ["ecg", "heart-rate"], paired: false },
      { id: "dev-sleep-1", name: "Sleep Sensor", kind: "sleep-sensor", transport: "wifi", supportedVitals: ["sleep", "heart-rate"], paired: false },
      { id: "dev-band-1", name: "Fitness Band", kind: "fitness-band", transport: "bluetooth", supportedVitals: ["heart-rate", "activity", "sleep"], paired: false },
    ];
    for (const d of defaults) this.devices.set(d.id, d);
  }

  list() {
    return [...this.devices.values()];
  }

  get(deviceId: string) {
    return this.devices.get(deviceId);
  }

  registerDevice(device: WearableDevice) {
    this.devices.set(device.id, device);
  }

  registerPlugin(pluginId: string, handler: { connect: (deviceId: string) => Promise<DeviceSession> }) {
    this.plugins.set(pluginId, handler);
  }

  async sync(patientId: string, deviceId: string): Promise<{ session: DeviceSession; readings: VitalReading[] }> {
    const device = this.devices.get(deviceId);
    if (!device) throw new Error("Device not found");

    const session: DeviceSession = {
      id: `sess-${Date.now()}`,
      patientId,
      deviceId,
      deviceKind: device.kind,
      transport: device.transport,
      status: "streaming",
      startedAt: new Date().toISOString(),
      lastHeartbeat: new Date().toISOString(),
    };

    const readings = this.simulateReadings(patientId, device);
    return { session, readings };
  }

  private simulateReadings(patientId: string, device: WearableDevice): VitalReading[] {
    const now = new Date().toISOString();
    return device.supportedVitals.slice(0, 2).map((type) => ({
      id: `vital-${type}-${Date.now()}`,
      patientId,
      type,
      value: this.sampleValue(type),
      unit: this.sampleUnit(type),
      recordedAt: now,
      source: "wearable" as const,
      deviceId: device.id,
    }));
  }

  private sampleValue(type: VitalSignType): number {
    const samples: Partial<Record<VitalSignType, number>> = {
      "heart-rate": 72, spo2: 98, "blood-pressure": 120, "blood-glucose": 95, temperature: 36.6,
    };
    return samples[type] ?? 0;
  }

  private sampleUnit(type: VitalSignType): string | undefined {
    const units: Partial<Record<VitalSignType, string>> = {
      "heart-rate": "bpm", spo2: "%", "blood-glucose": "mg/dL", temperature: "°C",
    };
    return units[type];
  }
}

let registry: DeviceRegistry | null = null;

export function getDeviceRegistry() {
  if (!registry) registry = new DeviceRegistry();
  return registry;
}

export type { DeviceTransport, WearableDeviceKind };
