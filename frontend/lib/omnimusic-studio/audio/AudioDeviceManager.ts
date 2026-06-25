import type { AudioDeviceInfo, AudioSettings } from "../audio-types";

function inferTransport(label: string): AudioDeviceInfo["transport"] {
  const l = label.toLowerCase();
  if (l.includes("bluetooth") || l.includes("airpods")) return "bluetooth";
  if (l.includes("usb") || l.includes("focusrite") || l.includes("scarlett")) return "usb";
  if (l.includes("virtual") || l.includes("cable")) return "virtual";
  return "builtin";
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  inputDeviceId: null,
  outputDeviceId: null,
  sampleRate: 48000,
  bitDepth: 24,
  bufferSize: 512,
  clockSource: "internal",
};

export class AudioDeviceManagerEngine {
  async enumerate(): Promise<AudioDeviceInfo[]> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.enumerateDevices) {
      return this.fallbackDevices();
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter((d) => d.kind === "audioinput" || d.kind === "audiooutput")
        .map((d) => ({
          deviceId: d.deviceId,
          label: d.label || `${d.kind} (${d.deviceId.slice(0, 8)})`,
          kind: d.kind as "audioinput" | "audiooutput",
          transport: inferTransport(d.label || ""),
        }));
    } catch {
      return this.fallbackDevices();
    }
  }

  private fallbackDevices(): AudioDeviceInfo[] {
    return [
      { deviceId: "default-in", label: "Default Microphone", kind: "audioinput", transport: "builtin" },
      { deviceId: "default-out", label: "Default Speakers", kind: "audiooutput", transport: "builtin" },
      { deviceId: "usb-placeholder", label: "USB Audio Interface (placeholder)", kind: "audioinput", transport: "usb" },
      { deviceId: "bt-placeholder", label: "Bluetooth Headset (placeholder)", kind: "audiooutput", transport: "bluetooth" },
    ];
  }

  applySettings(settings: AudioSettings): AudioSettings {
    return { ...settings };
  }
}

export const audioDeviceManagerEngine = new AudioDeviceManagerEngine();
