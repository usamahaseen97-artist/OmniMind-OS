import { describe, expect, it } from "vitest";
import { omniAuthorizationEngine } from "../../../core/security/OmniAuthorizationEngine";

describe("OmniAuthorizationEngine", () => {
  it("grants platform:owner full tool execute", () => {
    omniAuthorizationEngine.assignRole("user-owner", "platform:owner");
    expect(omniAuthorizationEngine.can("user-owner", "tool:execute")).toBe(true);
  });

  it("denies guest project write", () => {
    expect(omniAuthorizationEngine.can("guest-user", "project:write")).toBe(false);
  });
});
