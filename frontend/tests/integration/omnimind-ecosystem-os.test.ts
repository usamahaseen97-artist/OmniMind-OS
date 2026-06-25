import { describe, expect, it } from "vitest";
import { omniCore } from "../../core/omnicore/OmniCore";

describe("OmniMind Ecosystem OS", () => {
  it("boots ecosystem layer on omniCore", async () => {
    omniCore.boot();
    await omniCore.ecosystem.boot();
    expect(omniCore.ecosystem.version).toBe("1.0.0-ecosystem");
  });

  it("home dashboard snapshot has required sections", async () => {
    const snap = await omniCore.ecosystem.home.snapshot();
    expect(snap).toHaveProperty("recentProjects");
    expect(snap).toHaveProperty("systemHealth");
    expect(snap).toHaveProperty("quickLaunch");
  });

  it("searchAll includes global search results", () => {
    const results = omniCore.ecosystem.searchAll("omniforge");
    expect(results.length).toBeGreaterThan(0);
  });

  it("hub registers and switches tools", () => {
    omniCore.ecosystem.hub.registerTool({
      id: "test-tool",
      toolSlug: "omnimind",
      label: "Test",
      href: "/",
    });
    const sw = omniCore.ecosystem.hub.switchTool("omnimind");
    expect(sw.toolSlug).toBe("omnimind");
  });
});
