import { describe, expect, it } from "vitest";
import { omniCore } from "../../core/omnicore/OmniCore";

describe("OmniMind Mission Control V2.0", () => {
  it("boots mission control on omniCore", async () => {
    omniCore.boot();
    await omniCore.missionControl.boot();
    expect(omniCore.missionControl.version).toBe("2.0.0");
  });

  it("builds local dashboard snapshot", async () => {
    const dash = await omniCore.missionControl.dashboard();
    expect(dash).toHaveProperty("system");
    expect(dash).toHaveProperty("health");
    expect(dash).toHaveProperty("projects");
  });

  it("computes health scores", async () => {
    const health = await omniCore.missionControl.health.compute();
    expect(health.overall).toBeGreaterThan(0);
    expect(health).toHaveProperty("security");
  });

  it("lists quick actions", () => {
    expect(omniCore.missionControl.actions.list().length).toBeGreaterThanOrEqual(9);
  });
});
