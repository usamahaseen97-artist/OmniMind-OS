import type { Campaign, CampaignStatus } from "./types";

export class CampaignManagerEngine {
  create(campaigns: Campaign[], name: string, objective: string): Campaign[] {
    const c: Campaign = {
      id: `camp-${Date.now()}`,
      name,
      status: "draft",
      objective,
      budget: 0,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: null,
      platforms: [],
      creativeIds: [],
      audienceId: null,
    };
    return [c, ...campaigns];
  }

  updateStatus(campaigns: Campaign[], id: string, status: CampaignStatus): Campaign[] {
    return campaigns.map((c) => (c.id === id ? { ...c, status } : c));
  }

  getActive(campaigns: Campaign[], activeId: string | null): Campaign | undefined {
    return campaigns.find((c) => c.id === activeId);
  }
}

export const campaignManagerEngine = new CampaignManagerEngine();
