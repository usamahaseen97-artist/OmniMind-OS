import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createApiClient } from "../../../lib/shared/http-client";
import { ApiError } from "../../../lib/qa/api-error-handler";

describe("createApiClient", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ok: true, data: "test" }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("caches GET responses", async () => {
    const api = createApiClient({ baseUrl: "/api", label: "Test", cacheTtlMs: 60_000 });
    await api.get("/items");
    await api.get("/items");
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("throws ApiError on non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 401, json: async () => ({}) }),
    );
    const api = createApiClient({ baseUrl: "/api", label: "Test", retries: 0, cacheTtlMs: 0 });
    let caught: unknown;
    try {
      await api.get("/fail");
    } catch (err) {
      caught = err;
    }
    expect(caught).toMatchObject({ status: 401, code: "unauthorized", retryable: false });
  });
});

describe("ApiError", () => {
  it("marks 429 as retryable", () => {
    const err = ApiError.fromResponse(429);
    expect(err.retryable).toBe(true);
    expect(err.code).toBe("rate_limit");
  });
});
