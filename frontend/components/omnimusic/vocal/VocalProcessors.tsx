"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

function ChainToggle({ label, enabled, onToggle, children }: { label: string; enabled: boolean; onToggle: () => void; children?: React.ReactNode }) {
  return (
    <div className="border-b border-white/[0.04] py-1">
      <button type="button" onClick={onToggle} className={`text-[8px] ${enabled ? "text-cyan-300" : "text-slate-600"}`}>{label}</button>
      {children}
    </div>
  );
}

export function VoiceCleaner() {
  const { processingChain, applyVoiceClean } = useOmniMusicStudio();
  return <ChainToggle label="Voice Cleaner" enabled={processingChain.noiseCleanup.enabled} onToggle={applyVoiceClean} />;
}

export function NoiseReducer() {
  const { processingChain, updateProcessingChain } = useOmniMusicStudio();
  const n = processingChain.noiseCleanup;
  return (
    <ChainToggle label={`Noise Reducer (${n.amount}%)`} enabled={n.enabled} onToggle={() => updateProcessingChain({ noiseCleanup: { enabled: !n.enabled, amount: n.amount } })}>
      <input type="range" min={0} max={100} value={n.amount} onChange={(e) => updateProcessingChain({ noiseCleanup: { ...n, amount: Number(e.target.value) } })} className="w-full" />
    </ChainToggle>
  );
}

export function BreathRemoval() {
  const { processingChain, updateProcessingChain } = useOmniMusicStudio();
  const b = processingChain.breathReduction;
  return (
    <ChainToggle label="Breath Removal" enabled={b.enabled} onToggle={() => updateProcessingChain({ breathReduction: { enabled: !b.enabled, amount: b.amount } })}>
      <input type="range" min={0} max={100} value={b.amount} onChange={(e) => updateProcessingChain({ breathReduction: { ...b, amount: Number(e.target.value) } })} className="w-full" />
    </ChainToggle>
  );
}

export function DeEsser() {
  const { processingChain, applyDeEss } = useOmniMusicStudio();
  return <ChainToggle label="De-Esser" enabled={processingChain.deEsser.enabled} onToggle={applyDeEss} />;
}

export function EQAssistant() {
  const { processingChain, updateProcessingChain } = useOmniMusicStudio();
  const eq = processingChain.eq;
  return (
    <div className="text-[8px] text-slate-500">
      EQ · Low {eq.low} Mid {eq.mid} High {eq.high} Air {eq.air}
      <button type="button" onClick={() => updateProcessingChain({ eq: { low: -1, mid: 0, high: 3, air: 2 } })} className="ml-2 text-cyan-400">Suggest</button>
    </div>
  );
}

export function CompressorAssistant() {
  const { processingChain } = useOmniMusicStudio();
  const c = processingChain.compressor;
  return <p className="text-[8px] text-slate-500">Compressor · {c.ratio}:1 @ {c.threshold}dB</p>;
}

export function ReverbAssistant() {
  const { processingChain } = useOmniMusicStudio();
  return <p className="text-[8px] text-slate-500">Reverb · {processingChain.reverb.mix}% mix</p>;
}

export function DelayAssistant() {
  const { processingChain } = useOmniMusicStudio();
  return <p className="text-[8px] text-slate-500">Delay · {processingChain.delay.timeMs}ms</p>;
}

export function HarmonyEngine() {
  const { processingChain, applyHarmony } = useOmniMusicStudio();
  return (
    <div className="flex items-center justify-between text-[8px]">
      <span className="text-slate-500">Harmony · {processingChain.harmony.intervals.join(", ")}</span>
      <button type="button" onClick={applyHarmony} className="text-cyan-400">Generate</button>
    </div>
  );
}

export function DoubleTracking() {
  const { processingChain, applyDoubleTrack } = useOmniMusicStudio();
  const d = processingChain.doubleTracking;
  return (
    <div className="flex items-center justify-between text-[8px]">
      <span className="text-slate-500">Double · {d.delayMs}ms · width {d.width}%</span>
      <button type="button" onClick={applyDoubleTrack} className="text-cyan-400">Enable</button>
    </div>
  );
}

export function ChoirGenerator() {
  const { choirLayers } = useOmniMusicStudio();
  return <p className="text-[8px] text-slate-500">Choir layers: {choirLayers.join(" · ")}</p>;
}

export function BackingVocals() {
  return <p className="text-[8px] text-slate-600">Backing vocal harmonies — architecture stub</p>;
}
