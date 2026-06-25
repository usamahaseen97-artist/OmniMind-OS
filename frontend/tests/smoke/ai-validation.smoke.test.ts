import { describe, expect, it } from "vitest";
import { omniAIValidator } from "../../core/quality/OmniAIValidator";
import { omniAI } from "../../core/ai/OmniAI";

describe("AI validation smoke", () => {
  it("runs all AI subsystem checks", () => {
    omniAI.boot();
    const results = omniAIValidator.runAll();
    expect(results.length).toBeGreaterThan(0);
    expect(omniAIValidator.allPassed()).toBe(true);
  });
});
