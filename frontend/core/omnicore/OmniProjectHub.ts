import { omniProjectManager } from "./OmniProjectManager";
import { omniRecentItems } from "./OmniRecentItems";
import { omniAI } from "../ai/OmniAI";
import { omniAssets } from "../assets/OmniAssets";
import { omniEventBus } from "./OmniEventBus";
import type { OmniToolSlug } from "./types";

/** OmniProjectHub — intelligent workspace per project (RC1). */
export class OmniProjectHub {
  get(projectId: string) {
    const project = omniProjectManager.get(projectId);
    if (!project) return null;

    const assets = omniAssets.assets.assets.filter((a) => a.projectId === projectId);
    const chats = omniAI.conversations.list().filter((c) =>
      project.toolSlugs.includes(c.toolSlug as OmniToolSlug),
    );
    const activity = omniRecentItems.list(20).filter(
      (r) => r.kind === "project" && r.label === project.name,
    );

    return {
      project,
      sections: {
        frontend: assets.filter((a) => a.kind === "source-code" || a.mimeType.includes("javascript")),
        backend: assets.filter((a) => a.tags.includes("backend") || a.kind === "dataset"),
        database: assets.filter((a) => a.tags.includes("database")),
        assets,
        documents: assets.filter((a) => a.kind === "document" || a.mimeType.includes("pdf")),
        design: assets.filter((a) => a.kind === "image" || a.kind === "design"),
        aiChats: chats,
        deployments: assets.filter((a) => a.tags.includes("deploy")),
        analytics: assets.filter((a) => a.tags.includes("analytics")),
      },
      timeline: activity,
      stats: {
        assetCount: assets.length,
        chatCount: chats.length,
        lastModified: project.modifiedAt,
      },
    };
  }

  listRecent() {
    return omniProjectManager.list().sort((a, b) => b.modifiedAt.localeCompare(a.modifiedAt));
  }

  listPinned() {
    return omniProjectManager.list().filter((p) => p.pinned);
  }

  listFavorites() {
    return omniProjectManager.list().filter((p) => p.favorite);
  }

  open(projectId: string, toolSlug: OmniToolSlug) {
    omniProjectManager.open(projectId, toolSlug);
    omniRecentItems.push("project", omniProjectManager.get(projectId)?.name ?? projectId, toolSlug);
    omniEventBus.publish("project:opened", { projectId, toolSlug });
    return this.get(projectId);
  }
}

export const omniProjectHub = new OmniProjectHub();
