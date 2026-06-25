/** Minimal semver utilities for plugin compatibility and upgrades. */
export class VersionManager {
  parse(version: string): [number, number, number] {
    const [maj = 0, min = 0, pat = 0] = version.replace(/^v/, "").split(".").map(Number);
    return [maj, min, pat];
  }

  compare(a: string, b: string): number {
    const va = this.parse(a);
    const vb = this.parse(b);
    for (let i = 0; i < 3; i++) {
      if (va[i] > vb[i]) return 1;
      if (va[i] < vb[i]) return -1;
    }
    return 0;
  }

  satisfies(version: string, range: string): boolean {
    if (range === "*" || range === "latest") return true;
    if (range.startsWith(">=")) return this.compare(version, range.slice(2).trim()) >= 0;
    if (range.startsWith("^")) {
      const [maj] = this.parse(range.slice(1));
      const [vMaj, vMin] = this.parse(version);
      const [, rMin] = this.parse(range.slice(1));
      return vMaj === maj && (vMaj > maj || vMin >= rMin);
    }
    return this.compare(version, range) === 0;
  }

  canUpgrade(current: string, next: string): boolean {
    return this.compare(next, current) > 0;
  }
}

let manager: VersionManager | null = null;

export function getVersionManager(): VersionManager {
  if (!manager) manager = new VersionManager();
  return manager;
}

export const OMNI_MIND_PLATFORM_VERSION = "12.0.0";
