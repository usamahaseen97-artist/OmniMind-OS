import { describe, expect, it } from "vitest";
import { omniCore } from "../../core/omnicore/OmniCore";

describe("OmniMind V2.0 Automation Engine", () => {
  it("exposes automation on omniCore", async () => {
    omniCore.boot();
    await omniCore.automation.boot();
    expect(omniCore.automation.version).toBe("2.0.0");
  });

  it("lists triggers and actions", () => {
    expect(omniCore.automation.triggers.list().length).toBeGreaterThanOrEqual(19);
    expect(omniCore.automation.actions.list().length).toBeGreaterThanOrEqual(19);
  });

  it("workflow library has 10 templates", () => {
    expect(omniCore.automation.library.templates()).toHaveLength(10);
  });

  it("instantiates template workflow", () => {
    const wf = omniCore.automation.library.instantiate("tpl-ai-research");
    expect(wf.name).toBe("AI Research");
    expect(wf.nodes.length).toBeGreaterThan(0);
  });
});
