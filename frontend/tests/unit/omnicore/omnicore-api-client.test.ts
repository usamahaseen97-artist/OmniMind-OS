import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { omniCoreApiClient } from "../../../core/omnicore/OmniCoreApiClient";

describe("omniCoreApiClient", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("listRecent returns items from backend", async () => {
    const items = [{ id: "r1", kind: "project" as const, label: "Demo", toolSlug: null, accessedAt: "" }];
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true, items }),
    } as Response);

    const result = await omniCoreApiClient.listRecent();
    expect(result?.items).toEqual(items);
  });

  it("saveRecent sends PUT payload", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true }),
    } as Response);

    const items = [{ id: "r2", kind: "tool" as const, label: "Tool", toolSlug: "omniforge" as const, accessedAt: "" }];
    const result = await omniCoreApiClient.saveRecent(items);
    expect(result?.ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "/api/v1/omnicore/recent",
      expect.objectContaining({ method: "PUT" }),
    );
  });
});
