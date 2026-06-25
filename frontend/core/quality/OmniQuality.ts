import { OMNICORE_QUALITY_VERSION } from "./constants";
import { omniAIValidator } from "./OmniAIValidator";
import { omniErrorReporter } from "./OmniErrorReporter";
import { omniHealthMonitor } from "./OmniHealthMonitor";
import { omniObservability } from "./OmniObservability";
import { omniTestCatalog } from "./OmniTestCatalog";

/** OmniQuality — QA, observability, and reliability platform facade. */
export class OmniQuality {
  readonly version = OMNICORE_QUALITY_VERSION;

  readonly errors = omniErrorReporter;
  readonly observability = omniObservability;
  readonly health = omniHealthMonitor;
  readonly aiValidator = omniAIValidator;
  readonly tests = omniTestCatalog;

  private booted = false;

  boot() {
    if (this.booted) return this;
    this.booted = true;
    return this;
  }

  async runHealthProbes(baseUrl = "") {
    const prefix = baseUrl || (typeof window !== "undefined" ? "" : "http://127.0.0.1:8001");
    await Promise.allSettled([
      this.health.probeEndpoint("backend-api", `${prefix}/api/v1/auth/health`),
      this.health.probeEndpoint("omnicore", `${prefix}/api/v1/omnicore/projects`),
    ]);
    return this.health.dashboard();
  }

  snapshot() {
    return {
      version: this.version,
      health: this.health.overallStatus(),
      services: this.health.services,
      metrics: this.observability.metrics(),
      testPassRate: this.tests.passRate(),
      lastCrash: this.errors.lastCrash(),
      aiValidation: this.aiValidator.results,
    };
  }
}

export const omniQuality = new OmniQuality();
