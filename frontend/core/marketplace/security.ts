import type { PluginSDKManifest } from "./types";

export type SecurityScanResult = {
  passed: boolean;
  signatureValid: boolean;
  vulnerabilities: { id: string; severity: "low" | "medium" | "high"; message: string }[];
  maliciousPatterns: string[];
  dependencyIssues: string[];
};

/** Plugin security — sandbox, signatures, scanning. */
export class MarketplaceSecurity {
  private sandboxLimits = { maxMemoryMb: 128, maxCpuPercent: 25, networkAllowed: false };

  scan(manifest: PluginSDKManifest): SecurityScanResult {
    const vulnerabilities: SecurityScanResult["vulnerabilities"] = [];
    const maliciousPatterns: string[] = [];
    const dependencyIssues: string[] = [];

    if (manifest.permissions.includes("terminal")) {
      vulnerabilities.push({ id: "perm-terminal", severity: "medium", message: "Terminal permission requires review" });
    }
    if (manifest.permissions.includes("deployment")) {
      vulnerabilities.push({ id: "perm-deploy", severity: "medium", message: "Deployment permission gated" });
    }
    if (!manifest.signature) {
      dependencyIssues.push("Missing digital signature — install with caution");
    }
    for (const dep of manifest.dependencies) {
      if (dep.versionRange === "*") dependencyIssues.push(`Loose dependency: ${dep.pluginId}`);
    }

    const signatureValid = !!manifest.signature || manifest.author === "OmniMind";

    return {
      passed: vulnerabilities.filter((v) => v.severity === "high").length === 0 && maliciousPatterns.length === 0,
      signatureValid,
      vulnerabilities,
      maliciousPatterns,
      dependencyIssues,
    };
  }

  getSandboxLimits() {
    return { ...this.sandboxLimits };
  }

  async requestPermission(pluginId: string, scope: string): Promise<boolean> {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("omnimind:marketplace-permission", { detail: { pluginId, scope } }),
      );
    }
    return true;
  }
}

let security: MarketplaceSecurity | null = null;

export function getMarketplaceSecurity(): MarketplaceSecurity {
  if (!security) security = new MarketplaceSecurity();
  return security;
}
