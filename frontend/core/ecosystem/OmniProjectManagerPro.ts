import { omniProjectHub } from "../omnicore/OmniProjectHub";
import { omniCollaboration } from "../collaboration";
import { omniAI } from "../ai/OmniAI";
import { omniActivityCenter } from "./OmniActivityCenter";
import type { ProjectManagerView } from "./types";

/** Enhanced Project Manager — timeline, assets, deployments, analytics, memory, AI context. */
export class OmniProjectManagerPro {
  view(projectId: string): ProjectManagerView | null {
    const hub = omniProjectHub.get(projectId);
    if (!hub) return null;

    const timeline = omniActivityCenter.items.filter(
      (a) => a.detail?.includes(projectId) || hub.project.name === a.title,
    );

    const collab = omniCollaboration.snapshot();
    const contributors = collab.activeOrg
      ? [{ id: "org", name: collab.activeOrg, role: "member" }]
      : [];

    return {
      projectId,
      timeline,
      assets: hub.sections.assets,
      history: hub.timeline,
      contributors: contributors.slice(0, 20),
      deployments: hub.sections.deployments,
      analytics: [
        { metric: "assets", value: hub.stats.assetCount },
        { metric: "chats", value: hub.stats.chatCount },
        { metric: "version", value: hub.project.version },
      ],
      memory: omniAI.memory.list().filter((m) => m.toolSlug && hub.project.toolSlugs.includes(m.toolSlug)),
      aiContext: `Project ${hub.project.name} — tools: ${hub.project.toolSlugs.join(", ")}`,
    };
  }

  list() {
    return omniProjectHub.listRecent();
  }
}

export const omniProjectManagerPro = new OmniProjectManagerPro();
