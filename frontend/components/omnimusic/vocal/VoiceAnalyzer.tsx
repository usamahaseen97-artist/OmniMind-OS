"use client";

import { useOmniMusicStudio } from "../../../lib/omnimusic-studio-context";

export function VoiceAnalyzer() {
  const { voiceAnalysis, vocalTakes, analyzeTake } = useOmniMusicStudio();

  return (
    <div className="mb-3">
      <p className="mb-1 text-[9px] uppercase text-slate-600">Voice Analysis</p>
      {vocalTakes[0] ? (
        <button type="button" onClick={() => analyzeTake(vocalTakes[0]!.id)} className="mb-2 text-[8px] text-cyan-400">Analyze latest take</button>
      ) : null}
      {voiceAnalysis ? (
        <div className="grid grid-cols-2 gap-1 text-[8px] text-slate-500">
          <span>Pitch: {voiceAnalysis.pitch.averageHz.toFixed(0)} Hz</span>
          <span>Timing: {voiceAnalysis.timingMs}ms</span>
          <span>Dynamics: {voiceAnalysis.dynamicsDb.toFixed(1)} dB</span>
          <span>Breaths: {voiceAnalysis.breathingEvents}</span>
          <span>Pronunciation: {voiceAnalysis.pronunciationScore.toFixed(0)}%</span>
          <span>Energy: {voiceAnalysis.energy.toFixed(0)}</span>
          <span>Range: {voiceAnalysis.rangeSemitones.toFixed(1)} st</span>
          <span>Confidence: {(voiceAnalysis.confidence * 100).toFixed(0)}%</span>
        </div>
      ) : (
        <p className="text-[8px] text-slate-600">Record a take to analyze performance</p>
      )}
    </div>
  );
}

export function PitchAnalyzer() {
  const { voiceAnalysis } = useOmniMusicStudio();
  if (!voiceAnalysis) return null;
  const p = voiceAnalysis.pitch;
  return (
    <div className="text-[8px] text-slate-500">
      <p className="text-[9px] uppercase text-slate-600">Pitch</p>
      Avg {p.averageHz.toFixed(1)} Hz · {p.centsOff.toFixed(1)} cents off · conf {(p.confidence * 100).toFixed(0)}%
    </div>
  );
}
