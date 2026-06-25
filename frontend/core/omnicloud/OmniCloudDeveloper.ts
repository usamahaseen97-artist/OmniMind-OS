/** Developer Cloud — SDK, APIs, CLI, webhooks, cloud functions. */
export class OmniCloudDeveloper {
  readonly apiBase = "/api/v1/omnicore/omnicloud";
  readonly cliCommand = "omnicloud";
  readonly sdkPackage = "@omnimind/omnicloud-sdk";

  endpoints() {
    return [
      { method: "GET", path: "/account", description: "Account and devices" },
      { method: "POST", path: "/sync", description: "Sync all domains" },
      { method: "POST", path: "/sync/{domain}", description: "Sync single domain" },
      { method: "GET", path: "/projects/{id}/snapshots", description: "List project snapshots" },
      { method: "POST", path: "/remote/jobs", description: "Enqueue remote job" },
      { method: "GET", path: "/storage", description: "Storage buckets" },
      { method: "GET", path: "/admin/dashboard", description: "Admin analytics" },
    ];
  }

  webhookEvents() {
    return ["sync.completed", "job.completed", "job.failed", "device.registered", "conflict.detected"];
  }

  cloudFunctionTemplate(name: string) {
    return `export async function ${name}(event) {
  const res = await fetch("${this.apiBase}/sync", { method: "POST" });
  return res.json();
}`;
  }

  snapshot() {
    return { apiBase: this.apiBase, endpoints: this.endpoints().length, webhooks: this.webhookEvents().length };
  }
}

export const omniCloudDeveloper = new OmniCloudDeveloper();
