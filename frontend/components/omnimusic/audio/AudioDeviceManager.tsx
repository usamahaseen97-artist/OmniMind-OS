"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

const SAMPLE_RATES = [44100, 48000, 96000] as const;
const BUFFER_SIZES = [128, 256, 512, 1024, 2048] as const;
const BIT_DEPTHS = [16, 24, 32] as const;

export function AudioDeviceManager() {
  const { audioDevices, audioSettings, updateAudioSettings, refreshDevices } = useOmniMusicStudio();
  const inputs = audioDevices.filter((d) => d.kind === "audioinput");
  const outputs = audioDevices.filter((d) => d.kind === "audiooutput");

  return (
    <div className="border-b border-white/[0.04] p-2">
      <div className="mb-1 flex items-center justify-between">
        <p className="text-[9px] uppercase text-slate-600">Audio Devices</p>
        <button type="button" onClick={() => void refreshDevices()} className="text-[8px] text-pink-400">Scan</button>
      </div>
      <label className="mb-1 block text-[8px] text-slate-500">
        Input
        <select
          className="mt-0.5 w-full rounded bg-black/40 px-1 py-0.5 text-[8px]"
          value={audioSettings.inputDeviceId ?? ""}
          onChange={(e) => updateAudioSettings({ inputDeviceId: e.target.value || null })}
        >
          <option value="">Default</option>
          {inputs.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>{d.label} ({d.transport})</option>
          ))}
        </select>
      </label>
      <label className="mb-1 block text-[8px] text-slate-500">
        Output
        <select
          className="mt-0.5 w-full rounded bg-black/40 px-1 py-0.5 text-[8px]"
          value={audioSettings.outputDeviceId ?? ""}
          onChange={(e) => updateAudioSettings({ outputDeviceId: e.target.value || null })}
        >
          <option value="">Default</option>
          {outputs.map((d) => (
            <option key={d.deviceId} value={d.deviceId}>{d.label}</option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-1">
        <select className="rounded bg-black/40 px-1 text-[8px]" value={audioSettings.sampleRate} onChange={(e) => updateAudioSettings({ sampleRate: Number(e.target.value) as typeof audioSettings.sampleRate })}>
          {SAMPLE_RATES.map((r) => <option key={r} value={r}>{r / 1000}k</option>)}
        </select>
        <select className="rounded bg-black/40 px-1 text-[8px]" value={audioSettings.bufferSize} onChange={(e) => updateAudioSettings({ bufferSize: Number(e.target.value) as typeof audioSettings.bufferSize })}>
          {BUFFER_SIZES.map((b) => <option key={b} value={b}>{b} buf</option>)}
        </select>
        <select className="rounded bg-black/40 px-1 text-[8px]" value={audioSettings.bitDepth} onChange={(e) => updateAudioSettings({ bitDepth: Number(e.target.value) as typeof audioSettings.bitDepth })}>
          {BIT_DEPTHS.map((b) => <option key={b} value={b}>{b}-bit</option>)}
        </select>
        <select className="rounded bg-black/40 px-1 text-[8px]" value={audioSettings.clockSource} onChange={(e) => updateAudioSettings({ clockSource: e.target.value as typeof audioSettings.clockSource })}>
          <option value="internal">Internal clock</option>
          <option value="external">External (placeholder)</option>
          <option value="wordclock">Word clock (placeholder)</option>
        </select>
      </div>
    </div>
  );
}
