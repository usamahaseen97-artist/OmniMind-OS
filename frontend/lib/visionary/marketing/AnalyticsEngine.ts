import type { AnalyticsMetric, AnalyticsSnapshot } from "./types";

export class AnalyticsEngine {
  computeSummary(snapshots: AnalyticsSnapshot[]): Record<AnalyticsMetric, number> {
    const out: Record<string, number> = {};
    for (const s of snapshots) {
      out[s.metric] = (out[s.metric] ?? 0) + s.value;
    }
    return out as Record<AnalyticsMetric, number>;
  }

  compareCampaigns(snapshots: AnalyticsSnapshot[], campaignIds: string[]): { id: string; total: number }[] {
    return campaignIds.map((id) => ({
      id,
      total: snapshots.filter((s) => s.campaignId === id).reduce((a, b) => a + b.value, 0),
    }));
  }
}

export const analyticsEngine = new AnalyticsEngine();
