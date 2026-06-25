type ProviderId = "primary" | "fallback_a" | "fallback_b";

const PROVIDERS: ProviderId[] = ["primary", "fallback_a", "fallback_b"];

/** Failover — switch AI provider on failure, retry safely. */
export class FailoverManager {
  private active: ProviderId = "primary";
  private failures = new Map<ProviderId, number>();
  private logs: { at: string; from: ProviderId; to: ProviderId; reason: string }[] = [];

  getActiveProvider() {
    return this.active;
  }

  getLogs() {
    return [...this.logs];
  }

  async execute<T>(fn: (provider: ProviderId) => Promise<T>): Promise<T> {
    const order = [this.active, ...PROVIDERS.filter((p) => p !== this.active)];
    let lastError: unknown;

    for (const provider of order) {
      try {
        const result = await fn(provider);
        if (provider !== this.active) {
          this.logs.push({
            at: new Date().toISOString(),
            from: this.active,
            to: provider,
            reason: "Automatic failover",
          });
          this.active = provider;
        }
        return result;
      } catch (err) {
        lastError = err;
        this.failures.set(provider, (this.failures.get(provider) ?? 0) + 1);
      }
    }

    throw lastError instanceof Error ? lastError : new Error("All providers failed");
  }
}
