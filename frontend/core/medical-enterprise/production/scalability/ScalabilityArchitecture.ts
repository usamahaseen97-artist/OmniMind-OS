import type { DeploymentTier, TenantConfig } from "../types";

/** Scalability architecture — multi-tenant, multi-region, horizontal scaling */
export class ScalabilityArchitecture {
  private tenants = new Map<string, TenantConfig>();

  registerTenant(config: TenantConfig) {
    this.tenants.set(config.id, config);
    return config;
  }

  getTenant(id: string) {
    return this.tenants.get(id);
  }

  getScalingProfile(tier: DeploymentTier) {
    const profiles: Record<DeploymentTier, { minInstances: number; maxInstances: number; loadBalanced: boolean }> = {
      clinic: { minInstances: 1, maxInstances: 2, loadBalanced: false },
      hospital: { minInstances: 2, maxInstances: 8, loadBalanced: true },
      network: { minInstances: 4, maxInstances: 24, loadBalanced: true },
      "multi-tenant": { minInstances: 4, maxInstances: 48, loadBalanced: true },
      "multi-region": { minInstances: 8, maxInstances: 96, loadBalanced: true },
    };
    return profiles[tier];
  }

  listDistributedServices() {
    return [
      { id: "clinical-ai", distributed: true, stateless: true },
      { id: "imaging-pipeline", distributed: true, stateless: false },
      { id: "laboratory-stream", distributed: true, stateless: true },
      { id: "his-api", distributed: true, stateless: true },
      { id: "governance-audit", distributed: false, stateless: false },
    ];
  }
}

let arch: ScalabilityArchitecture | null = null;

export function getScalabilityArchitecture() {
  if (!arch) arch = new ScalabilityArchitecture();
  return arch;
}
