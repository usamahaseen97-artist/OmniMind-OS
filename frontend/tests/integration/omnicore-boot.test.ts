import { describe, expect, it } from "vitest";
import { omniCore } from "../../core/omnicore/OmniCore";

describe("OmniCore integration", () => {
  it("boots all subsystems without error", () => {
    omniCore.boot();
    expect(omniCore.version).toBeTruthy();
    expect(omniCore.security.version).toBeTruthy();
    expect(omniCore.quality.version).toBeTruthy();
  });

  it("produces full snapshot", () => {
    const snap = omniCore.snapshot();
    expect(snap).toHaveProperty("security");
    expect(snap).toHaveProperty("quality");
    expect(snap).toHaveProperty("collaboration");
  });
});
