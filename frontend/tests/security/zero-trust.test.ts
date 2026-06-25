import { describe, expect, it } from "vitest";
import { omniZeroTrustEngine } from "../../core/security/OmniZeroTrustEngine";
import { omniAuthorizationEngine } from "../../core/security/OmniAuthorizationEngine";
import { omniTrustedDeviceManager } from "../../core/security/OmniTrustedDeviceManager";

describe("Zero trust security", () => {
  it("denies guest tool execute without role", () => {
    const decision = omniZeroTrustEngine.validateRequest(
      { userId: "guest-1", attributes: {} },
      "tool:execute",
    );
    expect(decision.allowed).toBe(false);
  });

  it("allows operator with assigned role and trusted device", () => {
    omniAuthorizationEngine.assignRole("op-1", "tool:operator");
    omniTrustedDeviceManager.register("op-1", "test-device", "fp-test");
    const decision = omniZeroTrustEngine.validateRequest(
      { userId: "op-1", attributes: { deviceFingerprint: "fp-test" } },
      "tool:execute",
    );
    expect(decision.allowed).toBe(true);
  });
});
