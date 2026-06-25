import { describe, expect, it } from "vitest";
import { omniCore } from "../../core/omnicore/OmniCore";
import { SYNC_DOMAINS } from "../../core/omnicloud/constants";

describe("OmniMind OmniCloud V2.0", () => {
  it("boots cloud platform on omniCore", async () => {
    omniCore.boot();
    await omniCore.cloud.boot();
    expect(omniCore.cloud.version).toBe("2.0.0");
  });

  it("exposes sync domains", () => {
    expect(SYNC_DOMAINS.length).toBeGreaterThanOrEqual(16);
    expect(SYNC_DOMAINS).toContain("projects");
    expect(SYNC_DOMAINS).toContain("ai-memory");
  });

  it("builds cloud snapshot", async () => {
    const snap = omniCore.cloud.snapshot();
    expect(snap).toHaveProperty("sync");
    expect(snap).toHaveProperty("security");
    expect(snap).toHaveProperty("storage");
  });

  it("runs local sync fallback", async () => {
    const result = await omniCore.cloud.sync.syncAll(["settings", "projects"]);
    expect(result.ok).toBe(true);
    expect(result.results.length).toBe(2);
  });

  it("exposes developer cloud endpoints", () => {
    expect(omniCore.cloud.developer.endpoints().length).toBeGreaterThanOrEqual(5);
  });
});
