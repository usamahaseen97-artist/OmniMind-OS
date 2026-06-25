import { describe, expect, it } from "vitest";
import { omniCore } from "../../core/omnicore/OmniCore";

describe("OmniMind RC1 unified platform", () => {
  it("boots brain and exposes 1.0.0-rc1", () => {
    omniCore.boot();
    expect(omniCore.version).toBe("1.0.0-rc1");
    expect(omniCore.brain.version).toBe("1.0.0-rc1");
  });

  it("snapshot includes brain and project hub", () => {
    const snap = omniCore.snapshot();
    expect(snap).toHaveProperty("brain");
    expect(snap).toHaveProperty("projectHub");
    expect(snap).toHaveProperty("platformSync");
  });

  it("global search indexes tools and commands", () => {
    const results = omniCore.search.search("omniforge");
    expect(results.some((r) => r.kind === "tool" || r.kind === "project")).toBe(true);
  });
});
