"use client";

import { cn } from "../../../lib/utils";
import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";
import { MixerEngine } from "./MixerEngine";
import { BusManager } from "./BusManager";
import { RoutingMatrix } from "./RoutingMatrix";
import { MasteringSuite } from "./MasteringSuite";
import { ReferenceTrackManager } from "./ReferenceTrackManager";
import { FXRack } from "./FXRack";
import { PluginHost } from "./PluginHost";
import { EQStudio } from "./EQStudio";
import { CompressorStudio } from "./CompressorStudio";
import { LimiterStudio } from "./LimiterStudio";
import { GateStudio } from "./GateStudio";
import { ReverbStudio } from "./ReverbStudio";
import { DelayStudio } from "./DelayStudio";
import { StereoImager } from "./StereoImager";
import { SaturationStudio } from "./SaturationStudio";
import { MultibandCompressor } from "./MultibandCompressor";
import { LoudnessMeter } from "./LoudnessMeter";
import { SpectrumAnalyzer } from "./SpectrumAnalyzer";
import { Oscilloscope } from "./Oscilloscope";
import { PhaseAnalyzer } from "./PhaseAnalyzer";
import { CorrelationMeter } from "./CorrelationMeter";
import { PresetManager } from "./PresetManager";
import { AutomationCurves } from "./AutomationCurves";
import { DSPArchitecture } from "./DSPArchitecture";

const PANELS = [
  { id: "mixer" as const, label: "Mixer" },
  { id: "mastering" as const, label: "Mastering" },
  { id: "fx" as const, label: "FX" },
  { id: "analysis" as const, label: "Analysis" },
  { id: "automation" as const, label: "Automation" },
  { id: "dsp" as const, label: "DSP" },
];

export function MixingWorkspace() {
  const { mixingPanel, setMixingPanel, mixSuggestions, mixReport } = useOmniMusicStudio();

  return (
    <div className="flex h-full flex-col bg-[#080a0e]">
      <div className="flex shrink-0 flex-wrap gap-0.5 border-b border-white/[0.06] p-1">
        {PANELS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setMixingPanel(p.id)}
            className={cn("rounded px-2 py-0.5 text-[8px]", mixingPanel === p.id ? "bg-amber-500/15 text-amber-200" : "text-slate-600")}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2">
        {mixingPanel === "mixer" ? (
          <>
            <MixerEngine />
            <BusManager />
            <RoutingMatrix />
            <PresetManager />
          </>
        ) : null}
        {mixingPanel === "mastering" ? (
          <>
            <MasteringSuite />
            <ReferenceTrackManager />
            <LimiterStudio />
          </>
        ) : null}
        {mixingPanel === "fx" ? (
          <div className="grid gap-2 md:grid-cols-2">
            <FXRack />
            <PluginHost />
            <EQStudio />
            <CompressorStudio />
            <GateStudio />
            <ReverbStudio />
            <DelayStudio />
            <StereoImager />
            <SaturationStudio />
            <MultibandCompressor />
          </div>
        ) : null}
        {mixingPanel === "analysis" ? (
          <>
            <div className="grid gap-2 md:grid-cols-2">
              <LoudnessMeter />
              <SpectrumAnalyzer />
              <Oscilloscope />
              <PhaseAnalyzer />
              <CorrelationMeter />
            </div>
            <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
              <p className="mb-2 text-[9px] font-medium text-slate-300">Mix Report</p>
              <p className="text-[8px] text-slate-500">
                Clipping: {mixReport.clipping ? "Yes" : "No"} · DR {mixReport.dynamicRangeDb.toFixed(1)} dB · Balance {mixReport.stereoBalance.toFixed(2)}
              </p>
            </div>
            <div className="rounded border border-white/[0.06] bg-white/[0.02] p-2">
              <p className="mb-2 text-[9px] font-medium text-amber-200/80">AI Mix Assistant</p>
              {mixSuggestions.length === 0 ? <p className="text-[8px] text-slate-600">No suggestions yet</p> : null}
              {mixSuggestions.map((s) => (
                <div key={s.id} className="mb-1 rounded border border-white/[0.04] px-2 py-1 text-[8px]">
                  <span className="text-amber-400/80">{s.category}</span>
                  <span className="ml-2 text-slate-400">{s.title}</span>
                  <p className="text-slate-600">{s.detail}</p>
                </div>
              ))}
            </div>
          </>
        ) : null}
        {mixingPanel === "automation" ? <AutomationCurves /> : null}
        {mixingPanel === "dsp" ? <DSPArchitecture /> : null}
      </div>
    </div>
  );
}
