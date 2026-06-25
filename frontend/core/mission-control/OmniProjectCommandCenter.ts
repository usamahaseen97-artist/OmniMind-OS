import { omniProjectHub } from "../omnicore/OmniProjectHub";
import { omniProjectManagerPro } from "../ecosystem/OmniProjectManagerPro";
import { omniQuality } from "../quality/OmniQuality";
import type { ProjectCommandRow } from "./types";

/** Project Command Center — progress, health, deployments per project. */
export class OmniProjectCommandCenter {
  list(): ProjectCommandRow[] {
    const health = omniQuality.health.overallStatus();
    const healthScore =
      health === "healthy" ? 92 : health === "degraded" ? 68 : health === "unhealthy" ? 35 : 55;

    return omniProjectHub.listRecent().map((p) => {
      const view = omniProjectManagerPro.view(p.id);
      const deployAssets = view?.deployments.length ?? 0;
      return {
        projectId: p.id,
        name: p.name,
        progress: Math.min(100, p.version * 15),
        healthScore,
        errors: 0,
        warnings: p.metadata && Object.keys(p.metadata).length > 5 ? 1 : 0,
        deploymentStatus: deployAssets > 0 ? "deployed" : "pending",
        assetCount: view?.assets.length ?? 0,
        memoryEntries: view?.memory.length ?? 0,
        aiContextPreview: view?.aiContext?.slice(0, 120) ?? "",
      };
    });
  }

  get(projectId: string) {
    return this.list().find((p) => p.projectId === projectId) ?? null;
  }
}

export const omniProjectCommandCenter = new OmniProjectCommandCenter();
