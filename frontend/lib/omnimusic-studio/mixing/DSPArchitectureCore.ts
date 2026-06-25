import type { DspGraphNode } from "../mixing-types";

export class DSPArchitectureCore {
  buildGraph(channelCount: number, busCount: number): DspGraphNode[] {
    const nodes: DspGraphNode[] = [
      { id: "in", type: "input", label: "Input", connections: ["ch-0"] },
    ];
    for (let i = 0; i < channelCount; i++) {
      nodes.push({ id: `ch-${i}`, type: "channel", label: `CH ${i + 1}`, connections: [`bus-0`, "master"] });
    }
    for (let i = 0; i < busCount; i++) {
      nodes.push({ id: `bus-${i}`, type: "bus", label: `Bus ${i + 1}`, connections: ["master"] });
    }
    nodes.push({ id: "master", type: "master", label: "Master", connections: ["out"] });
    nodes.push({ id: "out", type: "output", label: "Output", connections: [] });
    return nodes;
  }
}

export const dspArchitectureCore = new DSPArchitectureCore();
