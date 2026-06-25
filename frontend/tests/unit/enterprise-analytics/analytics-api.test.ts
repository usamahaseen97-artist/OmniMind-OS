import { describe, expect, it } from "vitest";
import { datasetFromAnalyticsApi } from "../../../lib/enterprise-analytics/analytics-api";

describe("analytics-api", () => {
  it("maps metric arrays to a dataset snapshot", () => {
    const snapshot = datasetFromAnalyticsApi(
      [
        { metric: "revenue", value: 1000, delta_pct: 5 },
        { metric: "profit", value: 200, delta_pct: -2 },
      ],
      "sales-q1",
      "rest_api",
    );

    expect(snapshot.name).toBe("sales-q1");
    expect(snapshot.sourceKind).toBe("rest_api");
    expect(snapshot.headers).toContain("metric");
    expect(snapshot.rows.length).toBe(2);
    expect(snapshot.rows[0]?.metric).toBe("revenue");
  });

  it("defaults missing metric fields", () => {
    const snapshot = datasetFromAnalyticsApi([{}], "fallback", "postgresql");
    expect(snapshot.rows[0]?.value).toBe(0);
    expect(snapshot.sourceKind).toBe("postgresql");
  });
});
