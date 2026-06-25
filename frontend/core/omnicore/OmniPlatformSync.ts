import { omniSettings } from "./OmniSettings";
import { omniWorkspaceManager } from "./OmniWorkspaceManager";
import { omniAI } from "../ai/OmniAI";
import { omniPluginEngine } from "../plugins/omnicore-platform";
import { omniEventBus } from "./OmniEventBus";
import { omniCoreApiClient } from "./OmniCoreApiClient";
import { omniProjectManager } from "./OmniProjectManager";
import { omniCloudSyncEngine } from "../omnicloud/OmniCloudSyncEngine";

/** Platform-wide cloud sync facade — projects, workspace, memory, plugins, settings (RC1). */
export class OmniPlatformSync {
  lastSyncAt: string | null = null;
  status: "idle" | "syncing" | "error" = "idle";

  async syncAll() {
    const cloud = await omniCloudSyncEngine.syncAll();
    if (cloud.ok) {
      this.lastSyncAt = omniCloudSyncEngine.lastSyncAt;
      this.status = omniCloudSyncEngine.status === "error" ? "error" : "idle";
      return {
        ok: true,
        domains: cloud.results.map((r) => r.domain),
        syncedAt: this.lastSyncAt,
      };
    }

    this.status = "syncing";
    const domains: string[] = [];
    try {
      const bundle = {
        settings: omniSettings.list(),
        workspacePresets: omniWorkspaceManager.presets,
        memory: omniAI.memory.list(),
        plugins: omniPluginEngine.registry.list().map((p) => ({ id: p.id, enabled: p.enabled })),
      };
      await omniCoreApiClient.syncPlatform(bundle);
      domains.push("settings", "workspace", "ai-memory", "plugins");
      for (const domain of domains) {
        omniEventBus.publish("cloud:sync", { domain });
      }

      const projects = omniProjectManager.list();
      if (projects.length) {
        await omniCoreApiClient.saveProjects(projects);
        domains.push("projects");
        omniEventBus.publish("cloud:sync", { domain: "projects" });
      }

      this.lastSyncAt = new Date().toISOString();
      this.status = "idle";
      return { ok: true, domains, syncedAt: this.lastSyncAt };
    } catch {
      this.status = "error";
      return { ok: false, domains };
    }
  }

  exportBundle() {
    return {
      settings: omniSettings.export(),
      workspacePresets: omniWorkspaceManager.presets,
      memory: omniAI.memory.list(),
      plugins: omniPluginEngine.registry.list().map((p) => ({ id: p.id, enabled: p.enabled })),
      exportedAt: new Date().toISOString(),
    };
  }

  snapshot() {
    return {
      status: this.status,
      lastSyncAt: this.lastSyncAt,
      syncableSettings: omniSettings.list().filter((s) => s.cloudSync).length,
    };
  }
}

export const omniPlatformSync = new OmniPlatformSync();
