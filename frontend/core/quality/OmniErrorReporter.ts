import type { CrashReport } from "./types";

/** OmniErrorReporter — crash logging and recovery tracking. */
export class OmniErrorReporter {
  crashes: CrashReport[] = [];

  recordCrash(message: string, recovered = false) {
    const crash: CrashReport = {
      id: `err-${Date.now()}`,
      message,
      recovered,
      timestamp: new Date().toISOString(),
    };
    this.crashes.unshift(crash);
    if (this.crashes.length > 100) this.crashes.pop();
    return crash;
  }

  lastCrash() {
    return this.crashes[0] ?? null;
  }

  recoveryRate() {
    if (!this.crashes.length) return 1;
    const recovered = this.crashes.filter((c) => c.recovered).length;
    return recovered / this.crashes.length;
  }
}

export const omniErrorReporter = new OmniErrorReporter();
