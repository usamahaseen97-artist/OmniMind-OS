import { getOmniMindBrain } from "../../../brain/OmniMindBrain";

/** Production bridge — Brain memory for ops events */
export class ProductionBrainBridge {
  readonly toolId = "medical-diagnostic-suite";

  pinOpsEvent(summary: string) {
    try {
      const brain = getOmniMindBrain();
      brain.globalMemory.pinNote(`Production: ${summary}`);
      brain.globalMemory.rememberTool(this.toolId);
    } catch { /* optional */ }
  }

  async recordDeployment(version: string, environment: string) {
    this.pinOpsEvent(`Deployed ${version} to ${environment}`);
    try {
      const brain = getOmniMindBrain();
      await brain.brain2.enhanceUnderstanding(`Medical suite deployment ${version}`, [`env:${environment}`]);
    } catch { /* optional */ }
  }
}

let bridge: ProductionBrainBridge | null = null;

export function getProductionBrainBridge() {
  if (!bridge) bridge = new ProductionBrainBridge();
  return bridge;
}
