import { describe, expect, it } from "vitest";
import { validateContract } from "../../../lib/qa/contract-validator";

describe("API contract validator", () => {
  it("passes when all keys present", () => {
    expect(validateContract({ ok: true, projects: [] }, ["ok", "projects"])).toEqual([]);
  });

  it("reports missing keys", () => {
    expect(validateContract({ ok: true }, ["ok", "projects"])).toEqual(["projects"]);
  });

  it("fails on non-object", () => {
    expect(validateContract(null, ["ok"])).toEqual(["ok"]);
  });
});
