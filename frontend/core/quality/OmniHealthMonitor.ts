import { omniObservability } from "./OmniObservability";
import type { HealthStatus, ServiceHealth } from "./types";

/** OmniHealthMonitor — live system status and service health. */
export class OmniHealthMonitor {
  services: ServiceHealth[] = [
    { name: "omnicore", status: "unknown", latencyMs: null, message: null },
    { name: "backend-api", status: "unknown", latencyMs: null, message: null },
    { name: "ai-providers", status: "unknown", latencyMs: null, message: null },
    { name: "database", status: "unknown", latencyMs: null, message: null },
    { name: "streaming", status: "unknown", latencyMs: null, message: null },
  ];

  updateService(name: string, status: HealthStatus, latencyMs: number | null = null, message: string | null = null) {
    const svc = this.services.find((s) => s.name === name);
    if (svc) {
      svc.status = status;
      svc.latencyMs = latencyMs;
      svc.message = message;
    } else {
      this.services.push({ name, status, latencyMs, message });
    }
  }

  async probeEndpoint(name: string, url: string) {
    const start = Date.now();
    try {
      const res = await fetch(url, { method: "GET" });
      const latencyMs = Date.now() - start;
      omniObservability.recordLatency(`health.${name}`, latencyMs);
      this.updateService(name, res.ok ? "healthy" : "degraded", latencyMs, `HTTP ${res.status}`);
      return res.ok;
    } catch (err) {
      this.updateService(name, "unhealthy", Date.now() - start, err instanceof Error ? err.message : "probe failed");
      return false;
    }
  }

  overallStatus(): HealthStatus {
    if (this.services.some((s) => s.status === "unhealthy")) return "unhealthy";
    if (this.services.some((s) => s.status === "degraded")) return "degraded";
    if (this.services.every((s) => s.status === "healthy")) return "healthy";
    return "unknown";
  }

  dashboard() {
    return {
      status: this.overallStatus(),
      services: this.services,
      metrics: omniObservability.metrics(),
      observability: omniObservability.snapshot(),
    };
  }
}

export const omniHealthMonitor = new OmniHealthMonitor();
