import { SYNC_DOMAINS } from "./constants";
import { omniCloudApiClient } from "./OmniCloudApiClient";
import { omniSettings } from "../omnicore/OmniSettings";
import { omniAI } from "../ai/OmniAI";
import { omniPluginEngine } from "../plugins/omnicore-platform";
import { omniProjectManager } from "../omnicore/OmniProjectManager";
import { omniWorkspaceManager } from "../omnicore/OmniWorkspaceManager";
import { omniThemeEngine } from "../omnicore/OmniThemeEngine";
import { omniShortcutManager } from "../omnicore/OmniShortcutManager";
import { omniAssets } from "../assets/OmniAssets";
import { omniCoreApiClient } from "../omnicore/OmniCoreApiClient";
import { omniEventBus } from "../omnicore/OmniEventBus";
import type { SyncDomain, SyncResult } from "./types";

/** OmniCloud Sync Engine — automatic multi-domain synchronization. */
export class OmniCloudSyncEngine {
  lastSyncAt: string | null = null;
  status: "idle" | "syncing" | "error" | "offline" = "idle";
  results: SyncResult[] = [];

  async syncAll(domains: SyncDomain[] = [...SYNC_DOMAINS]) {
    this.status = "syncing";
    const collected: SyncResult[] = [];

    try {
      const remote = await omniCloudApiClient.syncAll(domains);
      if (remote?.ok) {
        this.results = remote.results;
        this.lastSyncAt = new Date().toISOString();
        this.status = "idle";
        for (const r of remote.results) omniEventBus.publish("cloud:sync", { domain: r.domain });
        return { ok: true, results: remote.results };
      }

      for (const domain of domains) {
        const result = await this.syncDomain(domain);
        if (result) collected.push(result);
        omniEventBus.publish("cloud:sync", { domain });
      }

      this.results = collected;
      this.lastSyncAt = new Date().toISOString();
      this.status = "idle";
      return { ok: true, results: collected };
    } catch {
      this.status = "error";
      return { ok: false, results: collected };
    }
  }

  async syncDomain(domain: SyncDomain): Promise<SyncResult | null> {
    const at = new Date().toISOString();
    let itemCount = 0;

    switch (domain) {
      case "projects":
        itemCount = omniProjectManager.list().length;
        await omniCoreApiClient.saveProjects(omniProjectManager.list());
        break;
      case "ai-chats":
        itemCount = omniAI.conversations.list().length;
        break;
      case "ai-memory":
        itemCount = omniAI.memory.list().length;
        await omniCoreApiClient.syncPlatform({
          settings: [],
          memory: omniAI.memory.list(),
          workspacePresets: [],
          plugins: [],
        });
        break;
      case "settings":
        itemCount = omniSettings.list().length;
        await omniCoreApiClient.syncPlatform({
          settings: omniSettings.list(),
          memory: [],
          workspacePresets: [],
          plugins: [],
        });
        break;
      case "themes":
        itemCount = 1;
        break;
      case "plugins":
        itemCount = omniPluginEngine.registry.list().length;
        break;
      case "workspaces":
        itemCount = omniWorkspaceManager.presets.length;
        break;
      case "shortcuts":
        itemCount = omniShortcutManager.list().length;
        break;
      case "assets":
      case "images":
      case "videos":
      case "music":
      case "documents":
        itemCount = omniAssets.assets.assets.filter((a) => {
          if (domain === "images") return a.kind === "image";
          if (domain === "videos") return a.kind === "video";
          if (domain === "music") return a.kind === "audio";
          if (domain === "documents") return a.kind === "document";
          return true;
        }).length;
        omniAssets.cloud.enable(true);
        break;
      default:
        itemCount = 0;
    }

    const result: SyncResult = { domain, status: "synced", itemCount, at };
    await omniCloudApiClient.syncDomain(domain);
    return result;
  }

  snapshot() {
    return { status: this.status, lastSyncAt: this.lastSyncAt, results: this.results };
  }
}

export const omniCloudSyncEngine = new OmniCloudSyncEngine();
