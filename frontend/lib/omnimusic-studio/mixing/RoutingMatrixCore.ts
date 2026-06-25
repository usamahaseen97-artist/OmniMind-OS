import type { DspRoute } from "../mixing-types";

export class RoutingMatrixCore {
  routes: DspRoute[] = [];

  connect(fromChannelId: string, toBusId: string, gain = 1) {
    this.routes.push({ id: `rt-${Date.now()}`, fromChannelId, toBusId, gain, enabled: true });
  }

  toggle(id: string) {
    this.routes = this.routes.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r));
  }
}

export const routingMatrixCore = new RoutingMatrixCore();
