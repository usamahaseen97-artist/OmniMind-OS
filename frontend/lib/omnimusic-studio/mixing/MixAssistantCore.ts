import type { MixAssistantSuggestion } from "../mixing-types";

export class MixAssistantCore {
  suggest(report?: { clipping?: boolean; mudFreqHz?: number[] }): MixAssistantSuggestion[] {
    const out: MixAssistantSuggestion[] = [
      { id: "s1", category: "eq", title: "Cut mud at 300 Hz", detail: "Reduce 2–4 dB on bus channels around 250–400 Hz." },
      { id: "s2", category: "compression", title: "Gentle bus compression", detail: "2:1 ratio, 30ms attack on drum subgroup." },
      { id: "s3", category: "limiter", title: "Master limiter ceiling", detail: "Set ceiling to -1.0 dBTP for streaming." },
      { id: "s4", category: "stereo", title: "Widen synth pad", detail: "Stereo width 110% with mono bass below 120 Hz." },
      { id: "s5", category: "gain", title: "Gain staging", detail: "Peak channels at -12 dBFS before master bus." },
      { id: "s6", category: "master", title: "Master chain order", detail: "EQ → Multiband → Limiter." },
    ];
    if (report?.clipping) out.unshift({ id: "sc", category: "clip", title: "Clipping detected", detail: "Reduce master gain or channel peaks." });
    if (report?.mudFreqHz?.length) out.push({ id: "sm", category: "mud", title: "Mud detected", detail: `Problem bands: ${report.mudFreqHz.join(", ")} Hz` });
    return out;
  }
}

export const mixAssistantCore = new MixAssistantCore();
