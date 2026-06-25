import { describe, expect, it } from "vitest";
import { omniPermissionEngine } from "../../../core/collaboration/OmniPermissionEngine";

describe("OmniPermissionEngine", () => {
  it("allows owner project write on org-1", () => {
    const allowed = omniPermissionEngine.can("user-1", "org-1", "project:write");
    expect(allowed).toBe(true);
  });

  it("denies unknown user", () => {
    const allowed = omniPermissionEngine.can("unknown-user", "org-1", "project:write");
    expect(allowed).toBe(false);
  });
});
